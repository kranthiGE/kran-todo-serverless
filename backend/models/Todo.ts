/**
 * Fields in a request to create a single TODO item.
 */
export interface Todo {
    todoId: string
    name: string
    dueDate: string
    done: boolean
    attachmentUrl: string | null
    createdAt: string
}