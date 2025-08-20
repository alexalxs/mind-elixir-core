# TODO - Sistema de Notas Expandidas para Nós

## Fase 1: Estrutura de Dados e Armazenamento
- [ ] Adicionar campo 'note' ao tipo NodeObj para armazenar notas
- [ ] Criar interface TypeScript para estrutura de notas
- [ ] Garantir persistência das notas ao exportar/importar JSON
- [ ] Validar que notas sejam preservadas nas operações de edição

## Fase 2: Interface Visual e Indicadores
- [ ] Criar ícone de nota para exibir nos nós com notas
- [ ] Adicionar indicador visual ao nó quando tiver nota anexada
- [ ] Implementar tooltip de preview ao passar mouse sobre o ícone
- [ ] Adicionar animação suave para feedback visual

## Fase 3: Editor de Notas
- [ ] Criar componente modal para edição de notas
- [ ] Implementar editor com formatação básica (negrito, itálico, listas)
- [ ] Adicionar suporte para links clicáveis
- [ ] Implementar auto-save enquanto digita
- [ ] Criar botões de salvar e cancelar

## Fase 4: Integração com Menu de Contexto
- [ ] Adicionar opção "Adicionar/Editar Nota" no menu de contexto
- [ ] Criar atalho de teclado para abrir editor de notas
- [ ] Implementar lógica para remover notas vazias
- [ ] Integrar com sistema de undo/redo

## Fase 5: Busca e Exportação
- [ ] Implementar busca de texto dentro das notas
- [ ] Destacar nós com resultados de busca nas notas
- [ ] Incluir notas na exportação PNG/SVG como metadata
- [ ] Garantir que notas sejam incluídas no JSON exportado

## Fase 6: Otimizações e Melhorias
- [ ] Implementar lazy loading para notas grandes
- [ ] Adicionar contador de caracteres no editor
- [ ] Criar opção para copiar nota entre nós
- [ ] Adicionar suporte para markdown básico