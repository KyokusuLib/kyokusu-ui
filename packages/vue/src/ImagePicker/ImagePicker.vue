<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { PhImage, PhX } from '@phosphor-icons/vue'
import type { ImagePickerProps } from './types'
import { useKyokusuLocale } from '../i18n'

interface Props {
    size?: ImagePickerProps['size']
    border?: ImagePickerProps['border']
    shape?: ImagePickerProps['shape']
    accept?: ImagePickerProps['accept']
    maxSize?: ImagePickerProps['maxSize']
    label?: ImagePickerProps['label']
    placeholder?: ImagePickerProps['placeholder']
    disabled?: ImagePickerProps['disabled']
    locale?: string
}

const props = withDefaults(defineProps<Props>(), {
    size: 'md',
    border: 'dashed',
    shape: 'square',
    accept: 'image/*',
    maxSize: 5,
    label: '',
    placeholder: '',
    disabled: false
})

const { t } = useKyokusuLocale(() => props.locale)

const emit = defineEmits<{
    (e: 'update:modelValue', value: File | null): void
    (e: 'change', file: File | null): void
    (e: 'error', message: string): void
}>()

const model = defineModel<File | null>({ default: null })

const inputRef = ref<HTMLInputElement | null>(null)
const previewUrl = ref<string | null>(null)
const isDragOver = ref(false)

const sizeMap: Record<string, number> = {
    sm: 80,
    md: 120,
    lg: 160
}

const previewSize = computed(() => {
    if (typeof props.size === 'number') return props.size
    return sizeMap[props.size] || 120
})

const wrapperStyle = computed(() => ({
    width: `${previewSize.value}px`,
    height: `${previewSize.value}px`,
    borderRadius: props.shape === 'circle' ? '50%' : '8px'
}))

const borderStyle = computed(() => {
    if (props.border === 'none') return {}
    return {
        border: `2px ${props.border} ${isDragOver.value ? 'var(--k-zinc-900)' : 'var(--k-zinc-300)'}`
    }
})

const handleFile = (file: File) => {
    if (props.disabled) return

    if (!file.type.startsWith('image/')) {
        emit('error', t('invalidImageType'))
        return
    }

    if (file.size > props.maxSize * 1024 * 1024) {
        emit('error', t('fileTooLarge', { size: props.maxSize }))
        return
    }

    model.value = file
    emit('change', file)
}

const onInputChange = (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (file) handleFile(file)
    target.value = ''
}

const onDrop = (event: DragEvent) => {
    event.preventDefault()
    isDragOver.value = false

    const file = event.dataTransfer?.files[0]
    if (file) handleFile(file)
}

const onDragOver = (event: DragEvent) => {
    event.preventDefault()
    if (!props.disabled) isDragOver.value = true
}

const onDragLeave = () => {
    isDragOver.value = false
}

const openPicker = () => {
    if (!props.disabled) inputRef.value?.click()
}

const removeImage = (event: MouseEvent) => {
    event.stopPropagation()
    model.value = null
    previewUrl.value = null
}

watch(model, (file) => {
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
    if (file) {
        previewUrl.value = URL.createObjectURL(file)
    } else {
        previewUrl.value = null
    }
}, { immediate: true })
</script>

<template>
    <div class="k-image-picker-wrapper">
        <label v-if="label" class="k-image-picker-label">{{ label }}</label>
        
        <div
            class="k-image-picker"
            :class="{
                'k-image-picker--disabled': disabled,
                'k-image-picker--drag-over': isDragOver,
                'k-image-picker--has-image': previewUrl
            }"
            :style="{ ...wrapperStyle, ...borderStyle }"
            @click="openPicker"
            @drop="onDrop"
            @dragover="onDragOver"
            @dragleave="onDragLeave"
        >
            <input
                ref="inputRef"
                type="file"
                :accept="accept"
                :disabled="disabled"
                class="k-image-picker-input"
                @change="onInputChange"
            />

            <template v-if="previewUrl">
                <img :src="previewUrl" class="k-image-picker-preview" alt="Preview" />
                <button
                    v-if="!disabled"
                    class="k-image-picker-remove"
                    @click="removeImage"
                    type="button"
                >
                    <PhX :size="14" />
                </button>
            </template>

            <template v-else>
                <div class="k-image-picker-placeholder">
                    <PhImage :size="24" class="k-image-picker-icon" />
                    <span class="k-image-picker-text">{{ placeholder || t('imagePlaceholder') }}</span>
                </div>
            </template>
        </div>
    </div>
</template>

<style scoped>
.k-image-picker-wrapper {
    display: flex;
    flex-direction: column;
    gap: 6px;

    --k-picker-bg: var(--k-zinc-50);
    --k-picker-bg-hover: var(--k-zinc-100);
    --k-picker-border: var(--k-zinc-300);
    --k-picker-border-active: var(--k-zinc-900);
    --k-picker-text: var(--k-zinc-500);
    --k-picker-icon: var(--k-zinc-400);
    --k-picker-label: var(--k-zinc-900);
    --k-picker-remove-bg: var(--k-red-500);
}

.dark .k-image-picker-wrapper {
    --k-picker-bg: var(--k-zinc-900);
    --k-picker-bg-hover: var(--k-zinc-800);
    --k-picker-border: var(--k-zinc-700);
    --k-picker-border-active: var(--k-white);
    --k-picker-text: var(--k-zinc-500);
    --k-picker-icon: var(--k-zinc-600);
    --k-picker-label: var(--k-zinc-100);
}

.k-image-picker-label {
    font-size: 14px;
    font-weight: 500;
    color: var(--k-picker-label);
}

.k-image-picker {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--k-picker-bg);
    cursor: pointer;
    transition: all 0.2s ease;
    overflow: hidden;
}

.k-image-picker:hover:not(.k-image-picker--disabled) {
    background-color: var(--k-picker-bg-hover);
    border-color: var(--k-picker-border-active) !important;
}

.k-image-picker--drag-over {
    background-color: var(--k-picker-bg-hover);
    border-color: var(--k-picker-border-active) !important;
}

.k-image-picker--disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.k-image-picker-input {
    position: absolute;
    width: 0;
    height: 0;
    opacity: 0;
    pointer-events: none;
}

.k-image-picker-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 12px;
}

.k-image-picker-icon {
    color: var(--k-picker-icon);
}

.k-image-picker-text {
    font-size: 12px;
    color: var(--k-picker-text);
    text-align: center;
    line-height: 1.3;
}

.k-image-picker-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.k-image-picker-remove {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--k-picker-remove-bg);
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.2s ease;
    padding: 0;
}

.k-image-picker:hover .k-image-picker-remove {
    opacity: 1;
}

.k-image-picker--circle .k-image-picker-remove {
    top: 0;
    right: 0;
}
</style>
