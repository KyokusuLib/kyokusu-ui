<script lang="ts" setup>
import { ref, computed, watch, onMounted, reactive, nextTick, useId } from "vue";
import { PhTextBolder, PhTextItalic, PhTextStrikethrough } from "@phosphor-icons/vue";
import { useKyokusuLocale } from "../i18n";

interface Props {
    id?: string;
    label?: string;
    maxLength?: number;
    error?: string;
    disabled?: boolean;
    placeholder?: string;
    locale?: string;
}

const props = defineProps<Props>();
const { t } = useKyokusuLocale(() => props.locale);
const model = defineModel<string>({ default: '' });
const editorId = props.id || useId();

const editorRef = ref<HTMLElement | null>(null);
const charCount = ref(0);

const toolbarItems = computed(() => [
    { command: "bold", icon: PhTextBolder, label: t("bold") },
    { command: "italic", icon: PhTextItalic, label: t("italic") },
    { command: "strikeThrough", icon: PhTextStrikethrough, label: t("strikeThrough") },
]);

const activeStates = reactive<Record<string, boolean>>({
    bold: false,
    italic: false,
    strikeThrough: false,
});

const isClient = typeof window !== 'undefined';

const syncStates = () => {
    if (!isClient || !editorRef.value || props.disabled) return;
    for (const item of toolbarItems.value) {
        activeStates[item.command] = document.queryCommandState(item.command);
    }
};

const handleInput = () => {
    if (!editorRef.value) return;
    
    const content = editorRef.value.innerHTML;
    const text = editorRef.value.innerText.trim();

    if (props.maxLength && text.length > props.maxLength) {
        editorRef.value.innerHTML = model.value;
        return;
    }

    charCount.value = text.length;
    model.value = content === "<br>" ? "" : content;
    syncStates();
};

const exec = (command: string) => {
    if (!isClient || !editorRef.value || props.disabled) return;
    document.execCommand(command, false);
    nextTick(() => editorRef.value?.focus());
    handleInput();
};

watch(model, (val) => {
    if (editorRef.value && editorRef.value.innerHTML !== val) {
        editorRef.value.innerHTML = val || "";
        charCount.value = editorRef.value.innerText.trim().length;
    }
});

onMounted(() => {
    if (editorRef.value) {
        editorRef.value.innerHTML = model.value || "";
        charCount.value = editorRef.value.innerText.trim().length;
    }
});
</script>

<template>
    <div class="k-editor-wrapper">
        <label v-if="label" :for="editorId" class="k-editor-label">
            {{ label }}
        </label>

        <div 
            class="k-editor-box"
            :class="{ 
                'k-editor-box--error': error,
                'k-editor-box--disabled': disabled 
            }"
        >
            <div 
                ref="editorRef"
                :id="editorId"
                :contenteditable="!disabled"
                class="k-editor-content"
                @input="handleInput"
                @keyup="syncStates"
                @mouseup="syncStates"
            ></div>

            <div class="k-editor-toolbar">
                <button 
                    v-for="item in toolbarItems"
                    :key="item.command"
                    type="button"
                    @click="exec(item.command)"
                    :disabled="disabled"
                    class="k-editor-btn"
                    :class="{ 'k-editor-btn--active': activeStates[item.command] }"
                    :title="item.label"
                    :aria-label="item.label"
                >
                    <component :is="item.icon" :size="18" weight="bold" />
                </button>

                <div 
                    v-if="maxLength" 
                    class="k-editor-counter"
                    :class="{ 'k-editor-counter--limit': charCount >= maxLength }"
                >
                    {{ charCount }} / {{ maxLength }}
                </div>
            </div>
        </div>

        <p v-if="error" class="k-editor-error-text">{{ error }}</p>
    </div>
</template>

<style scoped>
.k-editor-wrapper {
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 100%;

    --k-editor-bg: var(--k-white);
    --k-editor-border: var(--k-zinc-200);
    --k-editor-border-focus: rgba(234, 179, 8, 0.5);
    --k-editor-ring: rgba(234, 179, 8, 0.05);
    
    --k-editor-text: var(--k-zinc-900);
    --k-editor-label: var(--k-zinc-500);
    
    --k-editor-toolbar-bg: var(--k-zinc-50);
    --k-editor-toolbar-border: var(--k-zinc-200);
    
    --k-editor-btn-text: var(--k-zinc-500);
    --k-editor-btn-hover-bg: var(--k-zinc-200);
    --k-editor-btn-active-bg: rgba(202, 138, 4, 0.4);
    --k-editor-btn-active-text: var(--k-white);
    --k-editor-btn-active-shadow: 0 4px 14px 0 rgba(234, 179, 8, 0.2);
    
    --k-editor-error: var(--k-red-500);
    --k-editor-error-ring: rgba(239, 68, 68, 0.05);
}

.dark .k-editor-wrapper {
    --k-editor-bg: var(--k-zinc-900);
    --k-editor-border: var(--k-zinc-700);
    
    --k-editor-text: var(--k-zinc-100);
    --k-editor-label: var(--k-zinc-400);
    
    --k-editor-toolbar-bg: var(--k-zinc-800);
    --k-editor-toolbar-border: var(--k-zinc-700);
    
    --k-editor-btn-text: var(--k-zinc-400);
    --k-editor-btn-hover-bg: var(--k-zinc-700);
}

.k-editor-label {
    font-size: 10px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--k-editor-label);
    margin-left: 4px;
}

.k-editor-box {
    width: 100%;
    background-color: var(--k-editor-bg);
    border: 1px solid var(--k-editor-border);
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.2s ease;
}

.k-editor-box:focus-within {
    border-color: var(--k-editor-border-focus);
    box-shadow: 0 0 0 4px var(--k-editor-ring);
}

.k-editor-box--error {
    border-color: var(--k-editor-error) !important;
    box-shadow: 0 0 0 4px var(--k-editor-error-ring) !important;
}

.k-editor-box--disabled {
    opacity: 0.5;
}

.k-editor-content {
    width: 100%;
    min-height: 140px;
    padding: 16px;
    font-size: 14px;
    color: var(--k-editor-text);
    outline: none;
    position: relative;
    z-index: 10;
    -webkit-font-smoothing: antialiased;
    word-break: break-word;
    white-space: pre-wrap;
}

.k-editor-box--disabled .k-editor-content {
    cursor: not-allowed;
}

.k-editor-content:empty:before {
    content: v-bind('placeholder ? `"${placeholder}"` : ""');
    position: absolute;
    color: var(--k-editor-label);
    pointer-events: none;
    font-style: italic;
}

.k-editor-toolbar {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 8px;
    background-color: var(--k-editor-toolbar-bg);
    border-top: 1px solid var(--k-editor-toolbar-border);
}

.k-editor-btn {
    padding: 8px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    background: transparent;
    border: none;
    color: var(--k-editor-btn-text);
    transition: all 0.2s ease;
}

.k-editor-btn:hover:not(:disabled) {
    background-color: var(--k-editor-btn-hover-bg);
}

.k-editor-btn:disabled {
    cursor: not-allowed;
    opacity: 0.5;
}

.k-editor-btn--active {
    background-color: var(--k-editor-btn-active-bg);
    color: var(--k-editor-btn-active-text);
    box-shadow: var(--k-editor-btn-active-shadow);
}

.k-editor-counter {
    margin-left: auto;
    padding-right: 8px;
    font-size: 10px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--k-editor-label);
    transition: color 0.2s ease;
}

.k-editor-counter--limit {
    color: var(--k-editor-error);
}

.k-editor-error-text {
    font-size: 12px;
    font-weight: 500;
    color: var(--k-editor-error);
    margin-left: 4px;
    margin-top: 2px;
}
</style>