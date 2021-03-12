import { Exception } from '@poppinss/utils';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

/*
|--------------------------------------------------------------------------
| Exception
|--------------------------------------------------------------------------
|
| The Exception class imported from `@adonisjs/core` allows defining
| a status code and error code for every exception.
|
| @example
| new ValidationException('message', 500, 'E_RUNTIME_EXCEPTION')
|
*/
export default class ValidationException extends Exception {
  constructor(public flashToSession: boolean, public messages?: any) {
    super('Validation Exception', 400, 'E_VALIDATION_FAILURE');
  }

  /**
   * Handle exception.
   */
  public async handle(error: ValidationException, ctx: HttpContextContract) {
    /**
     * Return the error messages as it is when `flashToSession` is explicitly disabled
     * or session module is not installed
     */
    if (!error.flashToSession || !ctx['session']) {
      return ctx.response.status(error.status).send(error.messages);
    }

    const session = ctx['session'];

    /**
     * Flash all input, except the `_csrf`.
     */
    session.flashExcept(['_csrf', '_method']);

    /**
     * Flash errors
     */
    ctx['session'].flash('errors', error.messages);

    /**
     * Redirect back with the query string
     */
    ctx.response.redirect('back', true);
  }
}
