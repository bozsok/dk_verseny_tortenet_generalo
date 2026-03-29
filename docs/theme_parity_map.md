# Theme Parity Map - Shadow System Ground Truth

Ez a dokumentum tartalmazza a fő rendszer (Standard) színeit és stílusait, amelyeket az Árnyék-rendszernek (Shadow) 1:1 tükröznie kell.

## 1. Alap Színpaletta (Variables)

| Változó | Cyber-Fantasy (Modern) | Literary (Irodalmi) |
| :--- | :--- | :--- |
| **Háttér (Deep)** | `#07080d` | `#F9F7F2` |
| **Kártya / Panel** | `#0f111a` | `#ffffff` |
| **Sidebar Háttér** | (bg-card) | `#F1EFE9` |
| **Input Háttér** | `#161a26` | `transparent` |
| **Elsődleges Neon** | `#00f2ff` | `#8C7861` (Barna) |
| **Másodlagos Neon**| `#9d50bb` | `#A39382` (Világosbarna) |
| **Szöveg (Fő)** | `#ffffff` | `#2D2926` |
| **Szöveg (Dim)** | `#8a8d9b` | `#6B645E` |
| **Betűtípus (Fő)**| `'Outfit', sans-serif` | `'Inter', sans-serif` |
| **Betűtípus (Fejléc)**| `'Rajdhani', sans-serif` | `'Lora', serif` |

## 2. Sidebar Elem-leképezés

| Elem | Cyber-Fantasy Stílus | Literary Stílus |
| :--- | :--- | :--- |
| **Sidebar Konténer** | `#0f111a`, 12px radius, Shadow | `#F1EFE9`, 12px radius, **NINCS ÁRNYÉK** |
| **Sidebar Fejléc** | Gradiens (Cyan-Purple), White text | **Solid `#8C7861`**, White text, **border-bottom** |
| **Sidebar Heading**| 1.4rem, Rajdhani 800 | **1.5rem, Lora 500**, No Uppercase |
| **Sidebar Toggle** | White/Transp, 4px radius, 34px | **White (#FFF)**, #2D2926 text, **box-shadow** |
| **Toggle Position** | calc(width - 42px) | **calc(width - 42px)**, top: 50%, 34x34px |
| **Sidebar Label** | 16px, Outfit Bold, Cyan | 16px, **Lora Bold**, `#6B645E` |
| **Input / Textarea**| Inter, 0.9rem, Dark border | **Inter**, 0.9rem, Sepia border |
| **Textarea Height**| 120px (Medium) | **360px (Literary Standard)** |
| **Primary Button** | Gradient, Glow | **Solid `#8C7861`**, White text, **NINCS GLOW** |
| **Secondary Button**| Semi-transparent, Cyan hover | **Pure White**, `#F9F7F2` hover, Brown border |
| **Accent Button** | Transp purple, Purple border | **Pure White**, #A39382 text, Sepia border |
| **Sync Button** | Transparent Cyan, Glow | **bg-deep (#F9F7F2)**, Cyan border, Glow |

## 3. Strukturális Ground Truth (Layout)

| Elem | Struktúra / HTML | Megjegyzés |
| :--- | :--- | :--- |
| **Sidebar Header** | `.dkv-header` > `span` + `button` | A toggle a fejlécen BELÜL van. |
| **Actions Section** | `.dkv-sidebar__actions` | Generate (Primary), Load (Secondary) |
| **Sec. Actions** | `.dkv-sidebar__secondary-actions` | Grid-alapú elrendezés |
| **Blueprint Button**| Full-width Block | `.dkv-btn--secondary` |
| **Export Buttons** | 2-column Grid Row (1fr 1fr) | `.dkv-btn--accent` (.MD és .TXT) |
| **Grid Gap** | **5px** (belső) / **10px** (külső) | Szigorúan tartandó! |

## 10. Globális szabály (Kiegészítés)
Minden jövőbeli fázisban (Preview, Globális, stb.) kötelező ezen táblázat értékeit használni. Eltérés esetén a folyamat azonnal megáll. **TILOS TÖRÖLNI SOROKAT EBBŐL A TÁBLÁZATBÓL.**
