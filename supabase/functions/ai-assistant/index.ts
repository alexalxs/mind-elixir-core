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
  prompt: string  // Prompt completo obrigatório
  
  // OpenAI configurations
  openAIConfig?: {
    model?: string
    temperature?: number
    maxTokens?: number
  }
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

// Função para validar a estrutura do NodeObj
function validateNodeStructure(node: any, path: string = 'root'): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Validar campos obrigatórios
  if (!node || typeof node !== 'object') {
    errors.push(`${path}: nó deve ser um objeto`)
    return { valid: false, errors }
  }
  
  if (!node.topic || typeof node.topic !== 'string') {
    errors.push(`${path}: campo 'topic' é obrigatório e deve ser uma string`)
  }
  
  if (!node.id || typeof node.id !== 'string') {
    errors.push(`${path}: campo 'id' é obrigatório e deve ser uma string`)
  }
  
  // Validar campos opcionais se existirem
  if (node.style !== undefined && (typeof node.style !== 'object' || node.style === null)) {
    errors.push(`${path}: campo 'style' deve ser um objeto se definido`)
  }
  
  if (node.tags !== undefined && !Array.isArray(node.tags)) {
    errors.push(`${path}: campo 'tags' deve ser um array se definido`)
  }
  
  if (node.icons !== undefined && !Array.isArray(node.icons)) {
    errors.push(`${path}: campo 'icons' deve ser um array se definido`)
  }
  
  if (node.hyperLink !== undefined && typeof node.hyperLink !== 'string') {
    errors.push(`${path}: campo 'hyperLink' deve ser uma string se definido`)
  }
  
  if (node.expanded !== undefined && typeof node.expanded !== 'boolean') {
    errors.push(`${path}: campo 'expanded' deve ser um boolean se definido`)
  }
  
  if (node.direction !== undefined && node.direction !== 0 && node.direction !== 1) {
    errors.push(`${path}: campo 'direction' deve ser 0 ou 1 se definido`)
  }
  
  // Validar children recursivamente
  if (node.children !== undefined) {
    if (!Array.isArray(node.children)) {
      errors.push(`${path}: campo 'children' deve ser um array se definido`)
    } else {
      node.children.forEach((child: any, index: number) => {
        const childValidation = validateNodeStructure(child, `${path}.children[${index}]`)
        errors.push(...childValidation.errors)
      })
    }
  }
  
  return { valid: errors.length === 0, errors }
}

// Função para validar o payload completo
function validatePayloadStructure(payload: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Validar estrutura básica
  if (!payload || typeof payload !== 'object') {
    errors.push('Payload deve ser um objeto JSON válido')
    return { valid: false, errors }
  }
  
  // Validar mindMap
  if (!payload.mindMap || typeof payload.mindMap !== 'object') {
    errors.push('Campo "mindMap" é obrigatório e deve ser um objeto')
  } else if (!payload.mindMap.nodeData) {
    errors.push('Campo "mindMap.nodeData" é obrigatório')
  } else {
    // Validar estrutura do nodeData
    const nodeValidation = validateNodeStructure(payload.mindMap.nodeData, 'mindMap.nodeData')
    errors.push(...nodeValidation.errors)
  }
  
  // Validar selectedNodeId
  if (!payload.selectedNodeId || typeof payload.selectedNodeId !== 'string') {
    errors.push('Campo "selectedNodeId" é obrigatório e deve ser uma string')
  }
  
  // Validar prompt
  if (!payload.prompt || typeof payload.prompt !== 'string' || !payload.prompt.trim()) {
    errors.push('Campo "prompt" é obrigatório e deve ser uma string não vazia')
  }
  
  // Validar openAIConfig se existir
  if (payload.openAIConfig !== undefined) {
    if (typeof payload.openAIConfig !== 'object' || payload.openAIConfig === null) {
      errors.push('Campo "openAIConfig" deve ser um objeto se definido')
    } else {
      if (payload.openAIConfig.model !== undefined && typeof payload.openAIConfig.model !== 'string') {
        errors.push('Campo "openAIConfig.model" deve ser uma string se definido')
      }
      if (payload.openAIConfig.temperature !== undefined && 
          (typeof payload.openAIConfig.temperature !== 'number' || 
           payload.openAIConfig.temperature < 0 || 
           payload.openAIConfig.temperature > 2)) {
        errors.push('Campo "openAIConfig.temperature" deve ser um número entre 0 e 2 se definido')
      }
      if (payload.openAIConfig.maxTokens !== undefined && 
          (typeof payload.openAIConfig.maxTokens !== 'number' || 
           payload.openAIConfig.maxTokens < 1)) {
        errors.push('Campo "openAIConfig.maxTokens" deve ser um número positivo se definido')
      }
    }
  }
  
  return { valid: errors.length === 0, errors }
}



serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    let rawPayload: any
    
    // Tentar fazer parse do JSON
    try {
      rawPayload = await req.json()
    } catch (jsonError) {
      console.error('[Edge Function] Erro ao fazer parse do JSON:', jsonError)
      return new Response(
        JSON.stringify({
          error: 'JSON inválido',
          details: 'O corpo da requisição não é um JSON válido',
          validationErrors: ['Erro de sintaxe JSON: ' + jsonError.message]
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }
    
    // Debug: Log the exact payload received
    console.log('[Edge Function] Raw payload received:', JSON.stringify(rawPayload, null, 2))
    
    // Handle both formats for backward compatibility
    let payload: RequestPayload
    if (rawPayload.nodeData && !rawPayload.mindMap) {
      // Old format - convert to new format
      console.log('[Edge Function] Converting old payload format to new format')
      payload = {
        mindMap: { nodeData: rawPayload.nodeData },
        selectedNodeId: rawPayload.selectedNodeId,
        prompt: rawPayload.prompt,
        openAIConfig: rawPayload.openAIConfig
      }
    } else {
      payload = rawPayload as RequestPayload
    }
    
    // Validar estrutura completa do payload
    const validation = validatePayloadStructure(payload)
    if (!validation.valid) {
      console.error('[Edge Function] Validação falhou:', validation.errors)
      return new Response(
        JSON.stringify({
          error: 'Formato de payload inválido',
          details: 'A estrutura do payload não está correta',
          validationErrors: validation.errors
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }
    
    const { 
      mindMap, 
      selectedNodeId, 
      prompt,
      openAIConfig
    } = payload
    
    // Extract OpenAI configurations with defaults
    const model = openAIConfig?.model || 'gpt-3.5-turbo'
    const temperature = openAIConfig?.temperature ?? 0.7
    const maxTokens = openAIConfig?.maxTokens || 2000
    
    // Debug: Log received payload
    console.log('[Edge Function] Received payload:', {
      selectedNodeId,
      promptLength: prompt.length,
      openAIConfig: { model, temperature, maxTokens },
      hasNodeData: !!mindMap?.nodeData
    })

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

    // Construir prompt completo com contexto
    const fullPrompt = `Você tem acesso ao mapa mental completo em formato JSON.
Nó selecionado: "${selectedNode.topic}"
ID do nó: "${selectedNode.id}"

Contexto do mapa mental:
${JSON.stringify(mindMap, null, 2)}

INSTRUÇÕES DO USUÁRIO:
${prompt}`
    
    // Debug: Log the prompt being used
    console.log('[Edge Function] Full prompt length:', fullPrompt.length)
    console.log('[Edge Function] User prompt:', prompt.substring(0, 200) + '...')

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
        model: model,
        messages: [
          {
            role: 'system',
            content:
              `Você é um assistente especializado em criar mapas mentais DETALHADOS e INFORMATIVOS usando o formato Mind Elixir.

FORMATO DE RESPOSTA OBRIGATÓRIO:
Você DEVE retornar sua resposta EXATAMENTE neste formato JSON:

{
  "children": [
    {
      "topic": "Texto do nó (OBRIGATÓRIO - deve ser uma string)",
      "id": "identificador-unico",
      "aiGenerated": true,
      "children": []
    }
  ]
}

REGRAS DO FORMATO MIND ELIXIR:
1. O objeto raiz DEVE ter apenas um campo "children" que é um array
2. Cada nó DEVE ter obrigatoriamente:
   - "topic": string com o texto do nó (NUNCA pode ser null ou vazio)
   - "id": string com identificador único
   - "aiGenerated": boolean sempre true
3. Campos opcionais:
   - "children": array de sub-nós (seguindo mesma estrutura)
   - "style": objeto com estilos CSS
   - "tags": array de strings
   - "hyperLink": string com URL

IMPORTANTE:
- SEMPRE retorne JSON válido, sem blocos de código markdown
- NUNCA use campos que não estão especificados acima
- Se criar sub-nós em "children", eles devem seguir a mesma estrutura
- Para tópicos, use frases descritivas completas
- Para respostas a perguntas, forneça explicações detalhadas`,
          },
          {
            role: 'user',
            content: fullPrompt,
          },
        ],
        temperature: temperature,
        max_tokens: maxTokens,
      }),
    })

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text()
      throw new Error(`OpenAI API error: ${error}`)
    }

    const openaiData = await openaiResponse.json()
    const content = openaiData.choices[0]?.message?.content || ''
    
    // Debug: Log raw OpenAI response
    console.log('[Edge Function] Raw OpenAI response:', content)

    // Processar resposta JSON
    interface ResponseNode {
      topic: string
      id: string
      aiGenerated: boolean
      children?: ResponseNode[]
    }

    let children: ResponseNode[] = []

    try {
      // Primeiro, limpar o conteúdo de possíveis blocos de código markdown
      let cleanContent = content.trim()
      
      // Remover blocos de código markdown se existirem
      if (cleanContent.startsWith('```json') && cleanContent.endsWith('```')) {
        cleanContent = cleanContent.slice(7, -3).trim()
      } else if (cleanContent.startsWith('```') && cleanContent.endsWith('```')) {
        cleanContent = cleanContent.slice(3, -3).trim()
      }
      
      // Tentar fazer parse do JSON retornado pela IA
      const parsedContent = JSON.parse(cleanContent)

      // Validar estrutura conforme IAAssistantToDo.md
      // A resposta deve ter a estrutura { children: [...] }
      if (parsedContent && parsedContent.children && Array.isArray(parsedContent.children)) {
        children = parsedContent.children

        // Validar e corrigir nós conforme requisitos do Mind Elixir
        const validateAndFixNodes = (nodes: any[], parentIndex = ''): ResponseNode[] => {
          return nodes.map((node, index) => {
            // Validar campos obrigatórios
            if (!node.topic || typeof node.topic !== 'string') {
              throw new Error(`Nó ${parentIndex}${index} está sem o campo 'topic' obrigatório`)
            }

            // Garantir que tenha id único (se não vier da IA)
            if (!node.id || typeof node.id !== 'string') {
              node.id = `ai-${Date.now()}-${parentIndex}${index}-${Math.random().toString(36).substring(2, 11)}`
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

        // No validation needed - the AI returns what the user requested

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
        .filter((line: string) => line.trim())
        .map((line: string) => line.replace(/^[\d\-*]+\.?\s*/, '').trim())
        .filter((line: string) => line.length > 0)

      // Criar estrutura válida mesmo no fallback
      children = lines.map((topic: string, index: number) => ({
        topic,
        id: `fallback-${Date.now()}-${index}`,
        aiGenerated: true,
      }))
    }

    return new Response(
      JSON.stringify({
        children,
        selectedNodeTopic: selectedNode.topic,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in ai-assistant function:', error)
    
    // Estrutura de erro padronizada
    const errorResponse: any = {
      error: error.message || 'Erro ao processar solicitação',
      timestamp: new Date().toISOString()
    }
    
    // Adicionar detalhes específicos dependendo do tipo de erro
    if (error.message.includes('JSON')) {
      errorResponse.type = 'JSON_ERROR'
      errorResponse.details = 'Problema com o formato JSON da requisição ou resposta'
    } else if (error.message.includes('mindMap') || error.message.includes('nodeData')) {
      errorResponse.type = 'STRUCTURE_ERROR'
      errorResponse.details = 'Estrutura do payload incorreta'
    } else if (error.message.includes('OpenAI')) {
      errorResponse.type = 'OPENAI_ERROR'
      errorResponse.details = 'Erro ao comunicar com a API da OpenAI'
    } else if (error.message.includes('Nó selecionado não encontrado')) {
      errorResponse.type = 'NODE_NOT_FOUND'
      errorResponse.details = 'O nó especificado não existe no mapa mental'
    } else {
      errorResponse.type = 'UNKNOWN_ERROR'
      errorResponse.details = error.toString()
    }
    
    return new Response(
      JSON.stringify(errorResponse),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
