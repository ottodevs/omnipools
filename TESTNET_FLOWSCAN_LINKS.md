# Testnet FlowScan Links - OmniPools Demo

Este documento contiene los enlaces de FlowScan para visualizar las transacciones de OmniPools en testnet.

## 🚀 Scripts Disponibles

### 1. Script Completo con Tracking
```bash
./scripts/testnet-demo-with-flowscan.sh
```
- Ejecuta todo el flujo de demo en testnet
- Captura IDs de transacciones automáticamente
- Genera enlaces de FlowScan
- Guarda resultados en JSON
- Verificaciones previas completas

### 2. Script Simplificado 
```bash
./scripts/testnet-transaction-tracker.sh
```
- Versión más simple y rápida
- Ejecuta las transacciones principales
- Genera log de transacciones
- Enlaces directos a FlowScan

## 📋 Flujo de Transacciones

El flujo completo incluye estas transacciones:

1. **Crear Organización** - `tx_create_org.cdc`
2. **Crear Vault** - `tx_create_vault_simple.cdc`
3. **Configurar USDC Receiver** - `tx_link_usdc_receiver.cdc`
4. **Agregar Participantes** - `tx_add_participant.cdc` (×2)
5. **Configurar USDC Minter** - `tx_setup_minter.cdc`
6. **Mintear USDC** - `tx_mint_or_fund_usdc.cdc`
7. **Establecer Ganadores** - `tx_set_winners_simple.cdc`
8. **Planificar Payout** - `tx_plan_payout.cdc`
9. **Ejecutar Payout** - `tx_payout_split.cdc`

## 🔗 Enlaces Principales de FlowScan

### Cuenta del Deployer/Organización
- **Dirección**: `0x035662afa58bdc22`
- **FlowScan**: https://testnet.flowscan.org/account/0x035662afa58bdc22

### Contratos Desplegados
- **Registry**: https://testnet.flowscan.org/account/0x035662afa58bdc22/contract/Registry
- **Vaults**: https://testnet.flowscan.org/account/0x035662afa58bdc22/contract/Vaults  
- **MockUSDC**: https://testnet.flowscan.org/account/0x035662afa58bdc22/contract/MockUSDC
- **DeFiActions**: https://testnet.flowscan.org/account/0x035662afa58bdc22/contract/DeFiActions

## 💡 Uso Recomendado

### Para Demos en Vivo:
1. Ejecutar `./scripts/testnet-transaction-tracker.sh`
2. Copiar los enlaces de FlowScan generados
3. Mostrar las transacciones en tiempo real

### Para Análisis Detallado:
1. Ejecutar `./scripts/testnet-demo-with-flowscan.sh`
2. Revisar el archivo JSON generado
3. Usar enlaces para auditoría completa

## 🔍 Verificación Manual

También puedes ejecutar transacciones individuales:

```bash
# Ejemplo: Crear organización
flow transactions send ./cadence/transactions/tx_create_org.cdc \
  --network testnet \
  --signer deployer \
  "OmniPool Labs"

# Ejemplo: Obtener resumen del vault
flow scripts execute ./cadence/scripts/sc_get_summary.cdc \
  --network testnet \
  0x035662afa58bdc22 1
```

## 📊 Scripts de Consulta

Para verificar el estado actual:

```bash
# Resumen del vault
flow scripts execute ./cadence/scripts/sc_get_summary.cdc --network testnet 0x035662afa58bdc22 1

# Participantes
flow scripts execute ./cadence/scripts/sc_get_participants.cdc --network testnet 0x035662afa58bdc22 1

# Ganadores
flow scripts execute ./cadence/scripts/sc_get_winners.cdc --network testnet 0x035662afa58bdc22 1

# Balance de ganadores
flow scripts execute ./cadence/scripts/sc_get_winner_balance.cdc --network testnet 0x035662afa58bdc22
```

## 🎯 Transacciones de Ejemplo

Si los scripts han sido ejecutados previamente, estas son algunas transacciones que deberían estar visibles en FlowScan:

- Puedes buscar por la dirección `0x035662afa58bdc22` en FlowScan testnet
- Filtrar por tipo de transacción (Contract Interaction)
- Ver el historial completo de actividad

## ⚠️ Notas Importantes

1. **Red**: Asegúrate de estar conectado a testnet
2. **Cuentas**: El script usa la cuenta deployer configurada en `flow.json`
3. **Contratos**: Los contratos deben estar desplegados previamente
4. **FLOW**: La cuenta deployer necesita FLOW para fees
5. **Tiempo**: Las transacciones pueden tardar unos segundos en confirmarse

## 🚀 Ejecutar Demo Ahora

Para ejecutar inmediatamente y obtener enlaces de FlowScan:

```bash
# Ejecutar script simplificado
./scripts/testnet-transaction-tracker.sh

# O script completo
./scripts/testnet-demo-with-flowscan.sh
```

Los enlaces de FlowScan se mostrarán en la salida del script y se guardarán en logs para referencia futura.