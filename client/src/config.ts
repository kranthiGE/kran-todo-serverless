// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = '8jajlv8iwh'
const region = 'ap-south-1'
export const apiEndpoint = `https://${apiId}.execute-api.${region}.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'kranthia.auth0.com',            // Auth0 domain
  clientId: 'Z9m6If72r9Q45dAJJODzEIMhB3ZVhrBb',//'Kq61Nisg0Wx49aOMijEHo7Yz304NFkrR',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
