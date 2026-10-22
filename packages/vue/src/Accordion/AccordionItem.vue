<script lang="ts" setup>
import { computed, inject, onMounted, onUnmounted, ref, useId } from 'vue';
import { PhCaretDown } from '@phosphor-icons/vue';
import { AccordionKey } from './types';

interface Props {
    title: string;
}

defineProps<Props>();

const ctx = inject(AccordionKey);
const index = ref(-1);
const itemId = useId();
const contentRef = ref<HTMLDivElement | null>(null);
const contentHeight = ref(0);

const isOpen = computed(() => ctx?.openItems.value.has(index.value) ?? false);

const toggle = () => {
    if (ctx && index.value >= 0) {
        ctx.toggle(index.value);
    }
};

const updateHeight = () => {
    if (contentRef.value) {
        contentHeight.value = contentRef.value.scrollHeight;
    }
};

onMounted(() => {
    if (ctx) {
        index.value = ctx.register();
    }
    updateHeight();
});

let observer: MutationObserver | null = null;

onMounted(() => {
    if (contentRef.value) {
        observer = new MutationObserver(updateHeight);
        observer.observe(contentRef.value, { childList: true, subtree: true });
    }
});

onUnmounted(() => {
    observer?.disconnect();
});
</script>

<template>
    <div 
        class="k-accordion-item"
        :class="{ 'k-accordion-item--open': isOpen }"
    >
        <button
            class="k-accordion-trigger"
            :aria-expanded="isOpen"
            :aria-controls="`accordion-content-${itemId}`"
            @click="toggle"
        >
            <span class="k-accordion-title">{{ title }}</span>
            <span class="k-accordion-icon">
                <PhCaretDown :size="16" weight="bold" />
            </span>
        </button>
        <div
            :id="`accordion-content-${itemId}`"
            ref="contentRef"
            class="k-accordion-content"
            role="region"
            :style="{ maxHeight: isOpen ? `${contentHeight}px` : '0px' }"
        >
            <div class="k-accordion-body">
                <slot />
            </div>
        </div>
    </div>
</template>

<style scoped>
.k-accordion-item {
    background-color: var(--k-white);
}

.dark .k-accordion-item {
    background-color: var(--k-zinc-900);
}

.k-accordion-item + .k-accordion-item {
    border-top: 1px solid transparent;
}

.k-accordion--border > .k-accordion-item + .k-accordion-item {
    border-top-color: var(--k-zinc-200);
}

.dark .k-accordion--border > .k-accordion-item + .k-accordion-item {
    border-top-color: var(--k-zinc-800);
}

.k-accordion-trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 16px;
    background: transparent;
    border: none;
    cursor: pointer;
    text-align: left;
    font-family: inherit;
    font-size: 14px;
    font-weight: 500;
    color: var(--k-zinc-900);
    transition: background-color 0.15s ease;
}

.dark .k-accordion-trigger {
    color: var(--k-zinc-100);
}

.k-accordion-trigger:hover {
    background-color: var(--k-zinc-100);
}

.dark .k-accordion-trigger:hover {
    background-color: var(--k-zinc-800);
}

.k-accordion-title {
    flex: 1;
}

.k-accordion-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--k-zinc-500);
    transition: transform 0.2s ease;
}

.dark .k-accordion-icon {
    color: var(--k-zinc-400);
}

.k-accordion-item--open .k-accordion-icon {
    transform: rotate(180deg);
}

.k-accordion-content {
    overflow: hidden;
    transition: max-height 0.25s ease;
}

.k-accordion-body {
    padding: 0 16px 16px 16px;
    font-size: 14px;
    color: var(--k-zinc-600);
    line-height: 1.6;
}

.dark .k-accordion-body {
    color: var(--k-zinc-400);
}
</style>
