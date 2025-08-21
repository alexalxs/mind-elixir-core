import type { MindElixirInstance, NodeObj } from '../types/index'
import type { Topic } from '../types/dom'

const defaultColors = [
  '#000000', '#0066ff', '#9966ff', '#ff3366', 
  '#ff6633', '#ff9933', '#ffcc00', '#66ff33',
  '#00cc99', '#00ccff', '#0099ff', '#cccccc',
]

const fontFamilies = [
  { name: 'Sans', value: 'Arial, sans-serif', preview: 'Abc' },
  { name: 'Serif', value: 'Georgia, serif', preview: 'Abc' },
  { name: 'Script', value: 'Cursive', preview: 'Abc', style: 'italic' },
  { name: 'Mono', value: 'Courier New, monospace', preview: 'Abc' },
]

export function createStyleEditorTab(mind: MindElixirInstance) {
  let currentNode: Topic | null = null

  // Create content element
  const content = document.createElement('div')
  content.className = 'style-editor-tab'
  content.innerHTML = `
    <div class="style-editor-tabs">
      <button class="style-tab-btn active" data-tab="node">Nó</button>
      <button class="style-tab-btn" data-tab="text">Texto</button>
    </div>
    <div class="style-tab-content active" data-content="node">
      <div class="color-section">
        <div class="color-label">Cor de Fundo</div>
        <div class="color-palette">
          ${defaultColors.map(color =>
            `<button class="color-btn bg-color" data-color="${color}" data-type="background" style="background-color: ${color}"></button>`
          ).join('')}
        </div>
      </div>
      <div class="additional-styles">
        <div class="style-group">
          <label>Borda</label>
          <select class="style-select" data-property="border">
            <option value="">Nenhuma</option>
            <option value="1px solid">Sólida fina</option>
            <option value="2px solid">Sólida média</option>
            <option value="3px solid">Sólida grossa</option>
            <option value="1px dashed">Tracejada fina</option>
            <option value="2px dashed">Tracejada média</option>
          </select>
        </div>
        <div class="style-group">
          <label>Largura</label>
          <select class="style-select" data-property="width">
            <option value="">Automática</option>
            <option value="100px">100px</option>
            <option value="150px">150px</option>
            <option value="200px">200px</option>
            <option value="250px">250px</option>
          </select>
        </div>
      </div>
    </div>
    <div class="style-tab-content" data-content="text">
      <div class="color-section">
        <div class="color-label">Cor do Texto</div>
        <div class="color-palette">
          ${defaultColors.map(color =>
            `<button class="color-btn text-color" data-color="${color}" data-type="text" style="background-color: ${color}"></button>`
          ).join('')}
        </div>
      </div>
      <div class="font-family-row">
        ${fontFamilies.map((font, i) =>
          `<button class="font-btn" data-font="${i}" style="font-family: ${font.value}; ${
            font.style ? `font-style: ${font.style}` : ''
          }">${font.preview}</button>`
        ).join('')}
      </div>
      <div class="style-controls">
        <button class="style-btn bold-btn" data-action="bold"><strong>B</strong></button>
        <button class="style-btn italic-btn" data-action="italic"><em>i</em></button>
        <div class="separator"></div>
        <button class="style-btn size-btn" data-action="size-down">A</button>
        <button class="style-btn size-btn size-up" data-action="size-up">A</button>
      </div>
    </div>
  `

  // Apply style to node
  const applyStyle = (property: keyof NonNullable<NodeObj['style']>, value: string) => {
    if (!currentNode) return
    const nodeObj = currentNode.nodeObj
    if (!nodeObj.style) nodeObj.style = {}
    
    nodeObj.style[property] = value
    mind.reshapeNode(currentNode, { style: nodeObj.style })
  }

  // Event listeners
  content.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    
    if (target.classList.contains('style-tab-btn')) {
      const tab = target.dataset.tab
      if (tab) {
        content.querySelectorAll('.style-tab-btn').forEach(btn => {
          const btnElement = btn as HTMLElement
          btn.classList.toggle('active', btnElement.dataset.tab === tab)
        })
        content.querySelectorAll('.style-tab-content').forEach(pane => {
          pane.classList.toggle('active', pane.getAttribute('data-content') === tab)
        })
      }
    } else if (target.classList.contains('color-btn')) {
      const color = target.dataset.color
      const type = target.dataset.type || 'text'
      if (color) {
        if (type === 'background') {
          applyStyle('background', color)
        } else {
          applyStyle('color', color)
        }
      }
    } else if (target.classList.contains('font-btn')) {
      const index = parseInt(target.dataset.font || '0')
      const font = fontFamilies[index]
      if (font) {
        applyStyle('fontFamily', font.value)
      }
    } else if (target.classList.contains('style-btn')) {
      const action = target.dataset.action
      if (!action || !currentNode) return
      
      const nodeObj = currentNode.nodeObj
      if (!nodeObj.style) nodeObj.style = {}

      switch (action) {
        case 'bold':
          const isBold = nodeObj.style.fontWeight === 'bold'
          applyStyle('fontWeight', isBold ? 'normal' : 'bold')
          break
        case 'italic':
          const isItalic = nodeObj.style.fontStyle === 'italic'
          applyStyle('fontStyle', isItalic ? 'normal' : 'italic')
          break
        case 'size-up':
          const currentSize = parseInt(nodeObj.style.fontSize || '16')
          applyStyle('fontSize', `${currentSize + 2}px`)
          break
        case 'size-down':
          const currentSizeDown = parseInt(nodeObj.style.fontSize || '16')
          applyStyle('fontSize', `${Math.max(10, currentSizeDown - 2)}px`)
          break
      }
    }
  })

  // Handle select changes
  content.addEventListener('change', (e) => {
    const target = e.target as HTMLSelectElement
    if (target.classList.contains('style-select')) {
      const property = target.dataset.property as keyof NonNullable<NodeObj['style']>
      const value = target.value
      if (property) {
        applyStyle(property, value || '')
      }
    }
  })

  // Listen for node selection
  mind.bus.addListener('selectNodes', (nodes: NodeObj[]) => {
    if (nodes.length > 0) {
      const topicEl = mind.findEle(nodes[nodes.length - 1].id)
      if (topicEl) {
        currentNode = topicEl
      }
    }
  })

  return {
    id: 'style',
    label: 'Estilo',
    content,
    onActivate: () => {
      // Update current node when tab is activated
      if (mind.currentNode) {
        currentNode = mind.currentNode
      }
    }
  }
}