# Sistema de Estilos e Formatação de Texto no Mind-Elixir-Core

## Visão Geral

O Mind-Elixir-Core atualmente oferece três abordagens principais para estilização de conteúdo nos nós do mapa mental:

1. **Estilos de Nó (Node Styles)** - Aplicação de estilos CSS ao nó inteiro
2. **dangerouslySetInnerHTML** - Inserção de HTML puro para conteúdo rico
3. **Texto Simples (Plain Text)** - Edição padrão sem formatação

## 1. Estilos de Nó (Node Styles)

### Como Funciona
- Os estilos são aplicados ao elemento `<me-tpc>` inteiro através da propriedade `style` do objeto do nó
- Localização no código: `src/utils/dom.ts`, função `shapeTpc` (linhas 19-25)

### Propriedades Suportadas
```javascript
nodeObj.style = {
  fontSize: '20px',
  fontFamily: 'Arial',
  color: '#333333',
  background: '#f0f0f0',
  fontWeight: 'bold',
  width: '200px',
  border: '2px solid red',
  textDecoration: 'underline'
}
```


## 2. dangerouslySetInnerHTML

### Como Funciona
- Permite inserir HTML completo diretamente no nó
- Localização no código: `src/utils/dom.ts`, linhas 27-30
- **SUBSTITUI COMPLETAMENTE** todo o conteúdo do nó (texto, ícones, tags, links)

### Capacidades
- **Formatação Rica**: Negrito, itálico, sublinhado, cores específicas para palavras
- **Fórmulas Matemáticas**: Usando KaTeX
- **Blocos de Código**: Com syntax highlighting
- **Elementos Personalizados**: Divs, spans, tabelas, listas
- **Estilos Inline e CSS**: Incluindo `<style>` tags


### ⚠️ AVISO DE SEGURANÇA
- **NÃO HÁ SANITIZAÇÃO**: O HTML é inserido diretamente via `innerHTML`
- **Risco de XSS**: Se usar conteúdo de usuários, DEVE sanitizar antes
- **Use apenas com conteúdo confiável**

