# 🚀 Enlaces FlowScan Testnet - OmniPools

## ✅ Transacción de Ejemplo Ejecutada

**Transacción ID**: `4eca8454117fa8cab85082a7682eaa4fa44d3e8c92b1eccf77581698963103de`
**FlowScan**: https://testnet.flowscan.io/tx/4eca8454117fa8cab85082a7682eaa4fa44d3e8c92b1eccf77581698963103de

Esta transacción muestra:
- Agregar participante "TeamDemo" al vault
- Event emitido: `A.035662afa58bdc22.Vaults.ParticipantAdded`
- Estado: ✅ SEALED (confirmada)

## 🔗 Enlaces Principales

### Cuenta Organización/Deployer
- **Dirección**: `0x035662afa58bdc22`
- **FlowScan**: https://testnet.flowscan.org/account/0x035662afa58bdc22
- **Balance**: 100,000 FLOW
- **Contratos Desplegados**: 5

### Contratos Desplegados
- **Registry**: https://testnet.flowscan.org/account/0x035662afa58bdc22/contract/Registry
- **Vaults**: https://testnet.flowscan.org/account/0x035662afa58bdc22/contract/Vaults
- **MockUSDC**: https://testnet.flowscan.org/account/0x035662afa58bdc22/contract/MockUSDC
- **DeFiActions**: https://testnet.flowscan.org/account/0x035662afa58bdc22/contract/DeFiActions
- **FungibleTokenConnectors**: https://testnet.flowscan.org/account/0x035662afa58bdc22/contract/FungibleTokenConnectors

### Vault Existente
- **Vault ID**: 1
- **Nombre**: "ETHGlobal NY Production Test"
- **Descripción**: "Production testnet vault for demo"
- **Estado**: Active
- **Participantes actuales**: 1 (TeamDemo)

## 🛠️ Scripts Disponibles

### 1. Comandos Individuales
```bash
./scripts/testnet-commands.sh
```
Muestra todos los comandos para ejecutar paso a paso.

### 2. Script Automatizado Simple
```bash
./scripts/testnet-transaction-tracker.sh
```
Ejecuta el flujo completo y captura IDs automáticamente.

### 3. Script Completo con Análisis
```bash
./scripts/testnet-demo-with-flowscan.sh
```
Flujo completo con verificaciones y logging detallado.

## 📋 Comandos de Ejemplo Para Ejecutar

### Agregar Más Participantes
```bash
flow transactions send ./cadence/transactions/tx_add_participant.cdc \
  --network testnet --signer deployer \
  0x035662afa58bdc22 1 0x035662afa58bdc22 '{"team":"TeamAlpha"}'

flow transactions send ./cadence/transactions/tx_add_participant.cdc \
  --network testnet --signer deployer \
  0x035662afa58bdc22 1 0x035662afa58bdc22 '{"team":"TeamBeta"}'
```

### Configurar USDC y Payout
```bash
# Setup USDC receiver
flow transactions send ./cadence/transactions/tx_link_usdc_receiver.cdc \
  --network testnet --signer deployer

# Setup minter
flow transactions send ./cadence/transactions/tx_setup_minter.cdc \
  --network testnet --signer deployer

# Mint USDC
flow transactions send ./cadence/transactions/tx_mint_or_fund_usdc.cdc \
  --network testnet --signer deployer \
  0x035662afa58bdc22 5000.00

# Set winners
flow transactions send ./cadence/transactions/tx_set_winners_simple.cdc \
  --network testnet --signer deployer \
  0x035662afa58bdc22 1 1 3000.00 2 2000.00

# Execute payout
flow transactions send ./cadence/transactions/tx_payout_split.cdc \
  --network testnet --signer deployer \
  0x035662afa58bdc22 1
```

### Consultar Estado
```bash
# Resumen del vault
flow scripts execute ./cadence/scripts/sc_get_summary.cdc \
  --network testnet 0x035662afa58bdc22 1

# Metadata completa
flow scripts execute ./cadence/scripts/sc_get_vault_metadata.cdc \
  --network testnet 0x035662afa58bdc22 1

# Participantes
flow scripts execute ./cadence/scripts/sc_get_participants.cdc \
  --network testnet 0x035662afa58bdc22 1
```

## 🎯 Cómo Usar para Demos

1. **Ejecutar comando**:
   ```bash
   flow transactions send ./cadence/transactions/[TRANSACTION].cdc --network testnet --signer deployer [ARGS]
   ```

2. **Capturar Transaction ID** de la salida:
   ```
   Transaction ID: [TX_ID]
   ```

3. **Mostrar en FlowScan**:
   ```
   https://testnet.flowscan.io/tx/[TX_ID]
   ```

4. **Ver actividad de la cuenta**:
   ```
   https://testnet.flowscan.org/account/0x035662afa58bdc22
   ```

## 🔍 Estado Actual del Vault

El vault ya está configurado y listo para demos:
- ✅ Vault creado (ID: 1)
- ✅ Contratos desplegados
- ✅ Un participante agregado (TeamDemo)
- ⏳ Listo para agregar más participantes
- ⏳ Listo para configurar winners y payouts

## 💡 Tips para Demos

1. **Para mostrar transacciones en vivo**: Usa los comandos individuales y muestra cada TX ID en FlowScan inmediatamente.

2. **Para audit trail completo**: Ejecuta el script automatizado y muestra los resultados.

3. **Para análisis técnico**: Usa los scripts de consulta para mostrar el estado interno.

4. **Para visualización**: FlowScan permite ver events, código, y flujo completo de cada transacción.

## 🚀 Ejecutar Demo Completo Ahora

```bash
# Opción 1: Mostrar comandos
./scripts/testnet-commands.sh

# Opción 2: Ejecutar automáticamente  
./scripts/testnet-transaction-tracker.sh
```

¡Todos los scripts están listos y el testnet está funcionando! 🎉