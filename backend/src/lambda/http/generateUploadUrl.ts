import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import * as AWS from 'aws-sdk'
import { fetchJwtTokenFromHeader, getUserId, todoIdExists } from '../../utils/common'

const s3 = new AWS.S3({
    signatureVersion: 'v4'
})

const bucketName = process.env.TODO_IMAGES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log('generating upload URL')
    // read the query param for todoId
    const todoId = event.pathParameters.todoId
    console.log(`todoId ${todoId}`)

    // get logged-in user id
    const userId = getUserId(fetchJwtTokenFromHeader(event.headers.Authorization))
    console.log(`user id: ${userId}`)

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

function getUploadUrl(todoId: string) {
    console.log(`bucket: ${bucketName}`)
    console.log(`urlExpiration: ${urlExpiration}`)

    if(!urlExpiration){
        console.log('No urlExpiration specified')
        return undefined
    }

    const urlExpirationValue = parseInt(urlExpiration)
    return s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: todoId,
        Expires: urlExpirationValue
    })
}