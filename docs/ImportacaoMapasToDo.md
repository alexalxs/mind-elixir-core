# TODO - Sistema de Importação de Mapas

## Fase 1: Modal de Importação
- [ ] Criar componente modal para interface de importação
- [ ] Implementar área de drag & drop para arquivos
- [ ] Adicionar botão de seleção de arquivo alternativo
- [ ] Mostrar preview do nome e tamanho do arquivo

## Fase 2: Suporte a Múltiplos Formatos
- [ ] Implementar parser para formato JSON nativo
- [ ] Adicionar suporte para importação de arquivos .xmind
- [ ] Criar conversor para formato FreeMind (.mm)
- [ ] Implementar detecção automática de formato

## Fase 3: Validação e Tratamento de Erros
- [ ] Validar estrutura do arquivo antes de processar
- [ ] Criar mensagens de erro específicas por tipo de problema
- [ ] Implementar sanitização de dados importados
- [ ] Adicionar barra de progresso para arquivos grandes

## Fase 4: Galeria de Templates
- [ ] Criar seção de mapas de exemplo na modal
- [ ] Adicionar 5-10 templates para diferentes usos
- [ ] Implementar preview visual dos templates
- [ ] Permitir busca e filtragem de templates

## Fase 5: Processamento e Conversão
- [ ] Normalizar estrutura de dados importados
- [ ] Preservar estilos e formatações quando possível
- [ ] Converter coordenadas e layouts diferentes
- [ ] Manter anexos e links dos nós

## Fase 6: Integração e Persistência
- [ ] Integrar importação com sistema de undo
- [ ] Adicionar opção de merge com mapa existente
- [ ] Implementar importação via URL
- [ ] Salvar preferências de importação do usuário