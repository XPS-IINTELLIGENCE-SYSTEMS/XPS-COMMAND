// GROQ-NATIVE LAYER — Bypass Base44 completely for all LLM operations

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Get API key from environment (works in both frontend and backend)
const getGroqKey = () => {
  if (typeof window !== 'undefined') {
    return import.meta.env.VITE_GROQ_API_KEY;
  }
  return Deno?.env?.get?.('GROQ_API_KEY') || process?.env?.GROQ_API_KEY;
};

// GROQ MODEL SELECTION
const MODEL = 'mixtral-8x7b-32768'; // Fastest, best quality
// Alternative models:
// - mixtral-8x7b: 5-10 req/min
// - llama2-70b: Slower, better reasoning
// - gemma-7b: Lightweight

/**
 * DIRECT GROQ CALL — No Base44, pure API
 * @param {string} prompt - User prompt
 * @param {object} options - temperature, max_tokens, etc.
 * @returns {Promise<string>} - LLM response
 */
export async function groqInvoke(prompt, options = {}) {
  const GROQ_API_KEY = getGroqKey();
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY not set');
  }

  const payload = {
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: options.system || 'You are a helpful AI assistant.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: options.temperature || 0.7,
    max_tokens: options.max_tokens || 2000,
    top_p: options.top_p || 1,
    frequency_penalty: options.frequency_penalty || 0,
    presence_penalty: options.presence_penalty || 0,
  };

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * JSON MODE — Groq returns structured JSON
 * @param {string} prompt - Prompt that asks for JSON
 * @param {object} schema - JSON schema for response
 * @returns {Promise<object>} - Parsed JSON response
 */
export async function groqJsonMode(prompt, schema = {}) {
  const jsonPrompt = `${prompt}

Return ONLY valid JSON matching this schema:
${JSON.stringify(schema, null, 2)}`;

  const response = await groqInvoke(jsonPrompt, {
    temperature: 0.3, // Lower temp for structured output
    max_tokens: 4000,
  });

  try {
    return JSON.parse(response);
  } catch (e) {
    console.error('Failed to parse Groq JSON response:', response);
    throw new Error('Invalid JSON from Groq');
  }
}

/**
 * STREAMING MODE — Stream response token by token
 * @param {string} prompt - User prompt
 * @param {function} onToken - Callback for each token
 * @returns {Promise<string>} - Full response
 */
export async function groqStream(prompt, onToken) {
  const GROQ_API_KEY = getGroqKey();
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY not set');
  }

  const payload = {
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    stream: true,
  };

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`);
  }

  let fullResponse = '';
  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const text = decoder.decode(value);
    const lines = text.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          const token = parsed.choices[0]?.delta?.content || '';
          if (token) {
            fullResponse += token;
            if (onToken) onToken(token);
          }
        } catch (e) {
          // Skip parse errors for incomplete data
        }
      }
    }
  }

  return fullResponse;
}

/**
 * BATCH MODE — Process multiple prompts efficiently
 * @param {string[]} prompts - Array of prompts
 * @returns {Promise<string[]>} - Array of responses
 */
export async function groqBatch(prompts) {
  return Promise.all(prompts.map(p => groqInvoke(p)));
}

/**
 * SMART ROUTER — Route to Groq based on task type
 * @param {string} task - Task description
 * @param {string} prompt - User prompt
 * @returns {Promise<string>} - Response
 */
export async function groqSmartRouter(task, prompt) {
  // Fast tasks → Groq (this layer)
  // Deep reasoning → Optional Anthropic fallback
  // For now: all to Groq
  return groqInvoke(prompt, {
    system: `You are an expert at: ${task}`,
  });
}

export default {
  groqInvoke,
  groqJsonMode,
  groqStream,
  groqBatch,
  groqSmartRouter,
};