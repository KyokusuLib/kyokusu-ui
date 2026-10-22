import '../styles/image-picker.css';
import { t } from '../i18n';

export type ImagePickerSize = 'sm' | 'md' | 'lg' | number;
export type ImagePickerBorder = 'solid' | 'dashed' | 'none';
export type ImagePickerShape = 'square' | 'circle';

export interface ImagePickerOptions {
    size?: ImagePickerSize;
    border?: ImagePickerBorder;
    shape?: ImagePickerShape;
    accept?: string;
    maxSize?: number;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    onChange?: (file: File | null) => void;
    onError?: (message: string) => void;
    /** BCP-47 locale used for built-in UI strings. */
    locale?: string;
}

export class ImagePicker {
    private container: HTMLElement;
    private options: ImagePickerOptions;
    private element!: HTMLElement;
    private input!: HTMLInputElement;
    private previewUrl: string | null = null;
    private currentFile: File | null = null;

    private sizeMap: Record<string, number> = {
        sm: 80,
        md: 120,
        lg: 160
    };

    constructor(element: HTMLElement | string, options: ImagePickerOptions = {}) {
        const target = typeof element === 'string' ? document.querySelector(element) : element;
        if (!target) throw new Error('[Kyokusu UI] Target element for ImagePicker not found');

        this.container = target as HTMLElement;
        this.options = {
            size: 'md',
            border: 'dashed',
            shape: 'square',
            accept: 'image/*',
            maxSize: 5,
            disabled: false,
            ...options,
            placeholder: options.placeholder ?? t(options.locale, 'imagePlaceholder')
        };

        this.mount();
    }

    private getPreviewSize(): number {
        if (typeof this.options.size === 'number') return this.options.size;
        return this.sizeMap[this.options.size || 'md'] || 120;
    }

    private mount() {
        this.container.innerHTML = '';

        // Label
        if (this.options.label) {
            const label = document.createElement('label');
            label.className = 'k-image-picker-label';
            label.textContent = this.options.label;
            this.container.appendChild(label);
        }

        // Wrapper
        this.element = document.createElement('div');
        this.element.className = 'k-image-picker';

        if (this.options.disabled) {
            this.element.classList.add('k-image-picker--disabled');
        }

        const size = this.getPreviewSize();
        this.element.style.width = `${size}px`;
        this.element.style.height = `${size}px`;
        this.element.style.borderRadius = this.options.shape === 'circle' ? '50%' : '8px';

        if (this.options.border !== 'none') {
            this.element.style.border = `2px ${this.options.border} var(--k-zinc-300)`;
        }

        // Hidden input
        this.input = document.createElement('input');
        this.input.type = 'file';
        this.input.accept = this.options.accept || 'image/*';
        this.input.className = 'k-image-picker-input';
        if (this.options.disabled) this.input.disabled = true;
        this.element.appendChild(this.input);

        // Placeholder
        this.renderPlaceholder();

        // Events
        this.input.addEventListener('change', this.onInputChange);
        this.element.addEventListener('click', this.onClick);
        this.element.addEventListener('dragover', this.onDragOver);
        this.element.addEventListener('dragleave', this.onDragLeave);
        this.element.addEventListener('drop', this.onDrop);

        this.container.appendChild(this.element);
    }

    private renderPlaceholder() {
        const existing = this.element.querySelector('.k-image-picker-placeholder, .k-image-picker-preview-wrap');
        if (existing) existing.remove();

        if (this.previewUrl) {
            const wrap = document.createElement('div');
            wrap.className = 'k-image-picker-preview-wrap';

            const img = document.createElement('img');
            img.src = this.previewUrl;
            img.className = 'k-image-picker-preview';
            img.alt = 'Preview';
            wrap.appendChild(img);

            if (!this.options.disabled) {
                const removeBtn = document.createElement('button');
                removeBtn.type = 'button';
                removeBtn.className = 'k-image-picker-remove';
                removeBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
                removeBtn.addEventListener('click', this.onRemove);
                wrap.appendChild(removeBtn);
            }

            this.element.appendChild(wrap);
        } else {
            const placeholder = document.createElement('div');
            placeholder.className = 'k-image-picker-placeholder';
            placeholder.innerHTML = `
                <svg class="k-image-picker-icon" width="24" height="24" viewBox="0 0 256 256" fill="none">
                    <rect x="32" y="32" width="192" height="192" rx="16" fill="none" stroke="currentColor" stroke-width="16"/>
                    <circle cx="136" cy="120" r="24" fill="none" stroke="currentColor" stroke-width="16"/>
                    <path d="M224,160l-43.51-43.51a8,8,0,0,0-11.31,0L136,149.66,107.51,121.17a8,8,0,0,0-11.31,0L56,160" fill="none" stroke="currentColor" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span class="k-image-picker-text">${this.options.placeholder || ''}</span>
            `;
            this.element.appendChild(placeholder);
        }
    }

    private onClick = (e: Event) => {
        if (this.options.disabled) return;
        if ((e.target as HTMLElement).classList.contains('k-image-picker-remove')) return;
        this.input.click();
    }

    private onInputChange = () => {
        const file = this.input.files?.[0];
        if (file) this.handleFile(file);
        this.input.value = '';
    }

    private onDragOver = (e: DragEvent) => {
        e.preventDefault();
        if (!this.options.disabled) {
            this.element.classList.add('k-image-picker--drag-over');
        }
    }

    private onDragLeave = () => {
        this.element.classList.remove('k-image-picker--drag-over');
    }

    private onDrop = (e: DragEvent) => {
        e.preventDefault();
        this.element.classList.remove('k-image-picker--drag-over');
        const file = e.dataTransfer?.files[0];
        if (file) this.handleFile(file);
    }

    private onRemove = (e: Event) => {
        e.stopPropagation();
        if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
        this.previewUrl = null;
        this.currentFile = null;
        this.renderPlaceholder();
        this.options.onChange?.(null);
    }

    private handleFile(file: File) {
        if (this.options.disabled) return;

        if (!file.type.startsWith('image/')) {
            this.options.onError?.(t(this.options.locale, 'invalidImageType'));
            return;
        }

        const maxBytes = (this.options.maxSize || 5) * 1024 * 1024;
        if (file.size > maxBytes) {
            this.options.onError?.(t(this.options.locale, 'fileTooLarge', { size: this.options.maxSize ?? 5 }));
            return;
        }

        if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
        this.previewUrl = URL.createObjectURL(file);
        this.currentFile = file;
        this.renderPlaceholder();
        this.options.onChange?.(file);
    }

    public getFile(): File | null {
        return this.currentFile;
    }

    public updateOptions(newOptions: Partial<ImagePickerOptions>) {
        this.options = { ...this.options, ...newOptions };
        if (this.previewUrl) {
            URL.revokeObjectURL(this.previewUrl);
            this.previewUrl = null;
            this.currentFile = null;
        }
        this.mount();
    }

    public getElement() {
        return this.element;
    }

    public unmount() {
        if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
        this.element?.removeEventListener('click', this.onClick);
        this.element?.removeEventListener('dragover', this.onDragOver);
        this.element?.removeEventListener('dragleave', this.onDragLeave);
        this.element?.removeEventListener('drop', this.onDrop);
        this.container.innerHTML = '';
    }
}
