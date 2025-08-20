import type { NodeObj } from '../types/index'

export interface AINodeObj extends NodeObj {
  aiGenerated?: boolean
  aiGeneratedAt?: string
  aiMode?: AIMode['id']
}

export interface AIMode {
  id: 'expand' | 'suggest' | 'summarize' | 'question' | 'custom'
  label: string
  icon: string
  description: string
}

export interface AIAssistantPayload {
  mindMap: { nodeData: NodeObj }
  selectedNodeId: string
  mode: AIMode['id']
  depth: number
  customPrompt?: string
}