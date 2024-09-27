import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany, manyToMany, scope } from '@adonisjs/lucid/orm'
import User from './user.js'
import type { HasMany, BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
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

  @manyToMany(() => User, {
    pivotTable: 'project_user_pivot',
    localKey: 'id',
    pivotForeignKey: 'project_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'user_id',
  })
  declare users: ManyToMany<typeof User>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare deletedAt?: DateTime | null

  static deleted = scope((query) => query.whereNotNull('deleted_at'))
  static active = scope((query) => query.whereNull('deleted_at'))
}
