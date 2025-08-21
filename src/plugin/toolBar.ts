import type { MindElixirInstance } from '../types/index'
import side from '../icons/side.svg?raw'
import left from '../icons/left.svg?raw'
import right from '../icons/right.svg?raw'
import full from '../icons/full.svg?raw'
import living from '../icons/living.svg?raw'
import zoomin from '../icons/zoomin.svg?raw'
import zoomout from '../icons/zoomout.svg?raw'
import folderopen from '../icons/folder-open.svg?raw'
import ai from '../icons/ai.svg?raw'
import i18n from '../i18n'

import './toolBar.less'

const map: Record<string, string> = {
  side,
  left,
  right,
  full,
  living,
  zoomin,
  zoomout,
  folderopen,
  ai,
}
const createButton = (id: string, name: string) => {
  const button = document.createElement('span')
  button.id = id
  button.innerHTML = map[name]
  return button
}

// Validate MindElixir data structure
const validateMindElixirData = (data: any): { valid: boolean; error?: string } => {
  // Check if data is an object
  if (typeof data !== 'object' || data === null) {
    return { valid: false, error: 'invalidMindMapStructure' }
  }
  
  // Check required nodeData field
  if (!data.nodeData) {
    return { valid: false, error: 'missingNodeData' }
  }
  
  // Validate nodeData structure
  const nodeData = data.nodeData
  if (typeof nodeData !== 'object' || nodeData === null) {
    return { valid: false, error: 'invalidMindMapStructure' }
  }
  
  // Check required fields in nodeData
  if (!nodeData.id || typeof nodeData.id !== 'string') {
    return { valid: false, error: 'invalidMindMapStructure' }
  }
  
  if (!nodeData.topic || typeof nodeData.topic !== 'string') {
    return { valid: false, error: 'invalidMindMapStructure' }
  }
  
  if (typeof nodeData.root !== 'boolean') {
    return { valid: false, error: 'invalidMindMapStructure' }
  }
  
  // Validate children if present
  if (nodeData.children && !Array.isArray(nodeData.children)) {
    return { valid: false, error: 'invalidMindMapStructure' }
  }
  
  // Validate arrows if present
  if (data.arrows && !Array.isArray(data.arrows)) {
    return { valid: false, error: 'invalidMindMapStructure' }
  }
  
  // Validate summaries if present
  if (data.summaries && !Array.isArray(data.summaries)) {
    return { valid: false, error: 'invalidMindMapStructure' }
  }
  
  // Validate direction if present
  if (data.direction !== undefined && ![0, 1, 2].includes(data.direction)) {
    return { valid: false, error: 'invalidMindMapStructure' }
  }
  
  return { valid: true }
}

function createToolBarRBContainer(mind: MindElixirInstance) {
  const toolBarRBContainer = document.createElement('div')
  const fc = createButton('fullscreen', 'full')
  const gc = createButton('toCenter', 'living')
  const zo = createButton('zoomout', 'zoomout')
  const zi = createButton('zoomin', 'zoomin')
  const percentage = document.createElement('span')
  percentage.innerText = '100%'
  toolBarRBContainer.appendChild(fc)
  toolBarRBContainer.appendChild(gc)
  toolBarRBContainer.appendChild(zo)
  toolBarRBContainer.appendChild(zi)
  // toolBarRBContainer.appendChild(percentage)
  toolBarRBContainer.className = 'mind-elixir-toolbar rb'
  fc.onclick = () => {
    if (document.fullscreenElement === mind.el) {
      document.exitFullscreen()
    } else {
      mind.el.requestFullscreen()
    }
  }
  gc.onclick = () => {
    mind.toCenter()
  }
  zo.onclick = () => {
    mind.scale(mind.scaleVal - mind.scaleSensitivity)
  }
  zi.onclick = () => {
    mind.scale(mind.scaleVal + mind.scaleSensitivity)
  }
  return toolBarRBContainer
}
function createToolBarLTContainer(mind: MindElixirInstance) {
  const toolBarLTContainer = document.createElement('div')
  const l = createButton('tbltl', 'left')
  const r = createButton('tbltr', 'right')
  const s = createButton('tblts', 'side')
  const openFile = createButton('openfile', 'folderopen')
  const aiButton = createButton('ai-assistant', 'ai')

  toolBarLTContainer.appendChild(l)
  toolBarLTContainer.appendChild(r)
  toolBarLTContainer.appendChild(s)
  toolBarLTContainer.appendChild(openFile)
  toolBarLTContainer.appendChild(aiButton)
  toolBarLTContainer.className = 'mind-elixir-toolbar lt'
  l.onclick = () => {
    mind.initLeft()
  }
  r.onclick = () => {
    mind.initRight()
  }
  s.onclick = () => {
    mind.initSide()
  }
  openFile.onclick = () => {
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = '.json'
    fileInput.style.display = 'none'
    
    fileInput.onchange = (event) => {
      const target = event.target as HTMLInputElement
      const file = target.files?.[0]
      
      if (!file) return
      
      // Get current locale
      const locale = mind.locale || 'en'
      const lang = i18n[locale] || i18n.en
      
      // Validate file type
      if (!file.name.toLowerCase().endsWith('.json')) {
        alert(lang.invalidFileType)
        return
      }
      
      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        alert(lang.fileTooLarge)
        return
      }
      
      // Read file content
      const reader = new FileReader()
      
      reader.onload = (e) => {
        const content = e.target?.result as string
        
        try {
          const data = JSON.parse(content)
          
          // Validate data structure
          const validation = validateMindElixirData(data)
          if (!validation.valid) {
            alert(lang[validation.error! as keyof typeof lang] || lang.invalidMindMapStructure)
            return
          }
          
          // Integrate with refresh to load the new mind map
          try {
            mind.refresh(data)
            console.log('Mind map loaded successfully:', data)
            // No need for alert as the map will be visually updated
          } catch (refreshError) {
            console.error('Error refreshing mind map:', refreshError)
            alert(lang.errorReadingFile + ': ' + (refreshError as Error).message)
          }
          
        } catch (error) {
          alert(lang.invalidJSON + ': ' + (error as Error).message)
        }
      }
      
      reader.onerror = () => {
        alert(lang.errorReadingFile)
      }
      
      reader.readAsText(file, 'UTF-8')
    }
    
    document.body.appendChild(fileInput)
    fileInput.click()
    document.body.removeChild(fileInput)
  }
  aiButton.title = 'AI Assistant'
  aiButton.onclick = () => {
    // Emit event to open tabs panel
    mind.bus.fire('openTabsPanel')
  }
  return toolBarLTContainer
}

export default function (mind: MindElixirInstance) {
  mind.container.append(createToolBarRBContainer(mind))
  mind.container.append(createToolBarLTContainer(mind))
}
