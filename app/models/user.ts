import { DateTime } from 'luxon'
import { BaseModel, beforeSave, column, hasMany, manyToMany, scope } from '@adonisjs/lucid/orm'
import hash from '@adonisjs/core/services/hash'
import Project from './project.js'
import type { ManyToMany, HasMany } from '@adonisjs/lucid/types/relations'
import Status from './status.js'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare firstname: string

  @column()
  declare lastname: string

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare avatar?: string | null

  @hasMany(() => Project, {
    foreignKey: 'creator_id',
  })
  declare createdProjects: HasMany<typeof Project>

  @hasMany(() => Project, {
    foreignKey: 'owenrId',
  })
  declare ownedProjects: HasMany<typeof Project>

  @hasMany(() => Status, {
    foreignKey: 'creatorId',
  })
  declare createdStatuses: HasMany<typeof Status>

  @manyToMany(() => Project, {
    pivotTable: 'project_user_pivot',
    localKey: 'id',
    pivotForeignKey: 'user_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'project_id',
  })
  declare projects: ManyToMany<typeof Project>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare verifiedAt?: DateTime | null

  @column.dateTime()
  declare deletedAt?: DateTime | null

  @beforeSave()
  static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await hash.make(user.password)
    }
  }

  static unverified = scope((query) => query.whereNull('verified_at'))
  static verified = scope((query) => query.whereNotNull('verified_at'))
  static deleted = scope((query) => query.whereNotNull('deleted_at'))
  static active = scope((query) => query.whereNull('deleted_at'))
}
