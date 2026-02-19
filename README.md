# 🚗 Kandengue Pro

**Aplicação mobile profissional para motoristas de táxi** - Plataforma robusta desenvolvida em React Native/Expo para gestão completa de corridas e serviços de transporte.

[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-~54.0.25-black.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-23.5.0-orange)](https://firebase.google.com/)

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Arquitetura](#-arquitetura)
- [Tecnologias](#-tecnologias)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Execução](#-execução)
- [Build de Produção](#-build-de-produção)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Plugins e Integrações](#-plugins-e-integrações)
- [Troubleshooting](#-troubleshooting)
- [Contribuição](#-contribuição)

---

## 🎯 Sobre o Projeto

**Kandengue Pro** é uma aplicação mobile nativa desenvolvida para motoristas profissionais de táxi, oferecendo uma plataforma completa para gestão de corridas, rastreamento em tempo real, comunicação com passageiros e controle financeiro.

### 🎨 Características Principais

- ✅ **Interface Nativa** - UI/UX otimizada para iOS e Android
- 🌍 **Rastreamento GPS** - Localização em tempo real com suporte a background
- 🔥 **Firebase Integration** - Autenticação, Firestore e Cloud Messaging
- 🗺️ **Google Maps** - Integração completa com navegação e rotas
- 🌐 **Multiidioma** - Suporte i18n completo
- 🎨 **NativeWind** - Estilização moderna com Tailwind CSS
- 📱 **Offline First** - Funcionalidade mesmo sem conexão
- 🔐 **Segurança** - Keychain para armazenamento seguro de credenciais

---

## ✨ Funcionalidades

### 🚕 Gestão de Corridas

- Aceitar/rejeitar solicitações de corrida
- Acompanhamento em tempo real de corridas ativas
- Histórico completo de corridas realizadas
- Resumo financeiro detalhado

### 📍 Localização e Navegação

- Rastreamento GPS contínuo (foreground e background)
- Integração com Google Maps
- Rotas otimizadas com polyline
- Autocomplete de endereços

### 👤 Perfil do Motorista

- Gestão completa de perfil profissional
- Documentação digital
- Estatísticas de performance
- Sistema de avaliações

### 💬 Comunicação

- Notificações push (Firebase Messaging)
- Alertas customizados in-app
- Sistema de reclamações/suporte

### 🌐 Outros Recursos

- Tema claro/escuro
- Suporte offline com sincronização
- Verificação automática de atualizações
- Calendário para agendamentos
- Galeria de imagens para documentos

---

## 🏗️ Arquitetura

O projeto segue uma arquitetura **MVVM (Model-View-ViewModel)** limpa e escalável:

```
src/
├── core/           # Entidades e interfaces do domínio
├── data/           # Camada de dados e repositórios
├── domain/         # Casos de uso e regras de negócio
├── viewModels/     # ViewModels (lógica de apresentação)
├── screens/        # Telas da aplicação
├── components/     # Componentes reutilizáveis
├── context/        # React Context API
├── providers/      # Providers globais
├── routers/        # Navegação
├── services/       # Serviços (API, Firebase, etc.)
├── storage/        # Persistência local (MMKV, Zustand)
├── hooks/          # Custom hooks
├── utils/          # Utilitários e helpers
└── i18n/           # Internacionalização
```

### 🔄 Fluxo de Dados

```
View (Screen) → ViewModel → Use Case → Repository → Service/API
                    ↓
                  State Management (Zustand/Context)
```

---

## 🛠️ Tecnologias

### Core

- **React Native** `0.81.5` - Framework mobile
- **Expo** `~54.0.25` - Toolchain e SDK
- **TypeScript** `5.9.2` - Tipagem estática
- **React** `19.1.0` - Biblioteca UI

### Navegação & UI

- **React Navigation** `7.x` - Navegação nativa
- **NativeWind** `4.2.1` - Tailwind CSS para RN
- **Lucide React Native** `0.555.0` - Ícones modernos
- **Bottom Sheet** `5.2.7` - Modais fluidos

### Backend & Dados

- **Firebase** `23.5.0`
  - Authentication
  - Firestore Database
  - Cloud Messaging
  - Storage
- **TanStack Query** `5.90.11` - Data fetching e cache
- **Axios** `1.13.2` - Cliente HTTP
- **Zustand** `5.0.8` - State management leve

### Localização & Mapas

- **Expo Location** `19.0.7` - GPS e geolocalização
- **Expo Maps** `0.12.10` - Mapas nativos
- **Google Places Autocomplete** `2.6.1` - Busca de endereços
- **Polyline** `1.2.1` - Desenho de rotas

### Armazenamento & Persistência

- **MMKV** `4.0.1` - Storage ultra-rápido
- **AsyncStorage** `2.2.0` - Armazenamento assíncrono
- **Keychain** `10.0.0` - Armazenamento seguro

### Forms & Validação

- **React Hook Form** `7.66.1` - Gestão de formulários
- **Zod** `4.1.13` - Validação de schemas

### Internacionalização

- **i18next** `25.6.3` - Framework i18n
- **react-i18next** `16.3.5` - React bindings

### Outros

- **date-fns** `4.1.0` - Manipulação de datas
- **react-native-version-check** `3.5.0` - Verificação de versão
- **NetInfo** `11.4.1` - Estado da rede

---

## ⚙️ Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** `>= 18.x` ([Download](https://nodejs.org/))
- **npm** ou **yarn**
- **Git**
- **Expo CLI** (instalado globalmente): `npm install -g expo-cli`
- **EAS CLI** (para builds): `npm install -g eas-cli`

### Para desenvolvimento iOS:

- **macOS** (obrigatório)
- **Xcode** `>= 14.x` ([App Store](https://apps.apple.com/app/xcode/id497799835))
- **CocoaPods** `>= 1.11.x`: `sudo gem install cocoapods`

### Para desenvolvimento Android:

- **Android Studio** ([Download](https://developer.android.com/studio))
- **JDK 11** ou superior
- **Android SDK** (API 31+)

---

## 📦 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/RafaelPilartes/rn-expo-native-kandengue_pro-ts
cd rn-expo-native-kandengue_pro-ts
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as dependências nativas (se for rodar build local)

```bash
# Gerar pastas android/ios
npx expo prebuild
```

#### Para iOS (macOS apenas):

```bash
cd ios
bundle install
bundle exec pod install
cd ..
```

---

## 🔧 Configuração

### 1. Firebase

O projeto usa Firebase para autenticação, banco de dados e messaging. Você precisa configurar seus próprios arquivos:

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
2. Adicione as plataformas iOS e Android
3. Baixe os arquivos de configuração:
   - **iOS**: `GoogleService-Info.plist` → Salve em `firebase/`
   - **Android**: `google-services.json` → Salve em `firebase/`

> ⚠️ **IMPORTANTE**: Não commite esses arquivos. Eles já estão no `.gitignore`.

### 2. Google Maps API

Configure a API Key do Google Maps:

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie/selecione um projeto
3. Ative as APIs:
   - Maps SDK for Android
   - Maps SDK for iOS
   - Places API
4. Gere uma API Key
5. Substitua no `app.json`:

```json
{
  "expo": {
    "ios": {
      "config": {
        "googleMapsApiKey": "SUA_API_KEY_AQUI"
      }
    },
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "SUA_API_KEY_AQUI"
        }
      }
    }
  }
}
```

### 3. EAS Build (Expo Application Services)

Para fazer builds de produção:

```bash
# Login no EAS
eas login

# Configure o projeto (já configurado, mas caso precise)
eas build:configure
```

O arquivo `eas.json` já contém as configurações de build para development, preview e production.

---

## 🚀 Execução

### Desenvolvimento com Expo Go

```bash
# Inicia o servidor de desenvolvimento
npm start
```

Escaneie o QR Code com:

- **iOS**: App "Camera" nativo
- **Android**: App "Expo Go"

### Build Local (Development)

#### Android:

```bash
npm run android
```

#### iOS (macOS apenas):

```bash
npm run ios
```

### Outros Scripts Úteis

```bash
# Limpar cache e reiniciar
npx expo start --clear

# Web (experimental)
npm run web
```

---

## 📱 Build de Produção

### Build com EAS (Recomendado)

#### Android:

```bash
# Preview (internal distribution)
eas build --platform android --profile preview

# Production (Google Play)
eas build --platform android --profile production
```

#### iOS:

```bash
# Preview (TestFlight)
eas build --platform ios --profile preview

# Production (App Store)
eas build --platform ios --profile production
```

### Submit para Stores

```bash
# Android (Google Play)
eas submit --platform android

# iOS (App Store)
eas submit --platform ios
```

---

## 📂 Estrutura de Pastas

```
RnNativeKandengueProTs/
│
├── .agent/                 # Agentes de IA e skills
├── android/                # Projeto Android nativo (gerado)
├── ios/                    # Projeto iOS nativo (gerado)
├── assets/                 # Imagens, fontes, ícones
├── firebase/               # Arquivos de configuração Firebase (gitignored)
│   ├── GoogleService-Info.plist
│   └── google-services.json
│
├── src/
│   ├── App.tsx            # Componente raiz
│   ├── assets/            # Assets internos da aplicação
│   ├── components/        # Componentes reutilizáveis
│   │   ├── ui/           # Componentes de UI base
│   │   └── ...
│   ├── config/            # Configurações gerais
│   ├── constants/         # Constantes da aplicação
│   ├── context/           # React Context providers
│   │   ├── AlertContext.tsx
│   │   ├── LocationContext.tsx
│   │   └── TrackRideContext.tsx
│   ├── core/              # Domínio da aplicação
│   │   ├── entities/     # Entidades de negócio
│   │   └── interfaces/   # Contratos e interfaces
│   ├── data/              # Camada de dados
│   │   └── repositories/ # Implementação de repositórios
│   ├── domain/            # Casos de uso
│   ├── helpers/           # Funções auxiliares
│   ├── hooks/             # Custom hooks
│   ├── i18n/              # Configuração i18n
│   ├── locales/           # Arquivos de tradução
│   │   ├── pt/
│   │   ├── en/
│   │   └── ...
│   ├── modules/           # Módulos específicos
│   ├── providers/         # Providers globais
│   │   ├── AppProvider.tsx
│   │   ├── NetworkProvider.tsx
│   │   └── ThemeProvider.tsx
│   ├── routers/           # Configuração de navegação
│   ├── screens/           # Telas da aplicação
│   │   ├── Auth/         # Autenticação
│   │   ├── Main/         # Telas principais
│   │   ├── Rides/        # Gestão de corridas
│   │   └── Map/          # Telas de mapas
│   ├── services/          # Serviços externos
│   │   ├── api/
│   │   ├── firebase/
│   │   └── ...
│   ├── storage/           # Persistência
│   │   ├── store/        # Zustand stores
│   │   └── storageManager.ts
│   ├── styles/            # Estilos globais
│   │   └── global.css
│   ├── types/             # TypeScript types
│   ├── utils/             # Utilitários
│   └── viewModels/        # ViewModels MVVM
│
├── app.json               # Configuração Expo
├── eas.json               # Configuração EAS Build
├── package.json           # Dependências
├── tsconfig.json          # Configuração TypeScript
├── tailwind.config.js     # Configuração NativeWind/Tailwind
├── metro.config.js        # Configuração Metro bundler
├── babel.config.js        # Configuração Babel
└── README.md              # Este arquivo
```

---

## 🔌 Plugins e Integrações

### Expo Plugins Configurados

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

### Permissões (iOS)

Configuradas automaticamente no `app.json`:

- Localização (sempre, em uso, background)
- Câmera
- Microfone
- Galeria de fotos
- Contatos
- Bluetooth
- Calendário
- Notificações

### Permissões (Android)

```xml
INTERNET
VIBRATE
ACCESS_FINE_LOCATION
ACCESS_COARSE_LOCATION
ACCESS_BACKGROUND_LOCATION
FOREGROUND_SERVICE
FOREGROUND_SERVICE_LOCATION
RECORD_AUDIO
READ_EXTERNAL_STORAGE
WRITE_EXTERNAL_STORAGE
CAMERA
READ_CONTACTS
READ_PHONE_STATE
POST_NOTIFICATIONS
```

---

## 🐛 Troubleshooting

### ❌ Erro: "Unable to resolve module"

```bash
# Limpe o cache
npm start -- --clear
# ou
npx expo start --clear
```

### ❌ Erro de build iOS (CocoaPods)

```bash
cd ios
rm -rf Pods Podfile.lock
bundle exec pod install --repo-update
cd ..
```

### ❌ Firebase não conecta

1. Verifique se os arquivos `GoogleService-Info.plist` e `google-services.json` estão na pasta `firebase/`
2. Certifique-se de que os bundle identifiers coincidem:
   - `app.json`: `com.kandengueatrevido.pro`
   - Firebase Console: `com.kandengueatrevido.pro`

### ❌ Mapas não aparecem

1. Verifique a API Key no `app.json`
2. Confirme que as APIs necessárias estão ativas no Google Cloud Console
3. Adicione restrições de bundle ID (iOS) e package name (Android) à API Key

### ❌ Erro "Gradle build failed" (Android)

```bash
cd android
./gradlew clean
cd ..
npx expo prebuild --clean
```

### 📚 Recursos Úteis

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Firebase for React Native](https://rnfirebase.io/)
- [React Navigation](https://reactnavigation.org/docs/getting-started)

---

## 🤝 Contribuição

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

### Padrões de Código

- **TypeScript**: Todo código deve ser tipado
- **ESLint**: Siga as regras configuradas
- **Clean Code**: Código limpo, funções pequenas, nomes descritivos
- **MVVM**: Mantenha a arquitetura separada

---

## 📄 Licença

Este projeto é privado e proprietário. Todos os direitos reservados.

---

## 👥 Autores

**Kandengue Team** - _Desenvolvimento e Manutenção_

---

## 📞 Suporte

Para suporte técnico ou dúvidas:

- 📧 Email: suporte@kandengue.com
- 🌐 Website: https://kandengue.com

---

## 🎯 Roadmap

- [ ] Sistema de pagamentos in-app
- [ ] Chat em tempo real motorista-passageiro
- [ ] Modo offline completo
- [ ] Dashboard de estatísticas avançadas
- [ ] Integração com Waze
- [ ] Suporte para múltiplos idiomas (ES, FR)

---

<div align="center">

**Feito com ❤️ pela equipe Kandengue**

[⬆ Voltar ao topo](#-kandengue-pro)

</div>
