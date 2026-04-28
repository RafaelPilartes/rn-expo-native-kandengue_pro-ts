# Tech Stack — App Motorista (Kandengue Pro)

## Stack Principal

| Camada           | Tecnologia           | Versão   |
| ---------------- | -------------------- | -------- |
| Framework mobile | React Native         | 0.81.5   |
| Toolchain        | Expo (Bare Workflow) | ~54.0.25 |
| Linguagem        | TypeScript           | 5.9.2    |
| Biblioteca UI    | React                | 19.x     |

## Diferenças face ao App do Passageiro

O Kandengue Pro partilha a mesma base tecnológica do app do passageiro, com as seguintes adições específicas:

| Lib                  | Versão  | Motivo                                        |
| -------------------- | ------- | --------------------------------------------- |
| @gorhom/bottom-sheet | 5.2.7   | Bottom sheets fluidos para gestão de corridas |
| expo-task-manager    | ~14.0.9 | Background GPS tracking (foreground service)  |
| react-native-mmkv    | ^4.0.1  | Cache rápido de dados de tracking             |

## Navegação

| Lib                 | Versão | Uso                                      |
| ------------------- | ------ | ---------------------------------------- |
| React Navigation    | 7.x    | Navegação nativa                         |
| Gorhom Bottom Sheet | 5.2.7  | UX de corrida (aceitar/recusar/tracking) |

## Estilização

| Lib                     | Versão  | Uso                            |
| ----------------------- | ------- | ------------------------------ |
| NativeWind              | 4.2.1   | Tailwind para React Native     |
| React Native Reanimated | ~4.1.1  | Animações (bottom sheet, mapa) |
| Lucide React Native     | 0.555.0 | Ícones                         |

## Firebase

| Módulo                           | Versão  | Uso                              |
| -------------------------------- | ------- | -------------------------------- |
| @react-native-firebase/app       | ^23.5.0 | Inicialização                    |
| @react-native-firebase/auth      | ^23.5.0 | Autenticação                     |
| @react-native-firebase/firestore | ^23.5.0 | GPS writes + ride listeners      |
| @react-native-firebase/messaging | ^23.5.0 | FCM (novas corridas disponíveis) |
| @react-native-firebase/storage   | ^23.5.0 | Upload documentos motorista      |

## Mapas e GPS — Crítico

| Lib               | Versão   | Uso                                    |
| ----------------- | -------- | -------------------------------------- |
| expo-maps         | ~0.12.10 | Mapa nativo                            |
| expo-location     | ~19.0.7  | GPS (foreground)                       |
| expo-task-manager | ~14.0.9  | ★ GPS em background (task persistente) |
| @mapbox/polyline  | ^1.2.1   | Decode de rotas + polyline trimming    |

### Comportamento do GPS em Background

O `expo-task-manager` regista uma task que sobrevive ao backgrounding do app:

```typescript
// Registo da task (uma vez, no bootstrap)
TaskManager.defineTask(LOCATION_TASK_NAME, ({ data }) => {
  const { locations } = data
  // Escreve no Firestore mesmo com app em background
  updateRideTracking(locations[0])
})

// Iniciar tracking durante corrida
await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
  accuracy: Location.Accuracy.BestForNavigation,
  timeInterval: 5000, // a cada 5 segundos
  distanceInterval: 10, // ou a cada 10 metros
  foregroundService: {
    // Android: foreground service notification
    notificationTitle: 'Kandengue Pro',
    notificationBody: 'Tracking de corrida activo'
  }
})
```

## Gestão de Estado

| Lib                  | Versão   | Uso                                            |
| -------------------- | -------- | ---------------------------------------------- |
| Zustand              | ^5.0.8   | Estado global (driver, wallet, corrida activa) |
| TanStack React Query | ^5.90.11 | Histórico, dados de perfil                     |

## Armazenamento

| Lib                         | Versão  | Uso                     |
| --------------------------- | ------- | ----------------------- |
| react-native-mmkv           | ^4.0.1  | Cache local rápido      |
| @react-native-async-storage | 2.2.0   | Persistência assíncrona |
| react-native-keychain       | ^10.0.0 | Tokens de autenticação  |

## Forms e HTTP

| Lib             | Versão  | Uso                                         |
| --------------- | ------- | ------------------------------------------- |
| React Hook Form | ^7.66.1 | Formulários de perfil/documentos            |
| Zod             | ^4.1.13 | Validação de schemas                        |
| Axios           | ^1.13.2 | Chamadas à API Fastify (wallet, pagamentos) |

## i18n

| Lib           | Versão  | Uso                 |
| ------------- | ------- | ------------------- |
| i18next       | ^25.6.3 | Internacionalização |
| react-i18next | ^16.3.5 | React bindings      |

---

**Anterior**: [02 — Estrutura de Pastas](02-project-structure.md) | **Próximo**: [04 — Setup Local](04-setup-local.md)
