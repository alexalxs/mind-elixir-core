# Diagrama de Sequência - Abertura de Arquivos de Mapas Mentais

## Fluxo de Abertura de Arquivo JSON

```mermaid
sequenceDiagram
    participant User
    participant FileInput as Input[type=file]<br/>HTML Element
    participant ToolBar as toolBar.ts<br/>Plugin
    participant FileReader as FileReader API<br/>Browser
    participant Validator as Data Validator<br/>Custom
    participant MindElixir as MindElixir<br/>Instance
    participant Methods as methods.ts<br/>refresh()
    participant Layout as layout.ts<br/>layoutMain()
    participant LinkDiv as linkDiv.ts<br/>linkDiv()
    participant DOM as DOM Tree<br/>SVG/HTML
    participant EventBus as pubsub.ts<br/>Event System
    participant State as Internal State<br/>{nodeData, arrows}

    User->>ToolBar: Click "Open File" button<br/>{event: click}
    Note over ToolBar: Estado inicial: mapa padrão carregado
    
    ToolBar->>FileInput: createElement('input')<br/>{type: 'file', accept: '.json'}
    ToolBar->>FileInput: trigger click()
    FileInput->>User: Native file picker dialog
    
    User->>FileInput: Select mind-map.json
    FileInput->>ToolBar: onChange event<br/>{file: File object}
    
    ToolBar->>ToolBar: Validate file type<br/>{name: "*.json", size: <10MB}
    
    alt Invalid File Type
        ToolBar->>User: Alert: "Please select a JSON file"
        Note over User: Estado: mapa atual mantido
    else Valid JSON File
        ToolBar->>FileReader: new FileReader()
        ToolBar->>FileReader: readAsText(file)<br/>{encoding: 'UTF-8'}
        
        FileReader->>FileReader: Read file content
        FileReader->>ToolBar: onload event<br/>{result: string content}
        
        ToolBar->>Validator: JSON.parse(content)
        
        alt Invalid JSON Syntax
            Validator->>ToolBar: SyntaxError
            ToolBar->>User: Alert: "Invalid JSON format"
            Note over User: Estado: mapa atual mantido
        else Valid JSON
            Validator->>Validator: Validate MindElixirData<br/>{nodeData, arrows?, summaries?}
            
            alt Invalid Structure
                Validator->>ToolBar: ValidationError<br/>Missing required fields
                ToolBar->>User: Alert: "Invalid mind map structure"
                Note over User: Estado: mapa atual mantido
            else Valid MindElixirData
                Note over State: Estado antes: dados do mapa atual
                
                ToolBar->>MindElixir: instance.refresh(parsedData)
                MindElixir->>Methods: refresh(data)<br/>{nodeData, arrows, summaries}
                
                Methods->>Methods: clearSelection()
                Note over State: Estado: seleção limpa
                
                Methods->>State: Update internal data<br/>this.nodeData = data.nodeData<br/>this.arrows = data.arrows || []
                
                Methods->>Methods: fillParent(nodeData)<br/>Recursively set parent refs
                
                Methods->>Layout: layout()<br/>Calculate node positions
                Layout->>DOM: Clear existing DOM<br/>container.innerHTML = ''
                Layout->>Layout: layoutMain(nodeData, container)
                Layout->>DOM: Create node elements<br/>createNode() for each node
                
                Note over State: Estado: novos nós criados no DOM
                
                Methods->>LinkDiv: linkDiv()<br/>Draw connections
                LinkDiv->>LinkDiv: Process all nodes
                LinkDiv->>DOM: Create path elements<br/>SVG paths between nodes
                
                Methods->>Methods: processArrows()
                alt Has Custom Arrows
                    Methods->>DOM: Create arrow paths<br/>Based on arrows array
                end
                
                Methods->>EventBus: bus.fire('refresh')<br/>{data: newData}
                EventBus->>EventBus: Notify all listeners
                
                Methods->>Methods: toCenter()<br/>Center the mind map
                
                Note over State: Estado final: novo mapa carregado e centralizado
                
                MindElixir->>ToolBar: Success callback
                ToolBar->>User: Mind map loaded successfully
            end
        end
    end

    Note over User, State: Arquivos modificados: toolBar.ts (botão), methods.ts (validação)<br/>Funções utilizadas: refresh(), layout(), linkDiv()<br/>Dados persistidos: nodeData em memória (não há banco de dados)
```

## Estados do Sistema Durante o Processo

### 1. Estado Inicial
- Mapa mental padrão carregado
- ToolBar visível com botões existentes
- Nenhuma operação em andamento

### 2. Estado Durante Seleção de Arquivo
- Dialog nativo do browser aberto
- Aplicação aguardando resposta do usuário
- Mapa atual ainda visível

### 3. Estado Durante Leitura
- FileReader processando arquivo
- UI pode mostrar indicador de carregamento
- Mapa atual ainda visível

### 4. Estado Durante Validação
- Conteúdo JSON sendo parseado
- Estrutura sendo validada
- Decisão sobre aceitar ou rejeitar dados

### 5. Estado Durante Atualização
- DOM sendo limpo
- Novos elementos sendo criados
- Conexões sendo desenhadas

### 6. Estado Final (Sucesso)
- Novo mapa completamente carregado
- Centralizado na viewport
- Pronto para edição

### 6. Estado Final (Erro)
- Mapa original mantido
- Mensagem de erro exibida
- Sistema pronto para nova tentativa

## Detalhes de Implementação

### Arquivos a Modificar:
1. **src/plugin/toolBar.ts**
   - Adicionar botão "Open File"
   - Implementar handler para file input
   - Adicionar validação de arquivo

2. **src/icons/** (novo arquivo)
   - folder-open.svg para ícone do botão

3. **src/i18n.ts**
   - Adicionar traduções para "Open File"
   - Mensagens de erro em múltiplos idiomas

### Funções Reutilizadas:
1. **refresh(data)** - Atualiza mapa com novos dados
2. **clearSelection()** - Limpa seleções atuais
3. **fillParent()** - Configura referências parent/child
4. **layout()** - Calcula posições dos nós
5. **linkDiv()** - Desenha conexões
6. **toCenter()** - Centraliza visualização

### Estrutura de Dados Esperada:
```typescript
interface MindElixirData {
  nodeData: {
    id: string
    topic: string
    root: boolean
    children?: NodeObj[]
  }
  arrows?: Array<{
    id: string
    from: string
    to: string
    text?: string
  }>
  summaries?: Array<{
    id: string
    from: string
    to: string
    text?: string
  }>
  direction?: 0 | 1 | 2
  theme?: Theme
}
```