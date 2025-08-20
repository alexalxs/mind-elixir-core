# Diagrama de Sequência - Editor de Propriedades do Nó com Estilos e Formatação

## Caso de Uso: Editar estilos e formatação de texto do nó

```mermaid
sequenceDiagram
    participant User as Usuário
    participant UI as Interface
    participant NodeEditor as Editor de Nó
    participant DOM as DOM Utils<br/>(dom.ts)
    participant Node as NodeObj
    participant Bus as Event Bus
    participant Canvas as Canvas/SVG

    User->>UI: Clique direito no nó
    UI->>NodeEditor: Abrir editor de propriedades
    NodeEditor->>Node: Obter propriedades atuais<br/>{id, topic, style, dangerouslySetInnerHTML}
    Note over Node: Estado inicial:<br/>topic: "Texto simples"<br/>style: undefined<br/>dangerouslySetInnerHTML: undefined
    Node-->>NodeEditor: Retorna dados do nó
    
    NodeEditor->>UI: Renderizar modal/painel com abas
    Note over UI: Aba 1: Estilos do Nó<br/>Aba 2: Formatação Rica<br/>Aba 3: HTML Customizado
    
    alt Edição de Estilos do Nó
        User->>NodeEditor: Modificar estilo (cor, fonte, tamanho)
        NodeEditor->>Node: Atualizar nodeObj.style<br/>{fontSize: "20px", color: "#333", fontWeight: "bold"}
        Note over Node: Estado: style atualizado
        NodeEditor->>DOM: shapeTpc(tpc, nodeObj)<br/>src/utils/dom.ts:19-25
        Note over DOM: Aplica estilos CSS ao elemento<br/>tpc.style[key] = style[key]
        DOM->>Canvas: Atualizar visualização
    end
    
    alt Formatação Rica (WYSIWYG)
        User->>NodeEditor: Aplicar formatação (negrito, itálico)
        NodeEditor->>NodeEditor: Gerar HTML formatado<br/>"Texto com <strong>negrito</strong>"
        NodeEditor->>NodeEditor: Sanitizar HTML (DOMPurify)
        NodeEditor->>Node: Definir nodeObj.dangerouslySetInnerHTML
        Note over Node: Estado: dangerouslySetInnerHTML definido<br/>Substitui TODO conteúdo do nó
        NodeEditor->>DOM: shapeTpc(tpc, nodeObj)<br/>src/utils/dom.ts:27-30
        Note over DOM: tpc.innerHTML = nodeObj.dangerouslySetInnerHTML<br/>Ignora topic, icons, tags
        DOM->>Canvas: Renderizar HTML
    end
    
    alt HTML Customizado
        User->>NodeEditor: Inserir HTML direto<br/>Ex: KaTeX, code blocks
        NodeEditor->>NodeEditor: Validar/Sanitizar HTML
        NodeEditor->>Node: Definir nodeObj.dangerouslySetInnerHTML
        NodeEditor->>DOM: shapeTpc(tpc, nodeObj)
        DOM->>Canvas: Renderizar conteúdo HTML
    end
    
    User->>NodeEditor: Salvar alterações
    NodeEditor->>Bus: fire('operation', {name: 'reshapeNode', obj: node})
    Note over Bus: src/nodeOperation.ts<br/>Registra operação para undo/redo
    Bus->>Canvas: Atualizar links e layout
    NodeEditor->>UI: Fechar editor
    
    Note over Node: Estado Final:<br/>- style: {estilos CSS}<br/>- dangerouslySetInnerHTML: HTML formatado<br/>- topic: texto simples (fallback)
```

## Estados do Nó Durante a Edição

### Estado Inicial
```javascript
{
  topic: "Texto do nó",
  style: undefined,
  dangerouslySetInnerHTML: undefined
}
```

### Estado Durante Edição de Estilos
```javascript
{
  topic: "Texto do nó",
  style: {
    fontSize: "20px",
    color: "#333",
    fontWeight: "bold",
    background: "#f0f0f0",
    border: "2px solid blue"
  }
}
// Renderização: textContent com CSS aplicado
```

### Estado Durante Formatação Rica
```javascript
{
  topic: "Texto do nó", // mantido como fallback
  dangerouslySetInnerHTML: "<span>Texto com <strong>negrito</strong> e <em>itálico</em></span>"
}
// Renderização: innerHTML substitui TODO conteúdo
```

### Exemplos de dangerouslySetInnerHTML
```javascript
// KaTeX Math
dangerouslySetInnerHTML: '<div class="math math-display"><span class="katex">...</span></div>'

// Code Block
dangerouslySetInnerHTML: '<pre class="language-javascript"><code>let x = 1;</code></pre>'

// Custom Styled
dangerouslySetInnerHTML: '<div><style>.title{font-size:50px}</style><div class="title">Title</div></div>'
```

## Arquivos e Funções Principais

### src/utils/dom.ts
- `shapeTpc(tpc, nodeObj)`: Renderiza conteúdo do nó
  - Linhas 19-25: Aplica nodeObj.style
  - Linhas 27-30: Aplica dangerouslySetInnerHTML
  - Linha 52: Renderiza texto normal via textContent
- `editTopic()`: Editor inline (plaintext-only)
  - Linha 147: contentEditable = 'plaintext-only'

### src/nodeOperation.ts
- `reshapeNode(nodeId, updates)`: Atualiza propriedades do nó
- Registra operação no histórico

### src/types/index.ts
- `NodeObj`: Interface com style e dangerouslySetInnerHTML
- `NodeStyle`: Propriedades CSS suportadas

## Considerações de Segurança

### Risco XSS com dangerouslySetInnerHTML
```javascript
// PERIGOSO - sem sanitização
nodeObj.dangerouslySetInnerHTML = userInput // ⚠️ XSS!

// SEGURO - com sanitização
import DOMPurify from 'dompurify'
nodeObj.dangerouslySetInnerHTML = DOMPurify.sanitize(userInput)
```

### Editor Plaintext
- `contentEditable='plaintext-only'` previne injeção HTML
- Seguro para entrada de usuário

## Persistência e Exportação

- **Memória**: Alterações em instance.nodeData
- **Histórico**: Operações em instance.history[]
- **Exportação**: style e dangerouslySetInnerHTML incluídos em getData()
- **SVG Export**: foreignObject preserva HTML formatado