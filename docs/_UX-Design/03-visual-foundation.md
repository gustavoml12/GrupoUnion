# Visual Foundation

## Color System - Baseado no Logo Grupo Union

### Primary Colors (Gradiente do Logo)

**Purple (Roxo/Violeta)**
- `#8B5CF6` - Purple 500 (principal)
- `#7C3AED` - Purple 600 (hover)
- `#6D28D9` - Purple 700 (active)
- `#A78BFA` - Purple 400 (light)
- `#C4B5FD` - Purple 300 (lighter)

**Blue (Azul)**
- `#3B82F6` - Blue 500 (principal)
- `#2563EB` - Blue 600 (hover)
- `#1D4ED8` - Blue 700 (active)
- `#60A5FA` - Blue 400 (light)
- `#93C5FD` - Blue 300 (lighter)

**Cyan (Ciano)**
- `#06B6D4` - Cyan 500 (principal)
- `#0891B2` - Cyan 600 (hover)
- `#0E7490` - Cyan 700 (active)
- `#22D3EE` - Cyan 400 (light)
- `#67E8F9` - Cyan 300 (lighter)

### Gradient (Assinatura Visual)

**Primary Gradient (Logo)**
```css
background: linear-gradient(135deg, #8B5CF6 0%, #3B82F6 50%, #06B6D4 100%);
```

**Subtle Gradient (Backgrounds)**
```css
background: linear-gradient(135deg, #F3F4F6 0%, #E0E7FF 100%);
```

**Accent Gradient (CTAs)**
```css
background: linear-gradient(135deg, #7C3AED 0%, #2563EB 100%);
```

---

## Neutral Colors (Profissional)

**Grays**
- `#111827` - Gray 900 (texto principal)
- `#374151` - Gray 700 (texto secundário)
- `#6B7280` - Gray 500 (texto terciário)
- `#9CA3AF` - Gray 400 (placeholders)
- `#D1D5DB` - Gray 300 (borders)
- `#E5E7EB` - Gray 200 (dividers)
- `#F3F4F6` - Gray 100 (backgrounds)
- `#F9FAFB` - Gray 50 (light backgrounds)
- `#FFFFFF` - White (cards, modals)

**Black & White**
- `#000000` - Black (logo "grupo")
- `#FFFFFF` - White (logo "union", backgrounds)

---

## Status Colors

**Success (Verde)**
- `#10B981` - Green 500 (principal)
- `#059669` - Green 600 (hover)
- `#047857` - Green 700 (active)

**Warning (Amarelo/Laranja)**
- `#F59E0B` - Amber 500 (principal)
- `#D97706` - Amber 600 (hover)
- `#B45309` - Amber 700 (active)

**Error (Vermelho)**
- `#EF4444` - Red 500 (principal)
- `#DC2626` - Red 600 (hover)
- `#B91C1C` - Red 700 (active)

**Info (Azul)**
- `#3B82F6` - Blue 500 (usa primary blue)

---

## Semantic Colors (Aplicação)

### Indicações - Qualificação

**Quente (Hot)**
- Background: `#FEE2E2` (Red 100)
- Border: `#FCA5A5` (Red 300)
- Icon: `#EF4444` (Red 500)
- Text: `#991B1B` (Red 800)

**Morno (Warm)**
- Background: `#FED7AA` (Orange 200)
- Border: `#FDBA74` (Orange 300)
- Icon: `#F97316` (Orange 500)
- Text: `#9A3412` (Orange 800)

**Frio (Cold)**
- Background: `#DBEAFE` (Blue 100)
- Border: `#93C5FD` (Blue 300)
- Icon: `#3B82F6` (Blue 500)
- Text: `#1E40AF` (Blue 800)

### Status de Indicações

**Pendente**
- Color: `#F59E0B` (Amber 500)
- Background: `#FEF3C7` (Amber 100)

**Em Andamento**
- Color: `#3B82F6` (Blue 500)
- Background: `#DBEAFE` (Blue 100)

**Fechado - Ganho**
- Color: `#10B981` (Green 500)
- Background: `#D1FAE5` (Green 100)

**Fechado - Perdido**
- Color: `#6B7280` (Gray 500)
- Background: `#F3F4F6` (Gray 100)

**Cancelado**
- Color: `#EF4444` (Red 500)
- Background: `#FEE2E2` (Red 100)

### Badges e Reputação

**Estrelas (Rating)**
- Filled: `#FBBF24` (Yellow 400)
- Empty: `#D1D5DB` (Gray 300)

**Badges**
- Gold: `linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)`
- Silver: `linear-gradient(135deg, #E5E7EB 0%, #9CA3AF 100%)`
- Bronze: `linear-gradient(135deg, #FDBA74 0%, #EA580C 100%)`

---

## Typography

### Font Family

**Primary Font:** Inter
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

**Alternative:** Roboto
```css
font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Font Sizes & Weights

**Headings**
- H1: `32px / 2rem` - Font Weight: 700 (Bold)
- H2: `24px / 1.5rem` - Font Weight: 600 (Semi-Bold)
- H3: `20px / 1.25rem` - Font Weight: 600 (Semi-Bold)
- H4: `18px / 1.125rem` - Font Weight: 600 (Semi-Bold)

**Body**
- Large: `18px / 1.125rem` - Font Weight: 400 (Regular)
- Base: `16px / 1rem` - Font Weight: 400 (Regular)
- Small: `14px / 0.875rem` - Font Weight: 400 (Regular)
- XSmall: `12px / 0.75rem` - Font Weight: 400 (Regular)

**Special**
- Button: `16px / 1rem` - Font Weight: 500 (Medium)
- Label: `14px / 0.875rem` - Font Weight: 500 (Medium)
- Caption: `12px / 0.75rem` - Font Weight: 400 (Regular)

### Line Heights
- Tight: `1.25` (headings)
- Normal: `1.5` (body)
- Relaxed: `1.75` (long-form content)

---

## Spacing System

**Base Unit:** 4px

**Scale:**
- `0` - 0px
- `1` - 4px
- `2` - 8px
- `3` - 12px
- `4` - 16px
- `5` - 20px
- `6` - 24px
- `8` - 32px
- `10` - 40px
- `12` - 48px
- `16` - 64px
- `20` - 80px
- `24` - 96px

---

## Border Radius

**Rounded Corners:**
- `none` - 0px
- `sm` - 2px (inputs, small buttons)
- `md` - 4px (buttons, cards)
- `lg` - 8px (modals, large cards)
- `xl` - 12px (hero sections)
- `2xl` - 16px (special elements)
- `full` - 9999px (pills, avatars)

---

## Shadows

**Elevation System:**

**Small (Cards, Buttons)**
```css
box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
```

**Medium (Dropdowns, Popovers)**
```css
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 
            0 2px 4px -1px rgba(0, 0, 0, 0.06);
```

**Large (Modals, Dialogs)**
```css
box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 
            0 4px 6px -2px rgba(0, 0, 0, 0.05);
```

**XLarge (Floating Elements)**
```css
box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 
            0 10px 10px -5px rgba(0, 0, 0, 0.04);
```

**Colored Shadow (Primary Actions)**
```css
box-shadow: 0 10px 15px -3px rgba(139, 92, 246, 0.3), 
            0 4px 6px -2px rgba(139, 92, 246, 0.2);
```

---

## Icons

**Library:** Lucide React
**Size:** 20px (default), 24px (large), 16px (small)
**Stroke Width:** 2px (default), 1.5px (thin), 2.5px (bold)

**Common Icons:**
- Dashboard: `LayoutDashboard`
- Indicações: `ArrowRightLeft`
- Membros: `Users`
- Eventos: `Calendar`
- Perfil: `User`
- Notificações: `Bell`
- Configurações: `Settings`
- Sair: `LogOut`
- Adicionar: `Plus`
- Editar: `Edit`
- Deletar: `Trash2`
- Buscar: `Search`
- Filtrar: `Filter`
- Exportar: `Download`

---

## Component States

### Buttons

**Primary (Gradient)**
```css
/* Normal */
background: linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%);
color: #FFFFFF;

/* Hover */
background: linear-gradient(135deg, #7C3AED 0%, #2563EB 100%);
transform: translateY(-1px);
box-shadow: 0 10px 15px -3px rgba(139, 92, 246, 0.3);

/* Active */
background: linear-gradient(135deg, #6D28D9 0%, #1D4ED8 100%);
transform: translateY(0);

/* Disabled */
background: #E5E7EB;
color: #9CA3AF;
cursor: not-allowed;
```

**Secondary (Outline)**
```css
/* Normal */
border: 2px solid #8B5CF6;
color: #8B5CF6;
background: transparent;

/* Hover */
background: #F3F4F6;
border-color: #7C3AED;

/* Active */
background: #E5E7EB;
```

### Inputs

**Normal**
```css
border: 1px solid #D1D5DB;
background: #FFFFFF;
color: #111827;
```

**Focus**
```css
border: 2px solid #8B5CF6;
box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
outline: none;
```

**Error**
```css
border: 2px solid #EF4444;
box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
```

**Success**
```css
border: 2px solid #10B981;
box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
```

### Cards

**Default**
```css
background: #FFFFFF;
border: 1px solid #E5E7EB;
border-radius: 8px;
box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
```

**Hover (Interactive)**
```css
border-color: #8B5CF6;
box-shadow: 0 4px 6px -1px rgba(139, 92, 246, 0.1);
transform: translateY(-2px);
transition: all 0.2s ease;
```

---

## Dark Mode (Opcional - Futuro)

**Background:**
- Primary: `#111827` (Gray 900)
- Secondary: `#1F2937` (Gray 800)
- Tertiary: `#374151` (Gray 700)

**Text:**
- Primary: `#F9FAFB` (Gray 50)
- Secondary: `#D1D5DB` (Gray 300)
- Tertiary: `#9CA3AF` (Gray 400)

**Borders:**
- `#374151` (Gray 700)

**Gradient (Adjusted)**
```css
background: linear-gradient(135deg, #7C3AED 0%, #2563EB 50%, #0891B2 100%);
```

---

## Accessibility

### Contrast Ratios (WCAG 2.1 AA)

**Text on White:**
- Large Text (18px+): 3:1 minimum
- Normal Text (16px): 4.5:1 minimum

**Text on Purple (#8B5CF6):**
- Use White (#FFFFFF) - Ratio: 4.8:1 ✅

**Text on Blue (#3B82F6):**
- Use White (#FFFFFF) - Ratio: 4.5:1 ✅

**Text on Cyan (#06B6D4):**
- Use White (#FFFFFF) - Ratio: 3.2:1 ⚠️ (use for large text only)
- Use Gray 900 (#111827) - Ratio: 6.5:1 ✅

### Focus Indicators
- Always visible
- 2px solid outline
- Color: Primary Purple (#8B5CF6)
- Offset: 2px

---

_Visual foundation alinhada com a identidade moderna e vibrante do Grupo Union, mantendo profissionalismo e acessibilidade._
