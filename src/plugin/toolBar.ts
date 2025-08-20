import type { MindElixirInstance } from '../types/index'
import side from '../icons/side.svg?raw'
import left from '../icons/left.svg?raw'
import right from '../icons/right.svg?raw'
import full from '../icons/full.svg?raw'
import living from '../icons/living.svg?raw'
import zoomin from '../icons/zoomin.svg?raw'
import zoomout from '../icons/zoomout.svg?raw'
import folderopen from '../icons/folder-open.svg?raw'

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
}
const createButton = (id: string, name: string) => {
  const button = document.createElement('span')
  button.id = id
  button.innerHTML = map[name]
  return button
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

  toolBarLTContainer.appendChild(l)
  toolBarLTContainer.appendChild(r)
  toolBarLTContainer.appendChild(s)
  toolBarLTContainer.appendChild(openFile)
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
      
      // Validate file type
      if (!file.name.toLowerCase().endsWith('.json')) {
        alert('Please select a JSON file')
        return
      }
      
      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        alert('File size must be less than 10MB')
        return
      }
      
      // Read file content
      const reader = new FileReader()
      
      reader.onload = (e) => {
        const content = e.target?.result as string
        
        try {
          const data = JSON.parse(content)
          
          // Basic validation - check if it has nodeData
          if (!data.nodeData) {
            alert('Invalid mind map structure: missing nodeData')
            return
          }
          
          // For now, just log the data (Phase 4 will integrate with refresh)
          console.log('Valid mind map data loaded:', data)
          alert('File loaded successfully! (Integration pending)')
          
        } catch (error) {
          alert('Invalid JSON format: ' + (error as Error).message)
        }
      }
      
      reader.onerror = () => {
        alert('Error reading file')
      }
      
      reader.readAsText(file, 'UTF-8')
    }
    
    document.body.appendChild(fileInput)
    fileInput.click()
    document.body.removeChild(fileInput)
  }
  return toolBarLTContainer
}

export default function (mind: MindElixirInstance) {
  mind.container.append(createToolBarRBContainer(mind))
  mind.container.append(createToolBarLTContainer(mind))
}
