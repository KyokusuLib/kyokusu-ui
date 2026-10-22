import '../styles/spinner.css';
import { t } from '../i18n';

export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl' | number;
export type SpinnerVariant = 'default' | 'primary' | 'secondary';

export interface SpinnerOptions {
    size?: SpinnerSize;
    variant?: SpinnerVariant;
    /** BCP-47 locale used for built-in UI strings. */
    locale?: string;
}

export class Spinner {
    private container: HTMLElement;
    private options: SpinnerOptions;
    private element!: HTMLElement;

    constructor(element: HTMLElement | string, options: SpinnerOptions = {}) {
        const target = typeof element === 'string' ? document.querySelector(element) : element;
        if (!target) throw new Error('[Kyokusu UI] Target element for Spinner not found');

        this.container = target as HTMLElement;
        this.options = {
            size: 'md',
            variant: 'default',
            ...options
        };

        this.mount();
    }

    private mount() {
        this.container.innerHTML = '';

        this.element = document.createElement('span');
        this.element.className = 'k-spinner';
        this.element.setAttribute('role', 'status');
        this.element.setAttribute('aria-label', t(this.options.locale, 'loading'));

        if (typeof this.options.size === 'string') {
            this.element.classList.add(`k-spinner--${this.options.size}`);
        } else if (typeof this.options.size === 'number') {
            this.element.style.width = `${this.options.size}px`;
            this.element.style.height = `${this.options.size}px`;
        }

        if (this.options.variant && this.options.variant !== 'default') {
            this.element.classList.add(`k-spinner--${this.options.variant}`);
        }

        this.element.innerHTML = `
            <svg class="k-spinner-svg" viewBox="0 0 50 50">
                <circle 
                    class="k-spinner-circle" 
                    cx="25" 
                    cy="25" 
                    r="20" 
                    fill="none" 
                    stroke-width="4"
                />
            </svg>
        `;

        this.container.appendChild(this.element);
    }

    public updateOptions(newOptions: Partial<SpinnerOptions>) {
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
