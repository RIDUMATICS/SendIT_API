import { DateTime } from 'luxon';
import Hash from '@ioc:Adonis/Core/Hash';
import {
  column,
  beforeSave,
  BaseModel,
  HasMany,
  hasMany,
} from '@ioc:Adonis/Lucid/Orm';
import Parcel from './Parcel';

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public firstname: string;

  @column()
  public lastname: string;

  @column({
    prepare: (value: string) => value.toLowerCase(),
    consume: (value: string) => value.toLowerCase(),
  })
  public username: string;

  @column({
    prepare: (value: string) => value.toLowerCase(),
    consume: (value: string) => value.toLowerCase(),
  })
  public email: string;

  @column({ serializeAs: null })
  public password: string;

  @column.date({
    autoCreate: true,
    serialize: (value: DateTime) => value.toFormat('yyyy LLL dd'),
  })
  public register: DateTime;

  @column()
  public isAdmin: boolean;

  @hasMany(() => Parcel, {
    foreignKey: 'placedBy',
  })
  public parcels: HasMany<typeof Parcel>;

  @column.dateTime({
    autoCreate: true,
    serialize: (value: DateTime) => value.toFormat('yyyy LLL dd'),
  })
  public createdAt: DateTime;

  @column.dateTime({
    autoCreate: true,
    autoUpdate: true,
    serialize: (value: DateTime) => value.toFormat('yyyy LLL dd'),
  })
  public updatedAt: DateTime;

  @beforeSave()
  public static async hashPassword(user: user) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password);
    }
  }
}
