import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Project from './project.js'
import { type BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class Status extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare projectId: number

  @column()
  declare creatorId: number

  @column()
  declare order: number

  @belongsTo(() => Project, {
    localKey: 'creatorId',
  })
  declare project: BelongsTo<typeof Project>

  @belongsTo(() => User, {
    localKey: 'creatorId',
  })
  declare creator: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare deletedAt?: DateTime | null
}
