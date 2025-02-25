# Express Kickstarter

Welcome to **Express Kickstarter**, a fully-featured, best-practices-packed Express + TypeScript boilerplate. This isn't just another template—it's a battle-hardened setup designed for scalability, maintainability, and top-tier developer experience.

## Features

### Ultimate Developer Experience

- **TypeScript First**: Strictly typed codebase for maximum safety.
- **ESLint + Prettier + Lefthook**: Auto-linting, formatting, and commit hooks ensure a clean codebase.
- **Jest with Full Test Coverage**: Includes unit, integration, and e2e tests.
- **Modular & Scalable Structure**: Follows dependency injection and feature-based modularization.

### Environment & Configurations

- **dotenv-flow for Multi-Env Support**: Unlike `dotenv`, `dotenv-flow` supports `.env.development`, `.env.production`, etc.
- **Test Environment Support**: `NODE_ENV=test` will trigger dotenv-flow to use `.env.test`, ensuring correct configurations during testing.
- **Centralized Configs**: All environment variables are validated via Zod in `config/env.ts`.

### Security & Performance

- **Helmet + CORS + Rate-Limiting**: Protects against common web vulnerabilities.
- **Mongo-Sanitize & HPP**: Prevents NoSQL injection and HTTP parameter pollution.
- **Compression Enabled**: Gzip compression via `compression` middleware.

### Logging & Error Handling

- **Pino Logger**: Blazing fast logging with colorized output in development.
- **Custom Error Handling**: Centralized error handling with `CustomError` and `ValidationError`.
- **Response Enhancer Middleware**: Ensures every response follows a structured format.

### Project Structure

```
src/
├── config/       # Configurations (env, logger, etc.)
├── lib/          # Custom utilities (CustomError, ValidationError)
├── middlewares/  # Global middlewares (auth, logging, response enhancer)
├── modules/      # Feature-based modules
│   ├── user/
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   ├── user.repository.ts
│   │   ├── user.schema.ts
│   │   ├── user.types.ts
│   │   ├── tests/
├── utils/        # Helpers (setup-tests, formatters, etc.)
```

## Setup & Installation

### 1️⃣ Clone the Repository

```sh
git clone https://github.com/your-repo/express-kickstarter.git
cd express-kickstarter
```

### 2️⃣ Install Dependencies

```sh
pnpm install
```

### 3️⃣ Setup Environment Variables

```sh
cp .env.example .env.development
cp .env.example .env.test
```

Modify `.env.development` and `.env.test` with your configuration.

### 4️⃣ Run the App

#### Development Mode

```sh
pnpm dev
```

#### Production Mode

```sh
pnpm build && pnpm start
```

### 5️⃣ Running Tests

```sh
pnpm test              # Run all tests
pnpm test:unit         # Run unit tests
pnpm test:integration  # Run integration tests
pnpm test:e2e          # Run end-to-end tests
```

> Ensure `.env.test` is properly configured, as `NODE_ENV=test` will trigger dotenv-flow to load it.

## API Conventions & Guidelines

- **Controller Methods Return `Response.success<T>()`**: Standardized responses.
- **Validation Middleware**: Uses Zod to validate request payloads.
- **Error Handling**: All errors extend `CustomError`.

## Using AI to Generate Consistent, High-Quality Code

Once an AI (like ChatGPT) is familiarized with this project’s patterns, it can:

- Generate new feature modules (`user`, `post`, `auth`, etc.) with clean, testable code.
- Maintain strict TypeScript rules and best practices.
- Write tests following the existing structure.
- Ensure all controllers return properly structured responses.
- Generate middleware, repository, and service logic without breaking conventions.

### How to Use AI with This Boilerplate

1. **Provide this README** to the AI so it understands the architecture.
2. **Explain what you need**, e.g., "Generate a `Post` module with CRUD operations."
3. **Review & refine the AI output** before adding it to the codebase.
4. **Run tests** to ensure everything integrates properly.

This approach allows for **rapid, consistent, and high-quality code generation** while maintaining best practices.

---

This boilerplate ensures you spend less time setting up and more time building!
