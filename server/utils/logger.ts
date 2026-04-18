import pino from 'pino';
import { trace, context } from '@opentelemetry/api';
import appConfig from '../config/app-config';

/**
 * Pino logger mixin to inject OpenTelemetry trace context
 * Gold Standard: Correlation IDs for distributed tracing
 */
function traceMixin() {
    const activeSpan = trace.getSpan(context.active());
    if (activeSpan) {
        const spanContext = activeSpan.spanContext();
        return {
            trace_id: spanContext.traceId,
            span_id: spanContext.spanId,
            trace_flags: spanContext.traceFlags,
        };
    }
    return {};
}

/**
 * Enterprise Structured Logger (Pino)
 *
 * High-performance JSON logger replacing Winston.
 * - Configure Pino logger
 * - JSON format for production log aggregation
 * - Human-readable format for development
 * - Trace ID injection for distributed tracing
 * - JSON-first: Native structure for observability
 * - Async: Low overhead on main thread
 */

const isProduction = appConfig.environment.isProduction;
const isDevelopment = !isProduction; // Added based on the new level configuration

export const logger = pino({
    level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
    // Inject trace IDs from OpenTelemetry
    mixin: traceMixin,
    base: { service: 'vessura-api' },
    transport: isProduction
        ? undefined
        : {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
            },
        },
    formatters: {
        level: (label) => {
            return { level: label };
        },
    },
});

// Helper for backward compatibility
export function createLogger(moduleName?: string) {
    return logger.child({ module: moduleName });
}

export default {
    logger,
    createLogger
};
