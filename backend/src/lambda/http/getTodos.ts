import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS from 'aws-sdk'
import { getUserId, fetchJwtTokenFromHeader } from '../../utils/common'
import { createLogger } from '../../utils/logger'

const docClient = new AWS.DynamoDB.DocumentClient()
const todoTable = process.env.TODO_TABLE
const userDateIndex = process.env.USER_DATE_INDEX
const logger = createLogger('getTodos')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // TODO: Get all TODO items for a current user
    logger.info('todo lambda event started', event)

    // calling a common function to read the header and fetch the token
    // And then the token is decoded and user id is fetched from decoded JWT token
    const userId = getUserId(fetchJwtTokenFromHeader(event.headers.Authorization))

    // Need to fetch todo items only based on logged-in user
    const result = await docClient.query({
        TableName: todoTable,
        IndexName: userDateIndex,
        KeyConditionExpression: 'createdBy = :created_by',
        ExpressionAttributeValues: { 
            ':created_by': userId
        },
        ScanIndexForward: false //desc order
    }).promise()

    const items = result.Items

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            items
        })
    }
}