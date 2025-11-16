import {
  BaseModel,
  column,
  hasMany,
  HasMany,
  manyToMany,
  ManyToMany
} from '@adonisjs/lucid/orm'

import Message from './message.js'
import User from './user.js'

export default class Group extends BaseModel {
  @column({isPrimary : true})
  declare id: string

      @column() declare name: string

      @column() declare description: string|null

      @column() declare isPrivate: boolean

      @column
          .dateTime({autoCreate : true}) declare createdAt: Date

      @column.dateTime({autoCreate : true, autoUpdate: true}) declare updatedAt:
          Date

      // Relations

      @hasMany(() => Message) declare messages: HasMany<typeof Message>

      @manyToMany(() => User, {
        pivotTable : 'group_user',
        pivotForeignKey: 'group_id',
        pivotRelatedForeignKey: 'user_id',
      }) declare users: ManyToMany<typeof User>
}
