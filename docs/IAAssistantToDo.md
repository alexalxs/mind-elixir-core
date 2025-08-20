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

### Documentação da Edge Function `/ai-assistant`

#### Objetivo
Fornecer à IA o contexto completo do mapa mental para gerar conteúdo útil e relevante baseado em toda a estrutura de conhecimento existente, não apenas no nó selecionado.

#### Endpoint
```
POST https://{project-ref}.supabase.co/functions/v1/ai-assistant
```

#### Headers Obrigatórios
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {supabase-anon-key}",
  "apikey": "{supabase-anon-key}"
}
```

#### Payload da Requisição
```typescript
interface RequestPayload {
  mindMap: {
    nodeData: MindMapNode  // JSON completo do mapa mental com toda estrutura hierárquica
  }
  selectedNodeId: string   // ID do nó selecionado (ponto focal para geração)
  mode: 'expand' | 'question' | 'custom'
  depth?: number          // Número de itens a gerar (padrão: 5)
  customPrompt?: string   // Prompt customizado (apenas para mode='custom')
}
```

#### Estrutura do MindMapNode
```typescript
interface MindMapNode {
  topic: string
  id: string
  children?: MindMapNode[]
  // Outras propriedades opcionais: style, tags, icons, etc.
}
```

#### Resposta da API

A API retorna conteúdo gerado pela IA que será processado e formatado pelo cliente:

**Para modo expand e custom:**
```json
{
  "children": [
    {
      "topic": "Conteúdo gerado pela IA",
      "aiGenerated": true
    },
    {
      "topic": "Outro conteúdo relevante",
      "aiGenerated": true
    }
  ],
  "mode": "expand",
  "selectedNodeTopic": "Tópico do nó selecionado"
}
```

**Para modo question:**
```json
{
  "children": [
    {
      "topic": "Pergunta gerada pela IA?",
      "aiGenerated": true,
      "children": [
        {
          "topic": "Resposta detalhada baseada no contexto do mapa",
          "aiGenerated": true
        }
      ]
    }
  ],
  "mode": "question",
  "selectedNodeTopic": "Tópico selecionado"
}
```

**Importante**: A API retorna apenas o conteúdo gerado pela IA. O cliente (plugin frontend) é responsável por:
- Gerar IDs únicos para cada nó
- Aplicar formatação e estilos herdados
- Adicionar metadados (aiGeneratedAt)
- Criar estrutura hierárquica no mapa mental
- Adicionar indicadores visuais 🤖

#### Prompts Utilizados pela Edge Function

A função envia o mapa mental completo como contexto para a IA, permitindo que ela compreenda toda a estrutura e relações do conhecimento. O mapa completo é enviado no payload junto com o ID do nó selecionado.

**1. Modo Expand (Expandir)**
```
Você tem acesso ao mapa mental completo em formato JSON.
Nó selecionado: "{topic}"

Com base no contexto completo do mapa mental e no tópico selecionado, 
expanda "{topic}" em {depth} subtópicos relevantes que agreguem valor ao conhecimento existente.
Responda apenas com a lista numerada, um item por linha.
```

**2. Modo Question (Perguntas com Respostas)**
```
Você tem acesso ao mapa mental completo em formato JSON.
Nó selecionado: "{topic}"

Com base no contexto completo do mapa mental, gere {depth} perguntas exploratórias 
sobre "{topic}" que aprofundem o conhecimento, junto com suas respectivas respostas.

Para cada pergunta, formate a resposta como:
Q: [pergunta]
A: [resposta concisa]

Separe cada par pergunta-resposta com uma linha em branco.
```

**3. Modo Custom (Personalizado)**
```
Você tem acesso ao mapa mental completo em formato JSON.
Nó selecionado: "{topic}"

{customPrompt fornecido pelo usuário}
```

#### Configuração da OpenAI
- **Modelo**: gpt-3.5-turbo
- **Temperature**: 0.7
- **Max Tokens**: 300
- **System Message**: "Você é um assistente especializado em criar mapas mentais. Você recebe o contexto completo do mapa mental e deve gerar conteúdo relevante que agregue valor ao conhecimento existente."

#### Tratamento de Erros
- Limite de payload: 1MB
- Retorna erro 400 se o nó selecionado não for encontrado
- Retorna erro se OPENAI_API_KEY não estiver configurada
- Filtra automaticamente sugestões duplicadas (case insensitive)

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
[x] Marcar nós criados por IA com flag especial (aiGenerated, aiGeneratedAt)
[x] Adicionar ícone visual nos nós gerados por IA (badge 🤖)

## Fase 6: Modos de Operação ✅ COMPLETA
[x] Implementar modo "Expandir" - gerar subtópicos sem duplicar existentes
[x] Implementar modo "Perguntas" - perguntas exploratórias
[x] Adicionar suporte para prompt personalizado com contexto completo
[x] Implementar controle de profundidade (parâmetro depth)
[x] Implementar análise de duplicações antes de adicionar novos nós
[x] Filtrar sugestões duplicadas na resposta

## Próximos Passos - Melhorias Pendentes
[x] Adicionar botão IA na toolbar principal
[x] Marcar nós criados por IA com propriedade especial
[x] Adicionar ícone/badge visual nos nós gerados por IA
[x] Fix: Campo Nó selecionado agora atualiza corretamente (adicionado listener para selectNodes)
[x] Fix: Erro de estrutura circular ao converter para JSON (implementada função cleanNodeData)

## Status dos Testes da API (20/01/2025) ✓ RESOLVIDO

### Problemas Encontrados e Resolvidos
- ✓ Timeout ao conectar - Resolvido após mudança de IP
- ✓ Edge function atualizada para versão 7 com nova estrutura
- ✓ Erro "FindEle: Node not found" - Corrigido alterando método de adição de nós

### API Testada e Funcionando
- **Modo expand**: Retorna array de nós filhos simples
- **Modo question**: Retorna perguntas com respostas como nós filhos
- **Modo custom**: Funciona com prompts personalizados

### Estrutura de Resposta Confirmada
```json
{
  "children": [
    {
      "topic": "texto do nó",
      "aiGenerated": true,
      "children": [...] // Para modo question com respostas
    }
  ],
  "mode": "expand/question/custom",
  "selectedNodeTopic": "Tópico selecionado"
}
```

### Correções Implementadas
- Nós são adicionados diretamente na estrutura de dados
- Visual indicators aplicados após refresh do mapa
- Uso de `mind.refresh()` ao invés de `linkDiv.refresh()`

## Melhorias Futuras
[ ] Implementar histórico de sugestões
[ ] Adicionar opção de desfazer última aplicação de IA
[ ] Implementar cache local de sugestões
[ ] Adicionar configurações de IA nas preferências do usuário
[ ] Persistir flags de IA ao exportar/importar mapas mentais
[ ] Adicionar filtro para visualizar apenas nós gerados por IA
[ ] Implementar modo de revisão de sugestões antes de aplicar
[ ] Adicionar tratamento para quando API key não está configurada
[ ] Implementar feedback para rate limits da API
[ ] Adicionar opção para remover/editar nós gerados por IA


