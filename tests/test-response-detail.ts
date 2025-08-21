// Test script to evaluate response detail level from AI Assistant API

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
      }
    ]
  }
}

async function testDetailLevel(testName: string, payload: any) {
  console.log(`\n📝 Test: ${testName}`)
  console.log('📤 Payload:', JSON.stringify(payload, null, 2))
  
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

    console.log('\n✅ Response received')
    
    // Analyze detail level
    if (result.children && result.children.length > 0) {
      console.log('\n📊 Detail Analysis:')
      result.children.forEach((child: any, index: number) => {
        const charCount = child.topic.length
        const wordCount = child.topic.split(' ').length
        console.log(`\n  Item ${index + 1}:`)
        console.log(`    Topic: "${child.topic}"`)
        console.log(`    Characters: ${charCount}`)
        console.log(`    Words: ${wordCount}`)
        
        if (child.children && child.children.length > 0) {
          child.children.forEach((subChild: any, subIndex: number) => {
            const subCharCount = subChild.topic.length
            const subWordCount = subChild.topic.split(' ').length
            console.log(`    Answer ${subIndex + 1}:`)
            console.log(`      Text: "${subChild.topic.substring(0, 100)}${subChild.topic.length > 100 ? '...' : ''}"`)
            console.log(`      Characters: ${subCharCount}`)
            console.log(`      Words: ${subWordCount}`)
          })
        }
      })
      
      // Calculate averages
      const avgChars = result.children.reduce((sum: number, child: any) => sum + child.topic.length, 0) / result.children.length
      const avgWords = result.children.reduce((sum: number, child: any) => sum + child.topic.split(' ').length, 0) / result.children.length
      
      console.log(`\n  📈 Averages:`)
      console.log(`    Avg characters per topic: ${avgChars.toFixed(1)}`)
      console.log(`    Avg words per topic: ${avgWords.toFixed(1)}`)
    }
    
  } catch (error) {
    console.error('❌ Network error:', error)
  }
}

async function runDetailTests() {
  console.log('🔍 Testing Response Detail Levels\n')

  // Test 1: Default expand mode
  await testDetailLevel('Default Expand Mode', {
    mindMap: testMindMap,
    selectedNodeId: 'react',
    mode: 'expand',
    depth: 3
  })

  await new Promise(resolve => setTimeout(resolve, 2000))

  // Test 2: Expand with request for detailed subtopics
  await testDetailLevel('Expand with Detail Request', {
    mindMap: testMindMap,
    selectedNodeId: 'react',
    mode: 'expand',
    depth: 3,
    customPrompt: 'Gere 3 subtópicos DETALHADOS sobre React. Cada subtópico deve ter pelo menos 5-8 palavras descrevendo claramente o conceito, funcionalidade ou recurso específico.'
  })

  await new Promise(resolve => setTimeout(resolve, 2000))

  // Test 3: Question mode default
  await testDetailLevel('Default Question Mode', {
    mindMap: testMindMap,
    selectedNodeId: 'react',
    mode: 'question',
    depth: 2
  })

  await new Promise(resolve => setTimeout(resolve, 2000))

  // Test 4: Question mode with detailed answer request
  await testDetailLevel('Question Mode with Detailed Answers', {
    mindMap: testMindMap,
    selectedNodeId: 'react',
    mode: 'question',
    depth: 2,
    customPrompt: 'Gere 2 perguntas sobre React com respostas DETALHADAS. Cada resposta deve ter pelo menos 50-100 palavras explicando completamente o conceito.'
  })

  await new Promise(resolve => setTimeout(resolve, 2000))

  // Test 5: Custom prompt requesting comprehensive content
  await testDetailLevel('Custom Mode - Comprehensive Content', {
    mindMap: testMindMap,
    selectedNodeId: 'frontend',
    mode: 'custom',
    depth: 3,
    customPrompt: 'Liste 3 melhores práticas para desenvolvimento frontend moderno. Para cada prática, inclua: nome da prática (5-10 palavras), descrição detalhada (20-30 palavras), e exemplo prático.'
  })

  console.log('\n\n🔎 Potential Issues Identified:')
  console.log('1. Check if max_tokens limit is too low')
  console.log('2. Check if temperature setting affects detail level')
  console.log('3. Check if system prompt encourages brevity')
  console.log('4. Check if JSON format constraints limit content')
}

// Run tests
runDetailTests().catch(console.error)