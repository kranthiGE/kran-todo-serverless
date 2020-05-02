import { CustomAuthorizerEvent, CustomAuthorizerResult, CustomAuthorizerHandler } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS from 'aws-sdk'

import { verify } from 'jsonwebtoken'
import { JwtToken } from '../../auth/JwtToken'
import { fetchJwtTokenFromHeader } from '../../utils/common'

const secretId = process.env.AUTH_0_SECRET_ID
const secretField = process.env.AUTH_0_SECRET_VALUE

const secretMgr = new AWS.SecretsManager()

// Cache secret if a lambda instance is reused
let cachedSecret: string 

export const handler: CustomAuthorizerHandler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {

    try{
        // verify token by pass the auth token received to the lambda
        const decodedTokenVal =  await verifyToken(event.authorizationToken)
        console.log('User was authorized')

        // return a policy through which user can execute any lambda
        return {
            principalId: decodedTokenVal.sub,
            policyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'execute-api:Invoke',
                        Effect: 'Allow',
                        Resource: '*'
                    }
                ]
            },
            context: {
                userId: decodedTokenVal.sub
            }
        }

    }
    catch(e){
        console.log('User was not authorized', e.message)

        // deny access to any lambda function
        return {
            principalId: 'user',
            policyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'execute-api:Invoke',
                        Effect: 'Deny',
                        Resource: '*'
                    }
                ]
            }
        }
    }
}

async function verifyToken(authHeader: string): Promise<JwtToken>{
    const secretObject: any = await getSecret()
    const secretValue = secretObject[secretField]

    return verify(fetchJwtTokenFromHeader(authHeader), secretValue) as JwtToken
}

async function getSecret(){

    console.log(`fetching secret for ${secretId}`)
    //if(cachedSecret) return cachedSecret

    const data = await secretMgr.getSecretValue({
        SecretId: secretId
    }).promise()

    cachedSecret = data.SecretString
    console.log(`fetched secret value`)

    return JSON.parse(cachedSecret)
}