const SUPABASE_URL = 'https://mtugzogakhqqpykopstk.supabase.co';
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/ai-assistant`;
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10dWd6b2dha2hxcXB5a29wc3RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTY5MzIsImV4cCI6MjA3MTIzMjkzMn0.0SypN0pLQ0TgZsWYjplh8Dp3PiXcD7tOxhPSBf9tK4U';

// Exemplo de mapa mental para teste
const mindMapData = {
  nodeData: {
    id: "root",
    topic: "Desenvolvimento Web",
    children: [
      {
        id: "node1",
        topic: "Frontend",
        children: [
          {
            id: "node1-1",
            topic: "React"
          },
          {
            id: "node1-2",
            topic: "Vue.js"
          }
        ]
      },
      {
        id: "node2",
        topic: "Backend",
        children: [
          {
            id: "node2-1",
            topic: "Node.js"
          }
        ]
      }
    ]
  }
};

// Função para testar a edge function
async function testEdgeFunction(mode, selectedNodeId, customPrompt = null) {
  console.log(`\n========== Testando modo: ${mode} ==========`);
  console.log(`Nó selecionado: ${selectedNodeId}`);
  
  const payload = {
    mindMap: mindMapData,
    selectedNodeId: selectedNodeId,
    mode: mode,
    depth: 5
  };
  
  if (customPrompt) {
    payload.customPrompt = customPrompt;
  }
  
  try {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANON_KEY}`,
        'apikey': ANON_KEY
      },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Sucesso!');
      console.log('Sugestões:', data.suggestions);
      console.log('Modo:', data.mode);
      console.log('Tópico selecionado:', data.selectedNodeTopic);
    } else {
      console.log('❌ Erro:', data.error);
      console.log('Detalhes:', data.details);
    }
  } catch (error) {
    console.log('❌ Erro na requisição:', error.message);
  }
}

// Executar testes
async function runTests() {
  // Teste 1: Expandir Frontend
  await testEdgeFunction('expand', 'node1');
  
  // Teste 2: Sugerir ideias para Backend
  await testEdgeFunction('suggest', 'node2');
  
  // Teste 3: Resumir React
  await testEdgeFunction('summarize', 'node1-1');
  
  // Teste 4: Perguntas sobre Node.js
  await testEdgeFunction('question', 'node2-1');
  
  // Teste 5: Prompt customizado
  await testEdgeFunction('custom', 'root', 'Liste as tecnologias mais importantes para aprender em 2024');
}

// Executar os testes
runTests().then(() => {
  console.log('\n✅ Todos os testes concluídos!');
}).catch(error => {
  console.error('Erro ao executar testes:', error);
});