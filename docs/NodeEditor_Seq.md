# Diagrama de Sequência - Edição de Nó

## Caso de Uso: Editar propriedades de um nó através do menu de contexto

```mermaid
sequenceDiagram
    participant User
    participant ContextMenu as ContextMenu<br/>(contextMenu.ts)
    participant NodeEditor as NodeEditor<br/>(noteEditor.ts)
    participant DOM as DOM<br/>(dom.ts)
    participant NodeOp as NodeOperation<br/>(nodeOperation.ts)
    participant Instance as MindElixir<br/>Instance
    participant EventBus as Event Bus<br/>(pubsub.ts)

    User->>ContextMenu: Right-click no nó
    Note over ContextMenu: Estado: menu fechado
    
    ContextMenu->>ContextMenu: checkTargetType(target)<br/>Identifica elemento clicado
    ContextMenu->>Instance: getCurrentNode()<br/>Obtém nó selecionado
    Instance-->>ContextMenu: NodeObj {id, topic, style, note, ...}
    
    ContextMenu->>DOM: createMenu()<br/>Cria elementos do menu
    Note over ContextMenu: Estado: menu aberto
    
    ContextMenu->>User: Exibe menu com opções<br/>(incluindo "Node edit")
    
    User->>ContextMenu: Click "Node edit"
    ContextMenu->>NodeEditor: openNodeEditor(node)<br/>Passa NodeObj completo
    
    NodeEditor->>DOM: createModal()<br/>Cria interface de edição
    NodeEditor->>NodeEditor: populateFields(node)<br/>Preenche campos com dados atuais
    Note over NodeEditor: Estado: editor aberto<br/>Campos preenchidos
    
    NodeEditor->>User: Exibe modal de edição<br/>(propriedades, nota, estilos)
    
    User->>NodeEditor: Modifica valores<br/>(texto, cor, nota, etc.)
    Note over NodeEditor: Estado: valores modificados<br/>não salvos
    
    User->>NodeEditor: Click "Salvar"
    NodeEditor->>NodeEditor: validateInput()<br/>Valida campos
    NodeEditor->>NodeEditor: createPatch()<br/>Cria objeto com mudanças
    
    NodeEditor->>NodeOp: reshapeNode(node.id, patch)<br/>Patch: {style, note, tags, ...}
    
    NodeOp->>Instance: getObjById(id)<br/>Busca nó no nodeData
    Instance-->>NodeOp: NodeObj atual
    
    NodeOp->>NodeOp: Object.assign(node, patch)<br/>Mescla mudanças
    Note over Instance: Estado: nodeData atualizado
    
    NodeOp->>DOM: updateNodeDOM(node)<br/>Atualiza elementos visuais
    DOM->>DOM: Aplica estilos CSS<br/>Atualiza texto<br/>Adiciona indicadores
    
    NodeOp->>EventBus: bus.fire('reshapeNode', node)<br/>Notifica mudança
    EventBus->>Instance: Listeners notificados
    
    NodeOp->>Instance: addToHistory('reshapeNode')<br/>Adiciona ao histórico
    Note over Instance: Estado: operação<br/>registrada no undo/redo
    
    NodeEditor->>DOM: closeModal()<br/>Fecha editor
    Note over NodeEditor: Estado: editor fechado
    
    NodeEditor->>User: Nó atualizado visualmente
```

## Estados e Dados Trocados

### Dados enviados para NodeEditor:
```javascript
{
  id: "node123",
  topic: "Texto do nó",
  style: {
    fontSize: "16px",
    color: "#333",
    background: "#fff"
  },
  note: "Conteúdo da nota...",
  tags: ["tag1", "tag2"],
  icons: ["icon1"],
  hyperLink: "https://...",
  branchColor: "#4285F4"
}
```

### Patch enviado para reshapeNode:
```javascript
{
  topic: "Novo texto",
  style: {
    color: "#000",
    background: "#f0f0f0"
  },
  note: "Nova nota expandida...",
  tags: ["tag1", "tag3", "nova"]
}
```

### Evento disparado:
```javascript
bus.fire('reshapeNode', {
  node: updatedNode,
  patch: appliedPatch
})
```

## Arquivos e Funções Percorridas

1. **contextMenu.ts**
   - `checkTargetType()`: Identifica elemento clicado
   - `createContextMenu()`: Cria menu contextual
   - `extend[].onclick()`: Handler para "Node edit"

2. **noteEditor.ts** (a ser criado)
   - `openNodeEditor()`: Abre modal de edição
   - `createModal()`: Cria elementos da UI
   - `populateFields()`: Preenche campos
   - `validateInput()`: Valida entradas
   - `saveChanges()`: Processa salvamento

3. **nodeOperation.ts**
   - `reshapeNode()`: Aplica mudanças ao nó
   - Validação de permissões (before hook)

4. **dom.ts**
   - `updateNodeDOM()`: Atualiza visualização
   - Aplicação de estilos inline
   - Atualização de indicadores visuais

5. **pubsub.ts**
   - `bus.fire()`: Dispara eventos
   - Notificação para plugins e listeners

## Persistência

- **Memória**: Alterações salvas em `instance.nodeData`
- **Histórico**: Operação salva em `instance.history[]` para undo/redo
- **Exportação**: Dados incluídos ao exportar via `getData()`
- **Não há persistência em banco de dados** (aplicação client-side)