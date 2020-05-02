import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import { decode } from 'jsonwebtoken'
import { JwtToken } from '../auth/JwtToken'

const docClient = new AWS.DynamoDB.DocumentClient()
const todo_table = process.env.TODO_TABLE

export async function todoIdExists(todoId: string, userId: string){
    const result = await docClient
        .get({
            TableName: todo_table,
            Key: {
                createdBy: userId,
                todoId: todoId
            }
        })
        .promise()

    console.log(`todoId verify: ${result}`)
    return !!result.Item
}

export function getUserId(jwtToken: string): string{
    const decodedToken = decode(jwtToken) as JwtToken
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