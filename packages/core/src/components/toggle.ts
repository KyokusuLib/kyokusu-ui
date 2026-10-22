import '../styles/toggle.css'
import { createId } from '../utils/id';

export interface ToggleOptions {
    checked?: boolean;
    disabled?: boolean;
    label?: string;
    id?: string;
    onChange?: (checked: boolean) => void;
}

export class Toggle {
    private container: HTMLElement;
    private checked: boolean;
    private disabled: boolean;
    private id: string;
    private options: ToggleOptions;

    private rootEl!: HTMLDivElement;
    private buttonEl!: HTMLButtonElement;
    private labelEl?: HTMLLabelElement;

    private readonly toggleHandler = this.toggle.bind(this);

    constructor(element: HTMLElement | string, options: ToggleOptions = {}) {
        const target = typeof element === 'string' ? document.querySelector(element) : element;
        if (!target) {
            throw new Error('[Kyokusu UI] Target element not found');
        }
        
        this.container = target as HTMLElement;
        this.options = options;
        this.checked = options.checked ?? false;
        this.disabled = options.disabled ?? false;
        this.id = options.id ?? createId('k-toggle');

        this.mount();
    }

    private mount() {
        this.container.innerHTML = '';

        this.rootEl = document.createElement('div');
        this.rootEl.className = 'k-toggle-container';

        if (this.options.label) {
            this.labelEl = document.createElement('label');
            this.labelEl.className = 'k-toggle-label';
            this.labelEl.htmlFor = this.id;
            this.labelEl.textContent = this.options.label;
            this.rootEl.appendChild(this.labelEl);
        }

        this.buttonEl = document.createElement('button');
        this.buttonEl.type = 'button';
        this.buttonEl.role = 'switch';
        this.buttonEl.id = this.id;
        this.buttonEl.className = 'k-toggle-switch';
        
        const srSpan = document.createElement('span');
        srSpan.className = 'sr-only';
        srSpan.textContent = this.options.label || 'Toggle';

        const thumbSpan = document.createElement('span');
        thumbSpan.className = 'k-toggle-thumb';
        thumbSpan.setAttribute('aria-hidden', 'true');

        this.buttonEl.appendChild(srSpan);
        this.buttonEl.appendChild(thumbSpan);
        this.rootEl.appendChild(this.buttonEl);

        this.updateDOM();

        this.buttonEl.addEventListener('click', this.toggleHandler);
        if (this.labelEl) {
            this.labelEl.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggle();
            });
        }

        this.container.appendChild(this.rootEl);
    }

    private toggle() {
        if (this.disabled) return;
        
        this.checked = !this.checked;
        this.updateDOM();
        
        if (this.options.onChange) {
            this.options.onChange(this.checked);
        }
    }

    private updateDOM() {
        this.buttonEl.setAttribute('aria-checked', String(this.checked));
        this.buttonEl.disabled = this.disabled;
        
        if (this.checked) {
            this.buttonEl.classList.add('k-toggle--active');
        } else {
            this.buttonEl.classList.remove('k-toggle--active');
        }
        
        if (this.labelEl) {
            if (this.disabled) {
                this.labelEl.classList.add('k-toggle-label--disabled');
            } else {
                this.labelEl.classList.remove('k-toggle-label--disabled');
            }
        }
    }

    public setChecked(value: boolean) {
        if (this.checked === value) return;
        this.checked = value;
        this.updateDOM();
    }

    public setDisabled(value: boolean) {
        if (this.disabled === value) return;
        this.disabled = value;
        this.updateDOM();
    }

    public unmount() {
        this.buttonEl.removeEventListener('click', this.toggleHandler);
        this.container.innerHTML = '';
    }
}