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
  customPrompt?: string   // Prompt customizado (agora disponível para TODOS os modos)
  
  // Configurações OpenAI (opcionais)
  openAIConfig?: {
    model?: string         // Modelo a usar (padrão: 'gpt-3.5-turbo')
    temperature?: number   // Criatividade 0-2 (padrão: 0.7)
    maxTokens?: number    // Limite de tokens (padrão: 2000)
  }
  
  // Configurações de detalhamento (opcionais)
  detailConfig?: {
    minWordsPerTopic?: number    // Mínimo de palavras por tópico (padrão: 5)
    maxWordsPerTopic?: number    // Máximo de palavras por tópico (padrão: 10)
    minWordsPerAnswer?: number   // Mínimo de palavras por resposta (padrão: 30)
    maxWordsPerAnswer?: number   // Máximo de palavras por resposta (padrão: 100)
  }
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

A API SEMPRE retorna conteúdo no formato JSON válido seguindo a estrutura de nós do Mind Elixir:

**Para todos os modos (expand, question e custom):**
```json
{
  "children": [
    {
      "topic": "Conteúdo gerado pela IA",
      "id": "ai-generated-uuid",
      "aiGenerated": true,
      "children": []  // opcional, usado no modo question para respostas
    }
  ],
  "mode": "expand",  // ou "question" ou "custom"
  "selectedNodeTopic": "Tópico do nó selecionado"
}
```

**Estrutura de nó obrigatória:**
- `topic`: string - O texto do nó
- `id`: string - Identificador único
- `aiGenerated`: boolean - Sempre true para nós gerados por IA

**Campos opcionais:**
- `children`: array - Subnós (usado em modo question)
- `style`: object - Estilos CSS customizados
- `tags`: array - Tags do nó
- `image`: object - Imagem anexada
- `hyperLink`: string - Link externo

**Importante**: A API retorna apenas o conteúdo gerado pela IA. O cliente (plugin frontend) é responsável por:
- Gerar IDs únicos para cada nó
- Aplicar formatação e estilos herdados
- Adicionar metadados (aiGeneratedAt)
- Criar estrutura hierárquica no mapa mental
- Adicionar indicadores visuais 🤖

#### Prompts Utilizados pela Edge Function

A função envia o mapa mental completo como contexto para a IA, permitindo que ela compreenda toda a estrutura e relações do conhecimento. O mapa completo é enviado no payload junto com o ID do nó selecionado.

**IMPORTANTE**: A Edge Function agora funciona como um **intermediário transparente** entre o cliente e a OpenAI:
- O cliente tem controle TOTAL sobre o prompt, modelo, temperatura, tokens e configurações de detalhamento
- A função apenas repassa as configurações recebidas para a OpenAI, sem adicionar ou modificar nada
- O campo `customPrompt` quando fornecido substitui COMPLETAMENTE o prompt padrão
- O cliente é responsável por incluir TODAS as instruções necessárias, incluindo formato JSON se desejado
- Isso permite experimentação e otimização completa sem necessidade de fazer deploy da função
- A função é stateless e não mantém configurações próprias

**Prompts Padrão (usados quando customPrompt NÃO é fornecido):**

**1. Modo Expand (Expandir)**
```
Você tem acesso ao mapa mental completo em formato JSON.
Nó selecionado: "{topic}"

Com base no contexto completo do mapa mental e no tópico selecionado, 
expanda "{topic}" em {depth} subtópicos relevantes que agreguem valor ao conhecimento existente.

CADA SUBTÓPICO DEVE:
- Ter entre {minWordsPerTopic}-{maxWordsPerTopic} palavras
- Ser uma frase descritiva completa
- Explicar claramente um conceito, funcionalidade ou aspecto específico
- Não ser apenas uma palavra ou termo isolado

IMPORTANTE: Retorne a resposta em formato JSON válido, seguindo EXATAMENTE a estrutura de nós do Mind Elixir:
{
  "children": [
    {
      "topic": "Subtópico 1",
      "id": "generated-1",
      "aiGenerated": true
    }
  ]
}

Gere exatamente {depth} subtópicos únicos, relevantes e DETALHADOS.
Cada nó deve ter: topic (string), id (string único), aiGenerated (true).
```

**2. Modo Question (Perguntas com Respostas)**
```
Você tem acesso ao mapa mental completo em formato JSON.
Nó selecionado: "{topic}"

Com base no contexto completo do mapa mental, gere {depth} perguntas exploratórias 
sobre "{topic}" que aprofundem o conhecimento, junto com suas respectivas respostas.

IMPORTANTE: Retorne a resposta em formato JSON válido, seguindo EXATAMENTE a estrutura de nós do Mind Elixir:
{
  "children": [
    {
      "topic": "Pergunta exploratória 1?",
      "id": "question-1",
      "aiGenerated": true,
      "children": [
        {
          "topic": "Resposta detalhada e informativa",
          "id": "answer-1",
          "aiGenerated": true
        }
      ]
    },
    {
      "topic": "Pergunta exploratória 2?",
      "id": "question-2", 
      "aiGenerated": true,
      "children": [
        {
          "topic": "Resposta detalhada e informativa",
          "id": "answer-2",
          "aiGenerated": true
        }
      ]
    }
  ]
}

Gere exatamente {depth} pares de pergunta-resposta.
Cada pergunta é um nó pai com sua resposta como nó filho.
```

**3. Modo Custom (Personalizado)**
```
Você tem acesso ao mapa mental completo em formato JSON.
Nó selecionado: "{topic}"

{customPrompt fornecido pelo usuário}

IMPORTANTE: Retorne SEMPRE a resposta em formato JSON válido, seguindo EXATAMENTE a estrutura de nós do Mind Elixir:
{
  "children": [
    {
      "topic": "Conteúdo gerado",
      "id": "custom-1",
      "aiGenerated": true,
      "children": [] // opcional, se necessário criar subnós
    }
  ]
}

Cada nó deve ter obrigatoriamente: topic (string), id (string único), aiGenerated (true).
Opcionalmente pode ter: children (array de nós filhos), style (objeto com estilos).
```

#### Configuração da OpenAI

As configurações da OpenAI agora são **dinâmicas e configuráveis** via payload da requisição:

**Configurações OpenAI (openAIConfig):**
- **model**: Modelo da OpenAI a usar
  - Padrão: `'gpt-3.5-turbo'`
  - Opções: `'gpt-3.5-turbo'`, `'gpt-4'`, `'gpt-4-turbo-preview'`
- **temperature**: Controla a criatividade/aleatoriedade (0-2)
  - Padrão: `0.7`
  - 0 = Mais determinístico, 2 = Mais criativo
- **maxTokens**: Limite máximo de tokens na resposta
  - Padrão: `2000`
  - Recomendado: 1000-4000 para respostas detalhadas

**Configurações de Detalhamento (detailConfig):**
- **minWordsPerTopic**: Mínimo de palavras por tópico (modo expand)
  - Padrão: `5`
- **maxWordsPerTopic**: Máximo de palavras por tópico (modo expand)
  - Padrão: `10`
- **minWordsPerAnswer**: Mínimo de palavras por resposta (modo question)
  - Padrão: `30`
- **maxWordsPerAnswer**: Máximo de palavras por resposta (modo question)
  - Padrão: `100`

**Exemplo de requisição com configurações customizadas:**
```json
{
  "mindMap": { ... },
  "selectedNodeId": "react",
  "mode": "expand",
  "depth": 3,
  "openAIConfig": {
    "model": "gpt-4-turbo-preview",
    "temperature": 0.8,
    "maxTokens": 3000
  },
  "detailConfig": {
    "minWordsPerTopic": 8,
    "maxWordsPerTopic": 15
  }
}
```

#### Tratamento de Erros
- Limite de payload: 1MB
- Retorna erro 400 se o nó selecionado não for encontrado
- Retorna erro se OPENAI_API_KEY não estiver configurada
- Valida se o json recebido da open ai cumpre os requisitos de formato

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
[x] Ao selecionar um nó e clicar no botão de agente ele deve considerar esse nó como o nó selecionado e não o nó raiz. Por outro lado já esta funcionando corretamente o cenário onde o Agente já esta ativado e o usuário clicar em outro nó. 
[x] Script de otimização criado em tests/optimize-ai-prompts.ts para testar variações de prompts
[x] Campo de prompt customizado na interface para todos os modos
[Fix] O campo prompt deve ser levado em consideração nas requisições,  pois ao pedir para expandir ignora o prompt customizado e sempre gera 5 filhos.
[x] O componente de Ai Assistent deve ser modificado para se tornar uma aba junto com o componente de edição de nós e textos e ambos devem ficar ativados desde o carregamento da aplicação.
[Fix] O modelo da open ai, max_tokens, temperature, instruções sobre o detalhamento , número de palavras, é passado na requisição, respeito ao modelo de json.


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


