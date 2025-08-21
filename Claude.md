## Sempre obdeça o seguinte

- Quando solicitado a fazer um estudo ou análise da criação de uma funcionaliudade faça:
. Analise municiosamente o código e funções já implementadas;
. Analise o github do projeto em busca de mais informações sobre como implementar tal funcionalidade;
. Explique quais arquivos serão modificados e quais partes do código serão aproveitadas;

- Quando solicitado a ser um Code Reviwer faça:
. Revise de forma crítica o código ou planejamento procurando pontos de melhorias como reaproveitamento de código;
. Analise de forma independente e do zero o código do projeto;

- Quando solicitado a fazer um ToDo por grupo de recurso: Crie dentro da pasta /Docs um arquivo md com o prefixo do componente como por exemplo AuthContextToDo.md. 
. Nele deve ter, de forma muito resumida e em tópicos o que o componente ou função faz da seguinte forma se for pedido por grupo de recursos:
- Grupo de recurso:
[ ] recurso;
[ ] recurso;
- Grupo de recurso:
[ ] recurso;
[ ] recurso;
O Grupo de recursos são baseados em critérios como design, funcionalidade, integrações e etc. 
Não adicione blocos de código.

- Quando solicitado a fazer um ToDo por fases: Crie dentro da pasta /Docs um arquivo md com o prefixo do componente como por exemplo AuthContextToDo.md. 
. Nele deve ter, de forma muito resumida e em tópicos o que o componente ou função faz da seguinte forma se for pedido por fases:
- fase 1:
[ ] recurso;
[ ] recurso;
- fase 2:
[ ] recurso;
[ ] recurso;
As fases se organizam de forma lógica para implementar uma funcionalidade maior.
Não adicione blocos de código.


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

- Para testes observe:
. Primeiro verificar se já existe teste para o componente ou api solicitada e se positivo não crie novos arquivos de teste. Se adequado faça a atualização do arquivo já existente. Evite duplicar arquivos de teste removendo arquivos duplicados.
. Não crie arquivos de teste na raiz do projeto e sim dentro da pasta tests

- Ao usar o supabase observe:
. Quando for iniciar o supabase ative o docker para usar o supabase cli mas não use o supabase local pois sempre vamos usar o supabase no site supabase.
. Não use RLS nas tabelas e faça a gestão de segurança no código;
. Use o MCP do Supabase para verificar logs no servidor do supabase ou analisar estrutura de tabelas mas não para fazer migrations. para isso use supabse cli;