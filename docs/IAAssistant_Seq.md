# Diagrama de Sequência - IA Assistant (Simplificado)

## Fluxo Simplificado com Supabase Edge Functions

```mermaid
sequenceDiagram
    participant User
    participant ME as MindElixir
    participant EF as Edge Function
    participant OAI as OpenAI API

    User->>ME: Seleciona nó "Marketing"
    User->>ME: Clica botão IA
    ME->>ME: getSelectedNode()
    ME->>ME: getData()
    Note over ME: Obtém JSON completo do mapa<br/>com estrutura de todos os nós
    
    ME->>EF: POST /ai-assistant<br/>{<br/>  mindMap: {...}, // JSON completo<br/>  selectedNodeId: "n123",<br/>  mode: "expand"<br/>}
    Note over EF: Valida entrada<br/>Analisa contexto completo<br/>Identifica conteúdo existente
    
    EF->>OAI: POST /completions<br/>{prompt: "Contexto: [mapa mental completo]<br/>Expanda o nó 'Marketing'<br/>evitando duplicar tópicos existentes"}
    OAI-->>EF: {suggestions: ["SEO", "Redes Sociais"...]}
    Note over OAI: IA analisa contexto completo<br/>e sugere apenas tópicos novos
    
    EF-->>ME: {suggestions: [...]}
    ME->>ME: showModal(suggestions)
    
    User->>ME: Seleciona 3 sugestões
    ME->>ME: addChild("SEO")
    ME->>ME: addChild("Redes Sociais")
    ME->>ME: addChild("Email Marketing")
    ME->>ME: linkDiv.refresh()
    
    ME-->>User: Atualiza visualização
```

## Fluxo de Implementação MVP

```mermaid
sequenceDiagram
    participant Dev as Desenvolvedor
    participant SB as Supabase
    participant GH as GitHub

    Dev->>SB: Cria projeto Supabase
    SB-->>Dev: URL do projeto
    
    Dev->>SB: Configura OPENAI_API_KEY
    Dev->>Dev: Escreve Edge Function
    Dev->>SB: Deploy via CLI<br/>supabase functions deploy
    
    SB-->>Dev: Function URL
    
    Dev->>GH: Cria branch ia-assistant
    Dev->>Dev: Implementa plugin básico
    Dev->>Dev: Adiciona botão IA
    Dev->>Dev: Testa integração
    
    Dev->>GH: Commit e PR
```

## Estados Simplificados

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> NodeSelected: Seleciona nó
    NodeSelected --> Loading: Clica IA
    Loading --> ShowingSuggestions: Recebe sugestões
    Loading --> Error: Falha
    ShowingSuggestions --> Applied: Aplica selecionadas
    Applied --> Idle: Completo
    Error --> Idle: Fecha erro
```

## Fluxo de Expansão de Tópico com IA

```mermaid
sequenceDiagram
    participant User
    participant UI as UI/Toolbar
    participant ME as MindElixir
    participant IAM as IAManager
    participant API as IA API
    participant DB as LocalStorage
    participant DOM as DOM/SVG

    User->>UI: Seleciona nó "Marketing Digital"
    UI->>ME: getSelectedNode()
    ME-->>UI: NodeObj {id: "n123", topic: "Marketing Digital"}
    
    User->>UI: Clica botão IA/Atalho (Ctrl+I)
    UI->>IAM: showIAPanel(selectedNode)
    IAM->>DOM: createElement('ia-panel')
    DOM-->>User: Mostra painel com opções
    
    User->>IAM: Seleciona modo "Expandir"
    IAM->>ME: mind.getData()
    ME-->>IAM: JSON completo do mapa mental
    IAM->>IAM: buildPrompt(mode: "expand", fullMap: mapData, selectedId: "n123")
    Note over IAM: Prepara contexto com:<br/>- Mapa mental completo<br/>- ID do nó selecionado<br/>- Todos os tópicos existentes<br/>- Profundidade desejada
    
    IAM->>API: POST /completions<br/>{<br/>  mindMap: {...},<br/>  selectedNodeId: "n123",<br/>  mode: "expand"<br/>}
    API-->>IAM: Response {suggestions: [...]}
    Note over API: Retorna sugestões contextualizadas:<br/>Evita duplicar "Email Marketing"<br/>que já existe em outro ramo
    
    IAM->>DB: saveHistory(nodeId, suggestions)
    DB-->>IAM: {success: true}
    
    IAM->>DOM: renderSuggestions(suggestions)
    DOM-->>User: Mostra preview das sugestões
    
    User->>IAM: selectSuggestions([0,1,3])
    IAM->>ME: mind.addChild(parentId, {topic: "SEO"})
    ME->>ME: generateNewObj()
    ME->>ME: nodeData.children.push(newNode)
    ME->>DOM: linkDiv.refresh()
    DOM-->>User: Atualiza visualização
    
    IAM->>ME: mind.addChild(parentId, {topic: "Marketing de Conteúdo"})
    ME->>DOM: linkDiv.refresh()
    
    IAM->>ME: mind.addChild(parentId, {topic: "Email Marketing"})
    ME->>DOM: linkDiv.refresh()
    
    IAM->>DOM: addIAIndicator(nodeId)
    DOM-->>User: Mostra ícone IA no nó pai
    
    IAM->>ME: mind.bus.fire('iaExpansion', {parent, children})
    ME-->>IAM: Event dispatched
```

## Fluxo de Configuração e Inicialização

```mermaid
sequenceDiagram
    participant App
    participant ME as MindElixir
    participant IAM as IAManager
    participant Config as ConfigManager
    participant UI as UI Components

    App->>ME: new MindElixir(options)
    ME->>ME: init()
    
    App->>IAM: mind.install(IAAssistantPlugin)
    IAM->>Config: loadConfiguration()
    Config->>Config: readFromLocalStorage('ia-config')
    Config-->>IAM: {apiKey, model, endpoint}
    
    IAM->>ME: mind.bus.on('selectNode', handler)
    IAM->>ME: mind.contextMenu.extend([iaOptions])
    
    IAM->>UI: injectToolbarButton()
    UI->>DOM: appendChild(iaButton)
    
    IAM->>UI: createIAPanel()
    UI->>DOM: appendChild(iaPanel)
    Note over UI: Painel oculto inicialmente
    
    IAM->>ME: mind.before.addChild = validateIANode
    Note over IAM: Hook para validar nós<br/>criados pela IA
```

## Fluxo de Personalização com Prompt Customizado

```mermaid
sequenceDiagram
    participant User
    participant IAP as IA Panel
    participant IAM as IAManager
    participant API as IA API
    participant ME as MindElixir

    User->>IAP: Seleciona modo "Personalizar"
    IAP->>DOM: showCustomPromptInput()
    
    User->>IAP: Digite: "Crie subtópicos técnicos<br/>sobre SEO para desenvolvedores"
    IAP->>IAM: processCustomPrompt(prompt, selectedNode)
    
    IAM->>IAM: validatePrompt(prompt)
    Note over IAM: Verifica:<br/>- Tamanho máximo<br/>- Conteúdo apropriado
    
    IAM->>API: POST /completions<br/>{customPrompt + context}
    API-->>IAM: Response {suggestions: [...]}
    Note over API: Retorna:<br/>["Meta Tags", "Schema.org",<br/>"Core Web Vitals", "Sitemap XML",<br/>"Robots.txt"]
    
    IAM->>IAP: displaySuggestions(suggestions)
    User->>IAP: editSuggestion(0, "Meta Tags e Open Graph")
    
    IAP->>IAM: applySuggestions(editedSuggestions)
    IAM->>ME: batchAddChildren(parentId, suggestions)
    
    loop Para cada sugestão
        ME->>ME: addChild(parentId, suggestion)
        ME->>DOM: linkDiv.refresh()
    end
    
    ME->>ME: mind.bus.fire('operation', {name: 'iaCustomExpansion'})
```

## Estados e Transições

```mermaid
stateDiagram-v2
    [*] --> Idle: Plugin instalado
    
    Idle --> NodeSelected: Usuário seleciona nó
    NodeSelected --> IAMenuOpen: Ativa IA (botão/atalho)
    
    IAMenuOpen --> ModeSelected: Escolhe modo
    ModeSelected --> Processing: Envia requisição
    
    Processing --> SuggestionsReady: API responde
    Processing --> Error: Falha na API
    
    SuggestionsReady --> Editing: Usuário edita
    SuggestionsReady --> Applying: Aceita sugestões
    
    Editing --> Applying: Confirma edições
    Applying --> NodesCreated: Adiciona ao mapa
    
    NodesCreated --> Idle: Completo
    Error --> IAMenuOpen: Retry
    
    IAMenuOpen --> Idle: Cancela
    Editing --> IAMenuOpen: Cancela edições
```

## Tabelas de Persistência

### LocalStorage - Configuração IA
```
Key: "mindmap-ia-config"
Value: {
    apiKey: string (encrypted),
    apiEndpoint: string,
    model: string,
    temperature: number,
    maxTokens: number,
    defaultMode: string,
    language: string
}
```

### LocalStorage - Histórico de Sugestões
```
Key: "mindmap-ia-history-{mapId}"
Value: {
    "{nodeId}": {
        timestamp: number,
        mode: string,
        prompt?: string,
        suggestions: string[],
        accepted: string[],
        rejected: string[]
    }
}
```

### LocalStorage - Indicadores IA
```
Key: "mindmap-ia-nodes-{mapId}"
Value: {
    iaGeneratedNodes: string[], // IDs dos nós
    metadata: {
        "{nodeId}": {
            generatedAt: number,
            mode: string,
            parentContext: string
        }
    }
}
```