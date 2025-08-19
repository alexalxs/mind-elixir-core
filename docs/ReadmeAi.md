## Sempre obdeça o seguinte

- Quando solicitado a fazer um estudo ou análise da criação de uma funcionaliudade faça:
. Analise municiosamente o código e funções já implementadas;
. Analise o github do projeto em busca de mais informações sobre como implementar tal funcionalidade;
. Explique quais arquivos serão modificados e quais partes do código serão aproveitadas;

- Quando solicitado a ser um Code Reviwer faça:
. Revise de forma crítica o código ou planejamento procurando pontos de melhorias como reaproveitamento de código;
. Analise de forma independente e do zero o código do projeto;

- Quando solicitado a fazer um ToDo: Crie dentro da pasta /Docs um arquivo md com o prefixo do componente como por exemplo AuthContextToDo.md. 
. Nele deve ter, de forma muito resumida e em tópicos o que o componente ou função faz da seguinte forma:
- Grupo de recurso:
[ ] recurso;
[ ] recurso;
- Grupo de recurso:
[ ] recurso;
[ ] recurso;
O Grupo de recursos são baseados em critérios como design, funcionalidade, integrações e etc. 


- Quando solicitado a criar ou modificar o código:
. Seja minimalista em suas criações ou alteraçõe se atendo a criar ou modificar apenas o que foi solicitado sem adicionar mais recursos;
. Use os recursos nativos da solução e não faça solução de contorno;
. Suas criações ou alteraçõe não devem afetar outros elementos ou funções do sistema; 
. Sempre refatore arquivos que passarem de 500 linhas;
. Ao final execute npm run build e itere até corrigir qualquer erro;

- Quando solicitado a criar ou modificar um diagrama de sequencia: Crie dentro da pasta /Docs um arquivo .md com o prefixo do tema em estudo como por exemplo AuthContext_Seq.md. 
Se o arquivo já estiver presente, analise se já há um arquivo .md com diagrama de sequencia mermaid para o referido tema ( não faça fluxos  que tenham mais de um caso de uso).  
Em ambos os casos os requisitos devem ser cumpridos:
Consultando o Código criei na pasta de documentações o diagarma de sequencia mermeid cumprindo:
. Mostre como o estado varia durente as interações até ocorrer a ultima mudança de estado;
. Para cada interação entre os participant, detalhe as informações enviadas nas requisição e os retornos;
. indicar arquivos ou funções percorridas;
. indicar tabelas do banco de dados que salvam determinadas informações;


- Quando solicitado a testar o frontand: Execute o  playwright especificamente para a função em desenvolvimento considerando:
. sempre corrija a aplicação para que passe em todos os testes;
. execute o crud de forma a testar por completo a funcionalidade;
. Sempre sugira ou crie novos testes quando necessário;
. Seja minimalista e não produza nada além do mínimo necessário para resolver e use a documentação ofical como base;
. Não deve usar uma solução de fallback ou alternativa e sim a padrão;

- Quando for necessário ou solicitado a iniciar um servidor:
. Sempre verifique primeiro se o processo desejado já esta em execução na porta especificada no projeto e se isso ocorre use esse processo evitando criar um novo processo ou mudar de porta;

## Funcionalidades Necessárias


### Sistema de Notas Expandidas para Nós
**Necessidade:** Implementar um sistema que permita adicionar anotações detalhadas aos nós do mapa mental sem poluir a visualização principal.

**Descrição Detalhada:**
- [ ] Cada nó deve poder ter uma nota associada que contenha texto longo e formatado
- [ ] As notas devem ser armazenadas de forma vinculada ao nó correspondente
- [ ] Interface de edição em janela modal ou painel lateral separado
- [ ] Indicador visual no nó quando houver uma nota anexada (ex: ícone de documento)
- [ ] Visualização rápida da nota ao passar o mouse sobre o nó (tooltip expandido)
- [ ] Opção de abrir/fechar a nota completa ao clicar no indicador ou através de atalho de teclado
- [ ] Suporte para formatação básica do texto (negrito, itálico, listas, links)
- [ ] Exportação das notas junto com o mapa mental
- [ ] Busca de conteúdo dentro das notas anexadas

**Exemplo de Uso:**
- [ ] Um nó "Projeto X" poderia ter uma nota anexada contendo:
  - Descrição completa do projeto
  - Lista de requisitos técnicos
  - Links para documentação externa
  - Anotações de reuniões
  - Cronograma detalhado
- [ ] Ao clicar no ícone de nota do nó, uma janela lateral se abriria mostrando todo esse conteúdo formatado
- [ ] O usuário poderia editar a nota sem afetar o texto principal do nó no mapa

**Benefícios:**
- [ ] Permite documentação detalhada sem comprometer a clareza visual do mapa
- [ ] Facilita o uso do mapa mental como ferramenta de organização de conhecimento
- [ ] Mantém a interface limpa enquanto permite acesso rápido a informações complementares

### Sistema de Abertura e Importação de Mapas
**Necessidade:** Implementar funcionalidade para carregar mapas mentais existentes, permitindo reutilização e compartilhamento de conteúdo.

**Descrição Detalhada:**
- [Fix] Interface **modal** de upload que aceite arquivos de mapas mentais em formatos suportados (JSON, XML, etc.). importar xmind com opção.
- [ ] Galeria de mapas de exemplo pré-carregados para demonstração e templates
- [ ] Validação de formato e estrutura do arquivo antes da importação
- [ ] Tratamento de erros com mensagens claras para arquivos inválidos ou corrompidos
- [Fix] Após importar deve ser aberto em /index.html permitindo as mesma ações permitidas ao mapa padrão da aplicação como edição;

### Página inicial
- [fix] em /index.html Abrir como o mapa padrão do mind-elixir-core que por algum motivo foi removido;