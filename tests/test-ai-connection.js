#!/usr/bin/env node

/**
 * Teste simples de conexão com a Edge Function
 */

const https = require('https');

const SUPABASE_URL = 'https://mtugzogakhqqpykopstk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10dWd6b2dha2hxcXB5a29wc3RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE5MzAzMzksImV4cCI6MjA0NzUwNjMzOX0.KjQBSJ7Kl9rnRyBT6k7LV7U7yJFcvHI0zH6YJrUqGnI';

// Teste básico
const testPayload = {
  mindMap: {
    nodeData: {
      id: 'root',
      topic: 'Teste',
      children: []
    }
  },
  selectedNodeId: 'root',
  prompt: 'Gere 3 subtópicos sobre tecnologia'
};

const postData = JSON.stringify(testPayload);

const options = {
  hostname: 'mtugzogakhqqpykopstk.supabase.co',
  port: 443,
  path: '/functions/v1/ai-assistant',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'apikey': SUPABASE_ANON_KEY
  }
};

console.log('🧪 Testando conexão com Edge Function...\n');
console.log('URL:', SUPABASE_URL + '/functions/v1/ai-assistant');
console.log('Headers:', JSON.stringify(options.headers, null, 2));

const req = https.request(options, (res) => {
  console.log('\n📊 Status:', res.statusCode);
  console.log('Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\n📄 Resposta:');
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Erro:', e.message);
});

req.write(postData);
req.end();