---
name: Tactile Sensory System
colors:
  surface: '#f6fafe'
  surface-dim: '#d6dade'
  surface-bright: '#f6fafe'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f4f8'
  surface-container: '#eaeef2'
  surface-container-high: '#e4e9ed'
  surface-container-highest: '#dfe3e7'
  on-surface: '#171c1f'
  on-surface-variant: '#3c4a46'
  inverse-surface: '#2c3134'
  inverse-on-surface: '#edf1f5'
  outline: '#6b7a76'
  outline-variant: '#bacac5'
  surface-tint: '#006b5f'
  primary: '#006b5f'
  on-primary: '#ffffff'
  primary-container: '#2dd4bf'
  on-primary-container: '#00574d'
  inverse-primary: '#3cddc7'
  secondary: '#0058be'
  on-secondary: '#ffffff'
  secondary-container: '#2170e4'
  on-secondary-container: '#fefcff'
  tertiary: '#9d4300'
  on-tertiary: '#ffffff'
  tertiary-container: '#ffaa7d'
  on-tertiary-container: '#823600'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#62fae3'
  primary-fixed-dim: '#3cddc7'
  on-primary-fixed: '#00201c'
  on-primary-fixed-variant: '#005047'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#ffdbca'
  tertiary-fixed-dim: '#ffb690'
  on-tertiary-fixed: '#341100'
  on-tertiary-fixed-variant: '#783200'
  background: '#f6fafe'
  on-background: '#171c1f'
  surface-variant: '#dfe3e7'
typography:
  display-lg:
    fontFamily: Quicksand
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Quicksand
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Quicksand
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  title-md:
    fontFamily: Quicksand
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Quicksand
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 26px
  label-caps:
    fontFamily: Quicksand
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 20px
    letterSpacing: 0.05em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  unit: 8px
  container-padding: 24px
  gutter: 16px
  node-gap: 12px
---

## Brand & Style

The design system is centered on tactile satisfaction and sensory delight. It targets casual gamers and users seeking stress relief through a highly interactive, "squishy" interface. The aesthetic blends **Neomorphism** for physical depth with **Glassmorphism** for surface clarity, creating a UI that feels like a pressurized, translucent toy.

The emotional response should be one of calm engagement. Every element is designed to look touchable, inviting the user to interact with surfaces that react like physical materials—compressing under pressure and glowing with internal light.

## Colors

The palette balances "Zen" tranquility with "Blitz" energy.
- **Primary (Zen Teal):** Used for the main bubble nodes and primary actions to promote a sense of calm.
- **Secondary (Zen Blue):** Used for background depth and secondary navigational elements.
- **Tertiary (Blitz Orange):** Used for modifiers, power-ups, and high-energy game states.
- **Danger (Popped Red):** Reserved for obstacles, time warnings, and critical UI feedback.
- **Surface Neutrals:** Soft, cool-toned off-whites and greys are used to create the neomorphic base shadows and highlights.

Apply subtle linear gradients (top-left to bottom-right) to all interactive surfaces to enhance the 3D effect.

## Typography

This design system utilizes **Quicksand** exclusively to maintain a soft, approachable character. The rounded terminals of the typeface mirror the UI's physical shapes. 

Headlines use heavy weights and tight tracking to feel "inflated." Body text remains legible with medium weights, while labels use uppercase styling to provide a clear hierarchy against the vibrant, decorative background elements.

## Layout & Spacing

The layout follows a **fluid, contextual model** rather than a rigid grid, allowing bubbles and UI panels to float organically. 
- **HUD elements** are anchored to safe-area margins (24px) with high-z-index layering.
- **Game Grid:** Uses a flexible flexbox/grid container with a 12px gap to allow bubbles room to "breathe" and expand slightly on hover.
- **Responsibility:** On mobile, the HUD collapses into a simplified top bar, and the main interaction area scales to maximize the touch targets of the BubbleNodes.

## Elevation & Depth

Depth is the core of this system. It uses a hybrid of neomorphic and glassmorphic techniques:
- **Neomorphic Base:** Buttons and cards use dual shadows—a light highlight (White, 80% opacity) on the top-left and a soft drop shadow (Secondary color, 20% opacity) on the bottom-right.
- **Bubble Pressurization:** BubbleNodes use an **inner shadow** to create a concave/convex look, simulating the tension of a plastic surface.
- **Glassmorphism:** HUD panels and overlays use a backdrop-blur (12px to 20px) with a semi-transparent white stroke (1px, 20% opacity) to simulate frosted glass. This ensures legibility over the colorful, chaotic game field.

## Shapes

The shape language is ultra-rounded. 
- **Standard UI elements** (Cards, Selectors) use `rounded-xl` (1.5rem).
- **Interactive Nodes and Buttons** use the **Pill-shaped** (Full) setting to maximize the "bubble" metaphor.
- **Avoid Sharp Angles:** No element in this design system should have a corner radius less than 12px, as sharp edges break the soft, sensory immersion.

## Components

### BubbleNode
The central interactive element.
- **Intact:** High gloss, prominent inner-top highlight, and a subtle outer glow matching the primary color.
- **Hover/Touch-Down:** The element scales down to 95%, the inner shadow deepens to show compression, and the outer glow increases in intensity.
- **Popped:** Opacity drops to 30%, the 3D shadows are removed (flattened), and the element scales up to 110% briefly before settling.

### Mode Selectors
Large, tactile cards. They feature an icon centered within a neomorphic "well." On selection, the card's background shifts from a neutral gradient to a vibrant primary gradient.

### HUD & Panels
Floating glass containers. Use a 1px "inner-glow" border to define the edges. Text within HUDs should use a dark grey or pure white with a subtle drop shadow to pop against the blurred background.

### Tactile Sliders
Track uses an inset shadow (neomorphic well). The thumb is a perfect sphere with high-contrast gloss, making it look like a rolling marble.
