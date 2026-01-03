/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import OpenAI from 'openai';
import type { GenerateContentConfig } from '@google/genai';
import type { Config } from '../../../config/config.js';
import type { ContentGeneratorConfig } from '../../contentGenerator.js';
import { DEFAULT_TIMEOUT, DEFAULT_MAX_RETRIES } from '../constants.js';
import type { OpenAICompatibleProvider } from './types.js';

export const DEFAULT_OLLAMA_BASE_URL = 'http://localhost:11434/v1';
export const DEFAULT_OLLAMA_MODEL = 'qwen3-coder:14b';

/**
 * Ollama provider for local model inference
 *
 * Ollama provides easy-to-use local LLM serving with automatic GPU support.
 * Compatible with OpenAI API format at http://localhost:11434/v1
 */
export class OllamaProvider implements OpenAICompatibleProvider {
  protected contentGeneratorConfig: ContentGeneratorConfig;
  protected cliConfig: Config;

  constructor(
    contentGeneratorConfig: ContentGeneratorConfig,
    cliConfig: Config,
  ) {
    this.cliConfig = cliConfig;
    this.contentGeneratorConfig = contentGeneratorConfig;
  }

  /**
   * Check if the configuration is for Ollama
   */
  static isOllamaProvider(
    contentGeneratorConfig: ContentGeneratorConfig,
  ): boolean {
    const baseUrl = contentGeneratorConfig.baseUrl?.toLowerCase() || '';

    // Check if explicitly configured for Ollama
    if (
      baseUrl.includes('localhost:11434') ||
      baseUrl.includes('127.0.0.1:11434')
    ) {
      return true;
    }

    // Check if model name suggests Ollama (e.g., qwen3-coder:14b)
    const model = contentGeneratorConfig.model || '';
    if (model.includes(':') && model.startsWith('qwen')) {
      return true;
    }

    return false;
  }

  /**
   * Check if Ollama server is available
   */
  static async checkAvailability(baseUrl?: string): Promise<boolean> {
    const url = baseUrl || DEFAULT_OLLAMA_BASE_URL;

    try {
      // Try to fetch the tags endpoint (Ollama-specific)
      const tagsUrl = url.replace('/v1', '/api/tags');
      const response = await fetch(tagsUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      return response.ok;
    } catch (_error) {
      return false;
    }
  }

  /**
   * List available models from Ollama
   */
  static async listModels(baseUrl?: string): Promise<string[]> {
    const url = baseUrl || DEFAULT_OLLAMA_BASE_URL;

    try {
      const tagsUrl = url.replace('/v1', '/api/tags');
      const response = await fetch(tagsUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        return [];
      }

      const data = (await response.json()) as {
        models?: Array<{ name: string }>;
      };
      return data.models?.map((m) => m.name) || [];
    } catch (_error) {
      return [];
    }
  }

  buildHeaders(): Record<string, string | undefined> {
    const version = this.cliConfig.getCliVersion() || 'unknown';
    const userAgent = `QwenCode/${version} (${process.platform}; ${process.arch}; Ollama)`;

    return {
      'User-Agent': userAgent,
      'Content-Type': 'application/json',
    };
  }

  buildClient(): OpenAI {
    const {
      apiKey = 'ollama', // Ollama doesn't require API key, but OpenAI SDK needs something
      baseUrl = DEFAULT_OLLAMA_BASE_URL,
      timeout = DEFAULT_TIMEOUT,
      maxRetries = DEFAULT_MAX_RETRIES,
    } = this.contentGeneratorConfig;

    const defaultHeaders = this.buildHeaders();

    return new OpenAI({
      apiKey,
      baseURL: baseUrl,
      timeout,
      maxRetries,
      defaultHeaders,
    });
  }

  buildRequest(
    request: OpenAI.Chat.ChatCompletionCreateParams,
    _userPromptId: string,
  ): OpenAI.Chat.ChatCompletionCreateParams {
    // Ollama-specific enhancements
    const ollamaRequest: OpenAI.Chat.ChatCompletionCreateParams & {
      keep_alive?: string;
    } = {
      ...request,
      // Map model name if needed
      model: this.mapModelName(request.model),
      // Keep model loaded in memory for 5 minutes after last request
      keep_alive: '5m',
    };

    return ollamaRequest;
  }

  getDefaultGenerationConfig(): GenerateContentConfig {
    return {
      temperature: 0.7,
      topP: 0.95,
      maxOutputTokens: 8192, // Ollama supports up to 32K context
    };
  }

  /**
   * Map generic model names to Ollama-specific tags
   */
  private mapModelName(model: string): string {
    // If already in Ollama format (has colon), use as-is
    if (model.includes(':')) {
      return model;
    }

    // Map common model names to Ollama tags
    const modelMap: Record<string, string> = {
      'coder-model': DEFAULT_OLLAMA_MODEL,
      'qwen3-coder': 'qwen3-coder:14b',
      'qwen3-coder-7b': 'qwen3-coder:7b',
      'qwen3-coder-14b': 'qwen3-coder:14b',
      'qwen3-coder-32b': 'qwen3-coder:32b',
      'qwen3-coder-plus': 'qwen3-coder:32b',
    };

    return modelMap[model.toLowerCase()] || DEFAULT_OLLAMA_MODEL;
  }
}
