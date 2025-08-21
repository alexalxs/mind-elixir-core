import type { MindElixirInstance, NodeObj } from '../types/index'
import type { Topic } from '../types/dom'
import type { AINodeObj, AIAssistantPayload } from './aiAssistant.types'
import './aiAssistant.less'

export interface AIAssistantOptions {
  supabaseUrl?: string
  supabaseAnonKey?: string
  enabled?: boolean
  autoSuggest?: boolean
  maxSuggestions?: number
  // Panel position configuration
  position?: {
    top?: string
    right?: string
    bottom?: string
    left?: string
  }
  // OpenAI default configurations
  defaultOpenAIConfig?: {
    model?: string
    temperature?: number
    maxTokens?: number
  }
  // Detail default configurations
  defaultDetailConfig?: {
    minWordsPerTopic?: number
    maxWordsPerTopic?: number
    minWordsPerAnswer?: number
    maxWordsPerAnswer?: number
  }
}


export default function aiAssistant(mind: MindElixirInstance, options: AIAssistantOptions = {}) {
  const {
    supabaseUrl = 'https://mtugzogakhqqpykopstk.supabase.co',
    supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10dWd6b2dha2hxcXB5a29wc3RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTY5MzIsImV4cCI6MjA3MTIzMjkzMn0.0SypN0pLQ0TgZsWYjplh8Dp3PiXcD7tOxhPSBf9tK4U',
    enabled = true,
    autoSuggest = false,
    maxSuggestions = 5,
    position = { top: '20px', right: '20px' }
  } = options

  if (!enabled) return

  let currentNode: NodeObj | null = null
  let isLoading = false
  let editorPanel: HTMLElement

  // Check if style editor already exists
  const existingStyleEditor = mind.container.querySelector('.style-editor') as HTMLElement
  
  if (existingStyleEditor) {
    // Hide the existing style editor first
    existingStyleEditor.style.display = 'none'
    
    // Create a new integrated panel
    editorPanel = document.createElement('div')
    editorPanel.className = 'integrated-editor-panel'
    
    // Get the content from style editor
    const styleEditorContent = existingStyleEditor.querySelector('.style-editor-content')?.innerHTML || ''
    
    editorPanel.innerHTML = `
    <div class="editor-header">
      <div class="editor-tabs">
        <button class="tab-btn active" data-tab="style">Estilo</button>
        <button class="tab-btn" data-tab="ai">IA Assistant</button>
      </div>
      <button class="close-btn">✕</button>
    </div>
    <div class="editor-content">
      <div class="tab-content active" data-content="style">
        <div class="style-editor-content">
          ${styleEditorContent}
        </div>
      </div>
      <div class="tab-content" data-content="ai">
        <div class="ai-assistant-content">
      <div class="ai-current-node">
        <label>Nó selecionado:</label>
        <span class="ai-node-topic">Nenhum</span>
      </div>
      <div class="ai-prompt-section">
        <label>Prompt:</label>
        <textarea class="ai-prompt-input" placeholder="Expanda o tópico selecionado em 5 subtópicos relevantes..." rows="4"></textarea>
      </div>
      
      <div class="ai-config-section">
        <div class="config-header">
          <label>Configurações OpenAI</label>
          <button class="toggle-config-btn">▼</button>
        </div>
        <div class="config-content" style="display: none;">
          <div class="config-group">
            <label>Modelo:</label>
            <select class="ai-model-select">
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Rápido)</option>
              <option value="gpt-4">GPT-4 (Preciso)</option>
              <option value="gpt-4-turbo-preview">GPT-4 Turbo (Melhor)</option>
            </select>
          </div>
          <div class="config-group">
            <label>Temperatura (0-2):</label>
            <div class="slider-container">
              <input type="range" class="ai-temperature-slider" min="0" max="2" step="0.1" value="0.7">
              <span class="slider-value">0.7</span>
            </div>
            <small>Menor = mais focado, Maior = mais criativo</small>
          </div>
          <div class="config-group">
            <label>Máx. Tokens:</label>
            <input type="number" class="ai-max-tokens" min="100" max="4000" value="2000">
            <small>Limite de tamanho da resposta</small>
          </div>
        </div>
      </div>
      
      <div class="ai-suggestions">
        <div class="ai-suggestions-header">
          <button class="ai-generate-btn" disabled>Gerar Sugestões</button>
        </div>
        <div class="ai-suggestions-list"></div>
      </div>
      <div class="ai-loading" style="display: none;">
        <div class="ai-spinner"></div>
        <span>Gerando sugestões...</span>
      </div>
        </div>
      </div>
    </div>
  </div>
  `
    
    // Replace the old style editor with the integrated panel
    existingStyleEditor.parentNode?.replaceChild(editorPanel, existingStyleEditor)
  } else {
    // No existing style editor, create a new integrated panel
    editorPanel = document.createElement('div')
    editorPanel.className = 'integrated-editor-panel'
    editorPanel.innerHTML = `
    <div class="editor-header">
      <div class="editor-tabs">
        <button class="tab-btn" data-tab="style">Estilo</button>
        <button class="tab-btn active" data-tab="ai">IA Assistant</button>
      </div>
      <button class="close-btn">✕</button>
    </div>
    <div class="editor-content">
      <div class="tab-content" data-content="style">
        <div class="style-editor-message">
          <p>Editor de estilo não está carregado</p>
        </div>
      </div>
      <div class="tab-content active" data-content="ai">
        <div class="ai-assistant-content">
      <div class="ai-current-node">
        <label>Nó selecionado:</label>
        <span class="ai-node-topic">Nenhum</span>
      </div>
      <div class="ai-prompt-section">
        <label>Prompt:</label>
        <textarea class="ai-prompt-input" placeholder="Expanda o tópico selecionado em 5 subtópicos relevantes..." rows="4"></textarea>
      </div>
      
      <div class="ai-config-section">
        <div class="config-header">
          <label>Configurações OpenAI</label>
          <button class="toggle-config-btn">▼</button>
        </div>
        <div class="config-content" style="display: none;">
          <div class="config-group">
            <label>Modelo:</label>
            <select class="ai-model-select">
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Rápido)</option>
              <option value="gpt-4">GPT-4 (Preciso)</option>
              <option value="gpt-4-turbo-preview">GPT-4 Turbo (Melhor)</option>
            </select>
          </div>
          <div class="config-group">
            <label>Temperatura (0-2):</label>
            <div class="slider-container">
              <input type="range" class="ai-temperature-slider" min="0" max="2" step="0.1" value="0.7">
              <span class="slider-value">0.7</span>
            </div>
            <small>Menor = mais focado, Maior = mais criativo</small>
          </div>
          <div class="config-group">
            <label>Máx. Tokens:</label>
            <input type="number" class="ai-max-tokens" min="100" max="4000" value="2000">
            <small>Limite de tamanho da resposta</small>
          </div>
        </div>
      </div>
      
      <div class="ai-suggestions">
        <div class="ai-suggestions-header">
          <button class="ai-generate-btn" disabled>Gerar Sugestões</button>
        </div>
        <div class="ai-suggestions-list"></div>
      </div>
      <div class="ai-loading" style="display: none;">
        <div class="ai-spinner"></div>
        <span>Gerando sugestões...</span>
      </div>
        </div>
      </div>
    </div>
  </div>
  `
    mind.container.appendChild(editorPanel)
  }

  // Get DOM elements
  const closeBtn = editorPanel.querySelector('.close-btn') as HTMLButtonElement
  const tabBtns = editorPanel.querySelectorAll('.tab-btn') as NodeListOf<HTMLButtonElement>
  const nodeTopic = editorPanel.querySelector('.ai-node-topic') as HTMLSpanElement
  const promptTextarea = editorPanel.querySelector('.ai-prompt-input') as HTMLTextAreaElement
  const generateBtn = editorPanel.querySelector('.ai-generate-btn') as HTMLButtonElement
  const suggestionsList = editorPanel.querySelector('.ai-suggestions-list') as HTMLDivElement
  const loadingDiv = editorPanel.querySelector('.ai-loading') as HTMLDivElement
  
  // Config elements
  const toggleConfigBtn = editorPanel.querySelector('.toggle-config-btn') as HTMLButtonElement
  const configContent = editorPanel.querySelector('.config-content') as HTMLDivElement
  const modelSelect = editorPanel.querySelector('.ai-model-select') as HTMLSelectElement
  const temperatureSlider = editorPanel.querySelector('.ai-temperature-slider') as HTMLInputElement
  const temperatureValue = editorPanel.querySelector('.slider-value') as HTMLSpanElement
  const maxTokensInput = editorPanel.querySelector('.ai-max-tokens') as HTMLInputElement

  // Position panel according to options and show immediately
  editorPanel.style.position = 'fixed'
  if (position.top) editorPanel.style.top = position.top
  if (position.right) editorPanel.style.right = position.right
  if (position.bottom) editorPanel.style.bottom = position.bottom
  if (position.left) editorPanel.style.left = position.left
  editorPanel.style.display = 'block' // Show on load
  editorPanel.style.zIndex = '10000' // Ensure it's above other elements

  // Event handlers
  closeBtn.addEventListener('click', () => {
    editorPanel.style.display = 'none'
  })

  // Tab switching
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab
      if (!tabName) return
      
      // Update active tab
      tabBtns.forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      
      // Show corresponding content
      const contents = editorPanel.querySelectorAll('.tab-content')
      contents.forEach(content => {
        const contentTab = content.getAttribute('data-content')
        content.classList.toggle('active', contentTab === tabName)
      })
    })
  })

  // Config toggle
  toggleConfigBtn.addEventListener('click', () => {
    const isVisible = configContent.style.display !== 'none'
    configContent.style.display = isVisible ? 'none' : 'block'
    toggleConfigBtn.textContent = isVisible ? '▼' : '▲'
  })

  // Temperature slider
  temperatureSlider.addEventListener('input', () => {
    temperatureValue.textContent = temperatureSlider.value
  })

  generateBtn.addEventListener('click', async () => {
    if (!currentNode || isLoading) return
    await generateSuggestions()
  })

  // Ensure textarea works properly
  promptTextarea.addEventListener('click', (e) => {
    e.stopPropagation()
  })
  
  promptTextarea.addEventListener('keydown', (e) => {
    e.stopPropagation()
  })
  
  promptTextarea.addEventListener('input', (e) => {
    e.stopPropagation()
  })

  // Helper function to remove circular references and ensure required fields
  function cleanNodeData(node: NodeObj, depth: number = 0): any {
    // Ensure node is valid
    if (!node || typeof node !== 'object') {
      return null
    }
    
    // Force topic to be a string, even if undefined or null
    const topic = (node.topic !== undefined && node.topic !== null) 
      ? String(node.topic) 
      : `Node ${depth}`
    
    const cleaned: any = {
      id: node.id || `node-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      topic: topic, // Always ensure topic exists as string
      expanded: node.expanded,
      direction: node.direction
    }
    
    // Only add optional fields if they exist and are valid
    if (node.style && typeof node.style === 'object') cleaned.style = node.style
    if (node.tags && Array.isArray(node.tags)) cleaned.tags = node.tags
    if (node.icons && Array.isArray(node.icons)) cleaned.icons = node.icons
    if (node.hyperLink && typeof node.hyperLink === 'string') cleaned.hyperLink = node.hyperLink
    if (node.image && typeof node.image === 'object') cleaned.image = node.image
    
    // Add root property for the root node
    if (node.id === mind.nodeData.id) {
      cleaned.root = true
    }
    
    if (node.children && Array.isArray(node.children) && node.children.length > 0) {
      cleaned.children = node.children
        .map((child, index) => cleanNodeData(child, depth + 1))
        .filter(child => child !== null) // Remove invalid children
    }
    
    return cleaned
  }

  // AI API functions
  async function callAIAssistant(payload: any) {
    const response = await fetch(`${supabaseUrl}/functions/v1/ai-assistant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'apikey': supabaseAnonKey
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('[AI Assistant] API Error:', errorData)
      
      // Criar mensagem de erro detalhada
      let errorMessage = errorData.error || 'Erro ao chamar assistente IA'
      
      if (errorData.validationErrors && Array.isArray(errorData.validationErrors)) {
        errorMessage += '\n\nErros de validação:\n' + errorData.validationErrors.join('\n')
      } else if (errorData.details) {
        errorMessage += '\n\nDetalhes: ' + errorData.details
      }
      
      if (errorData.type) {
        errorMessage += '\n\nTipo: ' + errorData.type
      }
      
      throw new Error(errorMessage)
    }

    return response.json()
  }

  // Helper function to add AI-generated nodes recursively
  function addAINodes(parentNode: NodeObj, children: any[]) {
    // Ensure parent is expanded and has children array
    if (!parentNode.children) {
      parentNode.children = []
    }
    // Mark parent as expanded to allow collapse/expand
    parentNode.expanded = true
    
    children.forEach(child => {
      // Create new node with AI-generated flag
      const newNode = mind.generateNewObj() as AINodeObj
      newNode.topic = child.topic
      newNode.aiGenerated = true
      newNode.aiGeneratedAt = new Date().toISOString()
      newNode.parent = parentNode
      
      // Add the node to parent
      parentNode.children!.push(newNode)
      
      // Recursively add children (for Q&A mode)
      if (child.children && child.children.length > 0) {
        addAINodes(newNode, child.children)
      }
    })
  }
  
  // Helper function to add visual indicators after refresh
  function addVisualIndicators(node: NodeObj) {
    const nodeEl = mind.findEle(node.id)
    if (nodeEl && (node as AINodeObj).aiGenerated) {
      nodeEl.classList.add('ai-generated-node')
      // Add AI badge if not already present
      if (!nodeEl.querySelector('.ai-badge')) {
        const aiBadge = document.createElement('span')
        aiBadge.className = 'ai-badge'
        aiBadge.innerHTML = '🤖'
        aiBadge.title = 'AI Generated'
        nodeEl.appendChild(aiBadge)
      }
    }
    
    // Process children
    if (node.children) {
      node.children.forEach(child => addVisualIndicators(child))
    }
  }

  async function generateSuggestions() {
    if (!currentNode) return

    isLoading = true
    loadingDiv.style.display = 'flex'
    suggestionsList.innerHTML = ''
    generateBtn.disabled = true

    try {
      // Clean the node data to remove circular references
      const cleanedNodeData = cleanNodeData(mind.nodeData)
      
      // Validate prompt
      const prompt = promptTextarea.value.trim()
      if (!prompt) {
        suggestionsList.innerHTML = '<div class="ai-error">Por favor, digite um prompt</div>'
        isLoading = false
        loadingDiv.style.display = 'none'
        generateBtn.disabled = false
        return
      }

      const payload = {
        mindMap: { nodeData: cleanedNodeData },
        selectedNodeId: currentNode.id,
        prompt: prompt,
        openAIConfig: {
          model: modelSelect.value,
          temperature: parseFloat(temperatureSlider.value),
          maxTokens: parseInt(maxTokensInput.value)
        }
      }

      const result = await callAIAssistant(payload)
      
      // Automatically add all children nodes
      if (result.children && result.children.length > 0) {
        // Add nodes to the data structure
        addAINodes(currentNode, result.children)
        
        // Refresh the mind map view
        mind.refresh()
        
        // Add visual indicators and ensure expansion after refresh
        setTimeout(() => {
          if (currentNode) {
            addVisualIndicators(currentNode)
            
            // Force visual expansion of the node
            const nodeEl = mind.findEle(currentNode.id)
            if (nodeEl && currentNode.expanded) {
              // If node is marked as expanded but children not visible, force expand
              const wrapper = nodeEl.closest('me-wrapper')
              const childrenContainer = wrapper?.parentElement?.querySelector('me-nodes')
              
              if (!childrenContainer && currentNode.children && currentNode.children.length > 0) {
                // Children not rendered, force expansion
                mind.expandNode(nodeEl, true)
              }
            }
          }
        }, 100)
        
        // Show success message
        suggestionsList.innerHTML = `
          <div class="ai-success">
            ✅ ${result.children.length} sugestões foram adicionadas com sucesso!
          </div>
        `
        
        // Optionally clear custom prompt after successful generation
        // customPromptTextarea.value = ''
      } else {
        suggestionsList.innerHTML = '<div class="ai-no-suggestions">Nenhuma sugestão gerada</div>'
      }
    } catch (error) {
      console.error('Erro ao gerar sugestões:', error)
      suggestionsList.innerHTML = `<div class="ai-error">Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}</div>`
    } finally {
      isLoading = false
      loadingDiv.style.display = 'none'
      generateBtn.disabled = false
    }
  }

  // Add AI option to context menu
  mind.bus.addListener('showContextMenu', (e: MouseEvent) => {
    
    // Add AI assistant option to context menu
    setTimeout(() => {
      const contextMenu = mind.container.querySelector('.context-menu') as HTMLElement
      if (contextMenu && !contextMenu.querySelector('.ai-context-option')) {
        const aiOption = document.createElement('div')
        aiOption.className = 'context-menu-item ai-context-option'
        aiOption.innerHTML = '🤖 Assistente IA'
        aiOption.addEventListener('click', () => {
          editorPanel.style.display = 'block'
          // Switch to AI tab
          const aiTab = editorPanel.querySelector('[data-tab="ai"]') as HTMLButtonElement
          aiTab?.click()
          // Use the current selected node
          const selectedNode = mind.currentNode
          if (selectedNode && selectedNode.nodeObj) {
            currentNode = selectedNode.nodeObj
            nodeTopic.textContent = selectedNode.nodeObj.topic
            generateBtn.disabled = false
            
            if (autoSuggest) {
              generateSuggestions()
            }
          }
        })
        contextMenu.appendChild(aiOption)
      }
    }, 0)
  })

  // Listen for node selection
  mind.bus.addListener('selectNewNode', (node: NodeObj) => {
    currentNode = node
    nodeTopic.textContent = node.topic
    generateBtn.disabled = false
    
    if (editorPanel.style.display !== 'none' && autoSuggest) {
      generateSuggestions()
    }
  })

  // Also listen for selectNodes event (when clicking on existing nodes)
  mind.bus.addListener('selectNodes', (nodes: NodeObj[]) => {
    if (nodes.length > 0) {
      currentNode = nodes[nodes.length - 1] // Get the last selected node
      nodeTopic.textContent = currentNode.topic
      generateBtn.disabled = false
      
      if (editorPanel.style.display !== 'none' && autoSuggest) {
        generateSuggestions()
      }
    }
  })

  // No more modes - removed this section

  // Listen for toolbar button click
  mind.bus.addListener('openAIAssistant', () => {
    editorPanel.style.display = 'block'
    // Switch to AI tab
    const aiTab = editorPanel.querySelector('[data-tab="ai"]') as HTMLButtonElement
    aiTab?.click()
    
    // First check if there are selected nodes in currentNodes array
    if (mind.currentNodes && mind.currentNodes.length > 0) {
      // Use the last selected node from the array
      const selectedTopicEl = mind.currentNodes[mind.currentNodes.length - 1]
      if (selectedTopicEl && selectedTopicEl.nodeObj) {
        currentNode = selectedTopicEl.nodeObj
        nodeTopic.textContent = currentNode.topic
        generateBtn.disabled = false
      }
    } else if (mind.currentNode && mind.currentNode.nodeObj) {
      // Fallback to currentNode if no nodes in array
      currentNode = mind.currentNode.nodeObj
      nodeTopic.textContent = currentNode.topic
      generateBtn.disabled = false
    } else {
      // Last fallback: if no node is selected, use the root node
      const rootNode = mind.nodeData
      if (rootNode) {
        currentNode = rootNode
        nodeTopic.textContent = rootNode.topic
        generateBtn.disabled = false
      }
    }
  })

  // Return cleanup function
  return () => {
    editorPanel.remove()
  }
}