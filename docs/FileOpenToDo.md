# TODO - Sistema de Abertura de Arquivos

## Fase 1: Interface e UI ✅
- [x] Criar botão "Open File" no toolBar.ts
- [x] Adicionar ícone folder-open.svg em src/icons/
- [x] Adicionar traduções para "Open File" em i18n.ts

## Fase 2: Manipulação de Arquivos ✅
- [x] Implementar handler onChange para file input
- [x] Validar tipo de arquivo (apenas .json)
- [x] Implementar FileReader para ler conteúdo do arquivo

## Fase 3: Validação e Tratamento de Erros ✅
- [x] Criar validador de estrutura MindElixirData
- [x] Implementar tratamento de erros para JSON inválido
- [x] Adicionar mensagens de erro localizadas

## Fase 4: Integração e Testes ✅
- [x] Integrar com instance.refresh() existente
- [x] Testar carregamento e centralização do mapa
- [x] Verificar preservação de arrows e summaries ao importar
- [x] Crie na pasta /docs um arquivo .json com um mapa mental completo com vários estilo de nó para ser importado

## Arquivos Criados/Modificados:
- `/src/plugin/toolBar.ts` - Adicionado botão e lógica de abertura de arquivo
- `/src/icons/folder-open.svg` - Novo ícone para o botão
- `/src/i18n.ts` - Adicionadas traduções em 10 idiomas
- `/docs/example-mindmap.json` - Arquivo de exemplo com mapa completo
- `/test-file-open.html` - Página de teste da funcionalidade