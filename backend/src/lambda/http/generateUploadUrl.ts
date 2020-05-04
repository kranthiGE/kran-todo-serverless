import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { fetchJwtTokenFromHeader, getUserId } from '../../utils/common'
import { todoIdExists } from '../../businessLogic/todos'
import { getUploadUrl } from '../../businessLogic/todoS3operations'
import { createLogger } from '../../utils/logger'

const logger = createLogger('generateUploadUrl')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('generating upload URL')
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
    
    // fetch upload url and return
    const url = getUploadUrl(todoId)

    return {
        statusCode: 201,
        headers: {
        'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
        uploadUrl: url
        })
    }
}