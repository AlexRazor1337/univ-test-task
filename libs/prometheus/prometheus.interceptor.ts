import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Counter, Histogram } from 'prom-client';
import { Observable, tap } from 'rxjs';
import apiConfig from '../config/api.config';
import prometheusConfig from '../config/prometheus.config';

const httpRequestCounter = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'status', 'path'],
});

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'status', 'path'],
  buckets: [0.005, 0.01, 0.05, 0.1, 0.3, 0.5, 1, 3, 5],
});

@Injectable()
export class PrometheusInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, route, url } = request;
    const path = route?.path || url;

    // Ignore metrics endpoint
    if (
      path.startsWith(`/${apiConfig.prefix}${prometheusConfig.metricsEndpoint}`)
    ) {
      return next.handle();
    }

    const end = httpRequestDuration.startTimer({ method, path });

    return next.handle().pipe(
      tap({
        next: () => {
          const status = response.statusCode || 200;
          httpRequestCounter.inc({ method, status, path });
          end({ method, status, path });
        },
        error: (err) => {
          let status: number;

          if (err instanceof HttpException) {
            status = err.getStatus();
          } else {
            status = 500;
          }

          httpRequestCounter.inc({ method, status, path });
          end({ method, status, path });
        },
      }),
    );
  }
}
