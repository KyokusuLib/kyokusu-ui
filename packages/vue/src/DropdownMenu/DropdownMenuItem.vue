<script setup lang="ts">
import { ref, computed, watch, inject, onUnmounted, type Ref, type CSSProperties } from 'vue'
import { PhCaretRight, PhCheck, PhCircle } from '@phosphor-icons/vue'
import type { MenuItem, SelectionType } from './types'

interface Props {
    item: MenuItem
    trigger?: 'click' | 'hover'
    selectionType?: SelectionType
    isSelected?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    trigger: 'click',
    selectionType: 'none',
    isSelected: false
})

const emit = defineEmits<{
    (e: 'select', item: MenuItem): void
}>()

const hasSubmenu = computed(() => props.item.submenu && props.item.submenu.length > 0)
const isSubmenuOpen = ref(false)
const itemRef = ref<HTMLElement | null>(null)
const submenuRef = ref<HTMLElement | null>(null)
const submenuStyle = ref<CSSProperties>({})
let hoverTimeout: ReturnType<typeof setTimeout> | null = null

const openSubmenuCount = inject<Ref<number>>('dropdown-open-submenu-count', ref(0))!

watch(isSubmenuOpen, (open) => {
    openSubmenuCount.value += open ? 1 : -1
})

const showIndicator = computed(() => {
    if (props.selectionType === 'none') return false
    return props.item.checked || props.isSelected
})

const calculateSubmenuPosition = (): CSSProperties => {
    if (!itemRef.value || !submenuRef.value) return {}

    const parentMenu = itemRef.value.parentElement as HTMLElement
    const parentRect = parentMenu.getBoundingClientRect()
    const itemRect = itemRef.value.getBoundingClientRect()
    const scrollY = window.scrollY
    const scrollX = window.scrollX

    return {
        position: 'absolute',
        top: `${itemRect.top + scrollY}px`,
        left: `${parentRect.right + 1 + scrollX}px`
    }
}

const updateSubmenuPosition = async () => {
    if (!isSubmenuOpen.value) return
    const { nextTick } = await import('vue')
    await nextTick()
    submenuStyle.value = calculateSubmenuPosition()
}

const showSubmenu = () => {
    if (!hasSubmenu.value) return
    if (hoverTimeout) {
        clearTimeout(hoverTimeout)
        hoverTimeout = null
    }
    isSubmenuOpen.value = true
}

const hideSubmenu = () => {
    if (!hasSubmenu.value) return
    if (openSubmenuCount.value > 1) return
    hoverTimeout = setTimeout(() => {
        isSubmenuOpen.value = false
    }, 150)
}

const onItemClick = () => {
    if (props.item.disabled) return
    if (hasSubmenu.value) {
        isSubmenuOpen.value = !isSubmenuOpen.value
        return
    }
    if (props.item.action) {
        props.item.action()
    }
    emit('select', props.item)
}

const onItemMouseEnter = () => {
    if (hasSubmenu.value) {
        showSubmenu()
    }
}

const onItemMouseLeave = () => {
    if (hasSubmenu.value) {
        hideSubmenu()
    }
}

const onSubmenuMouseEnter = () => {
    if (hoverTimeout) {
        clearTimeout(hoverTimeout)
        hoverTimeout = null
    }
}

const onSubmenuMouseLeave = () => {
    hideSubmenu()
}

const onSubmenuSelect = (item: MenuItem) => {
    emit('select', item)
}

const showSubmenuAndFocus = async () => {
    if (!hasSubmenu.value) return
    showSubmenu()
    const { nextTick } = await import('vue')
    await nextTick()
    submenuRef.value?.querySelector<HTMLElement>('[role="menuitem"]')?.focus()
}

watch(isSubmenuOpen, updateSubmenuPosition)

onUnmounted(() => {
    if (hoverTimeout) clearTimeout(hoverTimeout)
})
</script>

<template>
    <li
        v-if="item.separator"
        class="k-dropdown-separator"
        role="separator"
    />
    <li
        v-else
        ref="itemRef"
        class="k-dropdown-item"
        :class="{
            'k-dropdown-item--disabled': item.disabled,
            'k-dropdown-item--has-submenu': hasSubmenu,
            'k-dropdown-item--selected': showIndicator
        }"
        role="menuitem"
        tabindex="-1"
        :aria-disabled="item.disabled || undefined"
        :aria-haspopup="hasSubmenu ? 'menu' : undefined"
        :aria-expanded="hasSubmenu ? isSubmenuOpen : undefined"
        @click="onItemClick"
        @mouseenter="onItemMouseEnter"
        @mouseleave="onItemMouseLeave"
        @keydown.enter.prevent.stop="onItemClick"
        @keydown.space.prevent.stop="onItemClick"
        @keydown.right.prevent.stop="showSubmenuAndFocus"
        @keydown.left.prevent.stop="isSubmenuOpen = false"
    >
        <span v-if="selectionType === 'checkbox'" class="k-dropdown-indicator">
            <PhCheck v-if="showIndicator" :size="14" weight="bold" />
        </span>
        <span v-else-if="selectionType === 'radio'" class="k-dropdown-indicator">
            <PhCircle v-if="showIndicator" :size="8" weight="fill" class="k-dropdown-radio-dot" />
        </span>
        <component v-if="item.icon" :is="item.icon" :size="16" weight="duotone" class="k-dropdown-item-icon" />
        <span class="k-dropdown-item-label">{{ item.label }}</span>
        <PhCaretRight v-if="hasSubmenu" :size="14" class="k-dropdown-item-arrow" />

        <Teleport to="body">
            <Transition name="k-dropdown-submenu">
                <ul
                    v-if="isSubmenuOpen && hasSubmenu"
                    ref="submenuRef"
                    class="k-dropdown-menu k-dropdown-submenu"
                    :style="submenuStyle"
                    role="menu"
                    @mouseenter="onSubmenuMouseEnter"
                    @mouseleave="onSubmenuMouseLeave"
                >
                    <DropdownMenuItem
                        v-for="subItem in item.submenu"
                        :key="subItem.id"
                        :item="subItem"
                        :trigger="trigger"
                        :selection-type="selectionType"
                        :is-selected="subItem.checked"
                        @select="onSubmenuSelect"
                    />
                </ul>
            </Transition>
        </Teleport>
    </li>
</template>

<style scoped>
.k-dropdown-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    font-size: 13px;
    color: var(--k-zinc-900);
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.1s ease;
    user-select: none;
    white-space: nowrap;
}

.dark .k-dropdown-item {
    color: var(--k-zinc-100);
}

.k-dropdown-item:hover:not(.k-dropdown-item--disabled) {
    background-color: var(--k-zinc-350);
}

.dark .k-dropdown-item:hover:not(.k-dropdown-item--disabled) {
    background-color: var(--k-zinc-700);
}

.k-dropdown-item--disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.k-dropdown-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    color: var(--k-zinc-900);
}

.dark .k-dropdown-indicator {
    color: var(--k-zinc-100);
}

.k-dropdown-radio-dot {
    color: var(--k-zinc-900);
}

.dark .k-dropdown-radio-dot {
    color: var(--k-zinc-100);
}

.k-dropdown-item-icon {
    flex-shrink: 0;
    color: var(--k-zinc-500);
}

.dark .k-dropdown-item-icon {
    color: var(--k-zinc-400);
}

.k-dropdown-item-label {
    flex: 1;
}

.k-dropdown-item-arrow {
    flex-shrink: 0;
    color: var(--k-zinc-500);
}

.dark .k-dropdown-item-arrow {
    color: var(--k-zinc-400);
}

.k-dropdown-separator {
    height: 1px;
    background-color: var(--k-zinc-200);
    margin: 4px 8px;
}

.dark .k-dropdown-separator {
    background-color: var(--k-zinc-700);
}

.k-dropdown-submenu {
    z-index: var(--k-z-submenu);
    background-color: var(--k-white);
    border-radius: 8px;
    border : 1px solid var(--k-neutral-900);
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.05);
    padding: 4px;
    list-style: none;
    margin: 0;
}

.dark .k-dropdown-submenu {
    background-color: var(--k-zinc-800);
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1);
    border-color: rgba(211, 211, 211, 0.4);
}

.k-dropdown-submenu-enter-active,
.k-dropdown-submenu-leave-active {
    transition: opacity 0.12s ease, transform 0.12s ease;
}

.k-dropdown-submenu-enter-from,
.k-dropdown-submenu-leave-to {
    opacity: 0;
    transform: translateX(-4px);
}
</style>
