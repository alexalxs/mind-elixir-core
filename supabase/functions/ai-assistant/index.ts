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
  mode: 'expand' | 'suggest' | 'summarize' | 'question' | 'custom'
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

function extractAllTopics(node: MindMapNode, topics: Set<string> = new Set()): Set<string> {
  topics.add(node.topic)
  if (node.children) {
    for (const child of node.children) {
      extractAllTopics(child, topics)
    }
  }
  return topics
}

function buildContextPrompt(
  selectedNode: MindMapNode,
  allTopics: Set<string>,
  mode: string,
  customPrompt?: string,
  depth: number = 5
): string {
  const existingTopicsArray = Array.from(allTopics)
  const context = `
Contexto do mapa mental:
- Nó selecionado: "${selectedNode.topic}"
- Tópicos já existentes no mapa: ${existingTopicsArray.join(', ')}

IMPORTANTE: Não sugira tópicos que já existem no mapa mental.
`

  const prompts: Record<string, string> = {
    expand: `${context}\nExpanda o tópico "${selectedNode.topic}" em ${depth} subtópicos relevantes e únicos. Responda apenas com a lista numerada, um item por linha.`,
    suggest: `${context}\nSugira ${depth} ideias relacionadas a "${selectedNode.topic}" que ainda não existem no mapa. Responda apenas com a lista numerada, um item por linha.`,
    summarize: `${context}\nCrie um resumo conciso do ramo "${selectedNode.topic}" considerando seus subtópicos.`,
    question: `${context}\nGere ${depth} perguntas exploratórias sobre "${selectedNode.topic}" para aprofundar o conhecimento. Responda apenas com a lista numerada, uma pergunta por linha.`,
    custom: customPrompt ? `${context}\n${customPrompt}` : ''
  }

  return prompts[mode] || prompts.expand
}

serve(async (req) => {
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

    // Extrair todos os tópicos existentes
    const allTopics = extractAllTopics(mindMap.nodeData)

    // Construir prompt com contexto
    const prompt = buildContextPrompt(selectedNode, allTopics, mode, customPrompt, depth)

    // Verificar se a API key está configurada
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY não configurada')
    }

    // Chamar OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente especializado em criar mapas mentais. Suas respostas devem ser concisas, relevantes e evitar duplicação de conteúdo já existente.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    })

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text()
      throw new Error(`OpenAI API error: ${error}`)
    }

    const openaiData = await openaiResponse.json()
    const content = openaiData.choices[0]?.message?.content || ''

    // Processar resposta em lista de sugestões
    let suggestions: string[] = []
    
    if (mode === 'expand' || mode === 'suggest' || mode === 'question') {
      suggestions = content
        .split('\n')
        .filter(line => line.trim())
        .map(line => line.replace(/^\d+\.\s*|-\s*/, '').trim())
        .filter(suggestion => suggestion.length > 0)
        .slice(0, depth)
    } else {
      // Para resumo ou custom, retornar como texto único
      suggestions = [content.trim()]
    }

    // Filtrar sugestões que já existem (case insensitive)
    const filteredSuggestions = suggestions.filter(suggestion => {
      const suggestionLower = suggestion.toLowerCase()
      return !Array.from(allTopics).some(topic => 
        topic.toLowerCase() === suggestionLower
      )
    })

    return new Response(
      JSON.stringify({ 
        suggestions: filteredSuggestions,
        mode,
        selectedNodeTopic: selectedNode.topic
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in ai-assistant function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro ao processar solicitação',
        details: error.toString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})