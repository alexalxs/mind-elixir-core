#!/usr/bin/env node

/**
 * Teste de validação da Edge Function ai-assistant
 * Testa especificamente as validações de formato implementadas
 */

const SUPABASE_URL = 'https://mtugzogakhqqpykopstk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10dWd6b2dha2hxcXB5a29wc3RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE5MzAzMzksImV4cCI6MjA0NzUwNjMzOX0.KjQBSJ7Kl9rnRyBT6k7LV7U7yJFcvHI0zH6YJrUqGnI';
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/ai-assistant`;

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'apikey': SUPABASE_ANON_KEY
};

// Teste simples
async function runTest() {
  console.log('🧪 Testando Edge Function ai-assistant\n');
  
  // Teste 1: Teste básico de funcionamento
  console.log('📋 Teste 1: Requisição válida');
  console.log('━'.repeat(50));
  
  const validPayload = {
    mindMap: {
      nodeData: {
        id: 'root',
        topic: 'Tecnologia',
        children: []
      }
    },
    selectedNodeId: 'root',
    prompt: 'Gere 3 subtópicos sobre tecnologia moderna'
  };
  
  try {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(validPayload)
    });
    
    console.log(`📊 Status: ${response.status}`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Resposta recebida com sucesso');
      console.log(`📝 Nós retornados: ${data.children?.length || 0}`);
      if (data.children) {
        data.children.forEach((node, i) => {
          console.log(`   ${i + 1}. ${node.topic}`);
        });
      }
    } else {
      console.log('❌ Erro:', data.error || 'Erro desconhecido');
      if (data.type) console.log('   Tipo:', data.type);
      if (data.details) console.log('   Detalhes:', data.details);
    }
  } catch (error) {
    console.log('❌ Erro na requisição:', error.message);
  }
  
  // Teste 2: Teste de validação - sem mindMap
  console.log('\n\n📋 Teste 2: Validação - Payload sem mindMap');
  console.log('━'.repeat(50));
  
  const invalidPayload = {
    selectedNodeId: 'root',
    prompt: 'Teste sem mindMap'
  };
  
  try {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(invalidPayload)
    });
    
    console.log(`📊 Status: ${response.status}`);
    const data = await response.json();
    
    if (!response.ok) {
      console.log('✅ Erro esperado recebido:', data.error);
      if (data.type) console.log('   Tipo:', data.type);
      if (data.validationErrors) {
        console.log('   Erros de validação:');
        data.validationErrors.forEach(err => console.log(`     - ${err}`));
      }
    } else {
      console.log('❌ Esperava erro mas recebeu sucesso');
    }
  } catch (error) {
    console.log('❌ Erro na requisição:', error.message);
  }
  
  console.log('\n✨ Testes concluídos!');
}

// Executar teste
runTest().catch(console.error);