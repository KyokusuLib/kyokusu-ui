<script lang="ts" setup>
import { useId } from 'vue';

const props = defineProps<{
  label?: string;
  id?: string;
  disabled?: boolean;
}>();

const model = defineModel<boolean>({ default: false });

const toggleId = props.id || useId();

const toggle = () => {
  if (!props.disabled) {
    model.value = !model.value;
  }
};
</script>

<template>
  <div class="k-toggle-container">
    <label 
      v-if="label" 
      :for="toggleId" 
      class="k-toggle-label"
      :class="{ 'k-toggle-label--disabled': disabled }"
      @click.prevent="toggle" 
    >
      {{ label }}
    </label>    
    <button 
      :id="toggleId"
      type="button"
      role="switch"
      :aria-checked="model"
      :disabled="disabled"
      @click="toggle"
      class="k-toggle-switch"
      :class="{ 'k-toggle--active': model }"
    >
      <span class="sr-only">{{ label }}</span>
      <span 
        aria-hidden="true" 
        class="k-toggle-thumb"
      ></span>
    </button>
  </div>
</template>

<style scoped>
.dark .k-toggle-container {
  --k-toggle-bg-off: var(--k-zinc-200);
  --k-toggle-bg-on: var(--k-white);
  --k-toggle-thumb-off: var(--k-zinc-500);
  --k-toggle-thumb-on: var(--k-zinc-900);
  --k-toggle-ring: var(--k-white);
  --k-toggle-label-color: var(--k-zinc-100);
}

.k-toggle-container {
  --k-toggle-width: 48px;
  --k-toggle-height: 24px;
  --k-toggle-thumb-size: 20px;

  --k-toggle-bg-off: var(--k-zinc-700);
  --k-toggle-bg-on: var(--k-zinc-900);
  --k-toggle-thumb-off: var(--k-zinc-400);
  --k-toggle-thumb-on: var(--k-white);
  --k-toggle-ring: var(--k-zinc-900);
  --k-toggle-label-color: var(--k-zinc-900);

  display: flex;
  align-items: center;
  gap: 12px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.k-toggle-switch {
  position: relative;
  display: inline-flex;
  align-items: center;
  height: var(--k-toggle-height);
  width: var(--k-toggle-width);
  flex-shrink: 0;
  cursor: pointer;
  border-radius: 9999px;
  border: 1px solid transparent;
  background-color: var(--k-toggle-bg-off);
  transition: background-color 0.2s ease-in-out, box-shadow 0.2s;
  outline: none;
  box-sizing: border-box;
  padding: 0;
}

.k-toggle-switch:focus-visible {
  box-shadow: 0 0 0 2px transparent, 0 0 0 4px var(--k-toggle-ring);
}

.k-toggle--active {
  background-color: var(--k-toggle-bg-on);
}

.k-toggle-switch:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.k-toggle-thumb {
  pointer-events: none;
  position: absolute;
  left: 1px;
  height: var(--k-toggle-thumb-size);
  width: var(--k-toggle-thumb-size);
  border-radius: 50%;
  background-color: var(--k-toggle-thumb-off);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-in-out, background-color 0.2s;
}

.k-toggle--active .k-toggle-thumb {
  transform: translateX(24px); 
  background-color: var(--k-toggle-thumb-on);
}

.k-toggle-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--k-toggle-label-color);
  cursor: pointer;
  user-select: none;
  transition: color 0.2s ease-in-out;
}

.k-toggle-label--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>