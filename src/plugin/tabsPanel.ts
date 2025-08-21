import type { MindElixirInstance } from '../types/index'
import './tabsPanel.less'
import './tabs.less'

export interface TabsPanelOptions {
  position?: {
    top?: string
    right?: string
    bottom?: string
    left?: string
  }
  defaultTab?: string
}

export interface Tab {
  id: string
  label: string
  content: HTMLElement | string
  onActivate?: () => void
  onDeactivate?: () => void
}

export default function tabsPanel(mind: MindElixirInstance, options: TabsPanelOptions = {}) {
  const {
    position = { top: '20px', right: '20px' },
    defaultTab = 'style'
  } = options

  let currentTab = defaultTab
  const tabs: Map<string, Tab> = new Map()

  // Create main panel
  const panel = document.createElement('div')
  panel.className = 'tabs-panel'
  panel.innerHTML = `
    <div class="tabs-header">
      <div class="tabs-nav"></div>
      <button class="tabs-close">&times;</button>
    </div>
    <div class="tabs-content"></div>
  `

  // Position panel
  panel.style.position = 'fixed'
  if (position.top) panel.style.top = position.top
  if (position.right) panel.style.right = position.right
  if (position.bottom) panel.style.bottom = position.bottom
  if (position.left) panel.style.left = position.left
  panel.style.display = 'block' // Show on load
  panel.style.zIndex = '10000'

  mind.container.appendChild(panel)

  // Get elements
  const tabsNav = panel.querySelector('.tabs-nav') as HTMLElement
  const tabsContent = panel.querySelector('.tabs-content') as HTMLElement
  const closeBtn = panel.querySelector('.tabs-close') as HTMLButtonElement

  // Close button
  closeBtn.addEventListener('click', () => {
    panel.style.display = 'none'
  })

  // Add tab function
  function addTab(tab: Tab) {
    tabs.set(tab.id, tab)

    // Create tab button
    const tabBtn = document.createElement('button')
    tabBtn.className = 'tab-btn'
    tabBtn.dataset.tab = tab.id
    tabBtn.textContent = tab.label
    tabBtn.addEventListener('click', () => switchTab(tab.id))
    tabsNav.appendChild(tabBtn)

    // Create tab content container
    const contentDiv = document.createElement('div')
    contentDiv.className = 'tab-pane'
    contentDiv.dataset.tabContent = tab.id
    
    // Add content
    if (typeof tab.content === 'string') {
      contentDiv.innerHTML = tab.content
    } else {
      contentDiv.appendChild(tab.content)
    }
    
    tabsContent.appendChild(contentDiv)

    // Activate default tab
    if (tab.id === currentTab) {
      switchTab(tab.id)
    }
  }

  // Switch tab function
  function switchTab(tabId: string) {
    const tab = tabs.get(tabId)
    if (!tab) return

    // Deactivate current tab
    const currentTabObj = tabs.get(currentTab)
    if (currentTabObj && currentTabObj.onDeactivate) {
      currentTabObj.onDeactivate()
    }

    // Update UI
    tabsNav.querySelectorAll('.tab-btn').forEach(btn => {
      const btnElement = btn as HTMLElement
      btn.classList.toggle('active', btnElement.dataset.tab === tabId)
    })

    tabsContent.querySelectorAll('.tab-pane').forEach(pane => {
      const paneElement = pane as HTMLElement
      pane.classList.toggle('active', paneElement.dataset.tabContent === tabId)
    })

    // Activate new tab
    currentTab = tabId
    if (tab.onActivate) {
      tab.onActivate()
    }
  }

  // Show/hide panel
  function show() {
    panel.style.display = 'block'
  }

  function hide() {
    panel.style.display = 'none'
  }

  // Listen for toolbar event
  mind.bus.addListener('openTabsPanel', () => {
    show()
  })

  return {
    addTab,
    switchTab,
    show,
    hide,
    destroy: () => panel.remove()
  }
}