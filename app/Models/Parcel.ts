import { DateTime } from 'luxon';
import { BaseModel, belongsTo, BelongsTo, column } from '@ioc:Adonis/Lucid/Orm';
import User from './user';

export default class Parcel extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  // Foreign key
  @column({ columnName: 'placedBy' })
  public placedBy: number;

  @column()
  public weight: number;

  @column()
  public weightmetric: string;

  @column.date({ autoCreate: true, columnName: 'sentOn' })
  public sentOn: DateTime;

  @column.date()
  public deliveredOn: DateTime;

  @column({ prepare: (value: string) => value.toLowerCase() })
  public status: string;

  @column()
  public from: string;

  @column()
  public to: string;

  @column()
  public currentLocation: string;

  @belongsTo(() => User, {
    foreignKey: 'placedBy',
  })
  public user: BelongsTo<typeof User>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
