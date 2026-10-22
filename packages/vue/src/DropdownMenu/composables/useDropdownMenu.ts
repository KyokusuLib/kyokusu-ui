import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import type { DropdownPlacement } from '../types'

interface UseDropdownMenuOptions {
    placement: DropdownPlacement
    offset: number
    width: number | string
    trigger: 'click' | 'hover'
    onOpen?: () => void
    onClose?: () => void
}

export interface UseDropdownMenuReturn {
    isOpen: ReturnType<typeof ref<boolean>>
    triggerRef: ReturnType<typeof ref<HTMLElement | null>>
    menuRef: ReturnType<typeof ref<HTMLElement | null>>
    menuStyle: ReturnType<typeof ref<Record<string, string>>>
    show: () => void
    hide: () => void
    toggle: () => void
    onTriggerClick: (event: MouseEvent) => void
    onTriggerMouseEnter: () => void
    onTriggerMouseLeave: () => void
    onMenuMouseEnter: () => void
    onMenuMouseLeave: () => void
}

export function useDropdownMenu(options: UseDropdownMenuOptions): UseDropdownMenuReturn {
    const isOpen = ref(false)
    const triggerRef = ref<HTMLElement | null>(null)
    const menuRef = ref<HTMLElement | null>(null)
    const menuStyle = ref<Record<string, string>>({})
    let hoverTimeout: ReturnType<typeof setTimeout> | null = null

    const menuWidth = computed(() =>
        typeof options.width === 'number' ? `${options.width}px` : options.width
    )

    const show = () => {
        if (isOpen.value) return
        if (hoverTimeout) {
            clearTimeout(hoverTimeout)
            hoverTimeout = null
        }
        isOpen.value = true
        options.onOpen?.()
    }

    const hide = () => {
        if (!isOpen.value) return
        isOpen.value = false
        options.onClose?.()
    }

    const toggle = () => isOpen.value ? hide() : show()

    const calculatePosition = (): Record<string, string> => {
        if (!triggerRef.value || !menuRef.value) return {}

        const triggerRect = triggerRef.value.getBoundingClientRect()
        const menuEl = menuRef.value
        const offset = options.offset
        const scrollY = window.scrollY
        const scrollX = window.scrollX

        let top = 0
        let left = 0

        switch (options.placement) {
            case 'bottom-start':
                top = triggerRect.bottom + offset + scrollY
                left = triggerRect.left + scrollX
                break
            case 'bottom-end':
                top = triggerRect.bottom + offset + scrollY
                left = triggerRect.right - menuEl.offsetWidth + scrollX
                break
            case 'top-start':
                top = triggerRect.top - menuEl.offsetHeight - offset + scrollY
                left = triggerRect.left + scrollX
                break
            case 'top-end':
                top = triggerRect.top - menuEl.offsetHeight - offset + scrollY
                left = triggerRect.right - menuEl.offsetWidth + scrollX
                break
        }

        return {
            position: 'absolute',
            top: `${top}px`,
            left: `${left}px`,
            width: menuWidth.value
        }
    }

    const updatePosition = async () => {
        if (!isOpen.value) return
        await nextTick()
        menuStyle.value = calculatePosition()
    }

    const onTriggerClick = (event: MouseEvent) => {
        event.stopPropagation()
        if (options.trigger === 'click') toggle()
    }

    const onTriggerMouseEnter = () => {
        if (options.trigger !== 'hover') return
        show()
    }

    const onTriggerMouseLeave = () => {
        if (options.trigger !== 'hover') return
        hoverTimeout = setTimeout(() => hide(), 150)
    }

    const onMenuMouseEnter = () => {
        if (options.trigger !== 'hover') return
        if (hoverTimeout) {
            clearTimeout(hoverTimeout)
            hoverTimeout = null
        }
    }

    const onMenuMouseLeave = () => {
        if (options.trigger !== 'hover') return
        hoverTimeout = setTimeout(() => hide(), 150)
    }

    const onClickOutside = (event: MouseEvent) => {
        if (!isOpen.value) return
        if (
            triggerRef.value?.contains(event.target as Node) ||
            menuRef.value?.contains(event.target as Node) ||
            (event.target as HTMLElement)?.closest?.('.k-dropdown-menu')
        ) return
        hide()
    }

    const onKeydown = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && isOpen.value) {
            hide()
            triggerRef.value?.focus()
        }
    }

    watch(isOpen, updatePosition)

    onMounted(() => {
        document.addEventListener('click', onClickOutside, true)
        document.addEventListener('keydown', onKeydown, true)
        window.addEventListener('scroll', updatePosition, true)
        window.addEventListener('resize', updatePosition, true)
    })

    onUnmounted(() => {
        document.removeEventListener('click', onClickOutside, true)
        document.removeEventListener('keydown', onKeydown, true)
        window.removeEventListener('scroll', updatePosition, true)
        window.removeEventListener('resize', updatePosition, true)
        if (hoverTimeout) clearTimeout(hoverTimeout)
    })

    return {
        isOpen,
        triggerRef,
        menuRef,
        menuStyle,
        show,
        hide,
        toggle,
        onTriggerClick,
        onTriggerMouseEnter,
        onTriggerMouseLeave,
        onMenuMouseEnter,
        onMenuMouseLeave
    }
}
