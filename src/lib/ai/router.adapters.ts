import type { AiProviderAdapter, AiRequest } from './router.types';

function buildPrompt(request: AiRequest) {
  if (typeof request.input.prompt === 'string') {
    return request.input.prompt;
  }

  return JSON.stringify(request.input, null, 2);
}

function buildSystemPrompt(request: AiRequest) {
  if (typeof request.metadata?.systemPrompt === 'string') {
    return request.metadata.systemPrompt;
  }

  if (request.task === 'resume_parse' || request.task === 'section_map' || request.task === 'jd_match') {
    return 'Return strict JSON only. Do not wrap output in markdown.';
  }

  return '';
}

function maybeParseJson(value: string) {
  const trimmed = value.replace(/```json/g, '').replace(/```/g, '').trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    return trimmed;
  }
}

function isStructuredTask(request: AiRequest) {
  return request.task === 'resume_parse' || request.task === 'section_map' || request.task === 'jd_match';
}

async function postJson<T>(url: string, init: RequestInit) {
  const response = await fetch(url, init);
  const body = await response.json().catch(() => ({} as T));

  if (!response.ok) {
    const message =
      (body as Record<string, any>)?.error?.message ||
      (body as Record<string, any>)?.message ||
      `HTTP_${response.status}`;
    throw new Error(message);
  }

  return body as T;
}

export const geminiAdapter: AiProviderAdapter = {
  name: 'gemini',
  async invoke({ request, apiKey, model }) {
    const prompt = buildPrompt(request);
    const systemPrompt = buildSystemPrompt(request);
    const contents = [];

    if (systemPrompt) {
      contents.push({ role: 'user', parts: [{ text: systemPrompt }] });
      contents.push({ role: 'model', parts: [{ text: 'Understood.' }] });
    }

    contents.push({ role: 'user', parts: [{ text: prompt }] });

    const body: Record<string, unknown> = {
      contents,
      generationConfig: {
        maxOutputTokens: request.maxTokens ?? 1600,
        temperature: request.temperature ?? 0.2,
      },
    };

    if (isStructuredTask(request)) {
      (body.generationConfig as Record<string, unknown>).responseMimeType = 'application/json';
    }

    const data = await postJson<any>(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    return {
      output: isStructuredTask(request) ? maybeParseJson(text) : text,
      raw: data,
      model,
    };
  },
};

export const groqAdapter: AiProviderAdapter = {
  name: 'groq',
  async invoke({ request, apiKey, model }) {
    const data = await postJson<any>('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: request.temperature ?? 0.2,
        max_tokens: request.maxTokens ?? 1600,
        response_format: isStructuredTask(request) ? { type: 'json_object' } : undefined,
        messages: [
          ...(buildSystemPrompt(request)
            ? [{ role: 'system', content: buildSystemPrompt(request) }]
            : []),
          { role: 'user', content: buildPrompt(request) },
        ],
      }),
    });

    const text = data.choices?.[0]?.message?.content ?? '';
    return {
      output: isStructuredTask(request) ? maybeParseJson(text) : text,
      raw: data,
      model,
    };
  },
};

export const openRouterAdapter: AiProviderAdapter = {
  name: 'openrouter',
  async invoke({ request, apiKey, model }) {
    const data = await postJson<any>('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: request.temperature ?? 0.2,
        max_tokens: request.maxTokens ?? 1600,
        response_format: isStructuredTask(request) ? { type: 'json_object' } : undefined,
        messages: [
          ...(buildSystemPrompt(request)
            ? [{ role: 'system', content: buildSystemPrompt(request) }]
            : []),
          { role: 'user', content: buildPrompt(request) },
        ],
      }),
    });

    const text = data.choices?.[0]?.message?.content ?? '';
    return {
      output: isStructuredTask(request) ? maybeParseJson(text) : text,
      raw: data,
      model,
    };
  },
};

export const nvidiaAdapter: AiProviderAdapter = {
  name: 'nvidia',
  async invoke() {
    throw new Error('NVIDIA adapter scaffold is not configured yet.');
  },
};

export const DEFAULT_AI_ADAPTERS = [geminiAdapter, groqAdapter, openRouterAdapter, nvidiaAdapter];
