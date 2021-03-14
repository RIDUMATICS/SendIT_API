import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { schema, rules } from '@ioc:Adonis/Core/Validator';
import User from 'App/Models/user';
import { MyReporter } from 'App/Validators/Reporters/MyReporter';

export default class AuthController {
  public async register({ request, response, auth }: HttpContextContract) {
    const data = await request.validate({
      schema: schema.create({
        firstname: schema.string({ trim: true }),
        lastname: schema.string({ trim: true }),
        email: schema.string({ trim: true }, [
          rules.email(),
          rules.lowerCase(), // convert to lowercase
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
            'sendit',
          ]),
        ]),
        password: schema.string({}, [
          rules.minLength(8),
          rules.confirmed('confirm_password'),
        ]),
      }),
      messages: {
        required: '{{field}} is {{rule}}',
        unique: 'User with the {{field}} already exists',
        blacklist: 'Username is not available please try another one',
        'email.email': 'Please enter a valid email',
        'confirm_password.confirmed': 'Confirm password',
      },
      reporter: MyReporter,
    });

    const user = await User.query()
      .where('email', data.email)
      .orWhere('username', data.username)
      .first();

    if (user) {
      let message = '';
      // check if it is the email or username
      if (user.email === data.email) {
        message = 'User with the email already registered';
      } else if (user.username === data.username) {
        message = 'Username is not available please try another one';
      }
      return response.conflict({ status: 409, message });
    }

    const new_user = await User.create({ ...data, isAdmin: false });
    const { token } = await auth.attempt(data.email, data.password);

    response.created({ status: 201, data: { user: new_user, token } });
  }

  public async login({ response, request, auth }: HttpContextContract) {
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
      reporter: MyReporter,
    });

    const type = valid_data.email ? 'email' : 'username';
    const value = valid_data.email || valid_data.username;

    const user = await User.findBy(type, value);

    if (!user) {
      return response.notFound({
        status: 404,
        error: `The ${type} or password you entered did not match our records.`,
      });
    }

    const { token } = await auth.attempt(user.email, valid_data.password);
    response.ok({ status: 200, data: { user, token } });
  }
}
