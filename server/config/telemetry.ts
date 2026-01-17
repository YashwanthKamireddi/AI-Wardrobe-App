import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { logger } from '../utils/logger';

/**
 * OpenTelemetry Configuration
 * Gold Standard: Distributed tracing with correlation IDs
 *
 * Provides:
 * - Automatic HTTP/Express instrumentation
 * - Trace context propagation
 * - Correlation IDs injected into logs
 */

let sdk: NodeSDK | null = null;

export function initializeOpenTelemetry(): void {
    try {
        sdk = new NodeSDK({
            instrumentations: [
                getNodeAutoInstrumentations({
                    // Automatically instrument HTTP requests and Express
                    '@opentelemetry/instrumentation-http': {},
                    '@opentelemetry/instrumentation-express': {},
                }),
            ],
        });

        sdk.start();
        logger.info('OpenTelemetry SDK initialized successfully');
    } catch (error) {
        logger.warn({ err: error }, 'Failed to initialize OpenTelemetry - continuing without tracing');
    }
}

export async function shutdownOpenTelemetry(): Promise<void> {
    if (sdk) {
        try {
            await sdk.shutdown();
            logger.info('OpenTelemetry SDK shut down');
        } catch (error) {
            logger.error({ err: error }, 'Error shutting down OpenTelemetry');
        }
    }
}
