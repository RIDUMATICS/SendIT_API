import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { schema, rules } from '@ioc:Adonis/Core/Validator';
import User from 'App/Models/user';

export default class AuthController {
  public async register({ request, response, auth }: HttpContextContract) {
    const data = await request.validate({
      schema: schema.create({
        firstname: schema.string({ trim: true }),
        lastname: schema.string({ trim: true }),
        email: schema.string({ trim: true }, [
          rules.email(),
          rules.lowerCase(), // convert to lowercase
          rules.unique({ table: 'users', column: 'email' }),
        ]),
        username: schema.string({ trim: true }, [
          rules.minLength(2),
          rules.lowerCase(), // convert to lowercase
          rules.blacklist([
            'admin',
            'super',
            'root',
            'agent',
            'send-it',
            'send_it',
            'sendIt',
          ]),
          rules.unique({ table: 'users', column: 'username' }),
        ]),
        password: schema.string({}, [
          rules.minLength(8),
          rules.confirmed('confirm_password'),
        ]),
      }),
      messages: {
        required: 'Please enter {{field}}',
        unique: 'User with the {{field}} already exists',
        blacklist: 'User with the {{field}} already exists',
        'email.email': 'Please enter a valid email',
        'confirm_password.confirmed': 'Confirm password',
      },
    });

    const new_user = await User.create({ ...data, isAdmin: false });
    const { token } = await auth.attempt(data.email, data.password);

    response.created({ status: 201, data: { user: new_user, token } });
  }

  public async login({ response, request, auth }: HttpContextContract) {
    try {
      const valid_data = await request.validate({
        schema: schema.create({
          email: schema.string.optional({ trim: true }, [
            rules.email(),
            rules.lowerCase(),
          ]),
          username: schema.string.optional({ trim: true }, [
            rules.requiredIfNotExists('email'),
            rules.lowerCase(),
          ]),
          password: schema.string(),
        }),
        messages: {
          email: 'Enter a valid {{rule}}',
          required: '{{field}} is {{rule}}',
          requiredIfNotExists: 'Enter email or username',
        },
      });


      const type = valid_data.email ? 'email' : 'username';
      const value = valid_data.email || valid_data.username;

      const user = await User.findByOrFail(type, value);
      const { token } = await auth.attempt(user.email, valid_data.password);
      response.ok({ status: 200, data: { user, token } });
    } catch (error) {
      if (
        error.code === 'E_ROW_NOT_FOUND' ||
        error.code === 'E_INVALID_AUTH_PASSWORD'
      )
        return response.notFound({
          status: 404,
          error: 'The email or password you entered did not match our records.',
        });

      return error;
    }
  }
}
