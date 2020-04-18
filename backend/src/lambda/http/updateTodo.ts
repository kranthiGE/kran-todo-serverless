import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import * as AWS from 'aws-sdk'

const docClient = new AWS.DynamoDB.DocumentClient()
const todo_table = process.env.TODO_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const updateTodo: UpdateTodoRequest = JSON.parse(event.body)

    console.log(`input object ${updateTodo}`)

    // read the query param for todoId
    const todoId = event.pathParameters.todoId
    console.log(`todoId ${todoId}`)
    // check if an object exists matching to the name
    const validTodoId = await todoIdExists(todoId)

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

    // if exists then update
    const params = {
        TableName: todo_table,
        Key: {
            todoId: todoId
        },
        UpdateExpression: "set #todoName = :n, dueDate = :du, done = :d",
        ExpressionAttributeValues: {
            ":n": updateTodo.name,
            ":du": updateTodo.dueDate,
            ":d": updateTodo.done
        },
        ExpressionAttributeNames: {
            "#todoName": updateTodo.name
        },
        ReturnValues: "UPDATED_NEW"
    }

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
        body: "Update succeeded"
    }
}

async function todoIdExists(todoId: string){
    const result = await docClient
        .get({
            TableName: todo_table,
            Key: {
                todoId: todoId
            }
        })
        .promise()

    console.log(`todoId verify: ${result}`)
    return !!result.Item
}