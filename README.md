# Sample servless app
Author: Kranthi Kiran  
Created On: 09-Apr-2020  
 
This application will allow creating/removing/updating/fetching TODO items. Each TODO item can optionally have an attachment image. Each user only has access to TODO items that he/she has created.  
***
## Getting Setup

### Installing project dependencies

```bash
npm install -g serverless
```
>_tip_: **npm i** is shorthand for **npm install**  
Set up a new user in IAM named "serverless" and save the access key and secret key.  
Configure serverless to use the AWS credentials you just set up:  
```bash
sls config credentials --provider aws --key YOUR_ACCESS_KEY --secret YOUR_SECRET_KEY --profile serverless  
sls create --template  
sls create --template aws-nodejs-typescript --path serverless-udagram-app  
sls deploy -v --aws-profile serverless  
```
#### Install serverless plugins
```bash
sls plugin install --name serverless-aws-documentation
sls plugin install --name serverless-reqvalidator-plugin
```