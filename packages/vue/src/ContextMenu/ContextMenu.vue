<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import DropdownMenuItem from '../DropdownMenu/DropdownMenuItem.vue';
import type { MenuItem } from '../DropdownMenu/types';
import type { ContextMenuPosition } from './types';
import { useKyokusuLocale } from '../i18n';

defineOptions({ inheritAttrs: false });

interface Props {
    items: MenuItem[];
    disabled?: boolean;
    width?: number | string;
    locale?: string;
}

const props = withDefaults(defineProps<Props>(), {
    disabled: false,
    width: 200,
});

const emit = defineEmits<{
    (e: 'select', item: MenuItem): void;
    (e: 'open', position: ContextMenuPosition): void;
    (e: 'close'): void;
}>();

const { t } = useKyokusuLocale(() => props.locale);

const areaRef = ref<HTMLElement | null>(null);
const menuRef = ref<HTMLElement | null>(null);
const isOpen = ref(false);
const menuStyle = ref<Record<string, string>>({});
const position = ref<ContextMenuPosition>({ x: 0, y: 0 });
let previouslyFocused: HTMLElement | null = null;

const menuWidth = computed(() =>
    typeof props.width === 'number' ? `${props.width}px` : props.width,
);

const getMenuItems = (): HTMLElement[] => {
    if (!menuRef.value) return [];
    return Array.from(menuRef.value.children).filter(
        (element): element is HTMLElement =>
            element instanceof HTMLElement &&
            element.getAttribute('role') === 'menuitem' &&
            element.getAttribute('aria-disabled') !== 'true',
    );
};

const focusItem = (index: number) => {
    const items = getMenuItems();
    if (items.length === 0) return;
    const next = (index + items.length) % items.length;
    items[next]?.focus();
};

const applyPosition = () => {
    if (!menuRef.value) return;

    const margin = 8;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const width = menuRef.value.offsetWidth;
    const height = menuRef.value.offsetHeight;

    let left = position.value.x + scrollX;
    let top = position.value.y + scrollY;

    if (position.value.x + width + margin > window.innerWidth) {
        left = Math.max(scrollX + margin, scrollX + window.innerWidth - width - margin);
    }
    if (position.value.y + height + margin > window.innerHeight) {
        top = Math.max(scrollY + margin, scrollY + window.innerHeight - height - margin);
    }

    menuStyle.value = {
        position: 'absolute',
        top: `${top}px`,
        left: `${left}px`,
        width: menuWidth.value,
    };
};

const close = (restoreFocus = true) => {
    if (!isOpen.value) return;
    isOpen.value = false;
    emit('close');

    const element = previouslyFocused;
    previouslyFocused = null;
    if (restoreFocus && element?.isConnected) element.focus();
};

const openAt = async (x: number, y: number) => {
    if (props.disabled) return;

    const wasOpen = isOpen.value;
    if (!wasOpen) {
        previouslyFocused =
            document.activeElement instanceof HTMLElement ? document.activeElement : null;
    }

    position.value = { x, y };
    menuStyle.value = {
        position: 'absolute',
        top: `${y + window.scrollY}px`,
        left: `${x + window.scrollX}px`,
        width: menuWidth.value,
    };
    isOpen.value = true;

    if (!wasOpen) emit('open', { x, y });

    await nextTick();
    applyPosition();
    focusItem(0);
};

const onContextMenu = (event: MouseEvent) => {
    if (props.disabled) return;

    event.preventDefault();
    event.stopPropagation();

    const target = event.target as HTMLElement | null;
    const targetRect = target?.getBoundingClientRect?.();
    const x = event.clientX || targetRect?.left || 0;
    const y = event.clientY || targetRect?.top || 0;

    void openAt(x, y);
};

const onSelect = (item: MenuItem) => {
    emit('select', item);
    close();
};

const onMenuKeydown = (event: KeyboardEvent) => {
    const items = getMenuItems();
    const currentIndex = items.indexOf(document.activeElement as HTMLElement);

    switch (event.key) {
        case 'ArrowDown':
            event.preventDefault();
            focusItem(currentIndex + 1);
            break;
        case 'ArrowUp':
            event.preventDefault();
            focusItem(currentIndex < 0 ? items.length - 1 : currentIndex - 1);
            break;
        case 'Home':
            event.preventDefault();
            focusItem(0);
            break;
        case 'End':
            event.preventDefault();
            focusItem(items.length - 1);
            break;
        case 'Enter':
        case ' ':
            if (currentIndex >= 0) {
                event.preventDefault();
                items[currentIndex].click();
            }
            break;
        case 'Escape':
            event.preventDefault();
            close();
            break;
        case 'Tab':
            close();
            break;
    }
};

const onOutsideMouseDown = (event: MouseEvent) => {
    if (!isOpen.value) return;

    const target = event.target as Element | null;
    if (!target) return;
    if (areaRef.value?.contains(target) || menuRef.value?.contains(target)) return;
    if (target.closest?.('.k-dropdown-menu')) return;

    close(false);
};

const onDocumentKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && isOpen.value) {
        event.preventDefault();
        close();
    }
};

const onDocumentContextMenu = (event: MouseEvent) => {
    if (!isOpen.value) return;

    const target = event.target as Node | null;
    if (!target) return;
    if (areaRef.value?.contains(target)) return;
    if (menuRef.value?.contains(target) || (target as Element).closest?.('.k-dropdown-menu')) {
        event.preventDefault();
        return;
    }

    close(false);
};

const onWindowResize = () => close(false);
const onScroll = () => close(false);

watch(
    () => props.disabled,
    (disabled) => {
        if (disabled) close(false);
    },
);

onMounted(() => {
    document.addEventListener('mousedown', onOutsideMouseDown, true);
    document.addEventListener('keydown', onDocumentKeydown, true);
    document.addEventListener('contextmenu', onDocumentContextMenu, true);
    window.addEventListener('scroll', onScroll);
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('blur', onWindowResize);
});

onUnmounted(() => {
    document.removeEventListener('mousedown', onOutsideMouseDown, true);
    document.removeEventListener('keydown', onDocumentKeydown, true);
    document.removeEventListener('contextmenu', onDocumentContextMenu, true);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onWindowResize);
    window.removeEventListener('blur', onWindowResize);
});

defineExpose({ openAt, close });
</script>

<template>
    <div ref="areaRef" v-bind="$attrs" class="k-context-menu-area" @contextmenu="onContextMenu">
        <slot />
    </div>

    <Teleport to="body">
        <Transition name="k-context-menu">
            <ul
                v-if="isOpen"
                ref="menuRef"
                class="k-context-menu"
                :style="menuStyle"
                role="menu"
                :aria-label="t('contextMenu')"
                @contextmenu.prevent.stop
                @keydown="onMenuKeydown"
            >
                <DropdownMenuItem
                    v-for="item in items"
                    :key="item.id"
                    :item="item"
                    trigger="click"
                    selection-type="none"
                    @select="onSelect"
                />
            </ul>
        </Transition>
    </Teleport>
</template>

<style scoped>
.k-context-menu-area {
    display: contents;
}

.k-context-menu {
    z-index: var(--k-z-popover);
    background-color: var(--k-white);
    border-radius: 8px;
    box-shadow:
        0 4px 24px rgba(0, 0, 0, 0.12),
        0 0 0 1px rgba(0, 0, 0, 0.05);
    padding: 4px;
    list-style: none;
    margin: 0;
    border: 1px solid var(--k-neutral-900);
    min-width: 180px;
    max-height: calc(100vh - 16px);
    overflow-y: auto;
    overscroll-behavior: contain;
    transform-origin: top left;
}

.dark .k-context-menu {
    background-color: var(--k-zinc-800);
    box-shadow:
        0 4px 24px rgba(0, 0, 0, 0.4),
        0 0 0 1px rgba(255, 255, 255, 0.1);
    border-color: rgba(211, 211, 211, 0.4);
}

.k-context-menu-enter-active,
.k-context-menu-leave-active {
    transition:
        opacity 0.12s ease,
        transform 0.12s ease;
}

.k-context-menu-enter-from,
.k-context-menu-leave-to {
    opacity: 0;
    transform: scale(0.98);
}
</style>
