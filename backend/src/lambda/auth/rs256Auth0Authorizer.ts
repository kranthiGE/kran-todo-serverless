
import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { JwtToken } from '../../auth/JwtToken'
import { fetchJwtTokenFromHeader } from '../../utils/common'
import { createLogger } from '../../utils/logger'
import { getSecret } from '../../utils/secretMgrUtils'

const logger = createLogger('rsAuth0Authorizer')

const certId = process.env.RS_AUTH_0_CERT_ID
const certField = process.env.RS_AUTH_0_CERT_VALUE
//const jwksurl = 'https://kranthia.auth0.com/.well-known/jwks.json'

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User authorized', e.message)

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtToken> {
    const secretObject: any = await getSecret(certId)
    const secretValue = secretObject[certField]
    return verify(fetchJwtTokenFromHeader(authHeader), secretValue, { algorithms: ['RS256'] }) as JwtToken
}
