<script setup lang="ts">
import { computed } from 'vue'
import type { SpinnerProps } from './types'
import { useKyokusuLocale } from '../i18n'

interface Props {
    size?: SpinnerProps['size']
    variant?: SpinnerProps['variant']
    locale?: string
}

const props = withDefaults(defineProps<Props>(), {
    size: 'md',
    variant: 'default'
})

const { t } = useKyokusuLocale(() => props.locale)

const spinnerClasses = computed(() => {
    const classes = ['k-spinner']
    
    if (typeof props.size === 'string') {
        classes.push(`k-spinner--${props.size}`)
    }
    
    if (props.variant && props.variant !== 'default') {
      classes.push(`k-spinner--${props.variant}`)
    }
    
    return classes.join(' ')
})

const spinnerStyle = computed(() => {
    if (typeof props.size === 'number') {
        return {
            width: `${props.size}px`,
            height: `${props.size}px`
        }
    }
    return {}
})
</script>

<template>
    <span :class="spinnerClasses" :style="spinnerStyle" role="status" :aria-label="t('loading')">
        <svg class="k-spinner-svg" viewBox="0 0 50 50">
            <circle 
                class="k-spinner-circle" 
                cx="25" 
                cy="25" 
                r="20" 
                fill="none" 
                stroke-width="4"
            />
        </svg>
    </span>
</template>

<style scoped>
.k-spinner {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    
    --k-spinner-color: var(--k-zinc-900);
    --k-spinner-track: var(--k-zinc-200);
}

.dark .k-spinner {
    --k-spinner-color: var(--k-zinc-100);
    --k-spinner-track: var(--k-zinc-700);
}

.k-spinner-svg {
    width: 100%;
    height: 100%;
    animation: k-spinner-rotate 1s linear infinite;
}

.k-spinner-circle {
    stroke: var(--k-spinner-color);
    stroke-linecap: round;
    stroke-dasharray: 120;
    stroke-dashoffset: 0;
    animation: k-spinner-dash 1.5s ease-in-out infinite;
}

/* Sizes */
.k-spinner--sm {
    width: 16px;
    height: 16px;
}

.k-spinner--md {
    width: 24px;
    height: 24px;
}

.k-spinner--lg {
    width: 32px;
    height: 32px;
}

.k-spinner--xl {
    width: 48px;
    height: 48px;
}

/* Variants */
.k-spinner--primary {
    --k-spinner-color: var(--k-orange-500);
    --k-spinner-track: var(--k-blue-100);
}

.dark .k-spinner--primary {
    --k-spinner-track: var(--k-blue-900);
}

.k-spinner--secondary {
    --k-spinner-color: var(--k-zinc-500);
    --k-spinner-track: var(--k-zinc-100);
}

.dark .k-spinner--secondary {
    --k-spinner-color: var(--k-zinc-400);
    --k-spinner-track: var(--k-zinc-800);
}

@keyframes k-spinner-rotate {
    100% {
        transform: rotate(360deg);
    }
}

@keyframes k-spinner-dash {
    0% {
        stroke-dasharray: 1, 150;
        stroke-dashoffset: 0;
    }
    50% {
        stroke-dasharray: 90, 150;
        stroke-dashoffset: -35;
    }
    100% {
        stroke-dasharray: 90, 150;
        stroke-dashoffset: -124;
    }
}
</style>
