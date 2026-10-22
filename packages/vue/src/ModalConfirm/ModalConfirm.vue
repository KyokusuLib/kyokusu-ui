<script setup lang="ts">
import { ModalWindow } from '../ModalWindow';
import { Button } from '../Button';
import { useKyokusuLocale } from '../i18n';
import { computed } from 'vue';

defineOptions({
	inheritAttrs: false
});

interface Props {
	modelValue: boolean;
	title?: string;
	description?: string;
	confirmText?: string;
	cancelText?: string;
	locale?: string;
}

const props = defineProps<Props>();
const { t } = useKyokusuLocale(() => props.locale);

const title = computed(() => props.title ?? t('confirmTitle'));
const description = computed(() => props.description ?? t('confirmDescription'));
const confirmText = computed(() => props.confirmText ?? t('confirmText'));
const cancelText = computed(() => props.cancelText ?? t('cancelText'));

const emit = defineEmits(["update:modelValue", "confirm", "cancel"]);

const onConfirm = () => {
	emit("confirm");
	emit("update:modelValue", false);
};

const onCancel = () => {
	emit("cancel");
	emit("update:modelValue", false);
};
</script>

<template>
  <div class="k-modal-confirm">
    <ModalWindow 
      :model-value="modelValue" 
      @update:model-value="$emit('update:modelValue', $event)"
      :title="title" 
      :center-title="true"
      width="24rem"
    >
      <div class="k-modal-confirm-body">
        <p class="k-modal-confirm-description">
          {{ description }}
        </p>
        
        <div class="k-modal-confirm-actions">
          <Button variant="outline" @click="onCancel">
            {{ cancelText }}
          </Button>
          <Button variant="primary" @click="onConfirm">
            {{ confirmText }}
          </Button>
        </div>
      </div>
    </ModalWindow>
  </div>
</template>

<style scoped>
.k-modal-confirm-body {
	display: flex;
	flex-direction: column;
	gap: 16px;
	padding: 8px 0;
}

.k-modal-confirm-description {
	margin: 0;
	font-size: 14px;
	line-height: 1.6;
	text-align: center;
	color: var(--k-modal-confirm-desc, var(--k-zinc-600));
}

.dark .k-modal-confirm-description {
	--k-modal-confirm-desc: var(--k-zinc-400);
}

.k-modal-confirm-actions {
	display: flex;
	gap: 16px;
}

.k-modal-confirm-actions .k-modal-confirm-btn,
.k-modal-confirm-actions .k-button {
	flex: 1;
	min-width: 0;
}

.k-modal-confirm-btn {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
	font-family: inherit;
	font-weight: 500;
	font-size: 14px;
	text-align: center;
	white-space: nowrap;
	vertical-align: middle;
	user-select: none;
	border: 1px solid transparent;
	border-radius: 8px;
	cursor: pointer;
	transition: all 0.2s ease-in-out;
	outline: none;
	height: 36px;
	padding: 0 20px;
	text-decoration: none;
	line-height: 1;
}

.k-modal-confirm-btn:focus-visible {
	box-shadow: 0 0 0 3px var(--k-btn-ring, rgba(24, 24, 27, 0.2));
}

.k-modal-confirm-btn:active:not(:disabled) {
	transform: scale(0.97);
}

.k-modal-confirm-btn--cancel {
	background: transparent;
	color: var(--k-modal-confirm-cancel-text, var(--k-zinc-900));
	border-color: var(--k-modal-confirm-cancel-border, var(--k-zinc-200));
}

.k-modal-confirm-btn--cancel:hover {
	background: var(--k-modal-confirm-cancel-hover-bg, var(--k-zinc-100));
	border-color: var(--k-modal-confirm-cancel-hover-border, var(--k-zinc-300));
}

.dark .k-modal-confirm-btn--cancel {
	--k-modal-confirm-cancel-text: var(--k-zinc-100);
	--k-modal-confirm-cancel-border: var(--k-zinc-700);
	--k-modal-confirm-cancel-hover-bg: var(--k-zinc-800);
	--k-modal-confirm-cancel-hover-border: var(--k-zinc-600);
}

.k-modal-confirm-btn--confirm {
	background: var(--k-modal-confirm-confirm-bg, var(--k-zinc-900));
	color: var(--k-modal-confirm-confirm-text, var(--k-white));
	border-color: transparent;
}

.k-modal-confirm-btn--confirm:hover {
	background: var(--k-modal-confirm-confirm-hover-bg, var(--k-zinc-700));
}

.dark .k-modal-confirm-btn--confirm {
	--k-modal-confirm-confirm-bg: var(--k-white);
	--k-modal-confirm-confirm-text: var(--k-zinc-900);
	--k-modal-confirm-confirm-hover-bg: var(--k-zinc-200);
}

@media (max-width: 639px) {
	.k-modal-confirm-actions {
		flex-direction: column;
	}

	.k-modal-confirm-actions .k-modal-confirm-btn,
	.k-modal-confirm-actions .k-button {
		width: 100%;
	}
}

</style>
