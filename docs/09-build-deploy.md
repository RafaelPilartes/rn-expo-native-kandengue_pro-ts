# Build e Deploy — App Motorista (Kandengue Pro)

## Estratégia de Build

Idêntica ao app do passageiro — EAS para builds cloud. Ver [09 — Build e Deploy do Passageiro](../rn-expo_native-kandengue-ts/docs/09-build-deploy.md) para referência geral.

## Perfis de Build (`eas.json`)

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "production": {
      "android": { "buildType": "apk" }
    }
  }
}
```

## Comandos

```bash
# Android — Preview (APK interno)
eas build --platform android --profile preview

# Android — Produção
eas build --platform android --profile production

# iOS — Produção
eas build --platform ios --profile production
```

## Considerações Específicas do Motorista

### Background Location no iOS

O iOS exige que o app declare o uso de background location no `Info.plist`. Isto é gerido automaticamente pelo `app.json`, mas o revisor da App Store verifica ativamente este campo. É necessário justificar o uso na descrição de submissão.

```json
// app.json — infoPlist (gerado pelo prebuild)
"UIBackgroundModes": ["location", "fetch", "remote-notification"]
```

### Foreground Service no Android

O Android 14+ requer a permissão `FOREGROUND_SERVICE_LOCATION` explicitamente. Está declarada em `app.json`:

```json
"permissions": [
  "FOREGROUND_SERVICE",
  "FOREGROUND_SERVICE_LOCATION"
]
```

### Bundle ID

O motorista usa um bundle ID diferente do passageiro:

- **Android**: `com.kandengueatrevido.pro`
- **iOS**: `com.kandengueatrevido.pro`

Deve estar registado separadamente no Firebase Console e no Google Cloud (Maps API Key com restrição de bundle ID).

## Checklist de Deploy

- [ ] `npx tsc --noEmit` sem erros
- [ ] `npm run lint` sem warnings críticos
- [ ] `app.json` com versão e build number correctos
- [ ] Firebase config files presentes e com bundle ID correcto
- [ ] Permissão `ACCESS_BACKGROUND_LOCATION` declarada
- [ ] Permissão `FOREGROUND_SERVICE_LOCATION` declarada (Android 14+)
- [ ] `UIBackgroundModes` inclui `location` (iOS)
- [ ] GPS em background testado em dispositivo físico
- [ ] FCM token registado após login
- [ ] `eas build` concluído sem erros

---

**Anterior**: [08 — Navegação](08-navigation.md) | **Próximo**: [10 — Padrões de Código](10-code-standards.md)
