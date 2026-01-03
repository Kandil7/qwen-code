# Qwen Code Project

This document provides an overview of the Qwen Code project, a terminal-based AI agent.

## Project Overview

Qwen Code is an open-source AI agent for the terminal, optimized for Qwen3-Coder. It is a fork of the Google Gemini CLI, adapted to better support Qwen-Coder models. The project is a TypeScript monorepo managed with npm workspaces.

The architecture consists of two main packages:

- `packages/cli`: The user-facing frontend that handles input, output, and the terminal UI.
- `packages/core`: The backend that interacts with the AI model, manages tools (skills), and handles the core logic.

## Building and Running

The project uses Node.js and npm for dependency management and scripting.

### Prerequisites

- Node.js >= 20.0.0

### Key Commands

The `package.json` file contains a comprehensive list of scripts. The most common ones are also available as `make` commands.

| Command             | Description                                                                           |
| :------------------ | :------------------------------------------------------------------------------------ |
| `npm install`       | Install all dependencies for the monorepo.                                            |
| `npm run build`     | Build all packages. This bundles the code using esbuild.                              |
| `npm start`         | Run the Qwen Code CLI in interactive mode.                                            |
| `npm run debug`     | Run the Qwen Code CLI with the Node.js inspector attached.                            |
| `npm test`          | Run the unit and integration tests for all packages using vitest.                     |
| `npm run lint`      | Lint the codebase using ESLint.                                                       |
| `npm run format`    | Format the codebase using Prettier.                                                   |
| `npm run preflight` | Run a full suite of checks: clean, install, format, lint, build, typecheck, and test. |

## Development Conventions

- **Monorepo:** The project is structured as a monorepo with packages located in the `packages/` directory.
- **Linting & Formatting:** ESLint and Prettier are used for maintaining code quality and consistency. A pre-commit hook is set up with husky to enforce these standards.
- **Testing:** Tests are written with `vitest`. Test files are co-located with the source code or in `__tests__` directories. Integration tests are in the `integration-tests/` directory.
- **Build System:** `esbuild` is used for fast TypeScript bundling.
- **Architecture:** The application is split into a `cli` frontend and a `core` backend, promoting separation of concerns. The core is extensible through a tool system. More details can be found in `docs/developers/architecture.md`.
