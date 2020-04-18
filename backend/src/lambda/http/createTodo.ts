import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import * as AWS from 'aws-sdk'
import * as uuid from 'uuid'

const docClient = new AWS.DynamoDB.DocumentClient()
const todo_table = process.env.TODO_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    console.log(`newTodo object ${newTodo}`)

    const todoId = uuid.v4()

    // read the optional value and add the attribute only if input is present
    const attachUrl = newTodo.attachmentUrl
    console.log(`attachUrl value ${attachUrl}`)

    const currentDate = new Date().toISOString();

    const newtodo_item = {
        todoId: todoId,
        name: newTodo.name,
        createdAt: currentDate,
        dueDate: newTodo.dueDate,
        done: newTodo.done,
        ...((attachUrl)? {attachmentUrl: attachUrl} : {})
    }

    await docClient.put({
        TableName: todo_table,
        Item: newtodo_item
    }).promise()

    let response;

    response = {
        statusCode: 201,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            newtodo_item
        }),
    }

    return response
}
