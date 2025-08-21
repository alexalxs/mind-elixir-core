import { test } from '@playwright/test'

test.describe('AI Assistant - Expand Node Error', () => {
  test('should properly expand nodes after AI suggestions are added', async ({ page }) => {
    // Navigate to test page
    await page.goto('http://localhost:8080/test-ai-selection.html')
    
    // Wait for mind map to load
    await page.waitForSelector('#map', { timeout: 5000 })
    
    // Wait a bit for the map to be fully rendered
    await page.waitForTimeout(1000)
    
    // Click on a node to select it
    await page.click('me-tpc:has-text("mind-elixir-react")')
    
    // Open AI Assistant context menu
    await page.click('me-tpc:has-text("mind-elixir-react")', { button: 'right' })
    await page.waitForSelector('#cm-ai_assistant', { timeout: 3000 })
    await page.click('#cm-ai_assistant')
    
    // Wait for AI Assistant panel to open
    await page.waitForSelector('.ai-assistant-panel', { timeout: 5000 })
    
    // Type a prompt
    await page.fill('#ai-prompt', 'Adicione 3 componentes React principais')
    
    // Click generate button
    await page.click('button:has-text("Gerar Sugestões")')
    
    // Wait for API response (mocked or real)
    await page.waitForTimeout(2000)
    
    // Check if nodes were added to the data structure
    const nodeData = await page.evaluate(() => {
      // @ts-ignore
      const mind = window.mind
      const selectedNode = mind.getSelectedNode()
      return {
        topic: selectedNode.topic,
        expanded: selectedNode.expanded,
        hasChildren: selectedNode.children && selectedNode.children.length > 0,
        childrenCount: selectedNode.children ? selectedNode.children.length : 0,
        children: selectedNode.children ? selectedNode.children.map((c: any) => ({
          topic: c.topic,
          aiGenerated: c.aiGenerated
        })) : []
      }
    })
    
    console.log('Node data after AI generation:', nodeData)
    
    // Verify that node has children and is marked as expanded
    if (!nodeData.hasChildren) {
      throw new Error('No children were added to the node')
    }
    
    if (!nodeData.expanded) {
      throw new Error('Node is not marked as expanded in data structure')
    }
    
    // Check if children are visible in DOM
    const visibleChildren = await page.evaluate(() => {
      // @ts-ignore
      const mind = window.mind
      const selectedNode = mind.getSelectedNode()
      const nodeElement = document.querySelector(`me-tpc[data-nodeid="${selectedNode.id}"]`)
      
      if (!nodeElement) return { error: 'Node element not found' }
      
      const wrapper = nodeElement.closest('me-wrapper')
      if (!wrapper) return { error: 'Wrapper not found' }
      
      const childrenContainer = wrapper.parentElement?.querySelector('me-nodes')
      const hasChildrenContainer = !!childrenContainer
      const visibleChildrenCount = childrenContainer ? childrenContainer.querySelectorAll('me-tpc').length : 0
      
      // Check expander icon
      const expander = wrapper.querySelector('.minus, me-expander:not(.minus)')
      const expanderClass = expander ? expander.className : 'not found'
      
      return {
        hasChildrenContainer,
        visibleChildrenCount,
        expanderClass,
        wrapperHTML: wrapper.outerHTML.substring(0, 200) // First 200 chars for debugging
      }
    })
    
    console.log('DOM state after AI generation:', visibleChildren)
    
    // Try to manually expand the node if children are not visible
    if (visibleChildren.visibleChildrenCount === 0) {
      console.log('Children not visible, trying to manually expand...')
      
      // Click on the expander
      const expanderSelector = `me-tpc[data-nodeid] me-expander`
      const expanderExists = await page.locator(expanderSelector).count() > 0
      
      if (expanderExists) {
        await page.click(expanderSelector)
        await page.waitForTimeout(500)
        
        // Check again
        const afterManualExpand = await page.evaluate(() => {
          // @ts-ignore
          const mind = window.mind
          const selectedNode = mind.getSelectedNode()
          const nodeElement = document.querySelector(`me-tpc[data-nodeid="${selectedNode.id}"]`)
          const wrapper = nodeElement?.closest('me-wrapper')
          const childrenContainer = wrapper?.parentElement?.querySelector('me-nodes')
          
          return {
            visibleChildrenCount: childrenContainer ? childrenContainer.querySelectorAll('me-tpc').length : 0,
            expanded: selectedNode.expanded
          }
        })
        
        console.log('After manual expand:', afterManualExpand)
      }
    }
    
    // Final verification
    const finalState = await page.evaluate(() => {
      // @ts-ignore
      const mind = window.mind
      const selectedNode = mind.getSelectedNode()
      const nodeElement = document.querySelector(`me-tpc[data-nodeid="${selectedNode.id}"]`)
      const wrapper = nodeElement?.closest('me-wrapper')
      const childrenContainer = wrapper?.parentElement?.querySelector('me-nodes')
      
      return {
        dataExpanded: selectedNode.expanded,
        dataChildrenCount: selectedNode.children ? selectedNode.children.length : 0,
        domChildrenVisible: childrenContainer ? childrenContainer.querySelectorAll('me-tpc').length : 0
      }
    })
    
    console.log('Final state:', finalState)
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'test-ai-expand-error.png', fullPage: true })
    
    // Assertions
    if (finalState.dataChildrenCount === 0) {
      throw new Error('No children in data structure')
    }
    
    if (finalState.domChildrenVisible === 0) {
      throw new Error(`Children exist in data (${finalState.dataChildrenCount}) but are not visible in DOM`)
    }
    
    if (finalState.dataExpanded !== true) {
      throw new Error('Node is not marked as expanded')
    }
  })
})