import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MindMapNode {
  topic: string
  id: string
  children?: MindMapNode[]
  [key: string]: any
}

interface RequestPayload {
  mindMap: {
    nodeData: MindMapNode
    [key: string]: any
  }
  selectedNodeId: string
  mode: 'expand' | 'question' | 'custom'
  customPrompt?: string
  depth?: number
}

function findNodeById(node: MindMapNode, id: string): MindMapNode | null {
  if (node.id === id) return node
  if (node.children) {
    for (const child of node.children) {
      const found = findNodeById(child, id)
      if (found) return found
    }
  }
  return null
}


function buildContextPrompt(
  selectedNode: MindMapNode,
  mode: string,
  customPrompt?: string,
  depth: number = 5
): string {
  const context = `Você tem acesso ao mapa mental completo em formato JSON.
Nó selecionado: "${selectedNode.topic}"`

  if (mode === 'expand') {
    return `${context}

Com base no contexto completo do mapa mental e no tópico selecionado, 
expanda "${selectedNode.topic}" em ${depth} subtópicos relevantes que agreguem valor ao conhecimento existente.

IMPORTANTE: Retorne a resposta em formato JSON válido, seguindo EXATAMENTE a estrutura de nós do Mind Elixir:
{
  "children": [
    {
      "topic": "Subtópico 1",
      "id": "generated-1",
      "aiGenerated": true
    },
    {
      "topic": "Subtópico 2", 
      "id": "generated-2",
      "aiGenerated": true
    }
  ]
}

Gere exatamente ${depth} subtópicos únicos e relevantes.
Cada nó deve ter: topic (string), id (string único), aiGenerated (true).`
  }

  if (mode === 'question') {
    return `${context}

Com base no contexto completo do mapa mental, gere ${depth} perguntas exploratórias 
sobre "${selectedNode.topic}" que aprofundem o conhecimento, junto com suas respectivas respostas.

IMPORTANTE: Retorne a resposta em formato JSON válido, seguindo EXATAMENTE a estrutura de nós do Mind Elixir:
{
  "children": [
    {
      "topic": "Pergunta exploratória 1?",
      "id": "question-1",
      "aiGenerated": true,
      "children": [
        {
          "topic": "Resposta detalhada e informativa",
          "id": "answer-1",
          "aiGenerated": true
        }
      ]
    },
    {
      "topic": "Pergunta exploratória 2?",
      "id": "question-2", 
      "aiGenerated": true,
      "children": [
        {
          "topic": "Resposta detalhada e informativa",
          "id": "answer-2",
          "aiGenerated": true
        }
      ]
    }
  ]
}

Gere exatamente ${depth} pares de pergunta-resposta.
Cada pergunta é um nó pai com sua resposta como nó filho.`
  }

  if (mode === 'custom' && customPrompt) {
    return `${context}

${customPrompt}

IMPORTANTE: Retorne SEMPRE a resposta em formato JSON válido, seguindo EXATAMENTE a estrutura de nós do Mind Elixir:
{
  "children": [
    {
      "topic": "Conteúdo gerado",
      "id": "custom-1",
      "aiGenerated": true,
      "children": [] // opcional, se necessário criar subnós
    }
  ]
}

Cada nó deve ter obrigatoriamente: topic (string), id (string único), aiGenerated (true).
Opcionalmente pode ter: children (array de nós filhos), style (objeto com estilos).`
  }

  // Fallback para expand
  return buildContextPrompt(selectedNode, 'expand', customPrompt, depth)
}

serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload: RequestPayload = await req.json()
    const { mindMap, selectedNodeId, mode, customPrompt, depth = 5 } = payload

    // Validação de tamanho do payload (limite de 1MB)
    const payloadSize = new Blob([JSON.stringify(payload)]).size
    if (payloadSize > 1024 * 1024) {
      throw new Error('Mapa mental muito grande. Limite máximo: 1MB')
    }

    // Encontrar nó selecionado
    const selectedNode = findNodeById(mindMap.nodeData, selectedNodeId)
    if (!selectedNode) {
      throw new Error('Nó selecionado não encontrado')
    }

    // Construir prompt com contexto
    const prompt = buildContextPrompt(selectedNode, mode, customPrompt, depth)

    // Verificar se a API key está configurada
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY não configurada')
    }

    // Chamar OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'Você é um assistente especializado em criar mapas mentais. Você recebe o contexto completo do mapa mental e deve gerar conteúdo relevante que agregue valor ao conhecimento existente. SEMPRE retorne suas respostas em formato JSON válido, nunca em texto simples.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    })

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text()
      throw new Error(`OpenAI API error: ${error}`)
    }

    const openaiData = await openaiResponse.json()
    const content = openaiData.choices[0]?.message?.content || ''

    // Processar resposta JSON
    interface ResponseNode {
      topic: string
      id: string
      aiGenerated: boolean
      children?: ResponseNode[]
    }

    let children: ResponseNode[] = []
    
    try {
      // Tentar fazer parse do JSON retornado pela IA
      const parsedContent = JSON.parse(content)
      
      // Validar estrutura conforme IAAssistantToDo.md
      // A resposta deve ter a estrutura { children: [...] }
      if (parsedContent && parsedContent.children && Array.isArray(parsedContent.children)) {
        children = parsedContent.children
        
        // Validar e corrigir nós conforme requisitos do Mind Elixir
        const validateAndFixNodes = (nodes: any[], parentIndex: string = ''): ResponseNode[] => {
          return nodes.map((node, index) => {
            // Validar campos obrigatórios
            if (!node.topic || typeof node.topic !== 'string') {
              throw new Error(`Nó ${parentIndex}${index} está sem o campo 'topic' obrigatório`)
            }
            
            // Garantir que tenha id único (se não vier da IA)
            if (!node.id || typeof node.id !== 'string') {
              node.id = `ai-${Date.now()}-${parentIndex}${index}-${Math.random().toString(36).substr(2, 9)}`
            }
            
            // Garantir que tenha aiGenerated = true
            node.aiGenerated = true
            
            // Validar e processar children recursivamente se existir
            if (node.children) {
              if (!Array.isArray(node.children)) {
                throw new Error(`Campo 'children' do nó ${node.id} deve ser um array`)
              }
              node.children = validateAndFixNodes(node.children, `${parentIndex}${index}-`)
            }
            
            // Validar campos opcionais se existirem
            if (node.style && typeof node.style !== 'object') {
              delete node.style // Remover se não for objeto válido
            }
            
            if (node.tags && !Array.isArray(node.tags)) {
              delete node.tags // Remover se não for array válido
            }
            
            return node
          })
        }
        
        // Validar que temos o número correto de nós no nível raiz
        if (mode !== 'custom' && children.length !== depth) {
          console.warn(`Esperado ${depth} nós, mas recebido ${children.length}. Ajustando...`)
          // Truncar ou preencher conforme necessário
          if (children.length > depth) {
            children = children.slice(0, depth)
          }
        }
        
        children = validateAndFixNodes(children)
      } else {
        throw new Error('Resposta da IA não está no formato esperado { children: [...] }')
      }
    } catch (parseError) {
      // Log do erro para debug
      console.error('Erro ao fazer parse do JSON:', parseError)
      console.log('Conteúdo recebido:', content)
      
      // Fallback: tentar extrair conteúdo mesmo que não seja JSON válido
      const lines = content
        .split('\n')
        .filter(line => line.trim())
        .map(line => line.replace(/^[\d\-*]+\.?\s*/, '').trim())
        .filter(line => line.length > 0)
        .slice(0, depth)
      
      // Criar estrutura válida mesmo no fallback
      children = lines.map((topic, index) => ({
        topic,
        id: `fallback-${Date.now()}-${index}`,
        aiGenerated: true,
      }))
    }

    return new Response(
      JSON.stringify({
        children,
        mode,
        selectedNodeTopic: selectedNode.topic,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in ai-assistant function:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'Erro ao processar solicitação',
        details: error.toString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
