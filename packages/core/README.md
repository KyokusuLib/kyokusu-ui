# @kyokusu-ui/core

Vanilla JS components and styles for Kyokusu UI. Framework-agnostic, class-based API.

## Install

```bash
npm install @kyokusu-ui/core
```

The stylesheet is a real CSS file (no runtime injection):

```js
import '@kyokusu-ui/core/style.css'
```

All components accept a `locale` option (`'en'`, `'ru'`) for built-in UI
strings. English is the default.

```js
import '@kyokusu-ui/core/style.css'
```

## Usage

### Button

```js
import { Button } from '@kyokusu-ui/core'

const btn = new Button('#root', {
  variant: 'primary',
  size: 'md',
  text: 'Click me',
  onClick: () => console.log('clicked')
})
```

### Input

```js
import { Input } from '@kyokusu-ui/core'

new Input('#root', {
  label: 'Email',
  type: 'email',
  placeholder: 'user@example.com',
  onChange: (val) => console.log(val)
})
```

### Select

```js
import { Select } from '@kyokusu-ui/core'

new Select('#root', {
  label: 'Country',
  placeholder: 'Pick one',
  options: [
    { value: 'us', label: 'United States' },
    { value: 'jp', label: 'Japan' }
  ],
  onChange: (val) => console.log(val)
})
```

### SearchSelect

```js
import { SearchSelect } from '@kyokusu-ui/core'

new SearchSelect('#root', {
  label: 'Search',
  options: [
    { value: '1', label: 'React' },
    { value: '2', label: 'Vue' },
    { value: '3', label: 'Svelte' }
  ],
  onChange: (val) => console.log(val)
})
```

### MultiSelect

```js
import { MultiSelect } from '@kyokusu-ui/core'

new MultiSelect('#root', {
  label: 'Frameworks',
  options: [
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue' },
    { value: 'svelte', label: 'Svelte' }
  ],
  onChange: (vals) => console.log(vals)
})
```

### Toggle

```js
import { Toggle } from '@kyokusu-ui/core'

new Toggle('#root', {
  label: 'Dark mode',
  onChange: (checked) => console.log(checked)
})
```

### DatePicker

```js
import { DatePicker } from '@kyokusu-ui/core'

new DatePicker('#root', {
  label: 'Birthday',
  type: 'date',
  onChange: (val) => console.log(val)
})
```

### Accordion

```js
import { Accordion } from '@kyokusu-ui/core'

new Accordion('#root', {
  multiple: true,
  items: [
    { title: 'Section 1', content: 'Content here' },
    { title: 'Section 2', content: 'More content' }
  ]
})
```

### Table

```js
import { Table } from '@kyokusu-ui/core'

new Table('#root', {
  headers: [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'role', label: 'Role' }
  ],
  items: [
    { name: 'Alice', role: 'Engineer' },
    { name: 'Bob', role: 'Designer' }
  ],
  searchable: true
})
```

### Card

```js
import { Card } from '@kyokusu-ui/core'

new Card('#root', {
  variant: 'default',
  padding: 'md',
  shadow: true
})
```

### Badge

```js
import { Badge } from '@kyokusu-ui/core'

new Badge('#root', {
  text: 'New',
  variant: 'destructive',
  size: 'sm'
})
```

### Spinner

```js
import { Spinner } from '@kyokusu-ui/core'

new Spinner('#root', {
  size: 'md',
  variant: 'primary'
})
```

### Tooltip

```js
import { Tooltip } from '@kyokusu-ui/core'

new Tooltip('#root', {
  content: 'Helpful tip',
  placement: 'top'
})
```

### Popover

```js
import { Popover } from '@kyokusu-ui/core'

new Popover('#root', {
  title: 'Info',
  content: 'Details here',
  trigger: 'click',
  placement: 'bottom'
})
```

### DropdownMenu

```js
import { DropdownMenu } from '@kyokusu-ui/core'

new DropdownMenu('#root', {
  items: [
    { id: 'copy', label: 'Copy' },
    { id: 'sep', label: '', separator: true },
    { id: 'more', label: 'More', submenu: [
      { id: 'archive', label: 'Archive' }
    ]}
  ],
  trigger: 'click',
  onSelect: (item) => console.log(item.id)
})
```

### ContextMenu

A right-click menu for an existing element. It reuses DropdownMenu items,
keyboard navigation, separators and submenus.

```js
import { ContextMenu } from '@kyokusu-ui/core'

const menu = new ContextMenu('#root', {
  items: [
    { id: 'copy', label: 'Copy' },
    { id: 'paste', label: 'Paste', disabled: true },
    { id: 'sep', label: '', separator: true },
    { id: 'share', label: 'Share', submenu: [
      { id: 'link', label: 'Copy link' }
    ]}
  ],
  width: 220,
  onSelect: (item) => console.log(item.id),
  onOpen: ({ x, y }) => console.log(x, y),
  onClose: () => console.log('closed')
})

menu.openAt(120, 80)
menu.close()
menu.destroy()
```

If ContextMenu is the only component you use, import its standalone
stylesheet instead of the full bundle:

```js
import '@kyokusu-ui/core/context-menu.css'
```

### ModalWindow

```js
import { ModalWindow } from '@kyokusu-ui/core'

const modal = new ModalWindow({
  title: 'Confirm',
  content: 'Are you sure?',
  onClose: () => console.log('closed')
})
modal.open()
```

### Notification

```js
import { NotificationManager } from '@kyokusu-ui/core'

const notify = new NotificationManager()
notify.show({ title: 'Done', type: 'success' })
```

### Separator

```js
import { Separator } from '@kyokusu-ui/core'
new Separator('#root')
```

### Label

```js
import { Label } from '@kyokusu-ui/core'
new Label('#root', { text: 'Username', required: true })
```

### RichText

```js
import { RichText } from '@kyokusu-ui/core'
new RichText('#root', { placeholder: 'Write something...' })
```

### Carousel

```js
import { Carousel } from '@kyokusu-ui/core'

new Carousel('#root', {
  items: [
    { type: 'image', src: '/img1.jpg' },
    { type: 'image', src: '/img2.jpg' }
  ],
  autoPlay: true
})
```

### ImagePicker

```js
import { ImagePicker } from '@kyokusu-ui/core'
new ImagePicker('#root', { onChange: (file) => console.log(file) })
```

### CircleBlock

```js
import { CircleBlock } from '@kyokusu-ui/core'
new CircleBlock('#root', { label: 'A', variant: 'primary' })
```

### PageLayout

```js
import { PageLayout } from '@kyokusu-ui/core'
new PageLayout('#root', { title: 'Dashboard' })
```

### TeleportedTooltip

```js
import { TeleportedTooltip } from '@kyokusu-ui/core'
new TeleportedTooltip('#root', { content: 'Teleported tip' })
```

### ModalConfirm

```js
import { ModalConfirm } from '@kyokusu-ui/core'

const confirm = new ModalConfirm({
  title: 'Delete?',
  content: 'This cannot be undone.',
  onConfirm: () => console.log('confirmed')
})
confirm.open()
```

## Migration notes

- Styles are shipped as a real CSS file. Import `@kyokusu-ui/vue/style.css`
  (or `@kyokusu-ui/core/style.css`) once in your application entry point.
  Runtime CSS injection has been removed, which makes the packages SSR-safe.
- `ModalWindow` / `ModalConfirm` no longer accept Tailwind classes in `width`.
  Pass a CSS length (`"32rem"`) or a number of pixels (`512`).
- Built-in UI strings are localised. English is the default; pass
  `locale: 'ru'` in a component's options, e.g.
  `new SearchSelect('#root', { options, locale: 'ru' })`.

## License

MIT
