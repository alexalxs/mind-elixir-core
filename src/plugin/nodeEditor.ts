
import { MindElixirInstance, NodeObj } from '../types'
import { shapeTpc } from '../utils/dom'

const editorTemplate = (node: NodeObj) => `
<div class="node-editor">
  <div class="editor-header">
    <span>Node Editor</span>
    <span class="close-btn">✕</span>
  </div>
  <div class="editor-body">
    <div class="form-group">
      <label>Font Size</label>
      <input type="number" id="fontSize" value="${node.style?.fontSize || 16}" />
    </div>
    <div class="form-group">
      <label>Color</label>
      <input type="color" id="color" value="${node.style?.color || '#000000'}" />
    </div>
    <div class="form-group">
      <label>Background</label>
      <input type="color" id="background" value="${node.style?.background || '#ffffff'}" />
    </div>
    <div class="form-group">
      <label>Font Weight</label>
      <select id="fontWeight">
        <option value="normal" ${node.style?.fontWeight === 'normal' ? 'selected' : ''}>Normal</option>
        <option value="bold" ${node.style?.fontWeight === 'bold' ? 'selected' : ''}>Bold</option>
      </select>
    </div>
  </div>
</div>
`

export default function(mind: MindElixirInstance) {
  let editor: HTMLDivElement | null = null

  const showEditor = (node: NodeObj) => {
    if (editor) {
      editor.remove()
    }
    editor = document.createElement('div')
    editor.innerHTML = editorTemplate(node)
    mind.container.appendChild(editor)

    const closeBtn = editor.querySelector('.close-btn')
    closeBtn?.addEventListener('click', () => {
      editor?.remove()
    })

    const inputs = editor.querySelectorAll('input, select')
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        const newStyle: any = {}
        inputs.forEach((i: any) => {
          newStyle[i.id] = i.value
          if (i.id === 'fontSize') {
            newStyle[i.id] = i.value + 'px'
          }
        })
        
        const updatedNode = { ...node, style: newStyle }
        const tpc = mind.findEle(node.id)
        shapeTpc(tpc, updatedNode)
        mind.linkDiv()
        mind.bus.fire('operation', {
          name: 'reshapeNode',
          obj: updatedNode,
          origin: node,
        })
      })
    })
  }

  mind.bus.addListener('editStyle', (node: NodeObj) => {
    showEditor(node)
  })
}
