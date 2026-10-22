<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { ContextMenu as VueContextMenu, type MenuItem } from '@kyokusu-ui/vue';
import { ContextMenu as CoreContextMenu, type ContextMenuItem } from '@kyokusu-ui/core';
import {
    PhCopy,
    PhCursorClick,
    PhEnvelope,
    PhLink,
    PhPencilSimple,
    PhShareNetwork,
    PhTrash,
} from '@phosphor-icons/vue';
import PropsTable from '../props/PropsTable.vue';
import '@kyokusu-ui/core/context-menu.css';

const svgIcon = (content: string) =>
    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${content}</svg>`;

const copyIcon = svgIcon(
    '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
);
const renameIcon = svgIcon(
    '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
);
const shareIcon = svgIcon(
    '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>',
);
const linkIcon = svgIcon(
    '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
);
const emailIcon = svgIcon(
    '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
);
const trashIcon = svgIcon(
    '<path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/>',
);

const vueItems: MenuItem[] = [
    { id: 'copy', label: 'Copy', icon: PhCopy },
    { id: 'rename', label: 'Rename', icon: PhPencilSimple },
    { id: 'paste', label: 'Paste', disabled: true },
    {
        id: 'share',
        label: 'Share',
        icon: PhShareNetwork,
        submenu: [
            { id: 'copy-link', label: 'Copy link', icon: PhLink },
            { id: 'email', label: 'Send by email', icon: PhEnvelope },
        ],
    },
    { id: 'sep', label: '', separator: true },
    { id: 'delete', label: 'Delete', icon: PhTrash },
];

const coreItems: ContextMenuItem[] = [
    { id: 'copy', label: 'Copy', icon: copyIcon },
    { id: 'rename', label: 'Rename', icon: renameIcon },
    { id: 'paste', label: 'Paste', disabled: true },
    {
        id: 'share',
        label: 'Share',
        icon: shareIcon,
        submenu: [
            { id: 'copy-link', label: 'Copy link', icon: linkIcon },
            { id: 'email', label: 'Send by email', icon: emailIcon },
        ],
    },
    { id: 'sep', label: '', separator: true },
    { id: 'delete', label: 'Delete', icon: trashIcon },
];

const vueAction = ref('');
const coreAction = ref('');
const coreArea = ref<HTMLElement | null>(null);
let coreMenu: CoreContextMenu | null = null;

const onVueSelect = (item: MenuItem) => {
    vueAction.value = item.label;
};

onMounted(() => {
    if (!coreArea.value) return;

    coreMenu = new CoreContextMenu(coreArea.value, {
        items: coreItems,
        width: 220,
        onSelect: (item) => {
            coreAction.value = item.label;
        },
    });
});

onUnmounted(() => {
    coreMenu?.destroy();
    coreMenu = null;
});

const vueProps = [
    { name: 'items', type: 'MenuItem[]', default: '—', desc: 'Массив элементов меню.' },
    {
        name: 'disabled',
        type: 'boolean',
        default: 'false',
        desc: 'Отключает меню и оставляет нативное контекстное меню браузера.',
    },
    {
        name: 'width',
        type: 'number | string',
        default: '200',
        desc: 'Ширина меню в пикселях или любая CSS-длина.',
    },
    {
        name: 'locale',
        type: 'string',
        default: '—',
        desc: 'BCP-47 локаль для встроенной подписи меню.',
    },
];

const coreOptions = [
    { name: 'items', type: 'ContextMenuItem[]', default: '—', desc: 'Массив элементов меню.' },
    {
        name: 'width',
        type: 'number | string',
        default: '200',
        desc: 'Ширина меню в пикселях или любая CSS-длина.',
    },
    {
        name: 'disabled',
        type: 'boolean',
        default: 'false',
        desc: 'Отключает меню и оставляет нативное контекстное меню браузера.',
    },
    {
        name: 'onSelect',
        type: '(item) => void',
        default: '—',
        desc: 'Callback при выборе элемента.',
    },
    {
        name: 'onOpen',
        type: '(position) => void',
        default: '—',
        desc: 'Callback при открытии с координатами меню.',
    },
    {
        name: 'onClose',
        type: '() => void',
        default: '—',
        desc: 'Callback при закрытии меню.',
    },
    {
        name: 'locale',
        type: 'string',
        default: '—',
        desc: 'BCP-47 локаль для встроенной подписи меню.',
    },
];
</script>

<template>
    <div class="component-demo">
        <div class="card">
            <h3>Vue component</h3>
            <p class="card-desc">
                Правый клик по области. Поддерживаются иконки, разделители, отключённые пункты и
                вложенные подменю.
            </p>

            <VueContextMenu :items="vueItems" :width="220" @select="onVueSelect">
                <div class="context-zone" tabindex="0" aria-label="Vue context menu example area">
                    <PhCursorClick :size="28" weight="duotone" class="context-zone-icon" />
                    <strong>Right-click this area</strong>
                    <span>@kyokusu-ui/vue</span>
                </div>
            </VueContextMenu>

            <p class="context-result">
                <span v-if="vueAction"
                    >Last action: <strong>{{ vueAction }}</strong></span
                >
                <span v-else>Try Copy, Share or Delete.</span>
            </p>
        </div>

        <div class="card">
            <h3>Core component</h3>
            <p class="card-desc">
                Та же логика на vanilla JS. Меню создаётся из набора опций и уничтожается через
                <code>destroy()</code>.
            </p>

            <div
                ref="coreArea"
                class="context-zone"
                tabindex="0"
                aria-label="Core context menu example area"
            >
                <PhCursorClick :size="28" weight="duotone" class="context-zone-icon" />
                <strong>Right-click this area</strong>
                <span>@kyokusu-ui/core</span>
            </div>

            <p class="context-result">
                <span v-if="coreAction"
                    >Last action: <strong>{{ coreAction }}</strong></span
                >
                <span v-else>Same menu, same styles.</span>
            </p>
        </div>

        <div class="card">
            <h3>Keyboard</h3>
            <p class="card-desc">
                Сфокусируйте область и нажмите <kbd>Shift</kbd> + <kbd>F10</kbd>, чтобы открыть меню
                без мыши. Внутри работают стрелки, <kbd>Home</kbd>, <kbd>End</kbd>,
                <kbd>Enter</kbd> и <kbd>Escape</kbd>.
            </p>
        </div>

        <PropsTable :items="vueProps" />
        <PropsTable :items="coreOptions" />
    </div>
</template>

<style scoped>
.card-desc {
    color: var(--text-muted);
    font-size: 14px;
    margin-bottom: 16px;
}

.context-zone {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 190px;
    padding: 24px;
    border: 1px dashed var(--border-color);
    border-radius: 12px;
    background: var(--bg-base);
    color: var(--text-muted);
    cursor: context-menu;
    user-select: none;
    text-align: center;
    transition:
        border-color 0.2s,
        background-color 0.2s,
        color 0.2s;
}

.context-zone:hover,
.context-zone:focus-visible {
    border-color: var(--accent-bg);
    background: var(--bg-hover-secondary);
    color: var(--text-main);
    outline: none;
}

.context-zone strong {
    color: var(--text-main);
    font-size: 15px;
    font-weight: 600;
}

.context-zone span {
    font-size: 13px;
}

.context-zone-icon {
    color: var(--accent-bg);
}

.context-result {
    min-height: 20px;
    margin-top: 14px;
    color: var(--text-muted);
    font-size: 13px;
}

.context-result strong {
    color: var(--text-main);
    font-weight: 600;
}

kbd {
    display: inline-block;
    padding: 2px 6px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    background: var(--bg-base);
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: 12px;
    color: var(--text-main);
}

code {
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    background: var(--bg-hover-secondary);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12px;
}
</style>
