import '../styles/circle-block.css';

export type CircleBlockSize = 'sm' | 'md' | 'lg' | number;

export interface CircleBlockOptions {
    text?: string;
    icon?: string;
    src?: string;
    bg?: string;
    color?: string;
    border?: boolean;
    size?: CircleBlockSize;
}

export class CircleBlock {
    private container: HTMLElement;
    private options: CircleBlockOptions;
    private element!: HTMLElement;

    private sizeMap: Record<string, number> = {
        sm: 32,
        md: 40,
        lg: 56
    };

    constructor(element: HTMLElement | string, options: CircleBlockOptions = {}) {
        const target = typeof element === 'string' ? document.querySelector(element) : element;
        if (!target) throw new Error('[Kyokusu UI] Target element for CircleBlock not found');

        this.container = target as HTMLElement;
        this.options = {
            size: 'md',
            border: false,
            ...options
        };

        this.mount();
    }

    private getPixelSize(): number {
        if (typeof this.options.size === 'number') return this.options.size;
        return this.sizeMap[this.options.size || 'md'] || 40;
    }

    private getInitials(): string {
        if (!this.options.text) return '';
        const words = this.options.text.trim().split(/\s+/);
        if (words.length === 1) {
            return words[0].substring(0, 2).toUpperCase();
        }
        return (words[0][0] + words[1][0]).toUpperCase();
    }

    private getFontSize(): string {
        const size = this.getPixelSize();
        if (size <= 32) return '11px';
        if (size <= 40) return '13px';
        return '16px';
    }

    private mount() {
        this.container.innerHTML = '';

        const size = this.getPixelSize();

        this.element = document.createElement('div');
        this.element.className = 'k-circle-block';
        this.element.style.width = `${size}px`;
        this.element.style.height = `${size}px`;
        this.element.style.backgroundColor = this.options.bg || 'var(--k-zinc-200)';
        this.element.style.borderRadius = '50%';

        if (this.options.border) {
            this.element.style.border = '2px solid var(--k-white)';
        }

        if (this.options.src) {
            const img = document.createElement('img');
            img.src = this.options.src;
            img.className = 'k-circle-block-img';
            img.alt = '';
            this.element.appendChild(img);
        } else if (this.options.icon) {
            const wrapper = document.createElement('span');
            wrapper.className = 'k-circle-block-icon';
            wrapper.innerHTML = this.options.icon;
            if (this.options.color) wrapper.style.color = this.options.color;
            this.element.appendChild(wrapper);
        } else if (this.options.text) {
            const span = document.createElement('span');
            span.className = 'k-circle-block-text';
            span.textContent = this.getInitials();
            span.style.fontSize = this.getFontSize();
            if (this.options.color) span.style.color = this.options.color;
            this.element.appendChild(span);
        }

        this.container.appendChild(this.element);
    }

    public updateOptions(newOptions: Partial<CircleBlockOptions>) {
        this.options = { ...this.options, ...newOptions };
        this.mount();
    }

    public getElement() {
        return this.element;
    }

    public unmount() {
        this.container.innerHTML = '';
    }
}
