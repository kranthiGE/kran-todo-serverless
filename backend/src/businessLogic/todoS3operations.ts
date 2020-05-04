import * as AWS from 'aws-sdk'
import { createLogger } from '../utils/logger'

const s3 = new AWS.S3({
    signatureVersion: 'v4'
})

const bucketName = process.env.TODO_IMAGES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

const logger = createLogger('todoS3Operations')

export function getUploadUrl(todoId: string) {
    logger.debug(`bucket: ${bucketName}`)
    logger.debug(`urlExpiration: ${urlExpiration}`)

    if(!urlExpiration){
        logger.error('No urlExpiration specified')
        return undefined
    }

    const urlExpirationValue = parseInt(urlExpiration)
    return s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: todoId,
        Expires: urlExpirationValue
    })
}