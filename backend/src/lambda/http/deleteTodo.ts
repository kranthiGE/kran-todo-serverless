import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { fetchJwtTokenFromHeader, getUserId } from '../../utils/common'
import { createLogger } from '../../utils/logger'
import { todoIdExists, deleteTodoItem } from '../../businessLogic/todos'

const logger = createLogger('deleteTodo')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    // read the query param for todoId
    const todoId = event.pathParameters.todoId
    logger.info('Delete lambda called', {
        todoId: todoId
    })

    // get logged-in user id
    const userId = getUserId(fetchJwtTokenFromHeader(event.headers.Authorization))
    logger.debug('Delete lambda called', {
        todoId: todoId
    })
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

    // if exists then delete
    try{
        deleteTodoItem(todoId, userId)
    }
    catch(err){
        return {
            statusCode: 500,
            headers: {
            'Access-Control-Allow-Origin': '*'
            },
            body: "delete failed: " + JSON.stringify(err)
        }
    }

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            message: "Delete succeeded"
        })
    }
}