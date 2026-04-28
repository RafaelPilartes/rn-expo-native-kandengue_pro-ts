# Padrões de Código — App Motorista (Kandengue Pro)

Os padrões são idênticos ao app do passageiro. Esta página destaca apenas as **regras e convenções específicas** do Kandengue Pro.

## Regras Específicas do Motorista

### GPS e Background Tasks

```typescript
// ✅ A task de background DEVE ser definida no root (antes de qualquer render)
// index.ts ou App.tsx — FORA do componente React
TaskManager.defineTask(LOCATION_TASK_NAME, handler);

// ❌ Nunca definir a task dentro de um componente (re-renders quebram)
function App() {
  TaskManager.defineTask(...); // ERRADO
}
```

### Writes no Firestore (GPS)

```typescript
// ✅ Usar serverTimestamp() para timestamps
// ✅ Usar arrayUnion para path (preserva histórico)
await firestore()
  .collection('rideTracking')
  .doc(rideId)
  .update({
    path: firestore.FieldValue.arrayUnion(newLocation),
    updated_at: firestore.FieldValue.serverTimestamp()
  })

// ❌ Nunca usar new Date() para timestamps no Firestore
// (inconsistente entre dispositivos e servidor)
```

### Throttling de Chamadas à API

O RouteService usa throttling obrigatório de 10 segundos para cálculo de rotas:

```typescript
// ✅ Sempre usar throttle para evitar rate limiting
const { route } = useRouteService({
  origin,
  destination,
  throttleMs: 10_000 // obrigatório
})

// ❌ Nunca chamar a Directions API a cada update de GPS
```

## Nomenclatura (idêntica ao passageiro)

| Elemento           | Convenção                  | Exemplo                                       |
| ------------------ | -------------------------- | --------------------------------------------- |
| Classes (Entities) | PascalCase                 | `RideEntity`, `DriverEntity`                  |
| Interfaces         | PascalCase com `I` prefixo | `IRide`, `IDriver`                            |
| Types              | camelCase / PascalCase     | `RideStatusType`, `LiveLocationType`          |
| Firestore fields   | snake_case                 | `ride_id`, `is_online`, `created_at`          |
| Hooks              | `use` + PascalCase         | `useRideSummary`, `useDriverRealtimeLocation` |

## Checklist antes de Commit

- [ ] `npx tsc --noEmit` sem erros
- [ ] `npm run lint` sem erros críticos
- [ ] Task de background definida fora de componentes React
- [ ] Writes Firestore usam `serverTimestamp()` (não `new Date()`)
- [ ] RouteService tem throttle configurado (mínimo 10s)
- [ ] Permissões verificadas antes de iniciar LocationUpdates
- [ ] Background task parada correctamente ao terminar corrida

## Testing

```bash
# Executar testes (quando implementados)
npm test

# Executar linter
npm run lint

# Verificar tipos TypeScript
npx tsc --noEmit
```

## Contribuição

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

### Diretrizes de Código

- **TypeScript**: Todo código deve ser tipado
- **ESLint**: Siga as regras configuradas
- **Clean Code**: Código limpo, funções pequenas, nomes descritivos
- **MVVM**: Mantenha a arquitetura separada

---

**Anterior**: [09 — Build e Deploy](09-build-deploy.md) | **Próximo**: [11 — Troubleshooting](11-troubleshooting.md)
