# TODO - Implementação IA Assistant

## Fase 1: Backend com Edge Function
[ ] Criar conta Supabase e projeto
[ ] Criar arquivo supabase/functions/ai-assistant/index.ts
[ ] Implementar Edge Function `/ai-assistant` 
[ ] Configurar variável de ambiente OPENAI_API_KEY
[ ] Implementar recepção de JSON completo do mapa mental
[ ] Implementar identificação do nó selecionado pelo ID
[ ] Implementar validação do tamanho do JSON (limite de payload)
[ ] Testar função com curl/Postman enviando mapa completo com prompt adequado segundo as opções recebidas na requisição

## Fase 2: Estrutura do Plugin
[ ] Criar arquivo src/plugin/iaAssistant.ts
[ ] Implementar classe IAAssistant seguindo padrão dos plugins existentes
[ ] Registrar plugin em src/index.ts usando mind.install()
[ ] Adicionar tipos necessários em src/types/index.ts

## Fase 3: Integração Frontend
[ ] Modificar src/plugin/toolBar.ts para adicionar botão IA
[ ] Modificar src/plugin/contextMenu.ts para adicionar opção IA
[ ] Implementar handler para seleção de nó usando mind.bus
[ ] Usar mind.getData() para obter JSON completo do mapa
[ ] Usar mind.getSelectedNode() para obter ID do nó selecionado
[ ] Criar chamada para Edge Function enviando mapa completo + ID
[ ] Implementar tratamento para mapas muito grandes (compressão ou paginação)

## Fase 4: Interface de Sugestões
[ ] Criar modal flutuante para mostrar sugestões
[ ] Implementar lista de sugestões com checkboxes
[ ] Adicionar opção de editar sugestões antes de aplicar
[ ] Permitir selecionar quais sugestões adicionar
[ ] Implementar indicador de loading
[ ] Mostrar toast de sucesso/erro

## Fase 5: Aplicação das Sugestões
[ ] Usar mind.addChild() para adicionar nós selecionados
[ ] Aproveitar generateNewObj() para criar estrutura dos nós
[ ] Implementar refresh do linkDiv após adicionar nós
[ ] Marcar nós criados por IA com flag especial
[ ] Adicionar ícone visual nos nós gerados por IA

## Fase 6: Modos de Operação
[ ] Implementar modo "Expandir" - gerar subtópicos sem duplicar existentes
[ ] Implementar modo "Sugerir" - ideias relacionadas considerando todo o mapa
[ ] Adicionar suporte para prompt personalizado com contexto completo
[ ] Implementar controle de profundidade (quantos níveis)
[ ] Implementar análise de duplicações antes de sugerir
[ ] Destacar na interface quando um tópico já existe em outro lugar