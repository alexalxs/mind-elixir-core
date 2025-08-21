import type { MindElixirInstance, NodeObj } from '../types/index'
import type { AINodeObj } from './aiAssistant.types'

export interface AIAssistantTabOptions {
  supabaseUrl?: string
  supabaseAnonKey?: string
  autoSuggest?: boolean
}

export function createAIAssistantTab(mind: MindElixirInstance, options: AIAssistantTabOptions = {}) {
  const {
    supabaseUrl = 'https://mtugzogakhqqpykopstk.supabase.co',
    supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10dWd6b2dha2hxcXB5a29wc3RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTY5MzIsImV4cCI6MjA3MTIzMjkzMn0.0SypN0pLQ0TgZsWYjplh8Dp3PiXcD7tOxhPSBf9tK4U',
    autoSuggest = false
  } = options

  let currentNode: NodeObj | null = null
  let isLoading = false

  // Create content element
  const content = document.createElement('div')
  content.className = 'ai-assistant-tab'
  content.innerHTML = `
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
  `

  // Get DOM elements
  const nodeTopic = content.querySelector('.ai-node-topic') as HTMLSpanElement
  const promptTextarea = content.querySelector('.ai-prompt-input') as HTMLTextAreaElement
  const generateBtn = content.querySelector('.ai-generate-btn') as HTMLButtonElement
  const suggestionsList = content.querySelector('.ai-suggestions-list') as HTMLDivElement
  const loadingDiv = content.querySelector('.ai-loading') as HTMLDivElement
  
  // Config elements
  const toggleConfigBtn = content.querySelector('.toggle-config-btn') as HTMLButtonElement
  const configContent = content.querySelector('.config-content') as HTMLDivElement
  const modelSelect = content.querySelector('.ai-model-select') as HTMLSelectElement
  const temperatureSlider = content.querySelector('.ai-temperature-slider') as HTMLInputElement
  const temperatureValue = content.querySelector('.slider-value') as HTMLSpanElement
  const maxTokensInput = content.querySelector('.ai-max-tokens') as HTMLInputElement

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

  // Prevent textarea from propagating events
  promptTextarea.addEventListener('click', (e) => e.stopPropagation())
  promptTextarea.addEventListener('keydown', (e) => e.stopPropagation())
  promptTextarea.addEventListener('input', (e) => e.stopPropagation())

  // Helper function to validate and log problematic nodes
  function validateNode(node: any, path: string = 'root'): boolean {
    if (!node || typeof node !== 'object') {
      console.warn(`[AI Assistant] Invalid node at ${path}: not an object`, node)
      return false
    }
    
    if (!node.topic && node.topic !== '') {
      console.warn(`[AI Assistant] Node missing topic at ${path}:`, node)
      return false
    }
    
    if (!node.id) {
      console.warn(`[AI Assistant] Node missing id at ${path}:`, node)
      return false
    }
    
    // Validate children recursively
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach((child: any, index: number) => {
        validateNode(child, `${path}.children[${index}]`)
      })
    }
    
    return true
  }

  // Helper function to remove circular references and ensure required fields
  function cleanNodeData(node: any, depth: number = 0, path: string = 'root'): any {
    // Ensure node is valid
    if (!node || typeof node !== 'object') {
      console.warn(`[AI Assistant] Skipping invalid node at ${path}`)
      return null
    }
    
    // Force topic to be a string, ALWAYS
    let topic = ''
    if (node.topic !== undefined && node.topic !== null) {
      // Convert to string even if it's another type
      topic = String(node.topic).trim()
      // If conversion resulted in empty string, use a default
      if (!topic) {
        topic = `Node ${node.id || path}`
        console.warn(`[AI Assistant] Node has empty topic at ${path}, using default:`, topic)
      }
    } else {
      // Generate a default topic
      topic = `Empty Node at ${path}`
      console.warn(`[AI Assistant] Node missing topic at ${path}, value:`, node.topic, ', using default:', topic)
    }
    
    // Force id to exist
    let id = node.id
    if (!id) {
      id = `generated-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
      console.warn(`[AI Assistant] Node missing id at ${path}, generated:`, id)
    }
    
    const cleaned: any = {
      id: id,
      topic: topic // This is now guaranteed to be a string
    }
    
    // Add other fields only if they're valid
    if (node.expanded !== undefined) cleaned.expanded = node.expanded
    if (node.direction !== undefined) cleaned.direction = node.direction
    
    // Only add optional fields if they exist and are valid
    if (node.style && typeof node.style === 'object') cleaned.style = node.style
    if (node.tags && Array.isArray(node.tags)) cleaned.tags = node.tags
    if (node.icons && Array.isArray(node.icons)) cleaned.icons = node.icons
    if (node.hyperLink && typeof node.hyperLink === 'string') cleaned.hyperLink = node.hyperLink
    if (node.image && typeof node.image === 'object') cleaned.image = node.image
    
    if (node.id === mind.nodeData.id) {
      cleaned.root = true
    }
    
    // Process children with detailed path information
    if (node.children && Array.isArray(node.children) && node.children.length > 0) {
      const cleanedChildren = []
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i]
        const childPath = `${path}.children[${i}]`
        
        // Skip invalid children
        if (!child || typeof child !== 'object') {
          console.warn(`[AI Assistant] Skipping invalid child at ${childPath}`)
          continue
        }
        
        // For children that are empty objects or have no topic, create a minimal valid node
        if (!child.topic && child.topic !== '') {
          child.topic = `Child ${i + 1}`
          console.warn(`[AI Assistant] Child at ${childPath} has no topic, setting default`)
        }
        
        const cleanedChild = cleanNodeData(child, depth + 1, childPath)
        if (cleanedChild !== null) {
          cleanedChildren.push(cleanedChild)
        }
      }
      if (cleanedChildren.length > 0) {
        cleaned.children = cleanedChildren
      }
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
      console.error('[AI Assistant Tab] API Error:', errorData)
      
      // Create detailed error message
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
    if (!parentNode.children) {
      parentNode.children = []
    }
    parentNode.expanded = true
    
    children.forEach(child => {
      const newNode = mind.generateNewObj() as AINodeObj
      newNode.topic = child.topic
      newNode.aiGenerated = true
      newNode.aiGeneratedAt = new Date().toISOString()
      newNode.parent = parentNode
      
      parentNode.children!.push(newNode)
      
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
      if (!nodeEl.querySelector('.ai-badge')) {
        const aiBadge = document.createElement('span')
        aiBadge.className = 'ai-badge'
        aiBadge.innerHTML = '🤖'
        aiBadge.title = 'AI Generated'
        nodeEl.appendChild(aiBadge)
      }
    }
    
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
      // First validate the original node data
      console.log('[AI Assistant] Validating node data...')
      validateNode(mind.nodeData)
      
      const cleanedNodeData = cleanNodeData(mind.nodeData)
      const prompt = promptTextarea.value.trim()
      
      if (!prompt) {
        suggestionsList.innerHTML = '<div class="ai-error">Por favor, digite um prompt</div>'
        return
      }

      // Debug: Check for problematic nodes before sending
      console.log('[AI Assistant] Cleaned node data:', cleanedNodeData)
      
      // Additional validation to find the problematic path
      if (cleanedNodeData.children && cleanedNodeData.children[12]) {
        console.log('[AI Assistant] Children[12]:', cleanedNodeData.children[12])
        if (cleanedNodeData.children[12].children) {
          console.log('[AI Assistant] Children[12].children:', cleanedNodeData.children[12].children)
        }
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
      
      if (result.children && result.children.length > 0) {
        addAINodes(currentNode, result.children)
        mind.refresh()
        
        setTimeout(() => {
          if (currentNode) {
            addVisualIndicators(currentNode)
          }
        }, 100)
        
        suggestionsList.innerHTML = `
          <div class="ai-success">
            ✅ ${result.children.length} sugestões foram adicionadas com sucesso!
          </div>
        `
      } else {
        suggestionsList.innerHTML = '<div class="ai-no-suggestions">Nenhuma sugestão gerada</div>'
      }
    } catch (error) {
      console.error('Erro ao gerar sugestões:', error)
      let errorHtml = '<div class="ai-error">'
      
      if (error instanceof Error) {
        // Split error message by newlines to format properly
        const errorParts = error.message.split('\n\n')
        errorHtml += `<strong>${errorParts[0]}</strong>`
        
        if (errorParts.length > 1) {
          errorHtml += '<br><br>'
          errorHtml += errorParts.slice(1).join('<br><br>').replace(/\n/g, '<br>')
        }
      } else {
        errorHtml += 'Erro desconhecido'
      }
      
      errorHtml += '</div>'
      suggestionsList.innerHTML = errorHtml
    } finally {
      isLoading = false
      loadingDiv.style.display = 'none'
      generateBtn.disabled = false
    }
  }

  generateBtn.addEventListener('click', async () => {
    if (!currentNode || isLoading) return
    await generateSuggestions()
  })

  // Listen for node selection
  mind.bus.addListener('selectNodes', (nodes: NodeObj[]) => {
    if (nodes.length > 0) {
      currentNode = nodes[nodes.length - 1]
      nodeTopic.textContent = currentNode.topic
      generateBtn.disabled = false
      
      if (autoSuggest) {
        generateSuggestions()
      }
    }
  })

  return {
    id: 'ai',
    label: 'IA Assistant',
    content,
    onActivate: () => {
      // Update current node when tab is activated
      if (mind.currentNodes && mind.currentNodes.length > 0) {
        const selectedTopicEl = mind.currentNodes[mind.currentNodes.length - 1]
        if (selectedTopicEl && selectedTopicEl.nodeObj) {
          currentNode = selectedTopicEl.nodeObj
          nodeTopic.textContent = currentNode.topic
          generateBtn.disabled = false
        }
      } else if (mind.currentNode && mind.currentNode.nodeObj) {
        currentNode = mind.currentNode.nodeObj
        nodeTopic.textContent = currentNode.topic
        generateBtn.disabled = false
      } else {
        const rootNode = mind.nodeData
        if (rootNode) {
          currentNode = rootNode
          nodeTopic.textContent = rootNode.topic
          generateBtn.disabled = false
        }
      }
    }
  }
}