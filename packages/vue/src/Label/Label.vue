<script setup lang="ts">
interface Props {
	label: string;
	for?: string;
}

const props = defineProps<Props>();
</script>

<template>
    <label v-if="props.label" :for="props.for" class="k-label">
        {{ props.label }}
    </label>
</template>

<style scoped>
.k-label {
    font-size: 10px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--k-zinc-500);
    margin-left: 4px;
    display: inline-block;
}

.dark .k-label {
    color: var(--k-zinc-400);
}
</style>