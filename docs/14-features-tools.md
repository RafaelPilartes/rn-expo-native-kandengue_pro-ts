# Features, Ferramentas e Dependências — App Motorista (Kandengue Pro)

Este documento agrupa as principais features e versões de dependências da stack tecnológica do projeto, servindo como referência rápida do que está implementado no README.

## Features Principais

### 🚕 Gestão de Corridas

- Aceitar/rejeitar solicitações de corrida.
- Acompanhamento em tempo real de corridas ativas.
- Histórico completo de corridas realizadas.
- Resumo financeiro detalhado (Ride Summary).

### 📍 Localização e Navegação

- Rastreamento GPS contínuo (foreground e background tracking obrigatório).
- Integração com Google Maps (expo-maps).
- Rotas otimizadas com polyline e autocomplete de endereços (Google Places).

### 👤 Perfil do Motorista

- Gestão completa de perfil profissional.
- Verificação e upload de documentação digital.
- Estatísticas de performance e sistema de avaliações.

### 💬 Comunicação

- Notificações push completas (Firebase Messaging).
- Alertas customizados in-app.

### 🌐 Outros Recursos

- Tema claro/escuro nativo.
- Suporte offline com sincronização.
- Verificação automática de atualizações (`react-native-version-check`).
- Calendário para agendamentos (`react-native-calendars`).
- Galeria de imagens para documentos (`react-native-image-picker`).
- Armazenamento seguro de credenciais via `react-native-keychain`.

---

## Versões Principais das Bibliotecas

| Categoria    | Biblioteca              | Versão              |
| ------------ | ----------------------- | ------------------- |
| **Core**     | React Native            | `0.81.5`            |
| **Core**     | Expo                    | `~54.0.25`          |
| **Core**     | TypeScript              | `5.9.2`             |
| **State**    | Zustand                 | `5.0.8`             |
| **State**    | TanStack Query          | `5.90.11`           |
| **Nav**      | React Navigation        | `7.x`               |
| **UI**       | NativeWind              | `4.2.1`             |
| **UI**       | Bottom Sheet            | `5.2.7`             |
| **Mapas**    | expo-maps               | `0.12.10`           |
| **Mapas**    | expo-location           | `19.0.7`            |
| **Firebase** | Firebase Suite          | `23.5.0`            |
| **Storage**  | react-native-mmkv       | `4.0.1`             |
| **Storage**  | react-native-keychain   | `10.0.0`            |
| **Forms**    | react-hook-form         | `7.66.1`            |
| **Forms**    | zod                     | `4.1.13`            |
| **i18n**     | i18next / react-i18next | `25.6.3` / `16.3.5` |

## Plugins do Expo Configuradas no App.json

```json
"plugins": [
  "@react-native-firebase/app",
  "@react-native-firebase/auth",
  "expo-maps",
  ["expo-build-properties", {
    "ios": {
      "useFrameworks": "static",
      "buildReactNativeFromSource": true
    }
  }]
]
```

## Suporte

- **Email:** suporte@kandengue.com
- **Website:** https://kandengue.com

---

**Anterior**: [13 — Design System](13-design-system.md)
