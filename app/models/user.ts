import { DateTime } from 'luxon'
import { BaseModel, beforeSave, column, scope } from '@adonisjs/lucid/orm'
import hash from '@adonisjs/core/services/hash'

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
