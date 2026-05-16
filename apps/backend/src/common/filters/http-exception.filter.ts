import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

interface ErrorResponseBody {
  statusCode: number;
  message: string | string[];
  error?: string;
  path: string;
  timestamp: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const { status, body } = this.buildResponse(exception, request);
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(`${request.method} ${request.url}`, exception);
    }
    response.status(status).json(body);
  }

  private buildResponse(
    exception: unknown,
    request: Request,
  ): { status: number; body: ErrorResponseBody } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();
      const message = this.extractMessage(payload, exception.message);
      const error = this.extractError(payload, exception.name);
      return {
        status,
        body: {
          statusCode: status,
          message,
          error,
          path: request.url,
          timestamp: new Date().toISOString(),
        },
      };
    }
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      body: {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        error: 'InternalServerError',
        path: request.url,
        timestamp: new Date().toISOString(),
      },
    };
  }

  private extractMessage(payload: unknown, fallback: string): string | string[] {
    if (typeof payload === 'string') {
      return payload;
    }
    if (payload && typeof payload === 'object' && 'message' in payload) {
      const value = (payload as { message: unknown }).message;
      if (typeof value === 'string' || Array.isArray(value)) {
        return value as string | string[];
      }
    }
    return fallback;
  }

  private extractError(payload: unknown, fallback: string): string {
    if (payload && typeof payload === 'object' && 'error' in payload) {
      const value = (payload as { error: unknown }).error;
      if (typeof value === 'string') {
        return value;
      }
    }
    return fallback;
  }
}
