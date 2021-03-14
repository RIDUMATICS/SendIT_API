import {
  MessagesBagContract,
  ErrorReporterContract,
} from '@ioc:Adonis/Core/Validator';
import ValidationException from 'App/Exceptions/ValidationException';

type ErrorMessage = string | string[];
type ErrorNode = {
  message: ErrorMessage;
  status: number;
};

export class MyReporter implements ErrorReporterContract<ErrorNode> {
  public hasErrors = false;

  /**
   * Tracking reported errors
   */
  private error: ErrorMessage = '';

  constructor(private messages: MessagesBagContract, private bail: boolean) {}

  /**
   * Invoked by the validation rules to
   * report the error
   */
  public report(
    pointer: string,
    rule: string,
    message: string,
    arrayExpressionPointer?: string,
    args?: any
  ) {
    /**
     * Turn on the flag
     */
    this.hasErrors = true;

    /**
     * Use messages bag to get the error message
     */
    const errorMessage = this.messages.get(
      pointer,
      rule,
      message,
      arrayExpressionPointer,
      args
    );

    /**
     * Track error message
     */

    if (typeof this.error === 'string') {
      if (this.error === '') {
        this.error = errorMessage;
      } else {
        this.error = [this.error];
        this.error.push(errorMessage);
      }
    } else {
      this.error.push(errorMessage);
    }

    /**
     * Bail mode means, stop validation on the first
     * error itself
     */
    if (this.bail) {
      throw this.toError();
    }
  }

  /**
   * Converts validation failures to an exception
   */
  public toError() {
    throw new ValidationException(false, this.toJSON());
  }

  /**
   * Get error messages as JSON
   */
  public toJSON() {
    return {
      message: this.error,
      status: 400,
    };
  }
}
