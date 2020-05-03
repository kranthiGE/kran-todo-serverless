import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import { decode } from 'jsonwebtoken'
import { JwtToken } from '../auth/JwtToken'
import { createLogger } from './logger'

const docClient = new AWS.DynamoDB.DocumentClient()
const todo_table = process.env.TODO_TABLE
const logger = createLogger('utils.common')
const secretMgr = new AWS.SecretsManager()

export async function todoIdExists(todoId: string, userId: string){
    logger.info('verify if todo item exists with given id', {
        todoId: todoId,
        userId: userId
    })
    const result = await docClient
        .get({
            TableName: todo_table,
            Key: {
                createdBy: userId,
                todoId: todoId
            }
        })
        .promise()

    logger.info(`todoId verify: ${result}`)
    return !!result.Item
}

export function getUserId(jwtToken: string): string{
    const decodedToken = decode(jwtToken, { complete: true }) as JwtToken
    return decodedToken.sub
}

export function fetchJwtTokenFromHeader(authHeader: string): string{
    if(!authHeader)
        throw new Error('No authorization header provided')
    
    if(!authHeader.toLocaleLowerCase().startsWith('bearer'))
        throw new Error('Invalid authorization header')

    const splitValue = authHeader.split(' ')
    return splitValue[1]
}

export async function getSecret(secretIdParam: string){

    logger.debug(`fetching secret for ${secretIdParam}`)
    //if(cachedSecret) return cachedSecret

    const data = await secretMgr.getSecretValue({
        SecretId: secretIdParam
    }).promise()

    logger.debug(`fetched secret value`)

    return JSON.parse(data.SecretString)
}