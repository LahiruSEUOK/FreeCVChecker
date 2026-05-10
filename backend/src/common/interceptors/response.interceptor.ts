import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';

interface SuccessResponse<T> {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  success: true;
  message: string;
  data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, SuccessResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<SuccessResponse<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<{ statusCode: number }>();

    return next.handle().pipe(
      map((data) => {
        let message = 'Request successful';
        let responseData: T = data as T;

        if (data && typeof data === 'object' && 'message' in data && 'data' in data) {
          const structured = data as { message: string; data: T };
          message = structured.message;
          responseData = structured.data;
        }

        return {
          statusCode: res.statusCode ?? 200,
          timestamp: new Date().toISOString(),
          path: request.path,
          method: request.method,
          success: true as const,
          message,
          data: responseData,
        };
      }),
    );
  }
}
