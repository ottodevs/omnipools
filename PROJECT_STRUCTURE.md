# OmniPools Project Structure

## 📁 Root Directory

```
omnipools-app/
├── 📚 docs/                    # Documentation
│   ├── README.md              # Documentation hub
│   ├── guides/                # Getting started guides
│   ├── development/           # Development guides
│   ├── reference/             # API and architecture docs
│   ├── reports/               # Technical reports
│   └── deployment/            # Deployment scripts
├── ⚙️ config/                  # Configuration files
│   ├── flow/                  # Flow blockchain config
│   ├── next/                  # Next.js config
│   └── typescript/            # TypeScript config
├── 🏗️ build/                   # Build artifacts
│   ├── cache/                 # Build cache
│   ├── coverage/              # Test coverage reports
│   └── reports/               # Build reports
├── 💻 src/                     # Source code
│   ├── app/                   # Next.js app router
│   ├── components/            # React components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility libraries
│   └── contracts/             # Flow contract configs
├── 🌐 public/                  # Static assets
│   ├── assets/                # Images and media
│   └── data/                  # Mock data for UI
├── 📜 cadence/                 # Flow smart contracts
│   ├── contracts/             # Contract definitions
│   ├── scripts/               # Read-only scripts
│   ├── transactions/          # State-changing transactions
│   ├── tests/                 # Contract tests
│   └── vendor/                # Third-party contracts
├── 🛠️ scripts/                 # Build and utility scripts
├── 📦 assets/                  # Project assets
└── 📋 Configuration files     # Root config files (symlinks)
```

## 🔗 Symlinks

The following files in the root are symlinks to organized config files:

- `flow.json` → `config/flow/flow.json`
- `cadence.json` → `config/flow/cadence.json`
- `next.config.ts` → `config/next/next.config.ts`
- `postcss.config.mjs` → `config/next/postcss.config.mjs`
- `tsconfig.json` → `config/typescript/tsconfig.json`
- `next-env.d.ts` → `config/typescript/next-env.d.ts`
- `.cache` → `build/cache/.cache`
- `coverage.json` → `build/coverage/coverage.json`
- `tsconfig.tsbuildinfo` → `build/cache/tsconfig.tsbuildinfo`

## 📚 Documentation Structure

### 🚀 Getting Started (`docs/guides/`)
- **overview.md** - Complete project overview
- **hackathon.md** - Essential commands for hackathon
- **runbook.md** - Step-by-step operational procedures
- **troubleshooting.md** - Common issues and solutions

### 🛠️ Development (`docs/development/`)
- **guide.md** - Development workflow and setup
- **best-practices.md** - Coding standards and guidelines
- **testing.md** - Testing strategies and frameworks
- **testing-migration.md** - Migration guide for testing

### 📖 Reference (`docs/reference/`)
- **architecture.md** - System architecture and structure
- **actions.md** - Flow Actions integration guide

### 📊 Reports (`docs/reports/`)
- **REPORT_H1_H3_EMBEDDED_METADATA.md** - Technical implementation
- **EMULATOR_SOLUTION_SUMMARY.md** - Emulator setup
- **UI_PROTOTYPE_SUMMARY.md** - Frontend implementation
- **COMMIT_SUMMARY.md** - Development progress
- **CADENCE_IDE_ISSUES.md** - Known issues
- **H0_H1_SETUP.md** - Initial setup

### 🚀 Deployment (`docs/deployment/`)
- **hackathon-setup.sh** - Automated setup script

## 🎯 Key Directories

### 💻 Source Code (`src/`)
- **app/** - Next.js 15 app router pages
- **components/** - Reusable React components
- **hooks/** - Custom React hooks
- **lib/** - Utility functions and constants
- **contracts/** - Flow contract configurations

### 📜 Smart Contracts (`cadence/`)
- **contracts/** - Core contract implementations
- **scripts/** - Read-only blockchain queries
- **transactions/** - State-changing operations
- **tests/** - Contract test suites
- **vendor/** - Third-party contract dependencies

### 🌐 Public Assets (`public/`)
- **assets/** - Static images and media files
- **data/** - Mock data for UI prototype

### 🛠️ Scripts (`scripts/`)
- **demo.sh** - Complete demo execution
- **start-emulator.sh** - Flow emulator management
- **generate-icon-assets.ts** - Asset generation

## 🔧 Configuration

### Flow (`config/flow/`)
- **flow.json** - Flow CLI configuration
- **cadence.json** - Cadence language settings

### Next.js (`config/next/`)
- **next.config.ts** - Next.js configuration
- **postcss.config.mjs** - PostCSS configuration

### TypeScript (`config/typescript/`)
- **tsconfig.json** - TypeScript compiler options
- **next-env.d.ts** - Next.js type definitions

## 🏗️ Build Artifacts

### Cache (`build/cache/`)
- **.cache/** - Flow emulator cache
- **tsconfig.tsbuildinfo** - TypeScript build info

### Coverage (`build/coverage/`)
- **coverage.json** - Test coverage data
- **lcov.info** - Coverage report format

## 📋 Root Files

- **README.md** - Project overview and quick start
- **package.json** - Node.js dependencies and scripts
- **Makefile** - Build automation commands
- **turbo.json** - Turborepo configuration
- **eslint.config.ts** - ESLint configuration
- **knip.config.ts** - Unused code detection
- **bunfig.toml** - Bun package manager config
- **.node-version** - Node.js version specification

---

*This structure provides a clean, organized foundation for the OmniPools project, making it easy to navigate and maintain.* 