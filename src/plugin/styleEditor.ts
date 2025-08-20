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
      <div class="style-editor-content">
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
        <div class="color-section">
          <div class="color-label">Theme Colors</div>
          <div class="color-palette">
            ${colors
              .map(
                color =>
                  `<button class="color-btn" data-color="${color}" style="background-color: ${color}"></button>`
              )
              .join('')}
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

  // Position editor above node
  const positionEditor = (node: Topic) => {
    if (!editorEl) return

    const nodeRect = node.getBoundingClientRect()
    const containerRect = mind.container.getBoundingClientRect()
    const editorHeight = 200 // approximate height

    // Calculate position relative to container
    const left = nodeRect.left - containerRect.left + nodeRect.width / 2
    const top = nodeRect.top - containerRect.top - editorHeight - 10

    editorEl.style.left = `${left}px`
    editorEl.style.top = `${top}px`
    editorEl.style.transform = 'translateX(-50%)'
  }

  // Show editor for node
  const showEditor = (node: Topic) => {
    if (!editorEl) return
    currentNode = node
    editorEl.style.display = 'block'
    positionEditor(node)
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
  const handleColorChange = (color: string) => {
    applyStyle('color', color)
  }

  // Event listeners
  editorEl.addEventListener('click', (e) => {
    e.stopPropagation()
    const target = e.target as HTMLElement
    
    if (target.classList.contains('font-btn')) {
      const index = parseInt(target.dataset.font || '0')
      handleFontFamily(index)
    } else if (target.classList.contains('style-btn')) {
      const action = target.dataset.action
      if (action) handleStyleAction(action)
    } else if (target.classList.contains('color-btn')) {
      const color = target.dataset.color
      if (color) handleColorChange(color)
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

  // Update position when container scrolls or resizes
  const updatePosition = () => {
    if (currentNode && editorEl?.style.display !== 'none') {
      positionEditor(currentNode)
    }
  }

  mind.container.addEventListener('scroll', updatePosition)
  window.addEventListener('resize', updatePosition)

  // Cleanup
  const destroy = () => {
    editorEl?.remove()
    mind.container.removeEventListener('scroll', updatePosition)
    window.removeEventListener('resize', updatePosition)
  }

  return { destroy }
}