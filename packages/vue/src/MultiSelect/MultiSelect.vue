<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted, nextTick, useId, useAttrs } from "vue";
import { useListNavigation } from "../composables/useListNavigation";
import { useKyokusuLocale } from "../i18n";

defineOptions({ inheritAttrs: false });

export interface MultiSelectOption {
	id: string | number;
	label: string;
}

interface Props {
	modelValue: (string | number | MultiSelectOption)[];
	options: (string | MultiSelectOption)[];
	id?: string;
	label?: string;
	placeholder?: string;
	error?: string;
	disabled?: boolean;
	loading?: boolean;
	locale?: string;
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: () => []
});

const emit = defineEmits(["update:modelValue", "search"]);

const isOpen = ref(false);
const searchQuery = ref("");
const wrapperRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const { t } = useKyokusuLocale(() => props.locale);
const selectId = props.id || useId();
const listboxId = useId();
const optionId = (index: number) => `${listboxId}-option-${index}`;
const attrs = useAttrs();

const normalizedOptions = computed<MultiSelectOption[]>(() => {
	return props.options.map((opt) =>
		typeof opt === "string" ? { id: opt, label: opt } : opt,
	);
});

const normalizedSelected = computed<MultiSelectOption[]>(() => {
	return props.modelValue.map((val) => {
		if (typeof val === "object" && val !== null) return val as MultiSelectOption;

		const found = normalizedOptions.value.find((opt) => opt.id === val);
		return found || { id: val, label: String(val) };
	});
});

const availableOptions = computed(() => {
	const selectedIds = normalizedSelected.value.map((s) => s.id);
	return normalizedOptions.value.filter((opt) => !selectedIds.includes(opt.id));
});

const filteredOptions = computed(() => {
	if (!searchQuery.value) return availableOptions.value;
	return availableOptions.value.filter((opt) =>
		opt.label.toLowerCase().includes(searchQuery.value.toLowerCase()),
	);
});

const openDropdown = () => {
	if (props.disabled) return;
	if (isOpen.value) {
		inputRef.value?.focus();
		return;
	}
	isOpen.value = true;
	nextTick(() => inputRef.value?.focus());
};

const closeDropdown = () => {
	isOpen.value = false;
	searchQuery.value = "";
};

const selectOption = (option: MultiSelectOption) => {
    if (props.modelValue.some(item => (typeof item === 'object' ? item.id : item) === option.id)) {
        return;
    }
    emit("update:modelValue", [...props.modelValue, option]);
    searchQuery.value = "";
    nextTick(() => inputRef.value?.focus());
};

const removeOption = (index: number) => {
	if (props.disabled) return;
	const newSelected = [...props.modelValue];
	newSelected.splice(index, 1);
	emit("update:modelValue", newSelected);
};

const handleInput = (e: Event) => {
	const target = e.target as HTMLInputElement;
	emit("search", target.value);
	activeIndex.value = filteredOptions.value.length > 0 ? 0 : -1;
};

const handleBackspace = () => {
	if (!searchQuery.value && props.modelValue.length > 0) {
		removeOption(props.modelValue.length - 1);
	}
};

const { activeIndex, activeDescendant, handleKeydown } = useListNavigation({
	items: () => filteredOptions.value,
	isOpen,
	optionId,
	onSelect: (option) => selectOption(option),
	onOpen: openDropdown,
	onClose: () => closeDropdown(),
	selectOnSpace: false,
});

const handleClickOutside = (event: MouseEvent) => {
	if (wrapperRef.value && !wrapperRef.value.contains(event.target as Node)) {
		closeDropdown();
	}
};

onMounted(() => document.addEventListener("mousedown", handleClickOutside));
onUnmounted(() => document.removeEventListener("mousedown", handleClickOutside));
</script>

<template>
    <div class="k-multiselect-wrapper" :class="attrs.class" :style="attrs.style" ref="wrapperRef">
        <label v-if="label" :for="selectId" class="k-multiselect-label">
            {{ label }}
        </label>

        <div 
            class="k-multiselect-trigger"
            :class="{
                'k-multiselect-trigger--error': error,
                'k-multiselect-trigger--focus': isOpen,
                'k-multiselect-trigger--disabled': disabled
            }"
            @click="openDropdown"
        >
            <div 
                v-for="(item, index) in normalizedSelected" 
                :key="item.id"
                class="k-multiselect-tag"
            >
                <span>{{ item.label }}</span>
                <button
                    type="button"
                    @click.stop="removeOption(index)"
                    class="k-multiselect-tag-close"
                    :aria-label="t('removeTag', { label: item.label })"
                >
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <input 
                :id="selectId"
                ref="inputRef"
                v-model="searchQuery"
                type="text"
                class="k-multiselect-input"
                :placeholder="modelValue.length === 0 ? (placeholder || t('selectPlaceholder')) : ''"
                :disabled="disabled"
                role="combobox"
                aria-haspopup="listbox"
                :aria-expanded="isOpen"
                :aria-controls="listboxId"
                :aria-activedescendant="activeDescendant"
                aria-autocomplete="list"
                :aria-disabled="disabled || undefined"
                @input="handleInput"
                @keydown="handleKeydown"
                @keydown.backspace="handleBackspace"
                @focus="openDropdown"
            />

            <div v-if="loading" class="k-multiselect-loader"></div>
        </div>

        <Transition name="k-multiselect-fade">
            <div v-if="isOpen" class="k-multiselect-popup">
                <ul :id="listboxId" class="k-multiselect-list" role="listbox">
                    <li
                        v-for="(option, index) in filteredOptions"
                        :id="optionId(index)"
                        :key="option.id"
                        @click.stop="selectOption(option)"
                        @mousemove="activeIndex = index"
                        class="k-multiselect-item"
                        :class="{ 'k-multiselect-item--active': activeIndex === index }"
                        role="option"
                        :aria-selected="false"
                    >
                        {{ option.label }}
                    </li>
                    <li v-if="filteredOptions.length === 0 && !loading" class="k-multiselect-empty" role="presentation">
                        {{ searchQuery ? t('noResults') : t('startTyping') }}
                    </li>
                </ul>
            </div>
        </Transition>

        <p v-if="error" class="k-multiselect-error-text">{{ error }}</p>
    </div>
</template>

<style scoped>
.k-multiselect-wrapper {
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-family: inherit;

    --k-ms-bg: var(--k-white);
    --k-ms-border: var(--k-zinc-200);
    --k-ms-border-focus: rgba(234, 179, 8, 0.5);
    --k-ms-ring: rgba(234, 179, 8, 0.05);
    --k-ms-text: var(--k-zinc-900);
    --k-ms-placeholder: var(--k-zinc-400);
    --k-ms-label: var(--k-zinc-500);
    --k-ms-disabled-bg: var(--k-zinc-100);
    --k-ms-error: var(--k-red-500);
    
    --k-ms-tag-bg: var(--k-white);
    --k-ms-tag-border: var(--k-zinc-200);
    --k-ms-tag-text: var(--k-zinc-900);
    --k-ms-tag-close: var(--k-zinc-400);
    --k-ms-tag-close-hover: var(--k-red-500);
    
    --k-ms-popup-bg: var(--k-white);
    --k-ms-popup-border: var(--k-zinc-200);
    --k-ms-popup-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    
    --k-ms-item-text: var(--k-zinc-700);
    --k-ms-item-hover-bg: var(--k-zinc-100);
}

.dark .k-multiselect-wrapper {
    --k-ms-bg: rgba(24, 24, 27, 0.5);
    --k-ms-border: var(--k-zinc-800);
    --k-ms-border-focus: rgba(234, 179, 8, 0.5);
    --k-ms-ring: rgba(234, 179, 8, 0.05);
    --k-ms-text: var(--k-zinc-200);
    --k-ms-placeholder: var(--k-zinc-500);
    --k-ms-label: var(--k-zinc-400);
    --k-ms-disabled-bg: var(--k-zinc-900);
    
    --k-ms-tag-bg: var(--k-zinc-800);
    --k-ms-tag-border: var(--k-zinc-700);
    --k-ms-tag-text: var(--k-zinc-200);
    --k-ms-tag-close: var(--k-zinc-500);
    
    --k-ms-popup-bg: var(--k-zinc-900);
    --k-ms-popup-border: var(--k-zinc-800);
    --k-ms-popup-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    
    --k-ms-item-text: var(--k-zinc-300);
    --k-ms-item-hover-bg: var(--k-zinc-800);
}

.k-multiselect-label {
    font-size: 10px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--k-ms-label);
    margin-left: 4px;
}

.k-multiselect-trigger {
    width: 100%;
    background-color: var(--k-ms-bg);
    border: 1px solid var(--k-ms-border);
    border-radius: 8px;
    min-height: 40px;
    padding: 4px 10px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    cursor: text;
    transition: all 0.2s ease;
    position: relative;
}

.k-multiselect-trigger--focus {
    border-color: var(--k-ms-border-focus) !important;
    box-shadow: 0 0 0 4px var(--k-ms-ring);
}

.k-multiselect-trigger--error {
    border-color: var(--k-ms-error) !important;
}

.k-multiselect-trigger--disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: var(--k-ms-disabled-bg);
}

.k-multiselect-tag {
    display: flex;
    align-items: center;
    gap: 6px;
    height: 24px;
    padding: 0 4px 0 10px;
    background-color: var(--k-ms-tag-bg);
    border: 1px solid var(--k-ms-tag-border);
    border-radius: 6px;
    font-size: 11px;
    font-weight: 700;
    color: var(--k-ms-tag-text);
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    cursor: default;
    user-select: none;
}

.k-multiselect-tag-close {
    background: transparent;
    border: none;
    padding: 0;
    color: var(--k-ms-tag-close);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s ease;
}

.k-multiselect-tag-close:hover {
    color: var(--k-ms-tag-close-hover);
}

.k-multiselect-input {
    flex: 1;
    min-width: 120px;
    height: 24px;
    background: transparent;
    border: none;
    outline: none;
    font-size: 14px;
    color: var(--k-ms-text);
    padding: 0;
}

.k-multiselect-input::placeholder {
    color: var(--k-ms-placeholder);
}

.k-multiselect-loader {
    position: absolute;
    right: 12px;
    width: 16px;
    height: 16px;
    border: 2px solid var(--k-yellow-500);
    border-top-color: transparent;
    border-radius: 50%;
    animation: k-ms-spin 1s linear infinite;
}

@keyframes k-ms-spin {
    to { transform: rotate(360deg); }
}

.k-multiselect-popup {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    z-index: var(--k-z-overlay);
    width: 100%;
    background-color: var(--k-ms-popup-bg);
    border: 1px solid var(--k-ms-popup-border);
    border-radius: 16px;
    box-shadow: var(--k-ms-popup-shadow);
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.k-multiselect-list {
    max-height: 240px;
    overflow-y: auto;
    padding: 8px;
    list-style: none;
    margin: 0;
}

.k-multiselect-list::-webkit-scrollbar {
    width: 4px;
}
.k-multiselect-list::-webkit-scrollbar-track {
    background: transparent;
}
.k-multiselect-list::-webkit-scrollbar-thumb {
    background: var(--k-ms-border);
    border-radius: 10px;
}

.k-multiselect-item {
    padding: 10px 16px;
    font-size: 14px;
    font-weight: 500;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    color: var(--k-ms-item-text);
}

.k-multiselect-item:hover,
.k-multiselect-item--active {
    background-color: var(--k-ms-item-hover-bg);
}

.k-multiselect-empty {
    padding: 32px 16px;
    font-size: 14px;
    color: var(--k-ms-placeholder);
    text-align: center;
    font-style: italic;
}

.k-multiselect-error-text {
    font-size: 12px;
    font-weight: 500;
    color: var(--k-ms-error);
    margin-left: 4px;
    margin-top: 4px;
    margin-bottom: 0;
}

.k-multiselect-fade-enter-active,
.k-multiselect-fade-leave-active {
    transition: all 0.2s ease;
}
.k-multiselect-fade-enter-from,
.k-multiselect-fade-leave-to {
    opacity: 0;
    transform: translateY(-8px);
}
</style>