import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/user'

export default class AdminSeeder extends BaseSeeder {
  public async run () {
    // Write your database queries inside the run method
    await User.create({
      firstname: "SendIT",
      lastname: "Admin",
      email: "admin@sendit.com",
      password: "admin",
      isAdmin: true,
      username: "Admin"
    })
  }
}
