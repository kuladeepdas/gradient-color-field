# Gradient Color Field

A Craft CMS field type for building gradients with multiple color stops.

## Features

- Gradient preview circle in field input
- Linear/radial gradient type
- Multiple draggable stops
- Per-stop color + opacity editing
- Uses a built-in modal color picker

## Installation

```bash
composer require kdgraphics/gradient-color-field
php craft plugin/install gradient-color-field
```

## Usage

Create a field of type **Gradient Color** and assign it to your field layout.
The field stores a JSON value including:

- `type` (`linear` or `radial`)
- `angle` (for linear)
- `stops[]` (`position`, `color`, `alpha`)

You can output the stored JSON directly in Twig from the field value.
