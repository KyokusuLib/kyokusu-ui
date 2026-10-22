<script setup lang="ts">
import { computed } from 'vue'
import type { CircleBlockProps } from './types'

interface Props {
    text?: CircleBlockProps['text']
    icon?: CircleBlockProps['icon']
    src?: CircleBlockProps['src']
    bg?: CircleBlockProps['bg']
    color?: CircleBlockProps['color']
    border?: CircleBlockProps['border']
    size?: CircleBlockProps['size']
}

const props = withDefaults(defineProps<Props>(), {
    text: '',
    icon: undefined,
    src: undefined,
    bg: undefined,
    color: undefined,
    border: false,
    size: 'md'
})

const sizeMap: Record<string, number> = {
    sm: 32,
    md: 40,
    lg: 56
}

const pixelSize = computed(() => {
    if (typeof props.size === 'number') return props.size
    return sizeMap[props.size] || 40
})

const initials = computed(() => {
    if (!props.text) return ''
    const words = props.text.trim().split(/\s+/)
    if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase()
    }
    return (words[0][0] + words[1][0]).toUpperCase()
})

const wrapperStyle = computed(() => ({
    width: `${pixelSize.value}px`,
    height: `${pixelSize.value}px`,
    backgroundColor: props.bg || 'var(--k-zinc-800)',
    borderWidth: props.border ? '2px' : '0',
    borderColor: props.border ? 'var(--k-white)' : 'transparent'
}))

const fontSize = computed(() => {
    if (pixelSize.value <= 32) return '11px'
    if (pixelSize.value <= 40) return '13px'
    return '16px'
})

const iconSize = computed(() => {
    if (pixelSize.value <= 32) return 14
    if (pixelSize.value <= 40) return 18
    return 24
})

const contentStyle = computed(() => props.color ? { color: props.color } : {})
</script>

<template>
    <div class="k-circle-block" :style="wrapperStyle">
        <img
            v-if="src"
            :src="src"
            class="k-circle-block-img"
            alt=""
        />
        <component
            v-else-if="icon"
            :is="icon"
            :size="iconSize"
            weight="duotone"
            class="k-circle-block-icon"
            :style="contentStyle"
        />
        <span v-else-if="text" class="k-circle-block-text" :style="{ fontSize, ...contentStyle }">
            {{ initials }}
        </span>
    </div>
</template>

<style scoped>
.k-circle-block {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    flex-shrink: 0;
    user-select: none;
    box-shadow: rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px;
}

.k-circle-block-text {
    font-weight: 600;
    color: var(--k-white);
    line-height: 1;
    letter-spacing: 0.5px;
}

.k-circle-block-icon {
    color: var(--k-white);
}

.k-circle-block-icon--default {
    opacity: 0.6;
}

.k-circle-block-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: inherit;
}
</style>
