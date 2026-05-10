import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ValidationError {
  field: string;
  message: string;
}

interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  success: false;
  message: string;
  errors?: ValidationError[];
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse = this._buildErrorResponse(exception, status, request);

    if (status >= 500) {
      this.logger.error(
        JSON.stringify({
          action: 'UNHANDLED_ERROR',
          path: request.path,
          method: request.method,
          status,
          error: exception instanceof Error ? exception.stack : String(exception),
        }),
      );
    }

    response.status(status).json(errorResponse);
  }

  private _buildErrorResponse(
    exception: unknown,
    status: number,
    request: Request,
  ): ErrorResponse {
    const base: ErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.path,
      method: request.method,
      success: false,
      message: 'An error occurred',
    };

    if (!(exception instanceof HttpException)) {
      base.message = 'Internal server error';
      return base;
    }

    const exceptionResponse = exception.getResponse();

    if (typeof exceptionResponse === 'string') {
      base.message = exceptionResponse;
      return base;
    }

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const resp = exceptionResponse as Record<string, unknown>;
      base.message = (resp['message'] as string) ?? exception.message;

      if ((status === 400 || status === 422) && Array.isArray(resp['message'])) {
        base.errors = (resp['message'] as string[]).map((msg) => ({
          field: msg.split(' ')[0] ?? 'unknown',
          message: msg,
        }));
        base.message = 'Validation failed';
      }
    }

    return base;
  }
}
