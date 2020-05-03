import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import * as AWS from 'aws-sdk'
import * as utils from '../../utils/common'
import { fetchJwtTokenFromHeader, getUserId } from '../../utils/common'
import { createLogger } from '../../utils/logger'

const docClient = new AWS.DynamoDB.DocumentClient()
const todo_table = process.env.TODO_TABLE
const logger = createLogger('updateTodo')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const updateTodo: UpdateTodoRequest = JSON.parse(event.body)

    logger.info(`input object ${updateTodo}`)

    // read the query param for todoId
    const todoId = event.pathParameters.todoId
    logger.debug(`todoId ${todoId}`)

    // get logged-in user id
    const userId = getUserId(fetchJwtTokenFromHeader(event.headers.Authorization))
    logger.debug(`user id: ${userId}`)

    // check if an object exists matching to the name
    const validTodoId = await utils.todoIdExists(todoId, userId)

    if(!validTodoId){
        return {
            statusCode: 404,
            headers: {
              'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
              error: 'Todo item does not exist'
            })
          }
    }

    const updatedDate = new Date().toISOString();
    // if exists then update
    const params = {
        TableName: todo_table,
        Key: {
            createdBy: userId,
            todoId: todoId
        },
        UpdateExpression: "set #todoName = :n, dueDate = :du, done = :d, updatedAt = :ud, attachmentUrl = :aurl",
        ExpressionAttributeValues: {
            ":n": updateTodo.name,
            ":du": updateTodo.dueDate,
            ":d": updateTodo.done,
            ":ud": updatedDate,
            ":aurl": updateTodo.attachmentUrl
        },
        ExpressionAttributeNames: {
            "#todoName": "name"
        },
        ReturnValues: "UPDATED_NEW"
    }

    logger.debug(`params: ${JSON.stringify(params)}`)

    await docClient.update(
        params, function(err, data){
            if(err){
                return {
                    statusCode: 500,
                    headers: {
                      'Access-Control-Allow-Origin': '*'
                    },
                    body: "Update failed: " + JSON.stringify(err)
                  }
            } else {
                console.log(`update succeeded: ${data}`)
            }
        }
    ).promise()

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            message: "Update succeeded"
        })
    }
}