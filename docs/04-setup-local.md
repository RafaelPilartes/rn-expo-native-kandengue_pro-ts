# Setup Local — App Motorista (Kandengue Pro)

## Pré-requisitos

| Ferramenta         | Versão mínima | Download                                                             |
| ------------------ | ------------- | -------------------------------------------------------------------- |
| Node.js            | ≥ 18.x        | [nodejs.org](https://nodejs.org/)                                    |
| npm                | ≥ 9.x         | (incluído no Node.js)                                                |
| Git                | qualquer      | [git-scm.com](https://git-scm.com/)                                  |
| EAS CLI            | latest        | `npm install -g eas-cli`                                             |
| Java JDK (Android) | 11+           | Android Studio inclui                                                |
| Android Studio     | Hedgehog+     | [developer.android.com/studio](https://developer.android.com/studio) |
| Xcode (iOS)        | ≥ 14          | App Store (macOS apenas)                                             |

---

## 1. Clonar e Instalar

```bash
git clone https://github.com/RafaelPilartes/rn-expo-native-kandengue_pro-ts.git
cd rn-expo_native-kandengue_pro-ts

npm install
```

---

## 2. Configurar Firebase

1. Acede ao [Firebase Console](https://console.firebase.google.com/)
2. Selecciona o projecto Kandengue
3. **Android** → `google-services.json` → coloca em `firebase/google-services.json`
4. **iOS** → `GoogleService-Info.plist` → coloca em `firebase/GoogleService-Info.plist`

> ⚠️ Bundle ID do motorista: `com.kandengueatrevido.pro` — deve corresponder ao registado no Firebase Console.

---

## 3. Configurar Google Maps

```json
// app.json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": { "apiKey": "TUA_API_KEY_ANDROID" }
      }
    },
    "ios": {
      "config": {
        "googleMapsApiKey": "TUA_API_KEY_IOS"
      }
    }
  }
}
```

APIs necessárias no Google Cloud Console:

- Maps SDK for Android / iOS
- Places API
- Directions API (para cálculo de rotas entre motorista e passageiro/destino)

---

## 4. Prebuild

```bash
npx expo prebuild
```

**Para iOS:**

```bash
cd ios
bundle install
bundle exec pod install
cd ..
```

> ⚠️ Necessário após qualquer alteração de plugins no `app.json` (ex: adicionar firebase, maps, etc.).

---

## 5. Permissões Obrigatórias

O app do motorista requer permissões mais extensas que o do passageiro, especialmente para **background location**:

**Android** — configuradas em `app.json`:

```json
"permissions": [
  "ACCESS_FINE_LOCATION",
  "ACCESS_COARSE_LOCATION",
  "ACCESS_BACKGROUND_LOCATION",   // ← obrigatória para tracking em background
  "FOREGROUND_SERVICE",
  "FOREGROUND_SERVICE_LOCATION",  // ← necessária no Android 14+
  "CAMERA",
  "READ_EXTERNAL_STORAGE",
  "POST_NOTIFICATIONS"
]
```

**iOS** — `infoPlist` em `app.json`:

```json
"NSLocationWhenInUseUsageDescription": "Necessário para mostrar a tua localização no mapa",
"NSLocationAlwaysAndWhenInUseUsageDescription": "Necessário para rastrear a tua localização durante corridas",
"NSLocationAlwaysUsageDescription": "Necessário para tracking em background"
```

---

## 6. Executar em Desenvolvimento

```bash
# Android
npm run android

# iOS (macOS apenas)
npm run ios

# Limpar cache (resolver módulos não encontrados)
npx expo start --clear
```

---

## 7. Testar GPS em Background

O tracking em background **não funciona no emulador** do Android Studio com precisão total. Para testar:

1. Usa um dispositivo físico Android
2. Ativa "Localização sempre permitida" nas definições do sistema para o app
3. Inicia uma corrida de teste → coloca o app em background → verifica se o Firestore continua a receber updates

---

## 8. Scripts Disponíveis

| Comando            | Descrição              |
| ------------------ | ---------------------- |
| `npm start`        | Servidor Metro         |
| `npm run android`  | Build Android          |
| `npm run ios`      | Build iOS (macOS)      |
| `npm run lint`     | ESLint                 |
| `npx tsc --noEmit` | Verificação TypeScript |

---

## Verificação

Após lançar:

- [ ] Login como motorista funciona
- [ ] Status do motorista é `approved` (caso contrário, aprovar no painel admin)
- [ ] Permissões de localização concedidas (sempre)
- [ ] Mapa carrega com posição actual
- [ ] FCM token registado (verifica em Firestore `fcm_tokens/{uid}`)

---

**Anterior**: [03 — Tech Stack](03-tech-stack.md) | **Próximo**: [05 — Firebase](05-firebase.md)
