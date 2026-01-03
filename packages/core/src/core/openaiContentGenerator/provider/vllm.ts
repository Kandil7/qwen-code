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

export const DEFAULT_VLLM_BASE_URL = 'http://localhost:8000/v1';

/**
 * vLLM provider for high-performance local model inference
 *
 * vLLM is optimized for throughput and supports advanced features like
 * tensor parallelism and continuous batching.
 */
export class VllmProvider implements OpenAICompatibleProvider {
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
   * Check if the configuration is for vLLM
   */
  static isVllmProvider(
    contentGeneratorConfig: ContentGeneratorConfig,
  ): boolean {
    const baseUrl = contentGeneratorConfig.baseUrl?.toLowerCase() || '';

    // Check if explicitly configured for vLLM (default port 8000)
    if (
      baseUrl.includes('localhost:8000') ||
      baseUrl.includes('127.0.0.1:8000')
    ) {
      return true;
    }

    return false;
  }

  /**
   * Check if vLLM server is available
   */
  static async checkAvailability(baseUrl?: string): Promise<boolean> {
    const url = baseUrl || DEFAULT_VLLM_BASE_URL;

    try {
      // Try to fetch the models endpoint
      const modelsUrl = `${url}/models`;
      const response = await fetch(modelsUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      return response.ok;
    } catch (_error) {
      return false;
    }
  }

  buildHeaders(): Record<string, string | undefined> {
    const version = this.cliConfig.getCliVersion() || 'unknown';
    const userAgent = `QwenCode/${version} (${process.platform}; ${process.arch}; vLLM)`;

    return {
      'User-Agent': userAgent,
      'Content-Type': 'application/json',
    };
  }

  buildClient(): OpenAI {
    const {
      apiKey = 'vllm', // vLLM doesn't require API key by default
      baseUrl = DEFAULT_VLLM_BASE_URL,
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
    // vLLM supports OpenAI-compatible API directly
    // Pass through all parameters, vLLM will handle them
    return {
      ...request,
    };
  }

  getDefaultGenerationConfig(): GenerateContentConfig {
    return {
      temperature: 0.7,
      topP: 0.95,
      maxOutputTokens: 8192,
    };
  }
}
