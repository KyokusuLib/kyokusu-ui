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
</script>

<template>
    <section id="context-menu" class="context-section section-py">
        <div class="container">
            <div class="context-header">
                <span class="context-eyebrow">New component</span>
                <h2 class="context-title">ContextMenu, right where you need it</h2>
                <p class="context-desc">
                    A right-click menu with keyboard navigation, icons, separators, disabled items
                    and nested submenus. Available for both Vue and vanilla JS.
                </p>
            </div>

            <div class="context-grid">
                <article class="context-card">
                    <div class="context-card-header">
                        <span class="context-badge">Vue</span>
                        <code class="context-package">@kyokusu-ui/vue</code>
                    </div>

                    <VueContextMenu :items="vueItems" :width="220" @select="onVueSelect">
                        <div
                            class="context-zone"
                            tabindex="0"
                            aria-label="Vue context menu example area"
                        >
                            <PhCursorClick :size="28" weight="duotone" class="context-zone-icon" />
                            <strong>Right-click this area</strong>
                            <span>Vue component</span>
                        </div>
                    </VueContextMenu>

                    <p class="context-result">
                        <span v-if="vueAction"
                            >Last action: <strong>{{ vueAction }}</strong></span
                        >
                        <span v-else>Try Copy, Share or Delete.</span>
                    </p>
                </article>

                <article class="context-card">
                    <div class="context-card-header">
                        <span class="context-badge">Core</span>
                        <code class="context-package">@kyokusu-ui/core</code>
                    </div>

                    <div
                        ref="coreArea"
                        class="context-zone"
                        tabindex="0"
                        aria-label="Core context menu example area"
                    >
                        <PhCursorClick :size="28" weight="duotone" class="context-zone-icon" />
                        <strong>Right-click this area</strong>
                        <span>Vanilla JS component</span>
                    </div>

                    <p class="context-result">
                        <span v-if="coreAction"
                            >Last action: <strong>{{ coreAction }}</strong></span
                        >
                        <span v-else>Same menu, same styles.</span>
                    </p>
                </article>
            </div>

            <p class="context-hint">
                Tip: focus an area and press <kbd>Shift</kbd> + <kbd>F10</kbd> to open the menu with
                the keyboard.
            </p>
        </div>
    </section>
</template>

<style scoped>
.context-section {
    background-color: var(--bg-surface);
    border-top: 1px solid var(--border-default);
    border-bottom: 1px solid var(--border-default);
}

.context-header {
    max-width: 680px;
    margin-bottom: 40px;
}

.context-eyebrow {
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    margin-bottom: 16px;
    border: 1px solid var(--border-default);
    border-radius: 999px;
    background-color: var(--bg-base);
    color: var(--accent-text);
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
}

.context-title {
    font-size: clamp(2rem, 4vw, 2.5rem);
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--text-primary);
    margin-bottom: 12px;
}

.context-desc {
    color: var(--text-secondary);
    font-size: 1.0625rem;
    line-height: 1.65;
}

.context-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
}

.context-card {
    display: flex;
    flex-direction: column;
    padding: 20px;
    border: 1px solid var(--border-default);
    border-radius: 16px;
    background-color: var(--bg-base);
    box-shadow: var(--shadow-sm);
}

.context-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;
}

.context-badge {
    display: inline-flex;
    align-items: center;
    padding: 3px 10px;
    border-radius: 999px;
    background-color: var(--accent-muted);
    color: var(--accent-text);
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
}

.context-package {
    color: var(--text-tertiary);
    font-family: var(--font-mono);
    font-size: 0.75rem;
}

.context-zone {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 190px;
    padding: 24px;
    border: 1px dashed var(--border-strong);
    border-radius: 12px;
    background-color: var(--bg-surface);
    color: var(--text-secondary);
    cursor: context-menu;
    user-select: none;
    text-align: center;
    transition:
        border-color var(--transition-fast),
        background-color var(--transition-fast),
        color var(--transition-fast);
}

.context-zone:hover,
.context-zone:focus-visible {
    border-color: var(--accent-base);
    background-color: var(--accent-muted);
    color: var(--text-primary);
    outline: none;
}

.context-zone strong {
    color: var(--text-primary);
    font-size: 0.9375rem;
    font-weight: 600;
}

.context-zone span {
    font-size: 0.8125rem;
}

.context-zone-icon {
    color: var(--accent-base);
}

.context-result {
    min-height: 20px;
    margin-top: 14px;
    color: var(--text-tertiary);
    font-size: 0.8125rem;
}

.context-result strong {
    color: var(--text-primary);
    font-weight: 600;
}

.context-hint {
    margin-top: 24px;
    color: var(--text-tertiary);
    font-size: 0.8125rem;
    text-align: center;
}

.context-hint kbd {
    padding: 2px 6px;
    border: 1px solid var(--border-strong);
    border-radius: 4px;
    background-color: var(--bg-base);
    color: var(--text-secondary);
    font-family: var(--font-mono);
    font-size: 0.75rem;
}
</style>
