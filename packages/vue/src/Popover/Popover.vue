<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted, nextTick, type CSSProperties } from 'vue'
import type { PopoverProps } from './types'

interface Props {
    placement?: PopoverProps['placement']
    trigger?: PopoverProps['trigger']
    title?: string
    width?: number | string
    offset?: number
    modelValue?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    placement: 'bottom',
    trigger: 'click',
    title: '',
    width: 200,
    offset: 8,
    modelValue: undefined
})

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'open'): void
    (e: 'close'): void
}>()

const isOpen = ref(false)
const triggerRef = ref<HTMLElement | null>(null)
const popoverRef = ref<HTMLElement | null>(null)
const popoverStyle = ref<CSSProperties>({})
let hoverTimeout: ReturnType<typeof setTimeout> | null = null

const controlled = computed(() => props.modelValue !== undefined)
const visible = computed(() => controlled.value ? props.modelValue : isOpen.value)

const popoverClasses = computed(() => [
    'k-popover',
    `k-popover--${props.placement}`
])

const popoverWidth = computed(() => 
    typeof props.width === 'number' ? `${props.width}px` : props.width
)

const setOpen = (value: boolean) => {
    if (controlled.value) {
        emit('update:modelValue', value)
    } else {
        isOpen.value = value
    }
}

const toggle = () => (visible.value ? hide() : show())

const show = () => {
    setOpen(true)
    emit('open')
}

const hide = () => {
    setOpen(false)
    emit('close')
}

const calculatePosition = (): CSSProperties => {
    if (!triggerRef.value || !popoverRef.value) return {}

    const triggerRect = triggerRef.value.getBoundingClientRect()
    const popoverEl = popoverRef.value
    const offset = props.offset
    const scrollY = window.scrollY
    const scrollX = window.scrollX

    let top = 0
    let left = 0

    switch (props.placement) {
        case 'bottom':
            top = triggerRect.bottom + offset + scrollY
            left = triggerRect.left + triggerRect.width / 2 - popoverEl.offsetWidth / 2 + scrollX
            break
        case 'top':
            top = triggerRect.top - popoverEl.offsetHeight - offset + scrollY
            left = triggerRect.left + triggerRect.width / 2 - popoverEl.offsetWidth / 2 + scrollX
            break
        case 'left':
            top = triggerRect.top + triggerRect.height / 2 - popoverEl.offsetHeight / 2 + scrollY
            left = triggerRect.left - popoverEl.offsetWidth - offset + scrollX
            break
        case 'right':
            top = triggerRect.top + triggerRect.height / 2 - popoverEl.offsetHeight / 2 + scrollY
            left = triggerRect.right + offset + scrollX
            break
    }

    return {
        position: 'absolute',
        top: `${top}px`,
        left: `${left}px`,
        width: popoverWidth.value
    }
}

const updatePosition = async () => {
    if (!visible.value) return
    await nextTick()
    popoverStyle.value = calculatePosition()
}

const onClickOutside = (event: MouseEvent) => {
    if (!visible.value) return
    if (
        triggerRef.value?.contains(event.target as Node) ||
        popoverRef.value?.contains(event.target as Node)
    ) return
    hide()
}

const onTriggerClick = (event: MouseEvent) => {
    event.stopPropagation()
    if (props.trigger === 'click') toggle()
}

const onTriggerMouseEnter = () => {
    if (props.trigger !== 'hover') return
    if (hoverTimeout) {
        clearTimeout(hoverTimeout)
        hoverTimeout = null
    }
    show()
}

const onTriggerMouseLeave = () => {
    if (props.trigger !== 'hover') return
    hoverTimeout = setTimeout(() => hide(), 100)
}

const onPopoverMouseEnter = () => {
    if (props.trigger !== 'hover') return
    if (hoverTimeout) {
        clearTimeout(hoverTimeout)
        hoverTimeout = null
    }
}

const onPopoverMouseLeave = () => {
    if (props.trigger !== 'hover') return
    hoverTimeout = setTimeout(() => hide(), 100)
}

watch(visible, updatePosition)

onMounted(() => {
    document.addEventListener('click', onClickOutside, true)
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition, true)
})

onUnmounted(() => {
    document.removeEventListener('click', onClickOutside, true)
    window.removeEventListener('scroll', updatePosition, true)
    window.removeEventListener('resize', updatePosition, true)
    if (hoverTimeout) clearTimeout(hoverTimeout)
})
</script>

<template>
    <div class="k-popover-wrapper" ref="triggerRef">
        <div 
            class="k-popover-trigger"
            @click="onTriggerClick"
            @mouseenter="onTriggerMouseEnter"
            @mouseleave="onTriggerMouseLeave"
        >
            <slot />
        </div>
        
        <Teleport to="body">
            <Transition name="k-popover">
                <div
                    v-if="visible"
                    ref="popoverRef"
                    :class="popoverClasses"
                    :style="popoverStyle"
                    @mouseenter="onPopoverMouseEnter"
                    @mouseleave="onPopoverMouseLeave"
                    role="dialog"
                    aria-modal="false"
                >
                    <div class="k-popover-arrow" />
                    <div v-if="title" class="k-popover-title">{{ title }}</div>
                    <div class="k-popover-content">
                        <slot name="content" />
                    </div>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

<style scoped>
.k-popover-wrapper {
    position: relative;
    display: inline-block;
}

.k-popover-trigger {
    display: inline-block;
}

.k-popover {
    z-index: var(--k-z-popover);
    background-color: var(--k-white);
    border-radius: 8px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.05);
    padding: 12px;
}

.dark .k-popover {
    background-color: var(--k-zinc-800);
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1);
}

.k-popover-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--k-zinc-900);
    margin-bottom: 8px;
}

.dark .k-popover-title {
    color: var(--k-zinc-100);
}

.k-popover-content {
    font-size: 13px;
    color: var(--k-zinc-600);
    line-height: 1.5;
}

.dark .k-popover-content {
    color: var(--k-zinc-400);
}

.k-popover-arrow {
    position: absolute;
    width: 8px;
    height: 8px;
    background-color: var(--k-white);
    transform: rotate(45deg);
    border: 1px solid rgba(0, 0, 0, 0.05);
}

.dark .k-popover-arrow {
    background-color: var(--k-zinc-800);
    border-color: rgba(255, 255, 255, 0.1);
}

/* Arrow positions */
.k-popover--bottom .k-popover-arrow {
    top: -4px;
    left: 50%;
    margin-left: -4px;
}

.k-popover--top .k-popover-arrow {
    bottom: -4px;
    left: 50%;
    margin-left: -4px;
}

.k-popover--left .k-popover-arrow {
    right: -4px;
    top: 50%;
    margin-top: -4px;
}

.k-popover--right .k-popover-arrow {
    left: -4px;
    top: 50%;
    margin-top: -4px;
}

/* Transitions */
.k-popover-enter-active,
.k-popover-leave-active {
    transition: opacity 0.15s ease, transform 0.15s ease;
}

.k-popover-enter-from,
.k-popover-leave-to {
    opacity: 0;
}

.k-popover--bottom.k-popover-enter-from,
.k-popover--bottom.k-popover-leave-to {
    transform: translateY(-4px);
}

.k-popover--top.k-popover-enter-from,
.k-popover--top.k-popover-leave-to {
    transform: translateY(4px);
}

.k-popover--left.k-popover-enter-from,
.k-popover--left.k-popover-leave-to {
    transform: translateX(4px);
}

.k-popover--right.k-popover-enter-from,
.k-popover--right.k-popover-leave-to {
    transform: translateX(-4px);
}
</style>
