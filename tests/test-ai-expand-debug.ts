// Test script to debug AI expand error
import MindElixir from '../src/index'
import example from '../src/example'

// Mock DOM elements
const mockDom = () => {
  if (typeof document === 'undefined') {
    // Create minimal DOM structure for testing
    global.document = {
      getElementById: () => ({ style: {} }),
      querySelector: () => null,
      createElement: () => ({ 
        style: {}, 
        classList: { add: () => {}, remove: () => {} },
        appendChild: () => {},
        addEventListener: () => {}
      }),
      body: { appendChild: () => {} }
    } as any
    
    global.window = {
      getComputedStyle: () => ({ getPropertyValue: () => '16px' })
    } as any
  }
}

mockDom()

// Create mind instance
const mind = new MindElixir({
  el: '#map',
  data: example
})

// Find node by topic
const findNodeByTopic = (topic: string) => {
  const findInNode = (node: any): any => {
    if (node.topic === topic) return node
    if (node.children) {
      for (const child of node.children) {
        const found = findInNode(child)
        if (found) return found
      }
    }
    return null
  }
  return findInNode(mind.nodeData)
}

// Test AI node expansion
export function testAINodeExpansion() {
  console.log('=== Testing AI Node Expansion ===\n')
  
  // Find target node
  const targetNode = findNodeByTopic('mind-elixir-react')
  if (!targetNode) {
    console.error('❌ Target node "mind-elixir-react" not found!')
    return
  }
  
  console.log(`✅ Found target node: ${targetNode.topic} (id: ${targetNode.id})`)
  console.log(`   Current state: expanded=${targetNode.expanded}, children=${targetNode.children?.length || 0}`)
  
  // Simulate AI-generated children
  console.log('\n📝 Adding AI-generated children...')
  
  // Ensure children array exists
  if (!targetNode.children) {
    targetNode.children = []
  }
  
  // Add AI nodes
  const aiChildren = [
    { topic: 'Component Architecture', aiGenerated: true },
    { topic: 'State Management', aiGenerated: true },
    { topic: 'Hooks Integration', aiGenerated: true }
  ]
  
  aiChildren.forEach(childData => {
    const newNode = mind.generateNewObj()
    newNode.topic = childData.topic
    newNode.aiGenerated = true
    newNode.parent = targetNode
    
    targetNode.children.push(newNode)
    console.log(`   ✅ Added: ${newNode.topic} (id: ${newNode.id})`)
  })
  
  // Mark as expanded
  console.log('\n🔧 Setting expanded=true...')
  targetNode.expanded = true
  
  // Check final state
  console.log('\n📊 Final state:')
  console.log(`   - Node: ${targetNode.topic}`)
  console.log(`   - Expanded: ${targetNode.expanded}`)
  console.log(`   - Children count: ${targetNode.children.length}`)
  targetNode.children.forEach((child: any, i: number) => {
    console.log(`     ${i+1}. ${child.topic} (AI: ${child.aiGenerated || false})`)
  })
  
  // Test the refresh method
  console.log('\n🔄 Testing refresh method...')
  
  // Mock the refresh to see what happens
  const originalRefresh = mind.refresh
  let refreshCalled = false
  
  mind.refresh = function() {
    refreshCalled = true
    console.log('   ✅ Refresh called')
    
    // Check if expandNode would be called
    const nodeEl = { nodeObj: targetNode } as any
    
    // The issue might be here - refresh might not properly handle pre-expanded nodes
    if (targetNode.expanded && targetNode.children && targetNode.children.length > 0) {
      console.log('   ⚠️  Node is marked as expanded but refresh might not render children')
      console.log('   💡 Possible issue: refresh() may not call expandNode for pre-expanded nodes')
    }
    
    return originalRefresh.call(this)
  }
  
  mind.refresh()
  
  if (!refreshCalled) {
    console.log('   ❌ Refresh was not called!')
  }
  
  console.log('\n🔍 Analysis:')
  console.log('The problem appears to be that when nodes are added with expanded=true,')
  console.log('the refresh() method does not automatically render the children in the DOM.')
  console.log('The expandNode() function needs to be called explicitly after refresh.')
  
  return {
    success: targetNode.expanded && targetNode.children.length > 0,
    issue: 'Nodes marked as expanded in data structure are not automatically rendered as expanded in DOM after refresh()'
  }
}

// Run test if executed directly
if (require.main === module) {
  testAINodeExpansion()
}