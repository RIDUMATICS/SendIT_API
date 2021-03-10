import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import User from 'App/Models/user';

export default class Admin {
  public async handle(
    { auth, response }: HttpContextContract,
    next: () => Promise<void>
  ) {
    if (auth.user?.isAdmin) {
      await next();
    } else {
      response.unauthorized({
        status: 401,
        error: 'Only admin is allowed',
      });
    }
  }
}
