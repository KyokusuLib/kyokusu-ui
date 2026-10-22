export type PopoverPlacement = 'top' | 'bottom' | 'left' | 'right'
export type PopoverTrigger = 'click' | 'hover'

export interface PopoverProps {
  placement?: PopoverPlacement
  trigger?: PopoverTrigger
  title?: string
  width?: number | string
  offset?: number
}
