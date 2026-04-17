export type AiTask =
  | 'resume_parse'
  | 'section_map'
  | 'ats_score'
  | 'jd_match'
  | 'jd_match_5d'
  | 'bullet_rewrite'
  | 'assistant_chat'
  | 'cover_letter_draft'
  | 'interview_prep'
  | 'profile_summary_gen'
  | 'resume_import_parse';

export type AiProviderName = 'gemini' | 'groq' | 'openrouter' | 'nvidia';

export type AiConfidence = 'high' | 'medium' | 'low';

export type AiRequest = {
  task: AiTask;
  input: Record<string, unknown>;
  schema?: object;
  temperature?: number;
  maxTokens?: number;
  metadata?: Record<string, unknown>;
  credentials?: Partial<Record<AiProviderName, string>>;
  validate?: (output: unknown) => string[];
};

export type AiResponse = {
  success: boolean;
  provider: string;
  model: string;
  output: unknown;
  confidence?: AiConfidence;
  error?: string;
  latencyMs: number;
  raw?: unknown;
};

export interface AiProviderAdapter {
  name: AiProviderName;
  invoke: (input: {
    request: AiRequest;
    apiKey: string;
    model: string;
  }) => Promise<{
    output: unknown;
    raw?: unknown;
    model?: string;
  }>;
}

export interface AiRuntimeConfig {
  providers: Record<AiProviderName, { enabled: boolean; apiKey: string; defaultModel: string }>;
  taskRouting: Record<AiTask, AiProviderName[]>;
  retryLimit: number;
}
