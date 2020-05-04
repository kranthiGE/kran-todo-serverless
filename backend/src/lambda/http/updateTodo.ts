import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { createLogger } from '../../utils/logger'
import { updateTodoItem, todoIdExists } from '../../businessLogic/todos'
import { fetchJwtTokenFromHeader, getUserId } from '../../utils/common'

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
    const validTodoId = await todoIdExists(todoId, userId)
 
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

    try{
        updateTodoItem(updateTodo, todoId, userId)
    }
    catch(error){
        return {
            statusCode: 500,
            headers: {
              'Access-Control-Allow-Origin': '*'
            },
            body: "Update failed: " + JSON.stringify(error)
          }
    }

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