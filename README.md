# CoderAI Agent Factory Frontend

A modern React-based frontend application for managing AI agents, built with TypeScript, Vite, and Tailwind CSS. This application provides a comprehensive interface for creating, managing, and monitoring various types of AI agents including regular agents, specialized agents, semantic agents, and team agents.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development](#development)
- [Building for Production](#building-for-production)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)

## Features

### Agent Management
- **Regular Agents**: Create customizable AI agents with specific instructions and capabilities
- **Specialized Agents**: Pre-configured agents with specific roles and capabilities for advanced workflows
- **Semantic Agents**: Advanced code-aware agents with semantic understanding and LSP integration
- **Deep Agents**: Advanced AI agents with planning tools, sub-agents, and virtual file systems
- **Team Agents**: Create coordinated teams of 15 specialized agents for complex projects

### Agent Types
- **Regular Agents**: Basic AI agents with customizable instructions
- **Specialized Agents**: Pre-configured agents with specific roles (DeepCode Integration)
- **Semantic Agents**: Code-aware agents with LSP integration (Serena Integration)
- **Deep Agents**: Advanced agents with planning capabilities and sub-agents
- **Team Agents**: Coordinated teams of multiple specialized agents

### Dashboard & Analytics
- Real-time monitoring of agent status and performance
- Analytics dashboard with metrics and visualizations
- Activity tracking and performance insights

### Planning Tools
- Structured plan creation for complex tasks
- Multi-step planning with customizable workflows
- Virtual file system exploration

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **React Router** for client-side routing
- **Tailwind CSS** for styling
- **TanStack Query** for server state management
- **Radix UI** for accessible UI components
- **Lucide React** for icons
- **React Hook Form** for form handling
- **Vitest** for unit testing
- **Playwright** for end-to-end testing

## Project Structure

```
frontend/
├── components/           # Reusable UI components
│   ├── ui/               # Radix UI components
│   ├── Header.tsx        # Application header
│   ├── Sidebar.tsx       # Navigation sidebar
│   └── TeamManagementDashboard.tsx # Team agent management
├── lib/                  # Utility functions and API client
│   ├── api-client.ts     # API client for backend communication
│   └── utils.ts          # Helper functions
├── pages/                # Page components
│   ├── AgentDetails.tsx  # Agent details view
│   ├── Analytics.tsx     # Analytics dashboard
│   ├── AutonomousFactory.tsx # Autonomous factory interface
│   ├── CreateAgent.tsx   # Agent creation wizard
│   ├── CreateTeamAgent.tsx # Team agent creation
│   ├── Dashboard.tsx     # Main dashboard
│   ├── DeepAgents.tsx    # Deep agents management
│   ├── DocumentUpload.tsx # Document upload interface
│   ├── HanditAI.tsx      # HanditAI integration
│   ├── SemanticAgents.tsx # Semantic agents management
│   ├── Templates.tsx     # Template management
│   └── TodoPlanner.tsx   # Task planning interface
├── styles/               # Global styles
│   └── globals.css
├── tests/                # Test files
│   ├── e2e/              # End-to-end tests
│   └── setup.ts          # Test setup
├── App.tsx               # Main application component
├── main.tsx              # Application entry point
├── index.html            # HTML template
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── vite.config.ts        # Vite configuration
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm, yarn, or bun package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd frontend
```

2. Install dependencies:
```bash
# Using npm
npm install

# Using yarn
yarn install

# Using bun
bun install
```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# API Configuration
VITE_API_BASE_URL=/api

# Development settings
NODE_ENV=development
```

## Development

Start the development server:

```bash
# Using npm
npm run dev

# Using yarn
yarn dev

# Using bun
bun run dev
```

The application will be available at `http://localhost:5173` by default.

## Building for Production

Create a production build:

```bash
# Using npm
npm run build

# Using yarn
yarn build

# Using bun
bun run build
```

Preview the production build:

```bash
# Using npm
npm run preview

# Using yarn
yarn preview

# Using bun
bun run preview
```

## Testing

### Unit Tests

Run unit tests with Vitest:

```bash
# Using npm
npm run test

# Using yarn
yarn test

# Using bun
bun test
```

### End-to-End Tests

Run end-to-end tests with Playwright:

```bash
# Using npm
npm run test:e2e

# Using yarn
yarn test:e2e

# Using bun
bun test:e2e
```

## Deployment

The application can be deployed to any static hosting service that supports SPA (Single Page Application) routing:

1. Build the application for production
2. Configure your hosting service to redirect all routes to `index.html`
3. Deploy the `dist` folder

Example deployment targets:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Firebase Hosting

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

### Code Style

- Follow the existing code style
- Use TypeScript for type safety
- Write unit tests for new functionality
- Ensure components are properly typed
- Use functional components with hooks

### Commit Messages

Follow conventional commit format:
- `feat: Add new feature`
- `fix: Resolve bug`
- `docs: Update documentation`
- `test: Add tests`
- `refactor: Restructure code`
- `chore: Update dependencies`

## Integration with GitHub Spec-Kit

This project can be enhanced with [GitHub Spec-Kit](https://github.com/github/spec-kit), a toolkit for spec-driven development that works with AI coding agents.

### What is GitHub Spec-Kit?

GitHub Spec-Kit is a toolkit that enables Spec-Driven Development, which flips the script on traditional software development. Instead of code being king, specifications become executable and directly generate working implementations.

### Prerequisites for Integration

To use GitHub Spec-Kit with this codebase, the following would need to be present:

1. **AI Coding Agent**: One of the supported agents:
   - GitHub Copilot
   - Claude Code
   - Gemini CLI
   - Cursor
   - Qwen Code
   - opencode
   - Windsurf
   - Codex CLI

2. **System Requirements**:
   - Linux/macOS (or WSL2 on Windows)
   - Python 3.11+
   - uv for package management
   - Git

3. **Installation**:
   ```bash
   uv tool install specify-cli --from git+https://github.com/github/spec-kit.git
   ```

### Integration Process

1. **Initialize Spec-Kit in Project**:
   ```bash
   specify init . --ai copilot
   ```

2. **Establish Project Principles**:
   ```
   /constitution Create principles focused on React development with TypeScript, emphasizing component reusability, accessibility, and performance optimization
   ```

3. **Create Specifications**:
   ```
   /specify Create a new dashboard component that displays agent performance metrics with real-time updates and filtering capabilities
   ```

4. **Create Technical Implementation Plan**:
   ```
   /plan The dashboard should use React with TypeScript, Tailwind CSS for styling, and integrate with the existing API client. Use TanStack Query for data fetching and caching.
   ```

5. **Break Down into Tasks**:
   ```
   /tasks
   ```

6. **Execute Implementation**:
   ```
   /implement
   ```

### Benefits of Integration

- **Structured Development Process**: Spec-Kit provides a systematic approach to feature development
- **Enhanced AI Collaboration**: Better guidance for AI coding agents with clear specifications
- **Improved Code Quality**: Consistent implementation based on well-defined specifications
- **Faster Development**: Reduced time spent on planning and design phases
- **Better Documentation**: Executable specifications serve as living documentation

### Usage with Current Codebase

To integrate Spec-Kit with the existing CoderAI Agent Factory frontend:

1. Install the prerequisites mentioned above
2. Run `specify init` in the project root
3. Use the slash commands to create specifications for new features:
   - Use `/specify` to define what you want to build
   - Use `/plan` to create technical implementation plans
   - Use `/tasks` to break down implementation into actionable steps
   - Use `/implement` to execute the tasks

This approach would work particularly well with the existing agent management features, dashboard components, and analytics visualizations in the current codebase.
