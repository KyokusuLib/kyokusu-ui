import { 
  PhToggleLeft, 
  PhCursorClick, 
  PhTextT, 
  PhListDashes,
  PhTextAa,
  PhTimer,
  PhSelectionAll,
  PhLineSegment,
  PhNotification,
  PhToolbox,
  PhSubtitles,
  PhMagnifyingGlass,
  PhBrowser,
  PhQuestion,
  PhTable,
  PhCards,
  PhLayout,
  PhArrowFatUp,
  PhListPlus,
  PhList,
  PhMedal,
  PhCircleNotch,
  PhChatCircleText,
  PhImage,
  PhCircle,
  PhMouseRightClick
} from '@phosphor-icons/vue'
import type { Component } from 'vue'

export interface NavigationItem {
  id: string
  label: string
  icon: Component
  disabled?: boolean
}

export interface NavigationGroup {
  label: string
  items: NavigationItem[]
}

export const navigationGroups: NavigationGroup[] = [
  {
    label: 'Form',
    items: [
      { id: 'Input', label: 'Input', icon: PhTextT },
      { id: 'Select', label: 'Select', icon: PhListDashes },
      { id: 'MultiSelect', label: 'MultiSelect', icon: PhSelectionAll },
      { id: 'SearchSelect', label: 'SearchSelect', icon: PhMagnifyingGlass },
      { id: 'DatePicker', label: 'DatePicker', icon: PhTimer },
      { id: 'Table', label: 'Table', icon: PhTable },
      { id: 'ImagePicker', label: 'ImagePicker', icon: PhImage }
    ]
  },
  {
    label: 'Content',
    items: [
      { id: 'Card', label: 'Card', icon: PhCards },
      { id: 'RichText', label: 'Rich Text', icon: PhTextAa },
      { id: 'Label', label: 'Label', icon: PhSubtitles },
      { id: 'Separator', label: 'Separator', icon: PhLineSegment },
      { id: 'Carousel', label: 'Carousel', icon: PhLineSegment },
      { id: 'ModalWindow', label: 'Modal Window', icon: PhBrowser },
      { id: 'ModalConfirm', label: 'Modal Confirm', icon: PhQuestion },
      { id: 'PageLayout', label: 'PageLayout', icon: PhLayout },
      { id: 'Accordion', label: 'Accordion', icon: PhListPlus },
      { id: 'Badge', label: 'Badge', icon: PhMedal },
      { id: 'CircleBlock', label: 'CircleBlock', icon: PhCircle },
      { id: 'DropdownMenu', label: 'DropdownMenu', icon: PhList },
      { id: 'ContextMenu', label: 'ContextMenu', icon: PhMouseRightClick }
    ]
  },
  {
    label: 'Controls',
    items: [
      { id: 'Toggle', label: 'Toggle', icon: PhToggleLeft },
      { id: 'Button', label: 'Button', icon: PhCursorClick },
      { id: 'Tooltip', label: 'Tooltip', icon: PhToolbox },
      { id: 'TeleportedTooltip', label: 'Tele. Tooltip', icon: PhArrowFatUp },
      { id: 'Notification', label: 'Notification', icon: PhNotification },
      { id: 'Spinner', label: 'Spinner', icon: PhCircleNotch },
      { id: 'Popover', label: 'Popover', icon: PhChatCircleText }
    ]
  }
]