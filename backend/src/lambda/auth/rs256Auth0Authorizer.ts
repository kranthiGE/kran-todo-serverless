
import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { JwtToken } from '../../auth/JwtToken'
import { fetchJwtTokenFromHeader } from '../../utils/common'
import { createLogger } from '../../utils/logger'
// import { getSecret } from '../../utils/secretMgrUtils'

const logger = createLogger('rsAuth0Authorizer')

// const certId = process.env.RS_AUTH_0_CERT_ID
// const certField = process.env.RS_AUTH_0_CERT_VALUE
const cert = `-----BEGIN CERTIFICATE-----
MIIC/zCCAeegAwIBAgIJMLNlA8VD+NG6MA0GCSqGSIb3DQEBCwUAMB0xGzAZBgNV
BAMTEmtyYW50aGlhLmF1dGgwLmNvbTAeFw0yMDA0MjUwODMzMDlaFw0zNDAxMDIw
ODMzMDlaMB0xGzAZBgNVBAMTEmtyYW50aGlhLmF1dGgwLmNvbTCCASIwDQYJKoZI
hvcNAQEBBQADggEPADCCAQoCggEBANfcTOvpSSoxTR+VriTmk5n4WZFmEa0wKD1d
fJ/PLkxvhOVEa5Y7WJoYgE0mPLA/HGL8EqJt/Dq+d35fpH0Iw8ByD2W3TvcAJXnb
5s2KT6RcF829zvsLq8auC4MXRoP4cK5OlsUxjedHKEVBNvsF0Akm73QUFPIHdJde
/8Jr/5h2vxPfoC9cpMeSCj4eyTdDib2mu7Dv7Ytksopmn09ArCa3epd8ALMjM7/u
SAqgDa5WlKvWFKQCwm2fIqAoUK38ANxFc4GnlwPZ53ZHP0PCUL+awXudBmDRFBBd
CKvxyNnXKD+1+xpgjzIe6wlwUVlDKpRKaF0c6ciRQHrBfrLR+jUCAwEAAaNCMEAw
DwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUPho4OEq4oIXkekliHJyoMH9puO4w
DgYDVR0PAQH/BAQDAgKEMA0GCSqGSIb3DQEBCwUAA4IBAQCeifxzSidPUHu7qxY0
SA2+iruXleCUxv4sxTcJ5/NbFFeQg+FvMhFS2IC2bbuNFHMrQ1AXpvTTQkwOtPnY
n9fMmL7WXvA5PRfCbV3MnLCQDvfJxPWk6SHkC0V4unffsMVPJRf+pCZE3BZOsGxy
CefPEG4EP+nAZYATBWSEZllVJUMHQ6kQgrIxIxmim9WXJ1/oGvWMXvhnc7t7oebV
rHGl27j6tEx4I0ODTai4tWhDPzoFC9O5VUs/crLAYjXrpfQAvTKeKAc+E0bHwVh1
O4dvkHMMKnp/vGAFCr/fNG/TKB44gBoobp1ov4nb3h4wPdNCT56UnwTjPok1X9Q1
qWCi
-----END CERTIFICATE-----`
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
    logger.error('User not authorized')
    logger.error(e)
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
    // const secretObject: any = await getSecret(certId)
    // logger.info(`secretObject= ${secretObject}`)
    // const secretValue = secretObject[certField]
    // logger.info(`secretValue= ${secretValue}`)
    return verify(fetchJwtTokenFromHeader(authHeader), cert, { algorithms: ['RS256'] }) as JwtToken
}
