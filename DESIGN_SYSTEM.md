# FIELD COLLECTOR // DESIGN SYSTEM

## 1. Aesthetic Thesis: "Light Utility Industrial"
The design is inspired by modern technical survey equipment, aerospace telemetry, and industrial hardware. It prioritizes clarity, technical precision, and a "high-contrast" utility look.

- **Aesthetic Direction**: Industrial Utilitarian (Light Mode)
- **Key Characteristics**: Functional density, sharp lines, technical fonts, high-visibility accents.

---

## 2. Design Tokens

### Colors
| Name | Value | Purpose |
| :--- | :--- | :--- |
| **Background** | `#eef0f2` | Main page background, low-contrast areas. |
| **Surface** | `#ffffff` | Primary UI components, cards, sheets. |
| **Surface-Hi** | `#f8f9fa` | Hover states, elevated surfaces. |
| **Accent** | `#ff8c00` | **Safety Orange**. Key actions (FABs), highlights, active states. |
| **Text (Primary)** | `#1a1d21` | High-contrast readability. |
| **Text (Secondary)** | `#5d646d` | Metadata, descriptive text. |
| **Text (Muted)** | `#a0aab4` | Hints, decorative labels. |
| **Success** | `#1db954` | Validated data, successful sync. |
| **Error** | `#d73a49` | Critical alerts, signal loss. |

### Typography
- **Display / Headers**: `Bebas Neue` (uppercase, letter-spacing: 0.04em)
- **Technical / Data**: `JetBrains Mono` (monospaced for precise coordinates).

### Geometry & Texture
- **Corners**: Sharp/Rectilinear.
- **Chamfers**: `polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)`
- **Grain Overlay**: A 5% opacity noise overlay (`feTurbulence`) is used globally for texture.
- **Shadows**: `0 8px 32px rgba(0,0,0,0.1)` for soft depth.

---

## 3. Layout Patterns

### Global Shell
- **Header**: Top-anchored (10px margin), 56px height, glassmorphic (`rgba(255,255,255,0.9)`).
- **Ad Strip**: Bottom-anchored (absolute), 60px height.
- **Map Controls**: Bottom-Left, floating above the sheet peek.
- **Primary Action (FAB)**: Bottom-Right, floating above the sheet peek.

### Bottom Sheet (Database)
- **Peek State**: 72px visibility from bottom.
- **Full State**: 75vh maximum height.
- **Action**: Swipe or tap handle to expand.

---

## 4. Component Standards

### Buttons
- **Primary (FAB)**: High visibility, safety orange background, white text, 56px height, asymmetric clip-path.
- **Header Buttons**: 36px square, 1px border, light-on-hover.
- **Control Buttons**: 42px square, white background, high border contrast.

### Cards (Point List)
- 1px border, 4px left-accent border (Safety Orange on hover).
- Content uses high-contrast typography and mono labels.

### Toasts
- Left-bordered with the status color.
- Uppercase technical messaging (e.g., `SIGNAL_LOCKED`, `ENTRY_PURGED`).

---

## 5. Agent Instructions
When creating new components or modifying the UI:
1. Always use CSS variables.
2. Maintain the **uppercase display** for all headers.
3. Ensure all icons are from Font Awesome 6.
4. Keep the "Utility" terminology (e.g., `SCANNING`, `COMMITTED`, `SYSTEM_SYNC`).
5. Never use generic rounded corners (radius > 4px).
