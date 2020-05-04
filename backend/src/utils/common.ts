import 'source-map-support/register'
import { decode } from 'jsonwebtoken'
import { Jwt } from '../auth/Jwt'
import { createLogger } from './logger'

const logger = createLogger('common')

export function getUserId(jwtToken: string): string{
    logger.debug(`jwttoken= ${jwtToken}`)
    const decodedToken: Jwt = decode(jwtToken, { complete: true }) as Jwt
    return decodedToken.payload.sub
}

export function fetchJwtTokenFromHeader(authHeader: string): string{
    if(!authHeader)
        throw new Error('No authorization header provided')
    
    if(!authHeader.toLocaleLowerCase().startsWith('bearer'))
        throw new Error('Invalid authorization header')

    const splitValue = authHeader.split(' ')
    return splitValue[1]
}