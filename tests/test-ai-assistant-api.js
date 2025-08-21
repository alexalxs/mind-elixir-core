#!/usr/bin/env node

/**
 * Script de teste para a Edge Function ai-assistant
 * Testa diferentes cenários e valida o formato de resposta JSON
 */

// Configurações do Supabase
const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || ''
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/ai-assistant`

// Headers obrigatórios
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'apikey': SUPABASE_ANON_KEY
}

// Mapa mental de exemplo para testes
const sampleMindMap = {
  nodeData: {
    id: 'root',
    topic: 'Desenvolvimento Web',
    children: [
      {
        id: 'frontend',
        topic: 'Frontend',
        children: [
          {
            id: 'react',
            topic: 'React',
            children: [
              { id: 'hooks', topic: 'Hooks' },
              { id: 'components', topic: 'Components' }
            ]
          },
          {
            id: 'vue',
            topic: 'Vue.js',
            children: []
          }
        ]
      },
      {
        id: 'backend',
        topic: 'Backend',
        children: [
          {
            id: 'nodejs',
            topic: 'Node.js',
            children: []
          }
        ]
      }
    ]
  }
}

// Função para validar estrutura de resposta
function validateResponse(response) {
  const errors = []

  // Validar estrutura básica
  if (!response.children || !Array.isArray(response.children)) {
    errors.push('Resposta deve ter campo "children" como array')
  }

  if (!response.selectedNodeTopic) {
    errors.push('Resposta deve ter campo "selectedNodeTopic"')
  }

  // Validar cada nó
  if (response.children && Array.isArray(response.children)) {
    response.children.forEach((node, index) => {
      if (!node.topic || typeof node.topic !== 'string') {
        errors.push(`Nó ${index} deve ter campo "topic" como string`)
      }
      if (!node.id || typeof node.id !== 'string') {
        errors.push(`Nó ${index} deve ter campo "id" como string`)
      }
      if (node.aiGenerated !== true) {
        errors.push(`Nó ${index} deve ter campo "aiGenerated" como true`)
      }

      // Validar children recursivamente se existir
      if (node.children) {
        if (!Array.isArray(node.children)) {
          errors.push(`Campo "children" do nó ${index} deve ser array`)
        } else {
          node.children.forEach((child, childIndex) => {
            if (!child.topic) errors.push(`Child ${childIndex} do nó ${index} sem topic`)
            if (!child.id) errors.push(`Child ${childIndex} do nó ${index} sem id`)
            if (child.aiGenerated !== true) errors.push(`Child ${childIndex} do nó ${index} sem aiGenerated`)
          })
        }
      }
    })
  }

  return { valid: errors.length === 0, errors }
}

// Testes
async function runTests() {
  console.log('🧪 Iniciando testes da Edge Function ai-assistant\n')

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ Erro: Configure SUPABASE_URL e SUPABASE_ANON_KEY')
    process.exit(1)
  }

  const tests = [
    {
      name: 'Teste 1: Expandir tópico React',
      payload: {
        mindMap: sampleMindMap,
        selectedNodeId: 'react',
        prompt: `Expanda o tópico selecionado em 5 subtópicos relevantes.

CADA SUBTÓPICO DEVE:
- Ter entre 8-12 palavras
- Ser uma frase descritiva completa
- Explicar um conceito ou funcionalidade específica

RETORNE em formato JSON:
{
  "children": [
    {
      "topic": "Virtual DOM para otimização de renderização de componentes",
      "id": "react-1",
      "aiGenerated": true
    }
  ]
}`
      }
    },
    {
      name: 'Teste 2: Gerar perguntas e respostas',
      payload: {
        mindMap: sampleMindMap,
        selectedNodeId: 'nodejs',
        prompt: `Gere 3 perguntas importantes sobre o tópico selecionado com respostas detalhadas.

CADA RESPOSTA deve ter 50-80 palavras.

RETORNE em formato JSON:
{
  "children": [
    {
      "topic": "O que é o Event Loop no Node.js?",
      "id": "q1",
      "aiGenerated": true,
      "children": [
        {
          "topic": "O Event Loop é o mecanismo que permite ao Node.js executar operações não-bloqueantes...",
          "id": "a1",
          "aiGenerated": true
        }
      ]
    }
  ]
}`
      }
    },
    {
      name: 'Teste 3: Análise customizada com configurações OpenAI',
      payload: {
        mindMap: sampleMindMap,
        selectedNodeId: 'frontend',
        prompt: `Analise o contexto do mapa mental e identifique lacunas de conhecimento no tópico selecionado.

Liste 4 áreas que poderiam ser adicionadas para tornar o mapa mais completo.

Para cada área, forneça:
1. Nome da área (5-8 palavras)
2. Justificativa de por que é importante (15-20 palavras)

RETORNE em formato JSON:
{
  "children": [
    {
      "topic": "Testes Automatizados com Jest e Testing Library - Justificativa: Garantir qualidade e confiabilidade do código frontend através de testes unitários e de integração",
      "id": "gap-1",
      "aiGenerated": true
    }
  ]
}`,
        openAIConfig: {
          model: 'gpt-4-turbo-preview',
          temperature: 0.8,
          maxTokens: 3000
        }
      }
    },
    {
      name: 'Teste 4: Prompt mínimo',
      payload: {
        mindMap: sampleMindMap,
        selectedNodeId: 'vue',
        prompt: 'Liste 3 conceitos básicos do Vue.js em formato JSON com estrutura { "children": [...] }'
      }
    },
    {
      name: 'Teste 5: Erro - Nó não encontrado',
      payload: {
        mindMap: sampleMindMap,
        selectedNodeId: 'nao-existe',
        prompt: 'Teste de erro',
      },
      expectError: true
    },
    {
      name: 'Teste 6: Erro - Prompt vazio',
      payload: {
        mindMap: sampleMindMap,
        selectedNodeId: 'react',
        prompt: ''
      },
      expectError: true
    }
  ]

  // Executar testes
  for (const test of tests) {
    console.log(`\n📋 ${test.name}`)
    console.log('━'.repeat(50))

    try {
      const startTime = Date.now()
      
      const response = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(test.payload)
      })

      const responseTime = Date.now() - startTime
      const data = await response.json()

      console.log(`⏱️  Tempo de resposta: ${responseTime}ms`)
      console.log(`📊 Status: ${response.status}`)

      if (test.expectError) {
        if (!response.ok) {
          console.log('✅ Erro esperado recebido:', data.error)
        } else {
          console.log('❌ Esperava erro mas recebeu sucesso')
        }
      } else {
        if (response.ok) {
          // Validar estrutura da resposta
          const validation = validateResponse(data)
          
          if (validation.valid) {
            console.log('✅ Resposta válida')
            console.log(`📝 Nós retornados: ${data.children.length}`)
            console.log(`🎯 Nó selecionado: "${data.selectedNodeTopic}"`)
            
            // Mostrar preview dos nós
            data.children.forEach((node, i) => {
              const preview = node.topic.length > 60 
                ? node.topic.substring(0, 60) + '...' 
                : node.topic
              console.log(`   ${i + 1}. ${preview}`)
              if (node.children && node.children.length > 0) {
                console.log(`      └─ ${node.children.length} respostas`)
              }
            })
          } else {
            console.log('❌ Resposta inválida:')
            validation.errors.forEach(error => console.log(`   - ${error}`))
          }
          
          // Debug: mostrar resposta completa em caso de problema
          if (!validation.valid || process.env.DEBUG) {
            console.log('\n📄 Resposta completa:')
            console.log(JSON.stringify(data, null, 2))
          }
        } else {
          console.log('❌ Erro na requisição:', data.error)
          if (data.details) {
            console.log('   Detalhes:', data.details)
          }
        }
      }
    } catch (error) {
      console.log('❌ Erro ao executar teste:', error.message)
    }
  }

  console.log('\n\n✨ Testes concluídos!')
}

// Executar testes
runTests().catch(console.error)