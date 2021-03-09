import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Parcels extends BaseSchema {
  protected tableName = 'parcels'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('placedBy').unsigned().notNullable()
      table.foreign('placedBy').references('id').inTable('users')
      table.float('weight').unsigned().notNullable()
      table.string('weightmetric', 255).notNullable()
      table.timestamp('sentOn').notNullable()
      table.timestamp('deliveredOn')
      table.enu('status', ['placed', 'transiting', 'delivered']).notNullable()
      table.string('from', 255).notNullable()
      table.string('to', 255).notNullable()
      table.string('currentLocation', 255)


      table.timestamps(true)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
