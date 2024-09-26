import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import User from './user.js'
import type { HasMany, BelongsTo } from '@adonisjs/lucid/types/relations'
import Status from './status.js'

export default class Project extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare description: string

  @column()
  declare cretorId: number

  @column()
  declare ownerId: number

  @belongsTo(() => User, {
    localKey: 'cretorId',
  })
  declare creator: BelongsTo<typeof User>

  @belongsTo(() => User, {
    localKey: 'ownerId',
  })
  declare owner: BelongsTo<typeof User>

  @hasMany(() => Status)
  declare statuses: HasMany<typeof Status>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare deletedAt?: DateTime | null
}
