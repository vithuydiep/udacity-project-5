import { AttachmentUtils } from '../helpers/attachmentUtils'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
// import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
// import * as createError from 'http-errors'
import { TodoAccess } from '../dataLayer/todosAcess'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { TodoUpdate } from '../models/TodoUpdate'

// TODO: Implement businessLogic
const logger = createLogger('TodoAccess')
const attachmentUtils = new AttachmentUtils()
const todoAccess = new TodoAccess()

export async function CreateTodo(
  newTodo: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {
  logger.info('call to create todo')

  const todoId = uuid.v4()
  const createdAt = new Date().toISOString()
  const s3AttachmentUrl = attachmentUtils.getAttachmentUrl(todoId)
  const newItem = {
    userId,
    todoId,
    createdAt,
    done: false,
    attachmentUrl: s3AttachmentUrl,
    ...newTodo
  }

  return await todoAccess.createTodoItem(newItem)
}

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
  logger.info('call to get list todo')
  return todoAccess.getAllTodos(userId)
}

export async function searchTodoForUser(
  userId: string,
  keyword: string
): Promise<TodoItem[]> {
  logger.info('call to search todo')
  return todoAccess.getTodoByText(userId, keyword)
}

export async function updateTodo(
  userId: string,
  todoId: string,
  updateTodoRequest: UpdateTodoRequest
): Promise<TodoUpdate> {
  logger.info('call to update todo')
  return todoAccess.updateTodoItem(
    todoId,
    userId,
    updateTodoRequest as TodoUpdate
  )
}

export async function deleteTodo(todoId: string, userId: string) {
  logger.info('call to delete todo')
  return todoAccess.deleteTodoItem(todoId, userId)
}

export async function createAttachmentPresignedUrl(
  todoId: string,
  userId: string
) {
  logger.info('call attachment to do by user', userId)
  return attachmentUtils.getUploadUrl(todoId)
}
