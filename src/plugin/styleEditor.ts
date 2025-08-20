import type { MindElixirInstance, NodeObj } from '../types/index'
import type { Topic } from '../types/dom'
import './styleEditor.less'

export interface StyleEditorOptions {
  position?: 'above' | 'below'
  colors?: string[]
}

const defaultColors = [
  '#000000', // black
  '#0066ff', // blue
  '#9966ff', // purple
  '#ff3366', // pink
  '#ff6633', // red-orange
  '#ff9933', // orange
  '#ffcc00', // yellow
  '#66ff33', // green
  '#00cc99', // teal
  '#00ccff', // cyan
  '#0099ff', // light blue
  '#cccccc', // gray
]

const fontFamilies = [
  { name: 'Sans', value: 'Arial, sans-serif', preview: 'Abc' },
  { name: 'Serif', value: 'Georgia, serif', preview: 'Abc' },
  { name: 'Script', value: 'Cursive', preview: 'Abc', style: 'italic' },
  { name: 'Mono', value: 'Courier New, monospace', preview: 'Abc' },
]

export default function styleEditor(mind: MindElixirInstance, options?: StyleEditorOptions) {
  const colors = options?.colors || defaultColors
  let currentNode: Topic | null = null
  let editorEl: HTMLElement | null = null

  // Create editor UI
  const createEditor = () => {
    const editor = document.createElement('div')
    editor.className = 'style-editor'
    editor.innerHTML = `
      <div class="style-editor-header">
        <div class="style-editor-tabs">
          <button class="tab-btn active" data-tab="node">Nó</button>
          <button class="tab-btn" data-tab="text">Texto</button>
        </div>
        <button class="close-btn">&times;</button>
      </div>
      <div class="style-editor-content">
        <div class="tab-content active" data-content="node">
          <div class="color-section">
            <div class="color-label">Cor de Fundo</div>
            <div class="color-palette">
              ${colors
                .map(
                  color =>
                    `<button class="color-btn bg-color" data-color="${color}" data-type="background" style="background-color: ${color}"></button>`
                )
                .join('')}
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
                <option value="1px dotted">Pontilhada fina</option>
                <option value="2px dotted">Pontilhada média</option>
                <option value="double">Dupla</option>
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
                <option value="300px">300px</option>
                <option value="400px">400px</option>
                <option value="500px">500px</option>
              </select>
            </div>
          </div>
        </div>
        <div class="tab-content" data-content="text">
          <div class="font-family-row">
            ${fontFamilies
              .map(
                (font, i) =>
                  `<button class="font-btn" data-font="${i}" style="font-family: ${font.value}; ${
                    font.style ? `font-style: ${font.style}` : ''
                  }">${font.preview}</button>`
              )
              .join('')}
          </div>
          <div class="style-controls">
            <button class="style-btn bold-btn" data-action="bold"><strong>B</strong></button>
            <button class="style-btn italic-btn" data-action="italic"><em>i</em></button>
            <div class="separator"></div>
            <button class="style-btn size-btn" data-action="size-down">A</button>
            <button class="style-btn size-btn size-up" data-action="size-up">A</button>
          </div>
          <div class="additional-styles">
            <div class="style-group">
              <label>Decoração do Texto</label>
              <select class="style-select" data-property="textDecoration">
                <option value="none">Nenhuma</option>
                <option value="underline">Sublinhado</option>
                <option value="overline">Linha acima</option>
                <option value="line-through">Riscado</option>
              </select>
            </div>
          </div>
          <div class="color-section">
            <div class="color-label">Cor do Texto</div>
            <div class="color-palette">
              ${colors
                .map(
                  color =>
                    `<button class="color-btn text-color" data-color="${color}" data-type="text" style="background-color: ${color}"></button>`
                )
                .join('')}
            </div>
          </div>
        </div>
      </div>
    `
    editor.style.display = 'none'
    return editor
  }

  // Initialize editor
  editorEl = createEditor()
  mind.container.appendChild(editorEl)

  // Position editor in top right corner
  const positionEditor = () => {
    if (!editorEl) return
    // Fixed position in top right corner
    editorEl.style.position = 'fixed'
    editorEl.style.top = '20px'
    editorEl.style.right = '20px'
    editorEl.style.transform = 'none'
  }

  // Show editor for node
  const showEditor = (node: Topic) => {
    if (!editorEl) return
    currentNode = node
    editorEl.style.display = 'block'
    positionEditor()
    updateActiveStates()
  }

  // Hide editor
  const hideEditor = () => {
    if (!editorEl) return
    editorEl.style.display = 'none'
    currentNode = null
  }

  // Apply style to node
  const applyStyle = (property: keyof NonNullable<NodeObj['style']>, value: string) => {
    if (!currentNode) return
    const nodeObj = currentNode.nodeObj
    if (!nodeObj.style) nodeObj.style = {}
    
    nodeObj.style[property] = value
    mind.reshapeNode(currentNode, { style: nodeObj.style })
  }

  // Handle font family change
  const handleFontFamily = (index: number) => {
    const font = fontFamilies[index]
    if (font) {
      applyStyle('fontFamily', font.value)
    }
  }

  // Handle style actions
  const handleStyleAction = (action: string) => {
    if (!currentNode) return
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

  // Handle color change
  const handleColorChange = (color: string, type: string) => {
    if (type === 'background') {
      applyStyle('background', color)
    } else {
      applyStyle('color', color)
    }
  }

  // Handle input/select changes
  editorEl.addEventListener('change', (e) => {
    const target = e.target as HTMLElement
    if (target.classList.contains('style-input') || target.classList.contains('style-select')) {
      const property = target.dataset.property as keyof NonNullable<NodeObj['style']>
      const value = (target as HTMLInputElement | HTMLSelectElement).value
      if (property) {
        applyStyle(property, value || '')
      }
    }
  })

  // Event listeners
  editorEl.addEventListener('click', (e) => {
    e.stopPropagation()
    const target = e.target as HTMLElement
    
    if (target.classList.contains('font-btn')) {
      const index = parseInt(target.dataset.font || '0')
      handleFontFamily(index)
    } else if (target.classList.contains('style-btn')) {
      const action = target.dataset.action
      if (action) {
        handleStyleAction(action)
        updateActiveStates()
      }
    } else if (target.classList.contains('color-btn')) {
      const color = target.dataset.color
      const type = target.dataset.type || 'text'
      if (color) handleColorChange(color, type)
    } else if (target.classList.contains('style-input')) {
      const property = target.dataset.property as keyof NonNullable<NodeObj['style']>
      const value = (target as HTMLInputElement).value
      if (property) {
        applyStyle(property, value || '')
      }
    } else if (target.classList.contains('tab-btn')) {
      const tab = target.dataset.tab
      if (tab) handleTabSwitch(tab)
    } else if (target.classList.contains('close-btn')) {
      hideEditor()
    }
  })

  // Listen for node selection changes
  let prevNode: Topic | null = null
  mind.container.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    const topicEl = target.closest('me-tpc') as Topic | null
    if (topicEl && topicEl !== prevNode) {
      prevNode = topicEl
      showEditor(topicEl)
    }
  })

  // Listen for style edit event from context menu
  mind.bus.addListener('editStyle', (nodeObj: NodeObj) => {
    const topicEl = mind.findEle(nodeObj.id)
    if (topicEl) {
      showEditor(topicEl)
    }
  })

  // Hide editor when clicking elsewhere
  mind.container.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!editorEl?.contains(target) && !target.closest('me-tpc')) {
      hideEditor()
    }
  })

  // Update active states based on current node
  const updateActiveStates = () => {
    if (!currentNode || !editorEl) return
    const nodeObj = currentNode.nodeObj
    
    // Update bold button
    const boldBtn = editorEl.querySelector('[data-action="bold"]')
    if (boldBtn) {
      boldBtn.classList.toggle('active', nodeObj.style?.fontWeight === 'bold')
    }
    
    // Update italic button
    const italicBtn = editorEl.querySelector('[data-action="italic"]')
    if (italicBtn) {
      italicBtn.classList.toggle('active', nodeObj.style?.fontStyle === 'italic')
    }
    
    // Update input fields
    const borderSelect = editorEl.querySelector('[data-property="border"]') as HTMLSelectElement
    if (borderSelect) borderSelect.value = nodeObj.style?.border || ''
    
    const widthSelect = editorEl.querySelector('[data-property="width"]') as HTMLSelectElement
    if (widthSelect) widthSelect.value = nodeObj.style?.width || ''
    
    const textDecorationSelect = editorEl.querySelector('[data-property="textDecoration"]') as HTMLSelectElement
    if (textDecorationSelect) textDecorationSelect.value = nodeObj.style?.textDecoration || 'none'
  }

  // Handle tab switching
  const handleTabSwitch = (tabName: string) => {
    const tabs = editorEl?.querySelectorAll('.tab-btn')
    const contents = editorEl?.querySelectorAll('.tab-content')
    
    tabs?.forEach(tab => {
      tab.classList.toggle('active', tab.getAttribute('data-tab') === tabName)
    })
    
    contents?.forEach(content => {
      content.classList.toggle('active', content.getAttribute('data-content') === tabName)
    })
  }

  // Cleanup
  const destroy = () => {
    editorEl?.remove()
  }

  return { destroy }
}