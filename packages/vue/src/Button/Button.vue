<script lang="ts" setup>
import { computed, useAttrs } from "vue";

interface Props {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'accent';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    glow?: boolean;
    block?: boolean;
    disabled?: boolean;
    loading?: boolean;
    as?: string;
    type?: 'button' | 'submit' | 'reset';
}

const props = withDefaults(defineProps<Props>(), {
    variant: 'primary',
    size: 'md',
    glow: false,
    block: false,
    disabled: false,
    loading: false,
    as: 'button',
    type: 'button'
});

const attrs = useAttrs();

const buttonClasses = computed(() => {
    const classes = ['k-button'];
    
    if (props.variant !== 'primary') classes.push(`k-button--${props.variant}`);
    if (props.size) classes.push(`k-button--${props.size}`);
    if (props.glow) classes.push('k-button--glow');
    if (props.block) classes.push('k-button--block');
    if (props.loading) classes.push('k-button--loading');
    
    return classes.join(' ');
});

const isDisabled = computed(() => props.disabled || props.loading);
</script>

<template>
    <component 
        :is="as"
        :type="as === 'button' ? type : undefined"
        :class="[buttonClasses, attrs.class]"
        :style="attrs.style as any"
        :disabled="isDisabled"
        :aria-disabled="isDisabled ? 'true' : undefined"
    >
        <span v-if="loading" class="k-button-loader"></span>
        <slot name="icon-left" v-if="!loading"></slot>
        <span v-if="size !== 'icon'" class="k-button-content">
            <slot></slot>
        </span>
        <slot v-else></slot>
        <slot name="icon-right"></slot>
    </component>
</template>

<style scoped>
.k-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-family: inherit;
    font-weight: 500;
    text-align: center;
    white-space: nowrap;
    vertical-align: middle;
    user-select: none;
    border: 1px solid transparent;    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    outline: none;
    text-decoration: none;

    --k-btn-bg: var(--k-zinc-900);
    --k-btn-text: var(--k-white);
    --k-btn-border: transparent;
    --k-btn-hover-bg: var(--k-zinc-700);
    --k-btn-hover-border: transparent;
    --k-btn-ring: rgba(24, 24, 27, 0.2);
    --k-btn-glow: rgba(24, 24, 27, 0.4);

    background-color: var(--k-btn-bg);
    color: var(--k-btn-text);
    border-color: var(--k-btn-border);
}

.dark .k-button {
    --k-btn-bg: var(--k-white);
    --k-btn-text: var(--k-zinc-900);
    --k-btn-border: transparent;
    --k-btn-hover-bg: var(--k-zinc-200);
    --k-btn-ring: rgba(255, 255, 255, 0.2);
    --k-btn-glow: rgba(255, 255, 255, 0.4);
}

.k-button:focus-visible {
    box-shadow: 0 0 0 3px var(--k-btn-ring);
}

.k-button:hover:not(:disabled) {
    background-color: var(--k-btn-hover-bg);
    border-color: var(--k-btn-hover-border);
}

.k-button:active:not(:disabled) {
    transform: scale(0.97);
}

.k-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.k-button--secondary {
    --k-btn-bg: var(--k-zinc-100);
    --k-btn-text: var(--k-zinc-900);
    --k-btn-hover-bg: var(--k-zinc-200);
}
.dark .k-button--secondary {
    --k-btn-bg: var(--k-zinc-800);
    --k-btn-text: var(--k-zinc-100);
    --k-btn-hover-bg: var(--k-zinc-700);
}

.k-button--outline {
    --k-btn-bg: transparent;
    --k-btn-text: var(--k-zinc-900);
    --k-btn-border: var(--k-zinc-200);
    --k-btn-hover-bg: var(--k-zinc-100);
    --k-btn-hover-border: var(--k-zinc-300);
}
.dark .k-button--outline {
    --k-btn-bg: transparent;
    --k-btn-text: var(--k-zinc-100);
    --k-btn-border: var(--k-zinc-700);
    --k-btn-hover-bg: var(--k-zinc-800);
    --k-btn-hover-border: var(--k-zinc-600);
}

.k-button--ghost {
    --k-btn-bg: transparent;
    --k-btn-text: var(--k-zinc-900);
    --k-btn-hover-bg: var(--k-zinc-100);
}
.dark .k-button--ghost {
    --k-btn-bg: transparent;
    --k-btn-text: var(--k-zinc-100);
    --k-btn-hover-bg: var(--k-zinc-800);
}

.k-button--danger {
    --k-btn-bg: var(--k-red-500);
    --k-btn-text: var(--k-white);
    --k-btn-hover-bg: var(--k-red-600);
    --k-btn-ring: rgba(239, 68, 68, 0.2);
    --k-btn-glow: rgba(239, 68, 68, 0.4);
}
.dark .k-button--danger {
    --k-btn-bg: var(--k-red-500);
    --k-btn-text: var(--k-white);
    --k-btn-hover-bg: var(--k-red-600);
    --k-btn-ring: rgba(239, 68, 68, 0.2);
    --k-btn-glow: rgba(239, 68, 68, 0.4);
}

.k-button--accent {
    --k-btn-bg: var(--k-yellow-500);
    --k-btn-text: var(--k-white);
    --k-btn-hover-bg: var(--k-yellow-600);
    --k-btn-ring: rgba(234, 179, 8, 0.2);
    --k-btn-glow: rgba(234, 179, 8, 0.4);
}

.dark .k-button--accent {
    --k-btn-bg: var(--k-yellow-500);
    --k-btn-text: var(--k-white);
    --k-btn-hover-bg: var(--k-yellow-600);
    --k-btn-ring: rgba(234, 179, 8, 0.2);
    --k-btn-glow: rgba(234, 179, 8, 0.4);
}

.k-button-content {
    display: flex;
    align-items: center;
    gap: 14px;
}

.k-button--glow:not(:disabled) {
    box-shadow: 0 0 15px var(--k-btn-glow);
}
.k-button--glow:hover:not(:disabled) {
    box-shadow: 0 0 25px var(--k-btn-glow);
}

.k-button--sm {
    height: 16px;
    padding: 5px 16px;
    font-size: 13px;
    border-radius: 6px;
}
.k-button--md {
    height: 32px;
    padding: 0 16px;
    font-size: 14px;
    border-radius: 8px;
}
.k-button--lg {
    height: 48px;
    padding: 0 24px;
    font-size: 16px;
    border-radius: 10px;
}
.k-button--icon {
    width: 40px;
    height: 40px;
    padding: 0;
    border-radius: 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.k-button--block {
    width: 100%;
}

.k-button-loader {
    width: 1em;
    height: 1em;
    border: 2px solid currentColor;
    border-right-color: transparent;
    border-radius: 50%;
    animation: k-btn-spin 0.75s linear infinite;
    display: inline-block;
    margin-right: 8px;
}

.k-button--loading {
    opacity: 0.8;
    cursor: wait;
}
.k-button--loading:active {
    transform: none;
}

@keyframes k-btn-spin {
    to { transform: rotate(360deg); }
}
</style>