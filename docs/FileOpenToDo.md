# TODO - Sistema de Abertura de Arquivos

## Fase 1: Interface e UI
- [ ] Criar botão "Open File" no toolBar.ts
- [ ] Adicionar ícone folder-open.svg em src/icons/
- [ ] Adicionar traduções para "Open File" em i18n.ts

## Fase 2: Manipulação de Arquivos
- [ ] Implementar handler onChange para file input
- [ ] Validar tipo de arquivo (apenas .json)
- [ ] Implementar FileReader para ler conteúdo do arquivo

## Fase 3: Validação e Tratamento de Erros
- [ ] Criar validador de estrutura MindElixirData
- [ ] Implementar tratamento de erros para JSON inválido
- [ ] Adicionar mensagens de erro localizadas

## Fase 4: Integração e Testes
- [ ] Integrar com instance.refresh() existente
- [ ] Testar carregamento e centralização do mapa
- [ ] Verificar preservação de arrows e summaries ao importar
- [ ] Crie na pasta /docs um arquivo .json com um mapa mental completo com vários estilo de nó para ser importado