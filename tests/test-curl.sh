#!/bin/bash

# Teste com curl
curl -X POST https://mtugzogakhqqpykopstk.supabase.co/functions/v1/ai-assistant \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10dWd6b2dha2hxcXB5a29wc3RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE5MzAzMzksImV4cCI6MjA0NzUwNjMzOX0.KjQBSJ7Kl9rnRyBT6k7LV7U7yJFcvHI0zH6YJrUqGnI" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10dWd6b2dha2hxcXB5a29wc3RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE5MzAzMzksImV4cCI6MjA0NzUwNjMzOX0.KjQBSJ7Kl9rnRyBT6k7LV7U7yJFcvHI0zH6YJrUqGnI" \
  -d '{"mindMap":{"nodeData":{"id":"root","topic":"Test","children":[]}},"selectedNodeId":"root","prompt":"Generate 3 subtopics"}'