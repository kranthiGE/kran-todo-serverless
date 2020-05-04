
import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import { createLogger } from './logger'

const logger = createLogger('secretMgrUtils')
const secretMgr = new AWS.SecretsManager()

export async function getSecret(secretIdParam: string){

    logger.info(`fetching secret for ${secretIdParam}`)

    const data = await secretMgr.getSecretValue({
        SecretId: secretIdParam
    }).promise()

    logger.info('fetched secret value', data)

    return JSON.parse(data.SecretString)
}