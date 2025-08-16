# OmniPools Documentation

Welcome to the OmniPools documentation! This is a comprehensive vault management system for bounties, grants, and tournaments built on Flow blockchain.

## 📚 Documentation Structure

### 🚀 Getting Started
- **[Overview](guides/overview.md)** - Complete project overview and architecture
- **[Hackathon Guide](guides/hackathon.md)** - Essential commands for hackathon participants
- **[Runbook](guides/runbook.md)** - Step-by-step operational procedures
- **[Troubleshooting](guides/troubleshooting.md)** - Common issues and solutions

### 🛠️ Development
- **[Development Guide](development/guide.md)** - Development workflow and setup
- **[Best Practices](development/best-practices.md)** - Coding standards and guidelines
- **[Testing](development/testing.md)** - Testing strategies and frameworks
- **[Testing Migration](development/testing-migration.md)** - Migration guide for testing

### 📖 Reference
- **[Architecture](reference/architecture.md)** - System architecture and structure
- **[Flow Actions](reference/actions.md)** - Flow Actions integration guide

### 📊 Reports
- **[H1-H3 Embedded Metadata Report](reports/REPORT_H1_H3_EMBEDDED_METADATA.md)** - Technical implementation report
- **[Emulator Solution Summary](reports/EMULATOR_SOLUTION_SUMMARY.md)** - Emulator setup and configuration
- **[UI Prototype Summary](reports/UI_PROTOTYPE_SUMMARY.md)** - Frontend implementation details
- **[Commit Summary](reports/COMMIT_SUMMARY.md)** - Development progress tracking
- **[Cadence IDE Issues](reports/CADENCE_IDE_ISSUES.md)** - Known issues and workarounds
- **[H0-H1 Setup Report](reports/H0_H1_SETUP.md)** - Initial setup documentation

### 🚀 Deployment
- **[Hackathon Setup](deployment/hackathon-setup.sh)** - Automated setup script for hackathon

## 🎯 Quick Start

### For Judges (60-second demo)
```bash
# Start emulator and run demo
flow emulator start --verbose
./scripts/demo.sh
```

### For Developers
```bash
# Full setup
make hackathon

# Start development
npm run dev

# Run tests
make test
```

### For UI Demo
```bash
# Start UI prototype
npm run dev

# Open in browser
open http://localhost:3000
```

## 🔗 Key Links

- **Frontend**: http://localhost:3000
- **Emulator**: http://localhost:3569
- **Flow Docs**: https://developers.flow.com/

## 📋 Project Status

- ✅ **H1-H3**: Core contracts and Flow Actions
- ✅ **H4**: Testing and validation
- ✅ **H5**: UI prototype (mocked)
- 🎯 **Ready for demo**: Complete system with CLI and UI

---

*Built for ETHGlobal New York 2025 🗽* 