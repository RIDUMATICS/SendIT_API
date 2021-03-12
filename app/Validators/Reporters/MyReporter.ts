import {
  MessagesBagContract,
  ErrorReporterContract,
} from '@ioc:Adonis/Core/Validator';
import ValidationException from 'App/Exceptions/ValidationException';

type ErrorMessage = string[];
type ErrorNode = {
  error: ErrorMessage;
  status: number;
};

export class MyReporter implements ErrorReporterContract<ErrorNode> {
  public hasErrors = false;

  /**
   * Tracking reported errors
   */
  private errors: ErrorMessage = [];

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
    this.errors.push(errorMessage);

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
      error: this.errors,
      status: 400,
    };
  }
}
