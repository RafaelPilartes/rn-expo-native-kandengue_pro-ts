# Kandengue Pro — App Motorista

**Aplicação mobile profissional para motoristas parceiros** da plataforma Kandengue.

Desenvolvida com React Native e Expo, oferece uma interface nativa focada em alta performance para aceitação de corridas, rastreamento contínuo em background, gestão financeira (wallets e recargas Unitel Money) e acompanhamento do Ride Summary.

---

## Stack Principal

| Camada       | Tecnologia                                |
| ------------ | ----------------------------------------- |
| Runtime      | React Native 0.81.5 + Expo ~54.0.25       |
| Linguagem    | TypeScript 5.9.2 (strict mode)            |
| Estado       | Zustand + TanStack React Query            |
| UI / Estilos | NativeWind + Bottom Sheet                 |
| Animações    | React Native Reanimated                   |
| Mapas / GPS  | expo-maps + expo-location + task-manager  |
| Backend      | Firebase (Auth, Firestore, FCM, Storage)  |
| Navegação    | React Navigation 7                        |
| Storage      | react-native-mmkv + react-native-keychain |
| Validação    | react-hook-form + Zod                     |

---

## Arquitetura de Alto Nível

O projeto segue rigorosamente o padrão **MVVM (Model-View-ViewModel)** garantindo independência entre a UI e a manipulação dos dados de backend.

```
┌─────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│  View (Screen)  │───▶│  ViewModel       │───▶│  Repository      │
│  (UI Components)│◀───│  (React Query)   │◀───│  (API/Firebase)  │
└─────────────────┘    └──────────────────┘    └──────────────────┘
                              ▲
                              │
                       ┌──────────────┐
                       │ Context API /│
                       │ Zustand Store│
                       └──────────────┘
```

---

## Quick Start

### Pré-requisitos

- **Node.js** ≥ 18
- **npm** ≥ 9
- **EAS CLI** (`npm install -g eas-cli`)
- Android Studio ou Xcode (apenas macOS)

### Instalação

```bash
# Clonar o repositório
git clone https://github.com/RafaelPilartes/rn-expo-native-kandengue_pro-ts.git
cd rn-expo_native-kandengue_pro-ts

# Instalar dependências
npm install
```

### Configurar variáveis de ambiente e Firebase

1. Adiciona `google-services.json` na pasta `firebase/` (Android).
2. Adiciona `GoogleService-Info.plist` na pasta `firebase/` (iOS).
3. Adiciona a API Key do Google Maps no ficheiro `app.json`.

> Ver [docs/04-setup-local.md](docs/04-setup-local.md) para detalhes exatos sobre Permissões (especialmente de GPS em background) e variáveis.

### Executar localmente

```bash
# Executar prebuild (obrigatório para gerar dependências de background tracking)
npx expo prebuild

# Iniciar servidor e executar
npm run android
# ou
npm run ios
```

---

## Comandos Principais

| Comando             | Descrição                                                          |
| ------------------- | ------------------------------------------------------------------ |
| `npm start`         | Inicia o servidor Metro                                            |
| `npm run android`   | Build e lança no emulador/dispositivo Android                      |
| `npm run ios`       | Build e lança no simulador/dispositivo iOS                         |
| `npm run lint`      | Verificação de código com ESLint                                   |
| `npx tsc --noEmit`  | Verificação de tipos TypeScript                                    |
| `npx expo prebuild` | Gera as pastas `/android` e `/ios` configurando permissões nativas |

---

## Troubleshooting Rápido

| Problema                            | Solução                                                                                               |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------- |
| GPS em background não actualiza     | Assegurar que a Background Task foi declarada no entry-point (`index.ts`) e o dispositivo está físico |
| "Unable to resolve module"          | Limpar cache com `npx expo start --clear`                                                             |
| Motorista encrava em modo "Pending" | O Admin deve aprovar o motorista no Painel de Controlo                                                |
| Gradle build failed                 | Correr `./gradlew clean` em `/android`, seguido de `npx expo prebuild --clean`                        |

> Ver [docs/11-troubleshooting.md](docs/11-troubleshooting.md) para a lista completa de problemas comuns.

---

## Documentação Detalhada

Todos os documentos técnicos estão detalhadamente organizados na pasta `docs/`:

| Documento                                                | Conteúdo                                                 |
| -------------------------------------------------------- | -------------------------------------------------------- |
| [00 — Visão Geral](docs/00-overview.md)                  | Contexto e propósito da app do Motorista                 |
| [01 — Arquitetura](docs/01-architecture.md)              | Fluxo MVVM detalhado                                     |
| [02 — Estrutura de Pastas](docs/02-project-structure.md) | Organização dos ficheiros                                |
| [03 — Tecnologias](docs/03-tech-stack.md)                | Dependências e stack                                     |
| [04 — Setup Local](docs/04-setup-local.md)               | Setup, Plugins Expo e Permissões rigorosas de Background |
| [05 — Firebase](docs/05-firebase.md)                     | Tipagem TS de Rides, Drivers e Transactions              |
| [06 — Mapas e Localização](docs/06-maps-location.md)     | Configuração de Task Manager e Throttling GPS            |
| [07 — Gestão de Estado](docs/07-state-management.md)     | Zustand, TanStack Query, Secure Storage                  |
| [08 — Navegação](docs/08-navigation.md)                  | Bottom Tabs e Auth Guards                                |
| [09 — Build e Deploy](docs/09-build-deploy.md)           | EAS Build Profiles                                       |
| [10 — Padrões de Código](docs/10-code-standards.md)      | Regras para o Motorista, Testes e Contribuição           |
| [11 — Troubleshooting](docs/11-troubleshooting.md)       | Resolução de bugs e permissões rejeitadas                |
| [12 — Roadmap](docs/12-roadmap.md)                       | Planeamento futuro (Recarga de wallet, etc.)             |
| [13 — Design System](docs/13-design-system.md)           | Padrões de Cores e UI                                    |
| [14 — Features e Ferramentas](docs/14-features-tools.md) | Lista completa de features e plugins instalados          |

> **Dica de Negócio:** Para entender como a comissão da plataforma é deduzida da wallet do motorista e o fluxo real de pagamentos, estude a **Bíblia Técnica** em `../_documentation/`.

---

## Licença

Este projeto é proprietário e pertence à **Kandengue**. Todos os direitos reservados.
