<script lang="ts" setup>
import { provide, ref } from 'vue';
import { AccordionKey } from './types';

interface Props {
    multiple?: boolean;
    border?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    multiple: false,
    border: true
});

const openItems = ref<Set<number>>(new Set());
let counter = 0;

const toggle = (index: number) => {
    const next = new Set(openItems.value);
    if (next.has(index)) {
        next.delete(index);
    } else {
        if (!props.multiple) next.clear();
        next.add(index);
    }
    openItems.value = next;
};

provide(AccordionKey, {
    multiple: props.multiple,
    border: props.border,
    openItems,
    toggle,
    register: () => counter++
});
</script>

<template>
    <div class="k-accordion" :class="{ 'k-accordion--border': border }">
        <slot />
    </div>
</template>

<style scoped>
.k-accordion {
    display: flex;
    flex-direction: column;
    border-radius: 12px;
    overflow: hidden;
}

.k-accordion--border {
    border: 1px solid var(--k-zinc-200);
}

.dark .k-accordion--border {
    border-color: var(--k-zinc-800);
}
</style>
