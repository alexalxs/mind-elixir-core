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
  prompt: string          // Prompt completo definido pelo cliente (OBRIGATÓRIO)
  
  // Configurações OpenAI (opcionais)
  openAIConfig?: {
    model?: string         // Modelo a usar (padrão: 'gpt-3.5-turbo')
    temperature?: number   // Criatividade 0-2 (padrão: 0.7)
    maxTokens?: number    // Limite de tokens (padrão: 2000)
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

**IMPORTANTE: A Edge Function é responsável por:**
1. **Validar e garantir o formato correto da resposta da OpenAI**
2. **Converter a resposta da IA para o formato JSON aceito pelo Mind Elixir**


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

**Estrutura de nó obrigatória (validada pela Edge Function):**
- `topic`: string - O texto do nó (obrigatório)
- `id`: string - Identificador único (gerado automaticamente se ausente)
- `aiGenerated`: boolean - Sempre true (adicionado automaticamente)

**Campos opcionais (validados pela Edge Function):**
- `children`: array - Subnós (validados recursivamente)
- `style`: object - Estilos CSS (removido se inválido)
- `tags`: array - Tags do nó (removido se inválido)
- `image`: object - Imagem anexada
- `hyperLink`: string - Link externo

**Processo de Validação da Edge Function:**
1. Recebe resposta da OpenAI (que pode estar em qualquer formato)
2. Tenta fazer parse do JSON e extrair estrutura `{ children: [...] }`
3. Valida cada nó recursivamente:
   - Garante que `topic` existe e é string
   - Gera `id` único se não existir
   - Adiciona `aiGenerated: true`
   - Valida e processa `children` recursivamente
   - Remove campos opcionais inválidos
4. Se o parse falhar, aplica fallback extraindo linhas de texto
5. Sempre retorna JSON válido no formato esperado

**O cliente (plugin frontend) é responsável por:**
- Aplicar formatação e estilos herdados
- Adicionar metadados (aiGeneratedAt)
- Criar estrutura hierárquica no mapa mental
- Adicionar indicadores visuais 🤖

#### Como Funciona o Sistema

**O que a aplicação faz automaticamente:**
1. Captura o mapa mental completo em formato JSON
2. Identifica qual nó está selecionado pelo usuário
3. Adiciona essas informações ao contexto antes de enviar para a IA
4. Envia tudo junto com o prompt do usuário para a Edge Function

**O que o usuário precisa fazer:**
- Escrever APENAS as instruções específicas do que deseja
- Não precisa mencionar "mapa mental" ou "nó selecionado" - isso já está no contexto

#### Prompts Utilizados pela Edge Function

**IMPORTANTE**: A Edge Function funciona como um **intermediário 100% transparente** entre o cliente e a OpenAI:
- O cliente tem controle TOTAL sobre TUDO: prompt, modelo, temperatura, tokens, etc.
- A função APENAS repassa as configurações recebidas para a OpenAI
- O campo `prompt` é OBRIGATÓRIO e define completamente o comportamento
- O cliente é responsável por incluir TODAS as instruções necessárias
- A função é completamente stateless e não adiciona nenhum conteúdo

**Exemplos de Prompts:**

**IMPORTANTE**: A aplicação adiciona automaticamente:
- O mapa mental completo em formato JSON ao contexto
- Informação sobre qual nó está selecionado
- Os exemplos abaixo mostram apenas o que o USUÁRIO precisa escrever

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

#### Tratamento de Erros

**Validações da Edge Function:**
1. **Validação de Payload (entrada):**
   - Limite de payload: 1MB
   - Valida estrutura JSON do payload recebido
   - Verifica campos obrigatórios: `mindMap`, `selectedNodeId`, `prompt`
   - Valida estrutura do `nodeData` recursivamente
   - Retorna erro 400 com detalhes específicos se inválido

2. **Validação de Resposta da OpenAI:**
   - Valida se a resposta é JSON válido
   - Verifica estrutura `{ children: [...] }`
   - Valida cada nó recursivamente:
     - Campo `topic` obrigatório e string
     - Campo `id` gerado automaticamente se ausente
     - Campo `aiGenerated` adicionado como true
     - Campos opcionais removidos se inválidos
   - Aplica fallback se JSON inválido (extrai linhas de texto)

3. **Outros Erros:**
   - Retorna erro 400 se o nó selecionado não for encontrado
   - Retorna erro se OPENAI_API_KEY não estiver configurada
   - Erros da API OpenAI são capturados e retornados

**Estrutura de Erro Padronizada:**
```json
{
  "error": "Mensagem do erro",
  "type": "TIPO_DO_ERRO",
  "details": "Detalhes adicionais",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "validationErrors": ["Lista de erros de validação se aplicável"]
}
```

**Tipos de Erro:**
- `JSON_ERROR`: Problema com formato JSON
- `STRUCTURE_ERROR`: Estrutura do payload incorreta
- `OPENAI_ERROR`: Erro na comunicação com OpenAI
- `NODE_NOT_FOUND`: Nó selecionado não existe
- `UNKNOWN_ERROR`: Outros erros

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
[x] O campo prompt deve ser levado em consideração nas requisições,  pois ao pedir para expandir ignora o prompt customizado e sempre gera 5 filhos.
[x] O componente de Ai Assistent deve ser modificado para se tornar uma aba junto com o componente de edição de nós e textos e ambos devem ficar ativados desde o carregamento da aplicação. Contudo as abas de edição de no e aba de edição de conteúdo não estao carregando corretamente. 
[x]Adicionar também as opções para formatar a requisição como modelo open ai e outros aspectos diferentes do prompt. 
[x] O modelo da open ai, max_tokens, temperature, instruções sobre o detalhamento , número de palavras, é passado na requisição



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
[ ] Se o payload for superior ao limite então implementar alguma técnicas para reduzir o tamanho do contexto