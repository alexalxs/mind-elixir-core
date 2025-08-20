// Using native fetch in Node.js 18+

const SUPABASE_URL = 'https://mtugzogakhqqpykopstk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10dWd6b2dha2hxcXB5a29wc3RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTY5MzIsImV4cCI6MjA3MTIzMjkzMn0.0SypN0pLQ0TgZsWYjplh8Dp3PiXcD7tOxhPSBf9tK4U';

async function testExpandMode() {
  console.log('Testing expand mode...');
  
  const payload = {
    mindMap: {
      nodeData: {
        topic: "Marketing Digital",
        id: "root",
        children: [
          {
            topic: "SEO",
            id: "n1",
            children: []
          },
          {
            topic: "Social Media", 
            id: "n2",
            children: []
          }
        ]
      }
    },
    selectedNodeId: "root",
    mode: "expand",
    depth: 3
  };

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-assistant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}

async function testQuestionMode() {
  console.log('\nTesting question mode...');
  
  const payload = {
    mindMap: {
      nodeData: {
        topic: "Marketing Digital",
        id: "root",
        children: []
      }
    },
    selectedNodeId: "root",
    mode: "question",
    depth: 2
  };

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-assistant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}

async function testCustomMode() {
  console.log('\nTesting custom mode...');
  
  const payload = {
    mindMap: {
      nodeData: {
        topic: "Marketing Digital",
        id: "root",
        children: []
      }
    },
    selectedNodeId: "root",
    mode: "custom",
    customPrompt: "Liste 3 estratégias avançadas de marketing digital para e-commerce",
    depth: 3
  };

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-assistant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}

async function runAllTests() {
  console.log('Starting AI Assistant API tests...\n');
  
  await testExpandMode();
  await testQuestionMode();
  await testCustomMode();
  
  console.log('\nTests completed!');
}

runAllTests();