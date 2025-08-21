// Test script to verify AI Assistant API behavior with custom prompts

const SUPABASE_URL = 'https://mtugzogakhqqpykopstk.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10dWd6b2dha2hxcXB5a29wc3RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTY5MzIsImV4cCI6MjA3MTIzMjkzMn0.0SypN0pLQ0TgZsWYjplh8Dp3PiXcD7tOxhPSBf9tK4U'

// Test mind map data
const testMindMap = {
  nodeData: {
    id: 'root',
    topic: 'Desenvolvimento Web',
    children: [
      {
        id: 'frontend',
        topic: 'Frontend',
        children: [
          { id: 'react', topic: 'React' },
          { id: 'vue', topic: 'Vue.js' }
        ]
      },
      {
        id: 'backend',
        topic: 'Backend',
        children: [
          { id: 'node', topic: 'Node.js' },
          { id: 'python', topic: 'Python' }
        ]
      }
    ]
  }
}

async function testAPICall(testName: string, payload: any) {
  console.log(`\n🧪 Test: ${testName}`)
  console.log('📤 Sending payload:', JSON.stringify(payload, null, 2))
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-assistant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify(payload)
    })

    const result = await response.json()
    
    if (!response.ok) {
      console.error('❌ Error:', result)
      return
    }

    console.log('✅ Response received')
    console.log('📊 Number of children generated:', result.children?.length || 0)
    console.log('📋 Children topics:', result.children?.map((c: any) => c.topic) || [])
    
    // Verify structure
    if (result.children && result.children.length > 0) {
      const validStructure = result.children.every((child: any) => 
        child.topic && child.id && child.aiGenerated === true
      )
      console.log('🔍 Valid structure:', validStructure ? '✅' : '❌')
    }
    
  } catch (error) {
    console.error('❌ Network error:', error)
  }
}

async function runTests() {
  console.log('🚀 Starting AI Assistant API Tests\n')

  // Test 1: Expand mode without custom prompt (should generate 5 items)
  await testAPICall('Expand mode - Default', {
    mindMap: testMindMap,
    selectedNodeId: 'react',
    mode: 'expand',
    depth: 5
  })

  // Wait between tests
  await new Promise(resolve => setTimeout(resolve, 2000))

  // Test 2: Expand mode with custom prompt requesting 3 items
  await testAPICall('Expand mode - Custom prompt with 3 items', {
    mindMap: testMindMap,
    selectedNodeId: 'react',
    mode: 'expand',
    depth: 3,
    customPrompt: 'Gere exatamente 3 subtópicos sobre React hooks específicos: useState, useEffect e useContext'
  })

  await new Promise(resolve => setTimeout(resolve, 2000))

  // Test 3: Expand mode with custom prompt requesting 2 items
  await testAPICall('Expand mode - Custom prompt with 2 items', {
    mindMap: testMindMap,
    selectedNodeId: 'backend',
    mode: 'expand',
    depth: 2,
    customPrompt: 'Gere apenas 2 subtópicos: um sobre APIs REST e outro sobre GraphQL'
  })

  await new Promise(resolve => setTimeout(resolve, 2000))

  // Test 4: Question mode with custom prompt
  await testAPICall('Question mode - Custom prompt', {
    mindMap: testMindMap,
    selectedNodeId: 'frontend',
    mode: 'question',
    depth: 2,
    customPrompt: 'Gere 2 perguntas específicas sobre performance em aplicações frontend'
  })

  await new Promise(resolve => setTimeout(resolve, 2000))

  // Test 5: Custom mode
  await testAPICall('Custom mode', {
    mindMap: testMindMap,
    selectedNodeId: 'python',
    mode: 'custom',
    depth: 4,
    customPrompt: 'Liste 4 frameworks Python populares para desenvolvimento web'
  })

  console.log('\n✅ All tests completed!')
}

// Run tests
runTests().catch(console.error)