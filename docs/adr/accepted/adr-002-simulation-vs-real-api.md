# ADR-002: Estratégia de Simulação vs API Real

**Status:** ✅ Implementado  
**Data:** 2024-01-15  
**Autor:** Genesis Luminal Team  
**Revisor:** Technical Lead  

## Contexto

O projeto Genesis Luminal precisa de análise de emoções, mas:
- API real do Anthropic tem custos por request
- Desenvolvimento requer muitos testes
- Demonstrações precisam funcionar sem dependências externas
- Necessidade de transparência sobre capacidades reais

## Decisão

**Implementar sistema híbrido com simulação como padrão e API real como opt-in.**

### Estratégia:
1. **Modo Simulação (Padrão):**
   - Heurísticas baseadas em palavras-chave
   - Resultados determinísticos para testes
   - Zero custo operacional
   - Marcação clara como [SIMULATION]

2. **Modo Real (Opt-in):**
   - Requer `ANTHROPIC_API_KEY` válida
   - Requer `FORCE_REAL_ANTHROPIC=true`
   - Fallback automático para simulação em caso de erro
   - Marcação clara como [REAL]

3. **Transparência Total:**
   - Headers HTTP indicando modo ativo
   - Metadados em responses
   - Disclaimer em UI
   - Documentação honesta sobre limitações

## Consequências

### Positivas ✅
- Desenvolvimento sem dependências externas
- Testes determinísticos e rápidos
- Zero custo para demonstrações
- Transparência total para usuários
- Flexibilidade para produção real
- Experiência de desenvolvimento superior

### Negativas ❌
- Complexidade adicional no código
- Necessidade de manter duas implementações
- Risco de divergência entre simulação e realidade
- Possível confusão para novos desenvolvedores

### Neutras ⚪
- Código adicional para sistema de transparência
- Documentação extra necessária

## Alternativas Consideradas

1. **Apenas Simulação:** Rejeitado por não permitir produção real
2. **Apenas API Real:** Rejeitado pelo custo e dependência
3. **Mock Dinâmico:** Rejeitado pela complexidade excessiva
4. **Modo Sandbox:** Considerado mas API Anthropic não oferece

## Status de Implementação

- [x] Aprovado
- [x] AnthropicProvider com modo híbrido
- [x] Sistema de feature flags
- [x] Headers de transparência
- [x] Disclaimer UI implementado
- [x] Documentação OpenAPI atualizada
- [x] Testes para ambos os modos

## Configuração

```bash
# Modo Simulação (padrão)
# Nenhuma configuração necessária

# Modo Real
ANTHROPIC_API_KEY=sk-ant-api03-...
FORCE_REAL_ANTHROPIC=true
```

## Métricas

- **Simulação Accuracy:** ~60% em textos simples
- **Real API Latency:** < 500ms p95
- **Fallback Rate:** < 1% quando real habilitado
- **Developer Adoption:** 100% usam simulação para dev

## Links Relacionados

- [Provider Implementation](../../backend/src/providers/AnthropicProvider.ts)
- [Feature Registry](../../backend/src/types/system-status.ts)
- [Transparency Middleware](../../backend/src/middleware/disclaimer.ts)
