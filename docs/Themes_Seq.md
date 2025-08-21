# Diagrama de Sequência - Aplicação de Temas

## Fluxo de Seleção e Aplicação de Tema

```mermaid
sequenceDiagram
    participant User
    participant ThemeButton as Botão Temas
    participant ThemeSelector as ThemeSelector Plugin
    participant ThemeManager as ThemeManager
    participant MindElixir as MindElixir Core
    participant DOM as DOM/Container
    participant LocalStorage as LocalStorage

    User->>ThemeButton: Clica no ícone de temas
    ThemeButton->>ThemeSelector: openThemeSelector()
    
    Note over ThemeSelector: Estado: modal fechado → aberto
    
    ThemeSelector->>ThemeSelector: renderThemeGrid()<br/>{themes: [...predefinedThemes]}
    ThemeSelector->>DOM: Cria modal com grid de temas
    
    Note over ThemeSelector: Estado: exibindo 6 temas<br/>(Meister, Prism, Color Burst,<br/>Ocean, Sunset, Vintage)
    
    User->>ThemeSelector: Hover sobre tema
    ThemeSelector->>ThemeSelector: showPreview(themeId)<br/>{preview: true}
    ThemeSelector->>DOM: Aplica classe de preview
    
    User->>ThemeSelector: Clica em tema (ex: "Ocean")
    ThemeSelector->>ThemeManager: applyTheme("ocean")<br/>{themeId: "ocean"}
    
    ThemeManager->>ThemeManager: getThemeById("ocean")<br/>Retorna: {<br/>  name: "Ocean",<br/>  type: "light",<br/>  palette: ["#0077BE", "#00A8E8"...],<br/>  cssVar: {...}<br/>}
    
    ThemeManager->>MindElixir: changeTheme(oceanTheme)<br/>src/utils/theme.ts
    
    MindElixir->>DOM: Aplica variáveis CSS<br/>container.style.setProperty()<br/>--main-color: #0077BE<br/>--root-color: #333<br/>etc...
    
    Note over MindElixir: Estado: tema anterior → Ocean
    
    MindElixir->>MindElixir: updateBranchColors()<br/>src/linkDiv.ts<br/>Aplica cores da paleta aos branches
    
    MindElixir->>MindElixir: refresh()<br/>Re-renderiza mapa mental
    
    ThemeManager->>LocalStorage: saveThemePreference("ocean")<br/>localStorage.setItem("me-theme", "ocean")
    
    ThemeSelector->>ThemeSelector: closeModal()<br/>{open: false}
    ThemeSelector->>DOM: Remove modal
    
    Note over ThemeSelector: Estado: modal aberto → fechado
    Note over MindElixir: Estado final: tema Ocean aplicado
```

## Notas sobre o Fluxo:

- **Arquivos envolvidos**:
  - `src/plugin/themeSelector.ts` - Plugin de seleção de temas (a criar)
  - `src/utils/theme.ts` - Função changeTheme existente
  - `src/themes/index.ts` - Definições de temas predefinidos (a criar)
  - `src/linkDiv.ts` - Aplicação de cores nos branches
  - `src/index.ts` - Core do MindElixir

- **Estados rastreados**:
  - Modal do seletor: fechado → aberto → fechado
  - Tema ativo: tema anterior → novo tema
  - Preview: ativo/inativo durante hover

- **Dados persistidos**:
  - Preferência de tema no localStorage
  - Tema incluído ao exportar mapa mental (já existente)