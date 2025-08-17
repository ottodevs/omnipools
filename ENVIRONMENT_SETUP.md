# Environment Setup Guide

Esta guía te ayudará a configurar las variables de entorno necesarias para OmniPools.

## Variables de Entorno Requeridas

### 1. Copia el archivo de ejemplo
```bash
cp .env.example .env.local
```

### 2. Configuración básica

El archivo `.env.local` ya está configurado para el emulador local. Las variables principales son:

- `NEXT_PUBLIC_FLOW_NETWORK`: Red de Flow a usar (`local`, `testnet`, `mainnet`)
- `NEXT_PUBLIC_FLOW_CONTRACTS_*`: Direcciones de contratos para cada red
- `NEXT_PUBLIC_DEMO_ORG_ADDRESS`: Dirección de la organización demo

### 3. Configuración de WalletConnect (REQUERIDO)

Para eliminar el warning de WalletConnect y permitir que los usuarios se conecten con wallets:

1. **Visita**: https://cloud.walletconnect.com/
2. **Crea una cuenta** o inicia sesión
3. **Crea un nuevo proyecto**
4. **Copia el Project ID**
5. **Agrega el Project ID** a tu `.env.local`:

```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=tu_project_id_aqui
```

### 4. Configuración por Red

#### Emulador Local (default)
```bash
NEXT_PUBLIC_FLOW_NETWORK=local
NEXT_PUBLIC_FLOW_CONTRACTS_LOCAL=0xf8d6e0586b0a20c7
NEXT_PUBLIC_DEMO_ORG_ADDRESS=0xf8d6e0586b0a20c7
```

#### Testnet
```bash
NEXT_PUBLIC_FLOW_NETWORK=testnet
NEXT_PUBLIC_FLOW_CONTRACTS_TESTNET=0xba1132bc08f82fe2
NEXT_PUBLIC_DEMO_ORG_ADDRESS=0xba1132bc08f82fe2
```

#### Mainnet
```bash
NEXT_PUBLIC_FLOW_NETWORK=mainnet
NEXT_PUBLIC_FLOW_CONTRACTS_MAINNET=0x... # Actualizar cuando se despliegue
NEXT_PUBLIC_DEMO_ORG_ADDRESS=0x... # Actualizar con dirección de mainnet
```

## Verificación

Después de configurar las variables:

1. Reinicia el servidor de desarrollo:
   ```bash
   bun dev
   ```

2. Verifica que:
   - No aparezca el warning de WalletConnect
   - El selector de red muestre la red correcta
   - La aplicación se conecte correctamente

## Troubleshooting

### Warning de WalletConnect
Si ves el mensaje "All dApps are expected to register for a WalletConnect projectId":
- Asegúrate de haber configurado `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- Verifica que el Project ID sea correcto
- Reinicia el servidor de desarrollo

### Error de conexión a Flow
- Verifica que el emulador esté corriendo (para local)
- Confirma que las direcciones de contratos sean correctas
- Verifica que la red configurada coincida con tus contratos desplegados

### Variables no reconocidas
- Todas las variables deben empezar con `NEXT_PUBLIC_` para ser accesibles en el cliente
- Reinicia el servidor después de cambiar variables de entorno
- Verifica que no haya espacios extra en los valores