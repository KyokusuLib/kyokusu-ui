<script lang="ts" setup>
import { ref, computed, useId, useAttrs } from "vue";
import type { Component, StyleValue } from "vue";
import { 
    PhEnvelopeSimple, 
    PhLockKey, 
    PhEye, 
    PhEyeSlash,
    PhMagnifyingGlass,
    PhPhone,
    PhLink 
} from "@phosphor-icons/vue";

defineOptions({ inheritAttrs: false });

interface Props {
    id?: string;
    label?: string;
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
    placeholder?: string;
    error?: string;
    disabled?: boolean;
    description?: string;
}

const props = withDefaults(defineProps<Props>(), {
    type: "text"
});

const model = defineModel<string>({ default: "" });
const inputId = props.id || useId();
const showPassword = ref(false);
const attrs = useAttrs();

const ICONS: Record<string, Component> = {
    email: PhEnvelopeSimple,
    password: PhLockKey,
    search: PhMagnifyingGlass,
    tel: PhPhone,
    url: PhLink
};

const wrapperClass = computed(() => attrs.class as any);
const wrapperStyle = computed(() => attrs.style as StyleValue);

const inputAttrs = computed(() => {
    const { class: _, style: __, ...rest } = attrs;
    return rest;
});

const currentType = computed(() => 
    props.type === "password" && showPassword.value ? "text" : props.type
);

const leftIcon = computed<Component | null>(() => ICONS[props.type] || null);

const togglePasswordVisibility = () => {
    if (!props.disabled) {
        showPassword.value = !showPassword.value;
    }
};
</script>

<template>
    <div class="k-input-wrapper" :class="wrapperClass" :style="wrapperStyle">
        <label v-if="label" :for="inputId" class="k-input-label">
            {{ label }}
        </label>
        
        <div class="k-input-container">
            <div v-if="leftIcon" class="k-input-icon k-input-icon--left">
                <component :is="leftIcon" :size="18" />
            </div>

            <input 
                v-bind="inputAttrs"
                :id="inputId"
                :type="currentType"
                v-model="model"
                :disabled="disabled"
                :placeholder="placeholder"
                class="k-input-field"
                :class="{
                    'k-input-field--error': error,
                    'k-input-field--disabled': disabled,
                    'k-input-field--with-left': !!leftIcon,
                    'k-input-field--with-right': type === 'password'
                }"
            />

            <button 
                v-if="type === 'password'"
                type="button"
                :disabled="disabled"
                @click="togglePasswordVisibility"
                class="k-input-icon k-input-icon--right k-input-icon--clickable"
                tabindex="-1"
            >
                <component :is="showPassword ? PhEye : PhEyeSlash" :size="18" />
            </button>
        </div>

        <p v-if="error" class="k-input-error-text">{{ error }}</p>
        <p v-else-if="description" class="k-input-description">{{ description }}</p>
    </div>
</template>

<style scoped>
.k-input-wrapper {
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 100%;

    --k-input-bg: var(--k-white);
    --k-input-border: var(--k-zinc-200);
    --k-input-border-focus: var(--k-zinc-900);
    --k-input-ring: rgba(24, 24, 27, 0.1);
    --k-input-text: var(--k-zinc-900);
    --k-input-placeholder: var(--k-zinc-400);
    --k-input-label: var(--k-zinc-900);
    --k-input-icon: var(--k-zinc-500);
    --k-input-icon-focus: var(--k-zinc-900);
    --k-input-error: var(--k-red-500);
    --k-input-error-ring: rgba(239, 68, 68, 0.1);
    --k-input-desc: var(--k-zinc-500);
    --k-input-disabled-bg: var(--k-zinc-100);
}

.dark .k-input-wrapper {
    --k-input-bg: var(--k-zinc-900);
    --k-input-border: var(--k-zinc-700);
    --k-input-border-focus: var(--k-white);
    --k-input-ring: rgba(255, 255, 255, 0.1);
    --k-input-text: var(--k-zinc-100);
    --k-input-placeholder: var(--k-zinc-500);
    --k-input-label: var(--k-zinc-100);
    --k-input-icon: var(--k-zinc-400);
    --k-input-icon-focus: var(--k-white);
    --k-input-disabled-bg: var(--k-zinc-800);
}

.k-input-label {
    font-size: 14px;
    font-weight: 500;
    color: var(--k-input-label);
    margin-left: 2px;
}

.k-input-container {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
}

.k-input-field {
    width: 100%;
    background-color: var(--k-input-bg);
    border: 1px solid var(--k-input-border);
    border-radius: 8px;
    padding: 10px 14px;
    font-family: inherit;
    font-size: 14px;
    color: var(--k-input-text);
    outline: none;
    transition: background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.k-input-field::placeholder {
    color: var(--k-input-placeholder);
}

.k-input-field:focus {
    border-color: var(--k-input-border-focus);
}

.k-input-field--error {
    border-color: var(--k-input-error) !important;
}

.k-input-field--disabled {
    background-color: var(--k-input-disabled-bg);
    opacity: 0.6;
    cursor: not-allowed;
}

.k-input-field--with-left {
    padding-left: 38px;
}

.k-input-field--with-right {
    padding-right: 38px;
}

.k-input-field:-webkit-autofill,
.k-input-field:-webkit-autofill:hover, 
.k-input-field:-webkit-autofill:focus, 
.k-input-field:-webkit-autofill:active {
    -webkit-text-fill-color: var(--k-input-text);
    transition: background-color 9999s ease-in-out 0s;
}

.k-input-icon {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--k-input-icon);
    transition: color 0.2s ease;
}

.k-input-container:focus-within .k-input-icon:not(.k-input-icon--clickable) {
    color: var(--k-input-icon-focus);
}

.k-input-icon--left {
    left: 12px;
    pointer-events: none;
}

.k-input-icon--right {
    right: 12px;
}

.k-input-icon--clickable {
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    outline: none;
}

.k-input-icon--clickable:hover:not(:disabled) {
    color: var(--k-input-icon-focus);
}

.k-input-icon--clickable:disabled {
    cursor: not-allowed;
    opacity: 0.6;
}

.k-input-error-text {
    font-size: 12px;
    font-weight: 500;
    color: var(--k-input-error);
    margin-left: 2px;
}

.k-input-description {
    font-size: 12px;
    color: var(--k-input-desc);
    margin-left: 2px;
}
</style>