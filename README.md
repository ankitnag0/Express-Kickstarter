# Express-Kickstarter

Welcome to **Express-Kickstarter** – the ultimate no-nonsense Express API boilerplate built with TypeScript. If you’re sick of half-assed starter kits and endless boilerplate that barely holds up in production, you’re in the right place. This project is secure, thoroughly tested, and packed with modern dev tools so you can build scalable APIs without the BS.

---

## What’s Inside?

### Key Features

- **TypeScript & Tooling**

  - **Type Safety:** Write code that doesn’t break at runtime.
  - **ESLint & Prettier:** Keep your code looking fresh and consistent.
  - **Jest Testing:** Unit, integration, and end-to-end tests so you never ship trash.

- **Environment & Config Management**

  - Uses **dotenv-flow** and **Zod** to load and validate environment variables. If your .env is misconfigured, the app will call you out immediately.

- **Security & Performance**

  - **Helmet, CORS, & Rate Limiting:** Basic measures to block the riff-raff.
  - **Mongo Sanitization & XSS Protection:** Stops malicious payloads dead in their tracks.
  - **Compression & HTTP Logging:** Powered by Pino (with pino-pretty in dev) to keep responses fast and logs readable.

- **Robust Error Handling**

  - Custom error classes deliver clear, no-BS messages so debugging isn’t a wild goose chase.

- **Authentication & Authorization**

  - **JWT Authentication:** Secure your endpoints with tokens so only the right folks get in.
  - **Role-Based Access Control (RBAC):** Admin-only routes ensure that only authorized peeps have access.

- **User Module**

  - Complete user management: sign-up, sign-in, profile updates, and role management.
  - Comprehensive tests cover every layer (repository, service, controller) ensuring your user flows are bulletproof.

- **Developer Experience**
  - A clean, organized project structure with preconfigured linting, formatting, and TypeScript settings (see `tsconfig.json` for performance optimizations and absolute imports).

---

## Getting Started

### Prerequisites

- **Node.js:** v14+ (LTS recommended).
- **MongoDB:** Running instance (local or remote).
- **Package Manager:** [pnpm](https://pnpm.io/) is recommended (npm works too if that’s your style).

### Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/yourusername/express-kickstarter.git
   cd express-kickstarter
   ```

2. **Install Dependencies:**

   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Configure Your Environment:**

   - Duplicate the `.env.example` file to create your own `.env`:

     ```bash
     cp .env.example .env.development
     ```

   - Edit the `.env` file with your settings:
     - `NODE_ENV` — `development`, `test`, or `production`
     - `PORT` — Your server’s port (default: 3000)
     - `CORS_ORIGIN` — Comma-separated allowed origins (e.g., `http://localhost:3000`)
     - `MONGODB_URL` — Your MongoDB connection string
     - `JWT_SECRET` — Secret key for signing JWTs (keep this locked down)
     - `JWT_EXPIRATION` — Expiration time in seconds (e.g., `3600`)

---

## Running the Server

### Development Mode

Run the server with hot-reloading to get instant feedback:

```bash
pnpm run dev
# or
npm run dev
```

### Production Build

Build your project and run it like a boss:

```bash
pnpm run build
pnpm run start
# or with npm:
npm run build
npm run start
```

---

## Testing

This project comes with a rock-solid testing suite—no shortcuts here:

- **Run All Tests:**

  ```bash
  pnpm run test
  # or
  npm run test
  ```

- **Watch Mode:**  
  For rapid feedback during development.

  ```bash
  pnpm run test:watch
  # or
  npm run test:watch
  ```

Tests cover everything—from API endpoints to service and repository logic—so you can be sure your app isn’t complete garbage.

---

## Project Structure

```
├── .env.example                   # Template for environment variables
├── .gitignore                     # Files/folders to ignore in Git
├── .prettierrc & .prettierignore  # Code formatting configuration
├── eslint.config.mjs              # ESLint rules to enforce code quality
├── jest.config.ts                 # Jest testing configuration
├── package.json                   # Project metadata and scripts
├── tsconfig.json                  # TypeScript compiler options and path aliases
└── src/                           # Main source code
    ├── app.ts                     # Express app setup with middleware
    ├── config/                    # Environment, database, and logger configurations
    ├── lib/                       # Custom error classes and validation utilities
    ├── middlewares/               # Authentication, error handling, logging, etc.
    └── modules/                   # Feature modules (e.g., User module with routes, controllers, services, tests)
```

---

## Contributing

Think you can improve this boilerplate? Fork the repo, commit your changes, and open a pull request. Just keep it clean, well-tested, and actually useful—no half-assing it.

---

## License

Express-Kickstarter is licensed under the **ISC License**. Use it, modify it, but if it breaks your app, don’t come crying to us.

---

## Final Thoughts

Express-Kickstarter isn’t here to hold your hand—it’s built for developers who demand efficiency, security, and scalable code. If you’re done with wimpy starter kits and ready for something that actually works, dive in and build something epic.

No sugar-coating. No excuses. Just solid, production-ready code.
