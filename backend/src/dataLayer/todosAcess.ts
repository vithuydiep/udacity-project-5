import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { createLogger } from '../utils/logger'

var AWSXRay = require('aws-xray-sdk')

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodoAccess {
  constructor(
    private readonly todoTable = process.env.TODOS_TABLE,
    private readonly indexName = process.env.INDEX_NAME,
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient()
  ) {}

  async getAllTodos(userId: string): Promise<TodoItem[]> {
    logger.info('get all todos list')

    const result = await this.docClient
      .query({
        TableName: this.todoTable,
        IndexName: this.indexName,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      })
      .promise()

    const items = result.Items

    return items as TodoItem[]
  }

  async getTodoByText(userId: string, keyword: string): Promise<TodoItem[]> {
    logger.info('get todo by search text')

    const result = await this.docClient
      .query({
        TableName: this.todoTable,
        IndexName: this.indexName,
        KeyConditionExpression: 'userId = :userId',
        FilterExpression: '#name = :name',
        ExpressionAttributeNames: {
          '#name': 'name'
        },
        ExpressionAttributeValues: {
          ':userId': userId,
          ':name': keyword
        }
      })
      .promise()

    const items = result.Items

    return items as TodoItem[]
  }

  async createTodoItem(todoItem: TodoItem): Promise<TodoItem> {
    logger.info('call to create todo item')

    await this.docClient
      .put({
        TableName: this.todoTable,
        Item: todoItem
      })
      .promise()

    return todoItem
  }

  async updateTodoItem(
    todoId: string,
    userId: string,
    todoUpdate: TodoUpdate
  ): Promise<TodoUpdate> {
    logger.info('call to update todo item')

    const result = await this.docClient
      .update({
        TableName: this.todoTable,
        Key: {
          todoId,
          userId
        },
        UpdateExpression: 'set #name = :name, dueDate = :dueDate, done= :done',
        ExpressionAttributeValues: {
          ':name': todoUpdate.name,
          ':dueDate': todoUpdate.dueDate,
          ':done': todoUpdate.done
        },
        ExpressionAttributeNames: {
          '#name': 'name'
        },
        ReturnValues: 'ALL_NEW'
      })
      .promise()

    const todoUpdateResult = result.Attributes

    return todoUpdateResult as TodoUpdate
  }

  async deleteTodoItem(todoId: string, userId: string): Promise<string> {
    logger.info('call to delete todo item')
    await this.docClient
      .delete({
        TableName: this.todoTable,
        Key: {
          userId,
          todoId
        }
      })
      .promise()

    return todoId as string
  }

  async updateTodoAttachmentUrl(
    todoId: string,
    userId: string,
    attachmentUrl: string
  ): Promise<void> {
    logger.info('call to update attachment url todo item')

    await this.docClient
      .update({
        TableName: this.todoTable,
        Key: {
          todoId,
          userId
        },
        UpdateExpression: 'set attachmentUrl = :attachmentUrl',
        ExpressionAttributeValues: {
          ':attachmentUrl': attachmentUrl
        }
      })
      .promise()
  }

  async getTodoItem(userId: string, todoId: string): Promise<TodoItem> {
    logger.info('GET a todo by id', { userId, todoId })

    const result = await this.docClient
      .get({
        TableName: this.todoTable,
        Key: {
          userId,
          todoId
        }
      })
      .promise()

    const item = result.Item

    return item as TodoItem
  }
}
