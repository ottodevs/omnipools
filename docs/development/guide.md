# Development Guide

## 🎯 Best Practices

### Cadence Contracts
- **Access Control**: Use `access(all)` for public functions, `access(self)` for internal
- **Resource Management**: Always destroy resources when done
- **Error Handling**: Use descriptive panic messages
- **Events**: Emit events for all state changes
- **Testing**: Test all public functions and edge cases

### Frontend Development
- **React 19**: Use latest features (use client, server components)
- **TypeScript**: Strict typing for all components
- **Tailwind**: Utility-first CSS approach
- **Flow SDK**: Proper wallet integration

## 🔄 Development Workflow

### 1. Contract Development
```bash
# Start emulator
make flow

# Deploy contracts
flow deploy

# Test changes
make test
```

### 2. Frontend Development
```bash
# Start dev server
make dev

# Build for production
make build
```

### 3. Testing Strategy
```bash
# Unit tests
make test-simple

# Integration tests
make test-e2e

# Full test suite
make test
```

## 📁 File Organization

### Contracts
```
cadence/
├── contracts/          # Smart contracts
│   ├── Registry.cdc   # Organization management
│   ├── Vaults.cdc     # Core vault functionality
│   └── FungibleTokenMock.cdc
├── scripts/           # Read operations
├── transactions/      # Write operations
└── test/             # Contract tests
```

### Frontend
```
src/
├── app/              # Next.js app router
│   ├── layout.tsx    # Root layout
│   ├── page.tsx      # Home page
│   └── providers.tsx # Context providers
└── components/       # Reusable components
    ├── auth.tsx      # Authentication
    └── connect.tsx   # Wallet connection
```

## 🧪 Testing Guidelines

### Contract Tests
- Test all public functions
- Validate access control
- Check event emissions
- Test edge cases and errors
- Verify resource cleanup

### Frontend Tests
- Component rendering
- User interactions
- Wallet integration
- Error handling
- Responsive design

## 🚀 Deployment

### Local Development
```bash
make hackathon  # Full setup
make dev        # Start frontend
```

### Testnet
```bash
# Update flow.json networks
flow deploy --network testnet
```

### Mainnet
```bash
# Update flow.json networks
flow deploy --network mainnet
```

## 🔧 Configuration

### Flow Configuration
- `flow.json`: Contract addresses and account setup
- `cadence/`: Contract source code
- `flowdb/`: Local emulator database

### Next.js Configuration
- `next.config.ts`: Build configuration
- `tailwind.config.js`: Styling configuration
- `tsconfig.json`: TypeScript configuration

## 📚 Resources

- [Flow Documentation](https://developers.flow.com/)
- [Cadence Language](https://developers.flow.com/cadence)
- [Next.js 15](https://nextjs.org/docs)
- [React 19](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

## 🆘 Troubleshooting

### Common Issues

1. **Emulator not starting**
   ```bash
   make reset  # Reset and restart
   ```

2. **Contract deployment fails**
   ```bash
   flow deploy --reset  # Force redeploy
   ```

3. **Tests failing**
   ```bash
   make test-simple  # Check basic functionality
   ```

4. **Frontend build errors**
   ```bash
   make clean  # Clear cache
   bun install  # Reinstall dependencies
   ```

### Debug Commands
```bash
make status    # Check system status
make logs      # View emulator logs
flow accounts  # List accounts
flow contracts # List contracts
```

## 🎯 Performance Tips

### Contracts
- Minimize storage operations
- Use efficient data structures
- Batch operations when possible
- Optimize for gas usage

### Frontend
- Use React.memo for expensive components
- Implement proper loading states
- Optimize bundle size
- Use Next.js Image component

## 🔒 Security Considerations

### Smart Contracts
- Validate all inputs
- Check access control
- Use safe math operations
- Audit event emissions
- Test failure scenarios

### Frontend
- Validate user inputs
- Sanitize data
- Use HTTPS in production
- Implement proper error boundaries
- Secure wallet integration 