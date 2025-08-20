# TODO - Implementação IA Assistant

## Fase 1: Backend com Edge Function ✅ COMPLETA
[x] Criar conta Supabase e projeto
[x] Criar arquivo supabase/functions/ai-assistant/index.ts
[x] Implementar Edge Function `/ai-assistant` 
[x] Configurar variável de ambiente OPENAI_API_KEY
[x] Implementar recepção de JSON completo do mapa mental
[x] Implementar identificação do nó selecionado pelo ID
[x] Implementar validação do tamanho do JSON (limite de payload)
[x] Testar função com curl/Postman enviando mapa completo com prompt adequado segundo as opções recebidas na requisição

## Fase 2: Estrutura do Plugin ✅ COMPLETA
[x] Criar arquivo src/plugin/aiAssistant.ts
[x] Implementar classe IAAssistant seguindo padrão dos plugins existentes
[x] Registrar plugin em src/dev.ts (inicialização manual)
[x] Adicionar tipos necessários (interface AIAssistantOptions)

## Fase 3: Integração Frontend ✅ COMPLETA
[x] Modificar src/plugin/toolBar.ts para adicionar botão IA
[x] Modificar contextMenu via event listener para adicionar opção IA
[x] Implementar handler para seleção de nó usando mind.bus
[x] Usar mind.nodeData para obter JSON completo do mapa
[x] Identificar nó selecionado e enviar ID
[x] Criar chamada para Edge Function enviando mapa completo + ID
[x] Implementar tratamento para mapas muito grandes (validação 1MB)

## Fase 4: Interface de Sugestões ✅ COMPLETA
[x] Criar painel flutuante para mostrar sugestões
[x] Implementar lista de sugestões com botões individuais
[x] Permitir adicionar sugestões individualmente
[x] Implementar indicador de loading
[x] Mostrar mensagens de erro quando necessário

## Fase 5: Aplicação das Sugestões ✅ COMPLETA
[x] Usar mind.addChild() para adicionar nós selecionados
[x] Implementar feedback visual após adicionar (botão muda para ✓)
[x] Marcar nós criados por IA com flag especial (aiGenerated, aiGeneratedAt, aiMode)
[x] Adicionar ícone visual nos nós gerados por IA (badge 🤖)

## Fase 6: Modos de Operação ✅ COMPLETA
[x] Implementar modo "Expandir" - gerar subtópicos sem duplicar existentes
[x] Implementar modo "Sugerir" - ideias relacionadas considerando todo o mapa
[x] Implementar modo "Resumir" - resumo do ramo selecionado
[x] Implementar modo "Perguntas" - perguntas exploratórias
[x] Adicionar suporte para prompt personalizado com contexto completo
[x] Implementar controle de profundidade (parâmetro depth)
[x] Implementar análise de duplicações antes de sugerir
[x] Filtrar sugestões duplicadas na resposta

## Próximos Passos - Melhorias Pendentes
[x] Adicionar botão IA na toolbar principal
[x] Marcar nós criados por IA com propriedade especial
[x] Adicionar ícone/badge visual nos nós gerados por IA
[Fix] O campo Nó selecionado não modifica mesmo selecionando outros nós que não são o nó central.

