import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import * as AWS from 'aws-sdk'
import * as uuid from 'uuid'
import { fetchJwtTokenFromHeader, getUserId } from '../../utils/common'
import { createLogger } from '../../utils/logger'

const docClient = new AWS.DynamoDB.DocumentClient()
const todoTable = process.env.TODO_TABLE

const logger = createLogger('createTodo')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)

    logger.info('createTodo lambda called', {
        createTodo: newTodo
    })
    
    const todoId = uuid.v4()

    // read the optional value and add the attribute only if input is present
    const attachUrl = newTodo.attachmentUrl
    logger.info('attachUrl value', {
        attachUrl: attachUrl
    })

    const currentDate = new Date().toISOString();

    // get logged-in user id
    const userId = getUserId(fetchJwtTokenFromHeader(event.headers.Authorization))
    logger.info('userId', {
        userId: userId
    })

    const item = {
        createdBy: userId,
        todoId: todoId,
        name: newTodo.name,
        createdAt: currentDate,
        updatedAt: currentDate,
        dueDate: newTodo.dueDate,
        done: newTodo.done,
        ...((attachUrl)? {attachmentUrl: attachUrl} : {})
    }

    logger.debug('Performing put operation', {
        item: JSON.stringify(item)
    })

    await docClient.put({
        TableName: todoTable,
        Item: item
    }).promise()

    let response;

    response = {
        statusCode: 201,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            item
        }),
    }

    logger.info('Inserted new item successfully')

    return response
}
