import * as AWS  from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { Todo } from '../../models/Todo'
import { createLogger } from '../utils/logger'

const logger = createLogger('createTodo')

export class TodosAccess {

    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly todoTable = process.env.TODO_TABLE,
        private readonly userDateIndex = process.env.USER_DATE_INDEX
    ){}

    async getAllTodos(userId: string): Promise<Todo[]> {
        logger.info('Fetching all TODO items')
        // Need to fetch todo items only based on logged-in user
        const result = await this.docClient.query({
            TableName: this.todoTable,
            IndexName: this.userDateIndex,
            KeyConditionExpression: 'createdBy = :created_by',
            ExpressionAttributeValues: { 
                ':created_by': userId
            },
            ScanIndexForward: false //desc order
        }).promise()

        logger.debug(` result = ${result} `)
        const items = result.Items
        return items as Todo[]
    }

    async createTodo(todo: Todo): Promise<Todo>{
        logger.info('create new todo item')
        await this.docClient.put({
            TableName: this.todoTable,
            Item: todo
        }).promise()
        
        return todo
    }

    async deleteTodo(userId: string, todoId: string){
        logger.info('deleting an item for ', {
            todoId: todoId,
            userId: userId
        })
        // if exists then delete
        const params = {
            TableName: this.todoTable,
            Key: {
                createdBy: userId,
                todoId: todoId
            },
            ReturnValues: 'ALL_OLD'
        }

        await this.docClient.delete(
            params, function(err, data){
                if(err){
                    logger.error(err)
                    throw new Error(err.message)
                } else {
                    logger.debug('delete succeeded ', {
                        data: data
                    })
                }
            }
        ).promise()

        logger.info('deleted successfully ')
    }

    async isTodoItemExists(todoId: string, userId: string){
        logger.info('verify if todo item exists with given id', {
            todoId: todoId,
            userId: userId
        })
        return await this.docClient
        .get({
            TableName: this.todoTable,
            Key: {
                createdBy: userId,
                todoId: todoId
            }
        })
        .promise()
    }

    async updateTodoItem(todo: Todo, userId: string){
        logger.info('update new todo item')
        const updatedDate = new Date().toISOString();
        // if exists then update
        const params = {
            TableName: this.todoTable,
            Key: {
                createdBy: userId,
                todoId: todo.todoId
            },
            UpdateExpression: "set #todoName = :n, dueDate = :du, done = :d, updatedAt = :ud, attachmentUrl = :aurl",
            ExpressionAttributeValues: {
                ":n": todo.name,
                ":du": todo.dueDate,
                ":d": todo.done,
                ":ud": updatedDate,
                ":aurl": todo.attachmentUrl
            },
            ExpressionAttributeNames: {
                "#todoName": "name"
            },
            ReturnValues: "UPDATED_NEW"
        }

        logger.debug(`params: ${JSON.stringify(params)}`)

        await this.docClient.update(
            params, function(err, data){
                if(err){
                    logger.error(err)
                    throw new Error(err.message)
                } else {
                    console.log(`update succeeded: ${data}`)
                }
            }
        ).promise()
        logger.info('updated successfully ')
    }
}

function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
      logger.info('Creating a local DynamoDB instance')
      return new AWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000',
        convertEmptyValues: true
      })
    }
  
    return new AWS.DynamoDB.DocumentClient({convertEmptyValues: true})
  }
  