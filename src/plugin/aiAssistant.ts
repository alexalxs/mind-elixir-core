import type { MindElixirInstance, NodeObj } from '../types/index'
import type { Topic } from '../types/dom'
import type { AINodeObj, AIMode, AIAssistantPayload } from './aiAssistant.types'
import './aiAssistant.less'

export interface AIAssistantOptions {
  supabaseUrl?: string
  supabaseAnonKey?: string
  enabled?: boolean
  autoSuggest?: boolean
  maxSuggestions?: number
}

const AI_MODES: AIMode[] = [
  { id: 'expand', label: 'Expandir', icon: '🌱', description: 'Expandir com subtópicos' },
  { id: 'suggest', label: 'Sugerir', icon: '💡', description: 'Sugerir ideias relacionadas' },
  { id: 'summarize', label: 'Resumir', icon: '📝', description: 'Resumir o ramo' },
  { id: 'question', label: 'Perguntas', icon: '❓', description: 'Gerar perguntas exploratórias' },
  { id: 'custom', label: 'Personalizado', icon: '✨', description: 'Prompt personalizado' }
]

export default function aiAssistant(mind: MindElixirInstance, options: AIAssistantOptions = {}) {
  const {
    supabaseUrl = 'https://mtugzogakhqqpykopstk.supabase.co',
    supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10dWd6b2dha2hxcXB5a29wc3RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTY5MzIsImV4cCI6MjA3MTIzMjkzMn0.0SypN0pLQ0TgZsWYjplh8Dp3PiXcD7tOxhPSBf9tK4U',
    enabled = true,
    autoSuggest = false,
    maxSuggestions = 5
  } = options

  if (!enabled) return

  let currentNode: NodeObj | null = null
  let isLoading = false

  // Create AI Assistant Panel
  const aiPanel = document.createElement('div')
  aiPanel.className = 'ai-assistant-panel'
  aiPanel.innerHTML = `
    <div class="ai-assistant-header">
      <span class="ai-assistant-title">🤖 Assistente IA</span>
      <button class="ai-assistant-close">✕</button>
    </div>
    <div class="ai-assistant-content">
      <div class="ai-current-node">
        <label>Nó selecionado:</label>
        <span class="ai-node-topic">Nenhum</span>
      </div>
      <div class="ai-modes">
        ${AI_MODES.map(mode => `
          <button class="ai-mode-btn" data-mode="${mode.id}" title="${mode.description}">
            <span class="ai-mode-icon">${mode.icon}</span>
            <span class="ai-mode-label">${mode.label}</span>
          </button>
        `).join('')}
      </div>
      <div class="ai-custom-prompt" style="display: none;">
        <textarea placeholder="Digite seu prompt personalizado..." rows="3"></textarea>
      </div>
      <div class="ai-suggestions">
        <div class="ai-suggestions-header">
          <label>Sugestões:</label>
          <button class="ai-generate-btn" disabled>Gerar</button>
        </div>
        <div class="ai-suggestions-list"></div>
      </div>
      <div class="ai-loading" style="display: none;">
        <div class="ai-spinner"></div>
        <span>Gerando sugestões...</span>
      </div>
    </div>
  `

  mind.container.appendChild(aiPanel)

  // Get DOM elements
  const closeBtn = aiPanel.querySelector('.ai-assistant-close') as HTMLButtonElement
  const nodeTopic = aiPanel.querySelector('.ai-node-topic') as HTMLSpanElement
  const modeBtns = aiPanel.querySelectorAll('.ai-mode-btn') as NodeListOf<HTMLButtonElement>
  const customPromptDiv = aiPanel.querySelector('.ai-custom-prompt') as HTMLDivElement
  const customPromptTextarea = customPromptDiv.querySelector('textarea') as HTMLTextAreaElement
  const generateBtn = aiPanel.querySelector('.ai-generate-btn') as HTMLButtonElement
  const suggestionsList = aiPanel.querySelector('.ai-suggestions-list') as HTMLDivElement
  const loadingDiv = aiPanel.querySelector('.ai-loading') as HTMLDivElement

  let selectedMode: AIMode['id'] = 'expand'

  // Hide panel initially
  aiPanel.style.display = 'none'

  // Event handlers
  closeBtn.addEventListener('click', () => {
    aiPanel.style.display = 'none'
  })

  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode as AIMode['id']
      selectedMode = mode
      
      // Update active state
      modeBtns.forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      
      // Show/hide custom prompt
      customPromptDiv.style.display = mode === 'custom' ? 'block' : 'none'
      
      // Clear suggestions
      suggestionsList.innerHTML = ''
    })
  })

  generateBtn.addEventListener('click', async () => {
    if (!currentNode || isLoading) return
    await generateSuggestions()
  })

  // Ensure textarea works properly
  customPromptTextarea.addEventListener('click', (e) => {
    e.stopPropagation()
  })
  
  customPromptTextarea.addEventListener('keydown', (e) => {
    e.stopPropagation()
  })
  
  customPromptTextarea.addEventListener('input', (e) => {
    e.stopPropagation()
  })

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
      const error = await response.json()
      throw new Error(error.error || 'Erro ao chamar assistente IA')
    }

    return response.json()
  }

  async function generateSuggestions() {
    if (!currentNode) return

    isLoading = true
    loadingDiv.style.display = 'flex'
    suggestionsList.innerHTML = ''
    generateBtn.disabled = true

    try {
      const payload: AIAssistantPayload = {
        mindMap: { nodeData: mind.nodeData },
        selectedNodeId: currentNode.id,
        mode: selectedMode,
        depth: maxSuggestions
      }

      if (selectedMode === 'custom' && customPromptTextarea.value) {
        payload.customPrompt = customPromptTextarea.value
      }

      const result = await callAIAssistant(payload)
      
      // Display suggestions
      if (result.suggestions && result.suggestions.length > 0) {
        result.suggestions.forEach((suggestion: string, index: number) => {
          const suggestionItem = document.createElement('div')
          suggestionItem.className = 'ai-suggestion-item'
          suggestionItem.innerHTML = `
            <span class="ai-suggestion-text">${suggestion}</span>
            <button class="ai-suggestion-add" title="Adicionar como filho">+</button>
          `
          
          const addBtn = suggestionItem.querySelector('.ai-suggestion-add') as HTMLButtonElement
          addBtn.addEventListener('click', () => {
            if (currentNode) {
              // Create new node with AI-generated flag
              const newNode = mind.generateNewObj() as AINodeObj
              newNode.topic = suggestion
              newNode.aiGenerated = true // Mark as AI-generated
              newNode.aiGeneratedAt = new Date().toISOString()
              newNode.aiMode = selectedMode
              
              // Find the current node's topic element
              const currentNodeEl = mind.findEle(currentNode.id) as Topic
              if (currentNodeEl) {
                // Add the node
                mind.addChild(currentNodeEl, newNode)
              }
              
              // Add visual indicator
              const newNodeEl = mind.findEle(newNode.id)
              if (newNodeEl) {
                newNodeEl.classList.add('ai-generated-node')
                // Add AI badge
                const aiBadge = document.createElement('span')
                aiBadge.className = 'ai-badge'
                aiBadge.innerHTML = '🤖'
                aiBadge.title = `AI Generated (${selectedMode})`
                newNodeEl.appendChild(aiBadge)
              }
              
              suggestionItem.classList.add('added')
              addBtn.disabled = true
              addBtn.textContent = '✓'
            }
          })
          
          suggestionsList.appendChild(suggestionItem)
        })
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
          aiPanel.style.display = 'block'
          // Use the current selected node
          const selectedNode = mind.currentNode
          if (selectedNode) {
            currentNode = selectedNode
            nodeTopic.textContent = selectedNode.topic
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
    
    if (aiPanel.style.display !== 'none' && autoSuggest) {
      generateSuggestions()
    }
  })

  // Set default mode
  modeBtns[0].classList.add('active')

  // Listen for toolbar button click
  mind.bus.addListener('openAIAssistant', () => {
    aiPanel.style.display = 'block'
    // Always use the current selected node from mind-elixir
    const selectedNode = mind.currentNode
    if (selectedNode) {
      currentNode = selectedNode
      nodeTopic.textContent = selectedNode.topic
      generateBtn.disabled = false
    } else {
      // If no node is selected, use the root node
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
    aiPanel.remove()
  }
}