# Troubleshooting — App Motorista (Kandengue Pro)

## Problemas de GPS e Background Tracking

### ❌ GPS para quando o app vai para background (Android)

1. Verificar permissão `ACCESS_BACKGROUND_LOCATION` no `app.json`
2. No dispositivo: Definições → Apps → Kandengue Pro → Localização → **Sempre**
3. Verificar se o Foreground Service está correctamente declarado:
   ```json
   "permissions": ["FOREGROUND_SERVICE", "FOREGROUND_SERVICE_LOCATION"]
   ```
4. Confirmar que a notificação do foreground service está configurada na task:
   ```typescript
   foregroundService: {
     notificationTitle: 'Kandengue Pro',
     notificationBody: 'Tracking activo',
   }
   ```

### ❌ GPS para quando o app vai para background (iOS)

1. Verificar `UIBackgroundModes` inclui `"location"` no `app.json` → `infoPlist`
2. No dispositivo: Definições → Kandengue Pro → Localização → **Sempre**
3. Confirmar que `NSLocationAlwaysUsageDescription` está no `infoPlist`

### ❌ Background task não é chamada

A task deve ser definida **antes de qualquer render React**:

```typescript
// ✅ Correcto — index.ts (entry point)
import { LOCATION_TASK_NAME } from '@/services/location/backgroundTask'
// A importação do módulo registra a task automaticamente

// ❌ Errado — dentro de App.tsx ou de qualquer componente
```

---

## Problemas de Firebase

### ❌ Motorista com status `pending` — app redireciona para ecrã de espera

Comportamento esperado. Para testar funcionalidades completas, aprovar o motorista no Painel Admin.

### ❌ `permission-denied` ao escrever em `rideTracking/{rideId}`

1. Confirmar que `rides/{rideId}.driverId === auth.currentUser.uid`
2. Verificar as Firestore Security Rules
3. Confirmar que o motorista aceitou a corrida antes de iniciar tracking

### ❌ `arrayUnion` não funciona como esperado

Usar a sintaxe correcta do `react-native-firebase`:

```typescript
// ✅ Correcto
import firestore from '@react-native-firebase/firestore'
firestore().FieldValue.arrayUnion(location)

// ❌ Errado (sintaxe do SDK web)
import { arrayUnion } from 'firebase/firestore'
```

---

## Problemas Gerais

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

---

## Problemas de Build

### ❌ `expo-maps` não compila no iOS

```bash
# Após prebuild, executar:
cd ios
bundle exec pod install --repo-update
cd ..
```

### ❌ Build Android falha com Gradle

```bash
cd android
./gradlew clean
cd ..
npx expo prebuild --clean
```

---

## Problemas de UI

### ❌ Bottom Sheet não abre / fecha correctamente

1. Confirmar que `GestureHandlerRootView` envolve toda a aplicação
2. Verificar versão do `@gorhom/bottom-sheet` — requer `react-native-reanimated` v3+

### ❌ Polyline não aparece no mapa

1. Verificar se o array de coordenadas não está vazio
2. Confirmar que as coordenadas têm `latitude`/`longitude` (não `lat`/`lng`)
3. Verificar se `@mapbox/polyline` decodificou correctamente:
   ```typescript
   const decoded = polyline.decode(encodedPolyline)
   // retorna [[lat, lng], ...] — converter para { latitude, longitude }
   const coords = decoded.map(([lat, lng]) => ({
     latitude: lat,
     longitude: lng
   }))
   ```

---

**Anterior**: [10 — Padrões de Código](10-code-standards.md) | **Próximo**: [12 — Roadmap](12-roadmap.md)
