/**
 * @license
 * Copyright 2025 Qwen
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  ContentGenerator,
  ContentGeneratorConfig,
} from '../contentGenerator.js';
import type { Config } from '../../config/config.js';
import { OpenAIContentGenerator } from './openaiContentGenerator.js';
import {
  DashScopeOpenAICompatibleProvider,
  DeepSeekOpenAICompatibleProvider,
  ModelScopeOpenAICompatibleProvider,
  OpenRouterOpenAICompatibleProvider,
  OllamaProvider,
  VllmProvider,
  type OpenAICompatibleProvider,
  DefaultOpenAICompatibleProvider,
} from './provider/index.js';

export { OpenAIContentGenerator } from './openaiContentGenerator.js';
export { ContentGenerationPipeline, type PipelineConfig } from './pipeline.js';

export {
  type OpenAICompatibleProvider,
  DashScopeOpenAICompatibleProvider,
  DeepSeekOpenAICompatibleProvider,
  OpenRouterOpenAICompatibleProvider,
  OllamaProvider,
  VllmProvider,
} from './provider/index.js';

export { OpenAIContentConverter } from './converter.js';

/**
 * Create an OpenAI-compatible content generator with the appropriate provider
 */
export function createOpenAIContentGenerator(
  contentGeneratorConfig: ContentGeneratorConfig,
  cliConfig: Config,
): ContentGenerator {
  const provider = determineProvider(contentGeneratorConfig, cliConfig);
  return new OpenAIContentGenerator(
    contentGeneratorConfig,
    cliConfig,
    provider,
  );
}

/**
 * Determine the appropriate provider based on configuration
 * Priority order:
 * 1. Local providers (Ollama, vLLM)
 * 2. Cloud providers (DashScope, DeepSeek, OpenRouter, ModelScope)
 * 3. Default OpenAI-compatible provider
 */
export function determineProvider(
  contentGeneratorConfig: ContentGeneratorConfig,
  cliConfig: Config,
): OpenAICompatibleProvider {
  const config =
    contentGeneratorConfig || cliConfig.getContentGeneratorConfig();

  // Check for local providers first (highest priority)
  if (OllamaProvider.isOllamaProvider(config)) {
    return new OllamaProvider(contentGeneratorConfig, cliConfig);
  }

  if (VllmProvider.isVllmProvider(config)) {
    return new VllmProvider(contentGeneratorConfig, cliConfig);
  }

  // Check for DashScope provider
  if (DashScopeOpenAICompatibleProvider.isDashScopeProvider(config)) {
    return new DashScopeOpenAICompatibleProvider(
      contentGeneratorConfig,
      cliConfig,
    );
  }

  if (DeepSeekOpenAICompatibleProvider.isDeepSeekProvider(config)) {
    return new DeepSeekOpenAICompatibleProvider(
      contentGeneratorConfig,
      cliConfig,
    );
  }

  // Check for OpenRouter provider
  if (OpenRouterOpenAICompatibleProvider.isOpenRouterProvider(config)) {
    return new OpenRouterOpenAICompatibleProvider(
      contentGeneratorConfig,
      cliConfig,
    );
  }

  // Check for ModelScope provider
  if (ModelScopeOpenAICompatibleProvider.isModelScopeProvider(config)) {
    return new ModelScopeOpenAICompatibleProvider(
      contentGeneratorConfig,
      cliConfig,
    );
  }

  // Default provider for standard OpenAI-compatible APIs
  return new DefaultOpenAICompatibleProvider(contentGeneratorConfig, cliConfig);
}

export { type ErrorHandler, EnhancedErrorHandler } from './errorHandler.js';
