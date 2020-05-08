import { TodosAccess } from "../dataAccessLayer/todosAccess"
import { Todo } from "../../models/Todo"
import { getUserId, fetchJwtTokenFromHeader } from "../utils/common"
import { createLogger } from "../utils/logger"
import * as uuid from 'uuid'
import { CreateTodoRequest } from "../requests/CreateTodoRequest"
import { UpdateTodoRequest } from "../requests/UpdateTodoRequest"
import { getImageUrlAsStoredInS3 } from "./todoS3operations"

const todosAccess = new TodosAccess()
const logger = createLogger('todos')

export async function getTodoItems(authHeader: string): Promise<Todo[]> {
    logger.info('getTodoItems business logic called: ', authHeader)

    // calling a common function to read the header and fetch the token
    // And then the token is decoded and user id is fetched from decoded JWT token
    const userId = getUserId(fetchJwtTokenFromHeader(authHeader))
    
    logger.info('retrieving todo items for : ', userId)
    return await todosAccess.getAllTodos(userId)
}

export async function createTodoItem(
    createTodoRequest: CreateTodoRequest,
    authHeader: string
): Promise<Todo> {

    logger.info('createTodo lambda called', {
        createTodo: createTodoRequest
    })
    
    const todoId = uuid.v4()

    // read the optional value and add the attribute only if input is present
    const attachUrl = createTodoRequest.attachmentUrl
    logger.info('attachUrl value', {
        attachUrl: attachUrl
    })

    const currentDate = new Date().toISOString();

    // get logged-in user id
    const userId = getUserId(fetchJwtTokenFromHeader(authHeader))
    logger.info('userId', {
        userId: userId
    })

    const item = {
        createdBy: userId,
        todoId: todoId,
        name: createTodoRequest.name,
        createdAt: currentDate,
        updatedAt: currentDate,
        dueDate: createTodoRequest.dueDate,
        done: createTodoRequest.done,
        attachmentUrl: attachUrl
    }

    logger.debug('Performing put operation', {
        item: JSON.stringify(item)
    })

    return await todosAccess.createTodo(item);
}

export async function deleteTodoItem(
    todoId: string,
    userId: string    
){
    try{
        todosAccess.deleteTodo(todoId, userId)
    }
    catch(err){
        throw new Error(err)
    }
}

export async function updateTodoItem(
    updateTodo: UpdateTodoRequest, 
    todoId: string,
    userId: string
    ){
    

    const item = {
        todoId: todoId,
        name: updateTodo.name,
        dueDate: updateTodo.dueDate,
        done: updateTodo.done,
        attachmentUrl: (updateTodo.attachmentUrl? updateTodo.attachmentUrl : '' ),
        createdAt: updateTodo.updatedAt
    }
    try{
        todosAccess.updateTodoItem(item,userId)
    }
    catch(err){
        throw new Error(err)
    }
}

export async function updateTodoAttachmentUrl(todoId: string, userId: string){
    const attachmentUrl = getImageUrlAsStoredInS3(todoId)
    logger.info(`generated image url on s3: ${attachmentUrl}`)
    todosAccess.updateTodoAttachmentUrl(todoId, userId, attachmentUrl)
}

export async function todoIdExists(todoId: string, userId: string){
    return !!(await todosAccess.isTodoItemExists(todoId, userId)).Item
}