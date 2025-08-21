# Mind Elixir Core - Theme System Analysis

## Current Styling System Overview

### 1. CSS/LESS Files Structure
- **Main style file**: `src/index.less` - Contains core styles for mind map elements
- **Plugin styles**: 
  - `src/plugin/contextMenu.less`
  - `src/plugin/toolBar.less`
  - `src/plugin/styleEditor.less`
  - `src/plugin/aiAssistant.less`
- **External styles**: `katex.css` (for math rendering)
- **Compiled output**: `dist/style.css`

### 2. Theme Implementation

#### Current Theme Structure (`src/types/index.ts`):
```typescript
export type Theme = {
  name: string
  type?: 'light' | 'dark'
  palette: string[]  // Color palette for main branches
  cssVar: {
    '--node-gap-x': string
    '--node-gap-y': string
    '--main-gap-x': string
    '--main-gap-y': string
    '--main-color': string
    '--main-bgcolor': string
    '--color': string
    '--bgcolor': string
    '--selected': string
    '--root-color': string
    '--root-bgcolor': string
    '--root-border-color': string
    '--root-radius': string
    '--main-radius': string
    '--topic-padding': string
    '--panel-color': string
    '--panel-bgcolor': string
    '--panel-border-color': string
    '--map-padding': string
  }
}
```

#### Predefined Themes (`src/const.ts`):
- **THEME (Light)**: Default light theme with 10-color palette
- **DARK_THEME**: Dark theme with 10-color palette

### 3. Theme Application System

#### Theme Initialization:
1. **Constructor** (`src/index.ts`): 
   - Detects system preference via `prefers-color-scheme`
   - Sets initial theme: `theme || (mediaQuery.matches ? DARK_THEME : THEME)`

2. **Init Method** (`src/methods.ts`):
   - Applies theme via `changeTheme(data.theme || this.theme, false)`

#### Theme Application (`src/utils/theme.ts`):
```typescript
export const changeTheme = function (theme: Theme, shouldRefresh = true) {
  this.theme = theme
  const base = theme.type === 'dark' ? DARK_THEME : THEME
  const cssVar = {
    ...base.cssVar,
    ...theme.cssVar,
  }
  // Apply CSS variables to container
  for (const key in cssVar) {
    this.container.style.setProperty(key, cssVar[key])
  }
  shouldRefresh && this.refresh()
}
```

### 4. Color Application to Elements

#### Branch Colors (`src/linkDiv.ts`):
- Main branches get colors from theme palette:
  ```typescript
  const palette = this.theme.palette
  const branchColor = tpc.nodeObj.branchColor || palette[i % palette.length]
  tpc.style.borderColor = branchColor
  ```
- Colors cycle through the palette based on branch index
- Individual nodes can override with `branchColor` property

#### Node Styling (`src/utils/dom.ts`):
- Individual nodes can have custom styles via `nodeObj.style`
- Style properties applied directly to DOM elements
- Supported properties: fontSize, fontFamily, color, background, fontWeight, etc.

### 5. Style Editor Plugin (`src/plugin/styleEditor.ts`)
- Provides UI for customizing individual node styles
- Two tabs: Node styles and Text styles
- Allows customization of:
  - Background color
  - Text color
  - Font family
  - Font size/weight/style
  - Border styles
  - Padding, margins, shadows
  - Opacity, border radius

### 6. CSS Variable System
The theme system uses CSS custom properties (variables) for dynamic theming:
- Applied to `.map-container` element
- Inherited by all child elements
- Variables control:
  - Spacing (gaps, padding)
  - Colors (backgrounds, text, borders)
  - Visual properties (radius, borders)

## Key Files for Theme Implementation

1. **Type Definitions**: `src/types/index.ts` - Theme interface
2. **Constants**: `src/const.ts` - Predefined themes
3. **Theme Utils**: `src/utils/theme.ts` - Theme application logic
4. **Main Styles**: `src/index.less` - Core CSS using theme variables
5. **Branch Coloring**: `src/linkDiv.ts` - Branch color application
6. **Node Styling**: `src/utils/dom.ts` - Individual node style application
7. **Style Editor**: `src/plugin/styleEditor.ts` - UI for style customization

## Theme Integration Points

1. **MindElixir Constructor**: Theme option passed during initialization
2. **Init Method**: Theme from data or default theme applied
3. **ChangeTheme Method**: Public API for theme switching
4. **Export/Import**: Theme saved with mind map data
5. **Style Editor**: Per-node style overrides

## Current Limitations

1. Only two predefined themes (light and dark)
2. No UI for theme selection/switching
3. Limited theme customization options
4. No theme persistence (localStorage)
5. No theme preview functionality