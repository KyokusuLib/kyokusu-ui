<script lang="ts" setup>
import { ref, computed, onMounted, onBeforeUnmount, useId } from 'vue';
import { useListNavigation } from '../composables/useListNavigation';
import { useKyokusuLocale } from '../i18n';

interface Option {
  value: string;
  label: string;
}

const props = defineProps<{
  label?: string;
  id?: string;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  locale?: string;
}>();

const model = defineModel<string>({ default: '' });
const { t } = useKyokusuLocale(() => props.locale);
const selectId = props.id || useId();
const listboxId = useId();
const optionId = (index: number) => `${listboxId}-option-${index}`;

const isOpen = ref(false);
const containerRef = ref<HTMLElement | null>(null);

const selectedLabel = computed(() => {
  const selected = props.options.find(opt => opt.value === model.value);
  return selected ? selected.label : (props.placeholder || t('selectPlaceholder'));
});

const toggleOpen = () => {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
};

const selectOption = (value: string) => {
  model.value = value;
  isOpen.value = false;
};

const { activeIndex, activeDescendant, handleKeydown } = useListNavigation({
  items: () => props.options,
  isOpen,
  optionId,
  onSelect: (option) => selectOption(option.value),
  onOpen: () => { if (!props.disabled) isOpen.value = true; },
  onClose: () => { isOpen.value = false; },
});

const handleClickOutside = (event: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <div class="k-select-container" ref="containerRef">
    <label 
      v-if="label" 
      :for="selectId" 
      class="k-select-label"
      :class="{ 'k-select-label--disabled': disabled }"
    >
      {{ label }}
    </label>

    <div class="k-select-wrapper">
      <button 
        type="button"
        :id="selectId"
        class="k-select-trigger"
        :class="{ 'k-select-trigger--open': isOpen }"
        :disabled="disabled"
        role="combobox"
        aria-haspopup="listbox"
        :aria-expanded="isOpen"
        :aria-controls="listboxId"
        :aria-activedescendant="activeDescendant"
        @click="toggleOpen"
        @keydown="handleKeydown"
      >
        <span class="k-select-value" :class="{ 'k-select-value--placeholder': !model && placeholder }">
          {{ selectedLabel }}
        </span>
        
        <div class="k-select-icon" :class="{ 'k-select-icon--open': isOpen }">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      <transition name="k-select-fade">
        <ul
          v-if="isOpen"
          :id="listboxId"
          class="k-select-dropdown"
          role="listbox"
        >
          <li
            v-for="(option, index) in options"
            :id="optionId(index)"
            :key="option.value"
            class="k-select-option"
            :class="{
              'k-select-option--selected': model === option.value,
              'k-select-option--active': activeIndex === index
            }"
            role="option"
            :aria-selected="model === option.value"
            @click="selectOption(option.value)"
            @mousemove="activeIndex = index"
          >
            {{ option.label }}
          </li>
        </ul>
      </transition>
    </div>
  </div>
</template>

<style scoped>
.k-select-container {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;

  --k-select-bg: var(--k-white);
  --k-select-bg-hover: var(--k-zinc-50);
  --k-select-bg-disabled: var(--k-zinc-100);
  --k-select-border: var(--k-zinc-200);
  --k-select-border-hover: var(--k-zinc-300);
  --k-select-text: var(--k-zinc-900);
  --k-select-text-disabled: var(--k-zinc-400);
  --k-select-placeholder: var(--k-zinc-400);
  --k-select-label: var(--k-zinc-900);
  
  --k-select-dropdown-bg: var(--k-white);
  --k-select-dropdown-border: var(--k-zinc-200);
  --k-select-option-hover: var(--k-zinc-100);
  --k-select-option-selected: var(--k-zinc-900);
  --k-select-option-selected-text: var(--k-white);

  --k-select-radius: 8px;
  --k-select-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --k-select-dropdown-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
}

.dark .k-select-container {
  --k-select-bg: var(--k-zinc-900);
  --k-select-bg-hover: var(--k-zinc-800);
  --k-select-bg-disabled: var(--k-zinc-800);
  --k-select-border: var(--k-zinc-700);
  --k-select-border-hover: var(--k-zinc-600);
  --k-select-text: var(--k-zinc-100);
  --k-select-text-disabled: var(--k-zinc-600);
  --k-select-placeholder: var(--k-zinc-500);
  --k-select-label: var(--k-white);
  
  --k-select-dropdown-bg: var(--k-zinc-900);
  --k-select-dropdown-border: var(--k-zinc-700);
  --k-select-option-hover: var(--k-zinc-800);
  --k-select-option-selected: var(--k-white);
  --k-select-option-selected-text: var(--k-zinc-900);
  
  --k-select-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.3);
  --k-select-dropdown-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.5);
}

.k-select-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--k-select-label);
  cursor: pointer;
  transition: color 0.2s ease;
  margin-left: 3px;
}

.k-select-label--disabled {
  color: var(--k-select-text-disabled);
  cursor: not-allowed;
}

.k-select-wrapper {
  position: relative;
  width: 100%;
}

.k-select-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--k-select-bg);
  border: 1px solid var(--k-select-border);
  border-radius: var(--k-select-radius);
  padding: 10px 14px;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  color: var(--k-select-text);
  box-shadow: var(--k-select-shadow);
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
  outline: none;
}

.k-select-trigger:hover:not(:disabled) {
  background-color: var(--k-select-bg-hover);
  border-color: var(--k-select-border-hover);
}

.k-select-trigger:disabled {
  background-color: var(--k-select-bg-disabled);
  color: var(--k-select-text-disabled);
  border-color: transparent;
  box-shadow: none;
  cursor: not-allowed;
}

.k-select-value {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.k-select-value--placeholder {
  color: var(--k-select-placeholder);
}

.k-select-icon {
  display: flex;
  align-items: center;
  color: var(--k-select-placeholder);
  transition: transform 0.2s ease, color 0.2s ease;
  flex-shrink: 0;
  margin-left: 8px;
}

.k-select-icon--open {
  transform: rotate(180deg);
  color: var(--k-select-text);
}

.k-select-trigger:focus .k-select-icon {
  color: var(--k-select-text);
}

.k-select-trigger:disabled .k-select-icon {
  color: var(--k-select-text-disabled);
}

.k-select-icon svg {
  width: 16px;
  height: 16px;
}

.k-select-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: var(--k-z-dropdown);
  background-color: var(--k-select-dropdown-bg);
  border: 1px solid var(--k-select-dropdown-border);
  border-radius: var(--k-select-radius);
  box-shadow: var(--k-select-dropdown-shadow);
  padding: 4px;
  margin: 0;
  list-style: none;
  max-height: 240px;
  overflow-y: auto;
}

.k-select-dropdown::-webkit-scrollbar {
  width: 6px;
}
.k-select-dropdown::-webkit-scrollbar-track {
  background: transparent;
}
.k-select-dropdown::-webkit-scrollbar-thumb {
  background-color: var(--k-select-border);
  border-radius: 10px;
}

.k-select-option {
  padding: 8px 12px;
  font-size: 14px;
  color: var(--k-select-text);
  border-radius: calc(var(--k-select-radius) - 2px);
  cursor: pointer;
  transition: background-color 0.1s ease, color 0.1s ease;
}

.k-select-option:hover,
.k-select-option--active {
  background-color: var(--k-select-option-hover);
}

.k-select-option--selected {
  background-color: var(--k-select-option-selected);
  color: var(--k-select-option-selected-text);
  font-weight: 500;
}

.k-select-option--selected:hover {
  background-color: var(--k-select-option-selected);
}

.k-select-fade-enter-active,
.k-select-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.k-select-fade-enter-from,
.k-select-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>