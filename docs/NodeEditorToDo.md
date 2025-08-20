# Sistema de Aplicação de Estilos - ToDo por Fases

## Fase 1 - Interface Básica de Estilos:
[ ] Modal/painel para edição de propriedades do nó
[ ] Campos para propriedades de estilo existentes (fontSize, color, background, fontWeight, border)
[ ] Seletores de cor para background e texto
[ ] Dropdown para família de fonte
[ ] Input numérico para tamanho de fonte
[ ] Botões para peso da fonte (normal/bold)
[ ] Preview em tempo real das mudanças
[ ] Integração com reshapeNode() para aplicar mudanças
[ ] Posição da caixa de formatação será no canto superior direito
[ ] A caixa de formatação apresenta 2 abas uma ao lado da outra e se uma estiver ativada o conteúdo da outra fica escondido: Aba Nó e Aba Texto. A aba texto formata o texto se ele não for html. A aba nó formata os aspectos relativos ao nó.  Exemplo de propriedades do nó : Cor de fundo, borda, largura, 
[ ] Nas duas abas as opçoes de cores devem estar no topo do layout.
[ ] Adicione todas as outras propriedades que podem ser modificadas e que são aceitas pelo mapa mental;
[ ] A caixa de formatação será ligada ao nó selecionado mesmo quando esse nó selecionado é alternado
[ ] Verifique se a propriedade border e width são aceitáveis. se for aceitável use valores em lista; se não forem aceitáveis remova;
[Fix] O campo decoração de texto não deve ser removido.
[ ] Melhore o layout de docs/images/2.png
[ ] As opções do campo borda não devem se referir a cores e apenas ao estilos de bordas


## Fase 2 - Editor de Formatação Rica:
[ ] Toolbar WYSIWYG com botões de formatação (B, I, U, etc)
[ ] Suporte para formatação parcial do texto (negrito em palavras específicas)
[ ] Implementar sanitização com DOMPurify
[ ] Campo de edição que gera HTML formatado
[ ] Salvar conteúdo formatado em dangerouslySetInnerHTML
[ ] Toggle entre modo texto simples e formatado
[ ] Preview do HTML resultante
[ ] Migração de ícones/tags para dentro do HTML quando usar formatação rica

