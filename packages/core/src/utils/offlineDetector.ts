/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Utility for detecting offline status and local model server availability
 */

export interface ServerAvailability {
  isAvailable: boolean;
  serverType?: 'ollama' | 'vllm' | 'custom';
  baseUrl?: string;
  models?: string[];
  error?: string;
}

/**
 * Check if a local model server is available at the given URL
 */
export async function checkLocalServerAvailability(
  baseUrl: string,
  timeout: number = 5000,
): Promise<ServerAvailability> {
  try {
    // Try Ollama-specific endpoint first
    const ollamaTagsUrl = baseUrl.replace(/\/v1\/?$/, '/api/tags');

    const ollamaResponse = await fetch(ollamaTagsUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(timeout),
    });

    if (ollamaResponse.ok) {
      const data = (await ollamaResponse.json()) as {
        models?: Array<{ name: string }>;
      };
      return {
        isAvailable: true,
        serverType: 'ollama',
        baseUrl,
        models: data.models?.map((m) => m.name) || [],
      };
    }
  } catch (_error) {
    // Not Ollama, try vLLM format
  }

  try {
    // Try vLLM/OpenAI-compatible /models endpoint
    const modelsUrl = baseUrl.endsWith('/v1')
      ? `${baseUrl}/models`
      : `${baseUrl}/v1/models`;

    const modelsResponse = await fetch(modelsUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(timeout),
    });

    if (modelsResponse.ok) {
      const data = (await modelsResponse.json()) as {
        data?: Array<{ id: string }>;
        models?: string[];
      };
      const models = data.data?.map((m) => m.id) || data.models || [];

      return {
        isAvailable: true,
        serverType: baseUrl.includes(':8000') ? 'vllm' : 'custom',
        baseUrl,
        models,
      };
    }
  } catch (error) {
    return {
      isAvailable: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }

  return {
    isAvailable: false,
    error: 'No local model server found at the specified URL',
  };
}

/**
 * Auto-detect local model servers on common ports
 */
export async function autoDetectLocalServer(): Promise<ServerAvailability> {
  const commonEndpoints = [
    'http://localhost:11434/v1', // Ollama default
    'http://127.0.0.1:11434/v1',
    'http://localhost:8000/v1', // vLLM default
    'http://127.0.0.1:8000/v1',
  ];

  for (const endpoint of commonEndpoints) {
    const result = await checkLocalServerAvailability(endpoint, 2000);
    if (result.isAvailable) {
      return result;
    }
  }

  return {
    isAvailable: false,
    error: 'No local model server detected on common ports (11434, 8000)',
  };
}

/**
 * Check if the system has internet connectivity
 */
export async function checkInternetConnectivity(
  timeout: number = 3000,
): Promise<boolean> {
  try {
    // Try to reach a reliable endpoint
    const response = await fetch(
      'https://dns.google/resolve?name=example.com',
      {
        method: 'HEAD',
        signal: AbortSignal.timeout(timeout),
      },
    );

    return response.ok;
  } catch (_error) {
    return false;
  }
}

/**
 * Get helpful error message for local server unavailability
 */
export function getLocalServerSetupInstructions(
  serverType: 'ollama' | 'vllm' = 'ollama',
): string {
  if (serverType === 'ollama') {
    return `
Ollama is not running. To use local models:

1. Install Ollama:
   Linux/macOS: curl -fsSL https://ollama.com/install.sh | sh
   Windows: Download from https://ollama.com/download

2. Pull a Qwen3-Coder model:
   ollama pull qwen3-coder:14b

3. Ollama should start automatically. If not, run:
   ollama serve

4. Try your request again.

For more help, visit: https://github.com/ollama/ollama
    `.trim();
  }

  return `
vLLM server is not running. To use vLLM:

1. Install vLLM:
   pip install vllm

2. Start vLLM server with Qwen3-Coder:
   vllm serve Qwen/Qwen3-Coder-14B --port 8000

3. Try your request again.

For more help, visit: https://docs.vllm.ai
  `.trim();
}
