import type { Component } from 'vue'

import ToggleDemo from '../components/demos/ToggleDemo.vue'
import SelectDemo from '../components/demos/SelectDemo.vue'
import RichTextDemo from '../components/demos/RichTextDemo.vue'
import InputDemo from '../components/demos/InputDemo.vue'
import DatePickerDemo from '../components/demos/DatePickerDemo.vue'
import SeparatorDemo from '../components/demos/SeparatorDemo.vue'
import TooltipDemo from '../components/demos/TooltipDemo.vue'
import NotificationDemo from '../components/demos/NotificationDemo.vue'
import SearchSelectDemo from '../components/demos/SearchSelectDemo.vue'
import MultiSelectDemo from '../components/demos/MultiSelectDemo.vue'
import LabelDemo from '../components/demos/LabelDemo.vue'
import CarouselDemo from '../components/demos/CarouselDemo.vue'
import ModalWindowDemo from '../components/demos/ModalWindowDemo.vue'
import ButtonDemo from '../components/demos/ButtonDemo.vue'
import TableDemo from '../components/demos/TableDemo.vue'
import CardDemo from '../components/demos/CardDemo.vue'
import PageLayoutDemo from '../components/demos/PageLayoutDemo.vue'
import ModalConfirmDemo from '../components/demos/ModalConfirmDemo.vue'
import TeleportedTooltipDemo from '../components/demos/TeleportedTooltipDemo.vue'
import AccordionDemo from '../components/demos/AccordionDemo.vue'
import BadgeDemo from '../components/demos/BadgeDemo.vue'
import SpinnerDemo from '../components/demos/SpinnerDemo.vue'
import PopoverDemo from '../components/demos/PopoverDemo.vue'
import ImagePickerDemo from '../components/demos/ImagePickerDemo.vue'
import CircleBlockDemo from '../components/demos/CircleBlockDemo.vue'
import DropdowmMenuDemo from '../components/demos/DropdownMenuDemo.vue'
import ContextMenuDemo from '../components/demos/ContextMenuDemo.vue'

export const componentDemos: Record<string, Component> = {
  Toggle: ToggleDemo,
  Select: SelectDemo,
  MultiSelect: MultiSelectDemo,
  RichText: RichTextDemo,
  Input: InputDemo,
  DatePicker: DatePickerDemo,
  Separator: SeparatorDemo,
  Tooltip: TooltipDemo,
  TeleportedTooltip: TeleportedTooltipDemo,
  Notification: NotificationDemo,
  SearchSelect: SearchSelectDemo,
  Label: LabelDemo,
  Carousel: CarouselDemo,
  ModalWindow: ModalWindowDemo,
  ModalConfirm: ModalConfirmDemo,
  Button: ButtonDemo,
  Table: TableDemo,
  Card: CardDemo,
  PageLayout: PageLayoutDemo,
  Accordion: AccordionDemo,
  Badge: BadgeDemo,
  Spinner: SpinnerDemo,
  Popover: PopoverDemo,
  ImagePicker: ImagePickerDemo,
  CircleBlock: CircleBlockDemo,
  DropdownMenu: DropdowmMenuDemo,
  ContextMenu: ContextMenuDemo
}