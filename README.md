# Kyokusu UI

A premium, minimalist, and highly customizable UI component library for Vue 3 and Vanilla JS. Designed with quiet luxury in mind and engineered for high-performance modern web applications.

![Screen](/assets/1.png)

## Features

- **Modern Aesthetic:** Clean, minimalist design with a focus on typography and spacing.
- **Vue 3 & Core:** Optimized components for Vue 3 and a vanilla JS core for other environments.
- **TypeScript First:** Fully typed for a superior developer experience.
- **Customizable:** Easily adaptable styles via CSS variables.
- **Accessible:** Built with accessibility in mind.
- **Icon Support:** Integrated with Phosphor Icons.

## Packages

- `@kyokusu-ui/vue`: Vue 3 components.
- `@kyokusu-ui/core`: Vanilla JS core components and styles.

## Quick Start

### Vue 3

```bash
npm install @kyokusu-ui/vue
```

```vue
<script setup>
import { Button } from '@kyokusu-ui/vue'
</script>

<template>
  <Button variant="primary">Start Building</Button>
</template>
```

Don't forget the stylesheet:

```js
import '@kyokusu-ui/vue/style.css'
```

### Vanilla JS

```bash
npm install @kyokusu-ui/core
```

```javascript
import { DatePicker } from '@kyokusu-ui/core'
import '@kyokusu-ui/core/style.css'

const dp = new DatePicker('#datepicker-root', {
  label: 'Select Date',
  onChange: (val) => console.log(val)
})
```

## Development

This project uses [Turborepo](https://turbo.build/) and [Bun](https://bun.sh/).

```bash
# Install dependencies
bun install

# Start development servers
bun run dev

# Build all packages
bun run build
```

## License

MIT
