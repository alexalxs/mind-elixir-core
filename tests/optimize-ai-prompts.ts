import { config } from 'dotenv'
config()

interface TestResult {
  prompt: string
  mode: string
  iteration: number
  score: {
    relevance: number // 0-10
    formatting: number // 0-10
    completeness: number // 0-10
    creativity: number // 0-10
    total: number
  }
  response: any
  error?: string
}

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://mtugzogakhqqpykopstk.supabase.co'
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || ''

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

// Prompt variations for expand mode
const expandPromptVariations = [
  // Original
  `Você tem acesso ao mapa mental completo em formato JSON.
Nó selecionado: "{topic}"

Com base no contexto completo do mapa mental e no tópico selecionado, 
expanda "{topic}" em {depth} subtópicos relevantes que agreguem valor ao conhecimento existente.

IMPORTANTE: Retorne a resposta em formato JSON válido, seguindo EXATAMENTE a estrutura de nós do Mind Elixir:
{
  "children": [
    {
      "topic": "Subtópico 1",
      "id": "generated-1",
      "aiGenerated": true
    }
  ]
}`,

  // Variation 1: More context emphasis
  `Contexto: Você está analisando um mapa mental completo sobre conhecimento estruturado.
Foco atual: "{topic}"

Analise profundamente o contexto geral e as relações entre os tópicos existentes.
Gere {depth} subtópicos que:
1. Complementem lacunas no conhecimento atual
2. Não dupliquem informações já presentes
3. Mantenham coerência com o tema geral

Formato JSON obrigatório:
{
  "children": [
    {"topic": "Subtópico relevante", "id": "unique-id", "aiGenerated": true}
  ]
}`,

  // Variation 2: Educational approach
  `Mapa mental educacional em análise.
Tópico para expansão: "{topic}"

Como um especialista em educação, sugira {depth} subtópicos que:
- Sigam uma progressão lógica de aprendizado
- Conectem-se com outros ramos do mapa
- Ofereçam profundidade prática

Retorne APENAS JSON válido:
{
  "children": [
    {"topic": "Conceito fundamental", "id": "edu-1", "aiGenerated": true}
  ]
}`,

  // Continue with more variations...
]

// Question mode variations
const questionPromptVariations = [
  // Original
  `Você tem acesso ao mapa mental completo em formato JSON.
Nó selecionado: "{topic}"

Com base no contexto completo do mapa mental, gere {depth} perguntas exploratórias 
sobre "{topic}" que aprofundem o conhecimento, junto com suas respectivas respostas.

IMPORTANTE: Retorne a resposta em formato JSON válido:
{
  "children": [
    {
      "topic": "Pergunta exploratória?",
      "id": "question-1",
      "aiGenerated": true,
      "children": [
        {"topic": "Resposta detalhada", "id": "answer-1", "aiGenerated": true}
      ]
    }
  ]
}`,

  // Variation 1: Socratic method
  `Análise socrática do mapa mental.
Foco: "{topic}"

Aplicando o método socrático, formule {depth} perguntas que:
1. Desafiem suposições
2. Revelem conexões ocultas
3. Estimulem reflexão profunda

Cada pergunta deve ter uma resposta que conecte com o contexto geral.

JSON estruturado:
{
  "children": [
    {
      "topic": "Por que...?",
      "id": "q1",
      "aiGenerated": true,
      "children": [{"topic": "Porque...", "id": "a1", "aiGenerated": true}]
    }
  ]
}`,

  // More variations...
]

async function testPrompt(
  prompt: string,
  mode: string,
  selectedNodeId: string,
  iteration: number
): Promise<TestResult> {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-assistant`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        mindMap: testMindMap,
        selectedNodeId,
        mode,
        depth: 3,
        customPrompt: mode === 'custom' ? prompt : undefined
      })
    })

    const data = await response.json()

    // Score the response
    const score = evaluateResponse(data, mode)

    return {
      prompt,
      mode,
      iteration,
      score,
      response: data
    }
  } catch (error) {
    return {
      prompt,
      mode,
      iteration,
      score: { relevance: 0, formatting: 0, completeness: 0, creativity: 0, total: 0 },
      response: null,
      error: error.message
    }
  }
}

function evaluateResponse(response: any, mode: string): TestResult['score'] {
  let relevance = 0
  let formatting = 0
  let completeness = 0
  let creativity = 0

  // Check formatting
  if (response && response.children && Array.isArray(response.children)) {
    formatting += 5
    
    // Check if all nodes have required fields
    const allNodesValid = response.children.every((node: any) => 
      node.topic && node.id && node.aiGenerated === true
    )
    if (allNodesValid) formatting += 5

    // Check structure for question mode
    if (mode === 'question') {
      const allQuestionsHaveAnswers = response.children.every((node: any) =>
        node.children && node.children.length > 0
      )
      if (allQuestionsHaveAnswers) completeness += 5
    }
  }

  // Check completeness (expected number of nodes)
  if (response.children && response.children.length === 3) {
    completeness += 5
  }

  // Evaluate content quality (simplified for example)
  if (response.children && response.children.length > 0) {
    const topics = response.children.map((n: any) => n.topic)
    
    // Check for non-empty topics
    if (topics.every((t: string) => t && t.length > 10)) {
      relevance += 5
    }
    
    // Check for variety
    const uniqueTopics = new Set(topics)
    if (uniqueTopics.size === topics.length) {
      creativity += 5
    }
    
    // Additional scoring based on content
    // This is simplified - in reality you'd want more sophisticated analysis
    relevance += 5
    creativity += 5
  }

  const total = relevance + formatting + completeness + creativity

  return {
    relevance,
    formatting,
    completeness,
    creativity,
    total
  }
}

async function runOptimization() {
  console.log('🚀 Starting AI Prompt Optimization...\n')
  
  const results: TestResult[] = []
  
  // Test expand mode
  console.log('📊 Testing EXPAND mode prompts...')
  for (let i = 0; i < expandPromptVariations.length; i++) {
    for (let iter = 0; iter < 3; iter++) { // 3 iterations per prompt
      const result = await testPrompt(
        expandPromptVariations[i],
        'expand',
        'react', // Test with React node
        iter + 1
      )
      results.push(result)
      console.log(`  Prompt ${i + 1}, Iteration ${iter + 1}: Score ${result.score.total}/40`)
      
      // Wait to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }
  
  // Test question mode
  console.log('\n📊 Testing QUESTION mode prompts...')
  for (let i = 0; i < questionPromptVariations.length; i++) {
    for (let iter = 0; iter < 3; iter++) {
      const result = await testPrompt(
        questionPromptVariations[i],
        'question',
        'backend',
        iter + 1
      )
      results.push(result)
      console.log(`  Prompt ${i + 1}, Iteration ${iter + 1}: Score ${result.score.total}/40`)
      
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }
  
  // Analyze results
  console.log('\n📈 Analysis Results:\n')
  
  // Group by mode and prompt
  const expandResults = results.filter(r => r.mode === 'expand')
  const questionResults = results.filter(r => r.mode === 'question')
  
  // Find best prompts
  const bestExpand = expandResults.reduce((best, current) => 
    current.score.total > best.score.total ? current : best
  )
  
  const bestQuestion = questionResults.reduce((best, current) =>
    current.score.total > best.score.total ? current : best
  )
  
  console.log('🏆 Best EXPAND prompt:')
  console.log(`Score: ${bestExpand.score.total}/40`)
  console.log(`Breakdown: Relevance=${bestExpand.score.relevance}, Formatting=${bestExpand.score.formatting}, Completeness=${bestExpand.score.completeness}, Creativity=${bestExpand.score.creativity}`)
  console.log(`Prompt: ${bestExpand.prompt.substring(0, 100)}...`)
  
  console.log('\n🏆 Best QUESTION prompt:')
  console.log(`Score: ${bestQuestion.score.total}/40`)
  console.log(`Breakdown: Relevance=${bestQuestion.score.relevance}, Formatting=${bestQuestion.score.formatting}, Completeness=${bestQuestion.score.completeness}, Creativity=${bestQuestion.score.creativity}`)
  console.log(`Prompt: ${bestQuestion.prompt.substring(0, 100)}...`)
  
  // Save detailed results
  const fs = await import('fs/promises')
  await fs.writeFile(
    'ai-prompt-optimization-results.json',
    JSON.stringify(results, null, 2)
  )
  
  console.log('\n✅ Full results saved to ai-prompt-optimization-results.json')
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runOptimization().catch(console.error)
}

export { runOptimization, testPrompt, evaluateResponse }