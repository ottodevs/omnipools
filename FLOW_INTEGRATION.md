# Flow Integration for OmniPools

This document describes the Flow blockchain integration for the OmniPools application.

## Overview

The application has been updated to use real-time data from the Flow blockchain instead of static JSON files. This enables a true Web3 experience where users can:

- View vault data in real-time from the blockchain
- Execute transactions directly from the frontend
- Connect to different Flow networks (local, testnet, mainnet)
- Interact with smart contracts through the Flow React SDK

## Architecture

### Components

1. **FlowProvider** (`src/app/providers.tsx`)
   - Wraps the application with Flow SDK configuration
   - Handles network selection and connection

2. **FlowConnect** (`src/components/flow-connect.tsx`)
   - Shows connection status and network information
   - Displays connected account address

3. **NetworkSelector** (`src/components/network-selector.tsx`)
   - Allows switching between Flow networks
   - Shows network details and access nodes

4. **TransactionExecutor** (`src/components/transaction-executor.tsx`)
   - Executes Cadence transactions from the frontend
   - Shows transaction status and results

### Hooks

1. **useFlowClient** (`src/lib/flow/client.ts`)
   - Provides access to Flow SDK functions
   - Manages network configuration

2. **useVaultData** (`src/hooks/use-vault-data.ts`)
   - Fetches vault data from the blockchain
   - Handles data transformation and error states

3. **useFlowTransactions** (`src/hooks/use-flow-transactions.ts`)
   - Manages transaction execution
   - Handles transaction status and results

### Data Flow

1. **Data Fetching**: Scripts query the blockchain for vault information
2. **Real-time Updates**: Data is refreshed when transactions are executed
3. **Transaction Execution**: Users can execute transactions directly from the UI
4. **Network Support**: Automatic detection and configuration for different networks

## Networks

The application supports three Flow networks:

- **Local**: `http://localhost:8888` (for development with emulator)
- **Testnet**: `https://rest-testnet.onflow.org` (for testing)
- **Mainnet**: `https://rest-mainnet.onflow.org` (for production)

Network selection is automatic based on the hostname, with localhost defaulting to the local emulator.

## Smart Contract Integration

### Scripts Used

- `getVault`: Fetches basic vault information
- `getVaultWinners`: Gets winner data for USDC payouts
- `getVaultParticipants`: Retrieves participant information
- `getVaultReceipts`: Gets transaction receipts

### Transactions Available

- `payoutSplit`: Executes payout distribution
- `addParticipant`: Adds new participants to a vault
- `setWinners`: Sets winner shares for a vault

## Usage

### Development

1. Start the Flow emulator:
   ```bash
   flow emulator start --persist
   ```

2. Deploy contracts:
   ```bash
   flow deploy
   ```

3. Run the application:
   ```bash
   bun run dev
   ```

### Production

1. Configure the network in `src/lib/flow/client.ts`
2. Ensure contracts are deployed to the target network
3. Update organization addresses as needed

## Configuration

### Environment Variables

- Network selection is automatic but can be overridden
- Organization addresses are configurable in constants
- Access nodes can be customized per network

### Constants

- `DEMO_ORG_ADDRESS`: Default organization for demo vaults
- `CADENCE_TRANSACTIONS`: Pre-defined transaction templates
- `FLOW_CONFIG`: Network configuration settings

## Benefits

1. **Real-time Data**: No more static JSON files
2. **True Web3**: Direct blockchain interaction
3. **Multi-network Support**: Easy switching between networks
4. **Transaction Execution**: Users can execute actions from the UI
5. **Audit Trail**: All actions are recorded on the blockchain
6. **Decentralized**: No centralized data storage required

## Future Enhancements

1. **Wallet Integration**: Support for multiple wallet providers
2. **Event Streaming**: Real-time updates via Flow events
3. **Indexed Data**: Integration with Flow indexing services
4. **Multi-chain Support**: Extend to other blockchains
5. **Advanced Transactions**: More complex transaction types
6. **Gas Optimization**: Transaction batching and optimization

## Troubleshooting

### Common Issues

1. **Connection Errors**: Check if the Flow emulator is running
2. **Transaction Failures**: Verify contract deployment and permissions
3. **Data Not Loading**: Check network configuration and contract addresses
4. **Wallet Connection**: Ensure wallet is properly configured

### Debug Mode

Enable debug logging by setting environment variables:
```bash
DEBUG=flow:* bun run dev
```

## Security Considerations

1. **Transaction Signing**: All transactions require user approval
2. **Network Validation**: Verify network configuration before production
3. **Contract Verification**: Ensure contracts are properly audited
4. **Access Control**: Implement proper authorization checks
5. **Error Handling**: Graceful handling of blockchain errors 