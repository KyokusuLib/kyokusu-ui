import '../styles/select.css';
import { createId } from '../utils/id';

export interface SelectOption {
    value: string;
    label: string;
}

export interface SelectOptions {
    value?: string;
    label?: string;
    id?: string;
    placeholder?: string;
    options: SelectOption[];
    disabled?: boolean;
    onChange?: (value: string) => void;
}

export class Select {
    private container: HTMLElement;
    private options: SelectOptions;
    private id: string;
    private value: string;
    
    private selectEl!: HTMLSelectElement;
    private labelEl?: HTMLLabelElement;

    constructor(element: HTMLElement | string, options: SelectOptions) {
        const target = typeof element === 'string' ? document.querySelector(element) : element;
        if (!target) throw new Error('[Kyokusu UI] Target element for Select not found');

        this.container = target as HTMLElement;
        this.options = options;
        this.value = options.value ?? '';
        this.id = options.id ?? createId('k-select');

        this.mount();
    }

    private mount() {
        this.container.innerHTML = '';

        const root = document.createElement('div');
        root.className = 'k-select-container';

        if (this.options.label) {
            this.labelEl = document.createElement('label');
            this.labelEl.className = 'k-select-label';
            this.labelEl.htmlFor = this.id;
            this.labelEl.textContent = this.options.label;
            if (this.options.disabled) {
                this.labelEl.classList.add('k-select-label--disabled');
            }
            root.appendChild(this.labelEl);
        }

        const wrapper = document.createElement('div');
        wrapper.className = 'k-select-wrapper';

        this.selectEl = document.createElement('select');
        this.selectEl.id = this.id;
        this.selectEl.className = 'k-select-input';
        this.selectEl.disabled = this.options.disabled ?? false;
        
        if (this.options.placeholder) {
            const placeholderOpt = document.createElement('option');
            placeholderOpt.value = '';
            placeholderOpt.disabled = true;
            placeholderOpt.selected = !this.value;
            placeholderOpt.textContent = this.options.placeholder;
            this.selectEl.appendChild(placeholderOpt);
        }

        this.options.options.forEach(opt => {
            const optionEl = document.createElement('option');
            optionEl.value = opt.value;
            optionEl.textContent = opt.label;
            if (this.value === opt.value) optionEl.selected = true;
            this.selectEl.appendChild(optionEl);
        });

        const iconContainer = document.createElement('div');
        iconContainer.className = 'k-select-icon';
        iconContainer.innerHTML = `
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
        `;

        this.selectEl.addEventListener('change', (e) => {
            this.value = (e.target as HTMLSelectElement).value;
            if (this.options.onChange) {
                this.options.onChange(this.value);
            }
        });

        wrapper.appendChild(this.selectEl);
        wrapper.appendChild(iconContainer);
        root.appendChild(wrapper);
        
        this.container.appendChild(root);
    }

    public getValue(): string {
        return this.value;
    }

    public setValue(val: string) {
        if (this.value === val) return;
        this.value = val;
        this.selectEl.value = val;
    }

    public setDisabled(disabled: boolean) {
        this.options.disabled = disabled;
        this.selectEl.disabled = disabled;
        
        if (this.labelEl) {
            if (disabled) {
                this.labelEl.classList.add('k-select-label--disabled');
            } else {
                this.labelEl.classList.remove('k-select-label--disabled');
            }
        }
    }

    public unmount() {
        this.container.innerHTML = '';
    }
}