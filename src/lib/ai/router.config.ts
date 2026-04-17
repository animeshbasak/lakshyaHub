import type { AiRuntimeConfig, AiTask } from './router.types';

const DEFAULT_TASK_ROUTING: Record<AiTask, Array<'gemini' | 'groq' | 'openrouter' | 'nvidia'>> = {
  resume_parse: ['gemini', 'groq', 'openrouter'],
  section_map: ['gemini', 'groq', 'openrouter'],
  ats_score: ['groq', 'gemini', 'openrouter'],
  jd_match: ['gemini', 'groq', 'openrouter'],
  jd_match_5d: ['gemini', 'groq', 'openrouter'],
  bullet_rewrite: ['openrouter', 'groq', 'gemini'],
  assistant_chat: ['gemini', 'groq', 'openrouter'],
  cover_letter_draft: ['gemini', 'openrouter', 'groq'],
  interview_prep: ['gemini', 'groq', 'openrouter'],
  profile_summary_gen: ['gemini', 'groq', 'openrouter'],
  resume_import_parse: ['gemini', 'groq', 'openrouter'],
};

function readEnvValue(name: string) {
  const val = process.env[name] || '';
  if (val) return val;
  // fallback: try bare key without AI_PROVIDER_ prefix
  const bare = name.replace(/^AI_PROVIDER_/, '');
  return process.env[bare] || '';
}

function readProviderEnabled(name: string) {
  return readEnvValue(name) !== 'false';
}

function readTaskPrimary(task: AiTask) {
  return readEnvValue(`AI_TASK_${task.toUpperCase()}_PRIMARY`);
}

function buildTaskRouting() {
  return Object.fromEntries(
    Object.entries(DEFAULT_TASK_ROUTING).map(([task, providers]) => {
      const configuredPrimary = readTaskPrimary(task as AiTask) as typeof providers[number] | '';
      const ordered = configuredPrimary
        ? [configuredPrimary, ...providers.filter((provider) => provider !== configuredPrimary)]
        : providers;
      return [task, ordered];
    })
  ) as AiRuntimeConfig['taskRouting'];
}

export function getAiRuntimeConfig(): AiRuntimeConfig {
  return {
    providers: {
      gemini: {
        enabled: readProviderEnabled('AI_PROVIDER_GEMINI_ENABLED'),
        apiKey: readEnvValue('AI_PROVIDER_GEMINI_API_KEY'),
        defaultModel: readEnvValue('AI_PROVIDER_GEMINI_MODEL') || 'gemini-2.0-flash',
      },
      groq: {
        enabled: readProviderEnabled('AI_PROVIDER_GROQ_ENABLED'),
        apiKey: readEnvValue('AI_PROVIDER_GROQ_API_KEY'),
        defaultModel: readEnvValue('AI_PROVIDER_GROQ_MODEL') || 'llama-3.3-70b-versatile',
      },
      openrouter: {
        enabled: readProviderEnabled('AI_PROVIDER_OPENROUTER_ENABLED'),
        apiKey: readEnvValue('AI_PROVIDER_OPENROUTER_API_KEY'),
        defaultModel: readEnvValue('AI_PROVIDER_OPENROUTER_MODEL') || 'meta-llama/llama-3.3-70b-instruct:free',
      },
      nvidia: {
        enabled: readProviderEnabled('AI_PROVIDER_NVIDIA_ENABLED'),
        apiKey: readEnvValue('AI_PROVIDER_NVIDIA_API_KEY'),
        defaultModel: readEnvValue('AI_PROVIDER_NVIDIA_MODEL') || '',
      },
    },
    taskRouting: buildTaskRouting(),
    retryLimit: Number(readEnvValue('AI_ROUTER_RETRY_LIMIT') || 1),
  };
}
