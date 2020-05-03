import { CustomAuthorizerEvent, CustomAuthorizerResult, CustomAuthorizerHandler } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { JwtToken } from '../../auth/JwtToken'
import { fetchJwtTokenFromHeader } from '../../utils/common'
import { createLogger } from '../../utils/logger'
import { getSecret } from '../../utils/secretMgrUtils'

const logger = createLogger('auth0Authorizer')

const secretId = process.env.AUTH_0_SECRET_ID
const secretField = process.env.AUTH_0_SECRET_VALUE

export const handler: CustomAuthorizerHandler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {

    try{
        // verify token by pass the auth token received to the lambda
        const decodedTokenVal =  await verifyToken(event.authorizationToken)
        logger.info('User was authorized')

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
        logger.info('User was not authorized', e.message)

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
    const secretObject: any = await getSecret(secretId)
    const secretValue = secretObject[secretField]

    return verify(fetchJwtTokenFromHeader(authHeader), secretValue) as JwtToken
}
