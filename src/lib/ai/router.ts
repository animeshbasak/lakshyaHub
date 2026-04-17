import { DEFAULT_AI_ADAPTERS } from './router.adapters';
import { getAiRuntimeConfig } from './router.config';
import type { AiProviderAdapter, AiRequest, AiResponse, AiRuntimeConfig } from './router.types';

function shouldRetry(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /RATE_LIMIT|TIMEOUT|ECONNRESET|TEMPORARY|HTTP_5|STRUCTURE_INVALID/i.test(message);
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export function createAiRouter(options?: {
  adapters?: AiProviderAdapter[];
  config?: AiRuntimeConfig;
  logger?: Pick<Console, 'info' | 'warn'>;
}) {
  const config = options?.config ?? getAiRuntimeConfig();
  const adapters = new Map((options?.adapters ?? DEFAULT_AI_ADAPTERS).map((adapter) => [adapter.name, adapter]));
  const logger = options?.logger ?? console;

  return {
    async execute(request: AiRequest): Promise<AiResponse> {
      const route = config.taskRouting[request.task];
      const errors: string[] = [];

      for (const providerName of route) {
        const adapter = adapters.get(providerName);
        const providerConfig = config.providers[providerName];
        const apiKey = request.credentials?.[providerName] || providerConfig.apiKey;

        if (!adapter || !providerConfig?.enabled || !apiKey) {
          continue;
        }

        const maxAttempts = 1 + config.retryLimit;

        for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
          const startedAt = Date.now();

          try {
            const result = await adapter.invoke({
              request,
              apiKey,
              model: providerConfig.defaultModel,
            });
            const validationErrors = request.validate?.(result.output) ?? [];

            if (validationErrors.length > 0) {
              throw new Error(`STRUCTURE_INVALID:${validationErrors.join('; ')}`);
            }

            const response: AiResponse = {
              success: true,
              provider: providerName,
              model: result.model ?? providerConfig.defaultModel,
              output: result.output,
              latencyMs: Date.now() - startedAt,
              raw: result.raw,
            };

            logger.info('[AI Router]', {
              task: request.task,
              provider: providerName,
              model: response.model,
              success: true,
              latencyMs: response.latencyMs,
              fallbackUsed: route[0] !== providerName,
            });

            return response;
          } catch (error) {
            const latencyMs = Date.now() - startedAt;
            const errorMessage = getErrorMessage(error);
            errors.push(`${providerName}:${errorMessage}`);
            logger.warn('[AI Router]', {
              task: request.task,
              provider: providerName,
              model: providerConfig.defaultModel,
              success: false,
              latencyMs,
              error: errorMessage,
              attempt: attempt + 1,
            });

            if (attempt < maxAttempts - 1 && shouldRetry(error)) {
              continue;
            }

            break;
          }
        }
      }

      return {
        success: false,
        provider: 'none',
        model: '',
        output: null,
        error: errors[errors.length - 1] || 'No AI provider was available for this task.',
        latencyMs: 0,
      };
    },
  };
}

export const aiRouter = createAiRouter();
