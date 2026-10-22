import '../styles/input.css';
import { createId } from '../utils/id';

export interface InputOptions {
    value?: string;
    id?: string;
    label?: string;
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
    placeholder?: string;
    error?: string;
    disabled?: boolean;
    autocomplete?: string;
    description?: string;
    onChange?: (value: string) => void;
}

const ICONS = {
    email: `<svg width="18" height="18" viewBox="0 0 256 256" fill="currentColor"><path d="M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48ZM203.43,64,128,133.15,52.57,64ZM216,192H40V74.19l82.59,75.71a16,16,0,0,0,20.82,0L216,74.19V192Z"></path></svg>`,
    password: `<svg width="18" height="18" viewBox="0 0 256 256" fill="currentColor"><path d="M208,80H176V56a48,48,0,0,0-96,0V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80ZM96,56a32,32,0,0,1,64,0V80H96ZM208,208H48V96H208V208Zm-64-56a16,16,0,1,1-16-16A16,16,0,0,1,144,152Z"></path></svg>`,
    eye: `<svg width="18" height="18" viewBox="0 0 256 256" fill="currentColor"><path d="M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.48c.35.79,8.82,19.58,27.65,38.41C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.35c18.83-18.83,27.3-37.62,27.65-38.41A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128,133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231,128c-7.22,13.47-35,64-103,64Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z"></path></svg>`,
    eyeSlash: `<svg width="18" height="18" viewBox="0 0 256 256" fill="currentColor"><path d="M53.92,34.62A8,8,0,1,0,42.08,45.38l38.21,43.66A160.7,160.7,0,0,0,36.34,105.9C17.51,124.73,9,143.53,8.69,144.29a8,8,0,0,0,0,6.48c.35.79,8.82,19.57,27.65,38.4C61.43,214.26,93.12,227.52,128,227.52a127.81,127.81,0,0,0,51.81-10.87l22.27,25.45a8,8,0,1,0,12-10.51ZM128,211.52c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,147.52a133.15,133.15,0,0,1,20.09-28l46.22,52.82a48.07,48.07,0,0,0,61.1,10L169,198.81A111.45,111.45,0,0,1,128,211.52Zm58.6-35.83,11.57,13.22A160.71,160.71,0,0,0,219.66,169c18.83-18.83,27.3-37.62,27.65-38.41a8,8,0,0,0,0-6.48c-.35-.79-8.82-19.57-27.65-38.4C194.57,60.78,162.88,47.52,128,47.52a127.83,127.83,0,0,0-51.81,10.87L90,73.81a111.45,111.45,0,0,1,38-6.69c30.78,0,57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231,147.52a133.15,133.15,0,0,1-20.09,28l-5.69-6.5A48.05,48.05,0,0,0,128,99.52a48.51,48.51,0,0,0-9.84,1L101,81A64.12,64.12,0,0,1,128,83.52a64,64,0,0,1,58.6,92.17Z"></path></svg>`
};

export class Input {
    private container: HTMLElement;
    private options: InputOptions;
    private value: string;
    private id: string;
    private isPasswordVisible = false;
    
    private inputEl!: HTMLInputElement;
    private errorEl?: HTMLParagraphElement;
    private descEl?: HTMLParagraphElement;
    private toggleBtn?: HTMLButtonElement;
    private wrapperEl!: HTMLDivElement;
    private labelEl?: HTMLLabelElement;

    constructor(element: HTMLElement | string, options: InputOptions) {
        const target = typeof element === 'string' ? document.querySelector(element) : element;
        if (!target) throw new Error('[Kyokusu UI] Target element for Input not found');

        this.container = target as HTMLElement;
        this.options = { type: 'text', ...options };
        this.value = options.value ?? '';
        this.id = options.id ?? createId('k-input');

        this.mount();
    }

    private createEl<K extends keyof HTMLElementTagNameMap>(
        tag: K, 
        className: string, 
        attributes: Record<string, any> = {}
    ): HTMLElementTagNameMap[K] {
        const el = document.createElement(tag);
        el.className = className;
        Object.entries(attributes).forEach(([key, val]) => {
            if (key in el) (el as any)[key] = val;
            else el.setAttribute(key, val);
        });
        return el;
    }

    private mount() {
        this.container.innerHTML = '';
        
        this.wrapperEl = this.createEl('div', 'k-input-wrapper');

        if (this.options.label) {
            this.labelEl = this.createEl('label', 'k-input-label', { 
                htmlFor: this.id, 
                textContent: this.options.label 
            });
            this.wrapperEl.appendChild(this.labelEl);
        }

        const inputContainer = this.createEl('div', 'k-input-container');
        const isEmail = this.options.type === 'email';
        const isPassword = this.options.type === 'password';

        if (isEmail || isPassword) {
            inputContainer.appendChild(this.createEl('div', 'k-input-icon k-input-icon--left', {
                innerHTML: isEmail ? ICONS.email : ICONS.password
            }));
        }

        this.inputEl = this.createEl('input', 'k-input-field', {
            id: this.id,
            type: this.options.type || 'text',
            value: this.value,
            placeholder: this.options.placeholder || '',
            autocomplete: this.options.autocomplete || '',
            disabled: !!this.options.disabled
        });

        this.inputEl.classList.toggle('k-input-field--disabled', !!this.options.disabled);
        this.inputEl.classList.toggle('k-input-field--error', !!this.options.error);
        this.inputEl.classList.toggle('k-input-field--with-left', isEmail || isPassword);
        this.inputEl.classList.toggle('k-input-field--with-right', isPassword);

        this.inputEl.addEventListener('input', (e) => {
            this.value = (e.target as HTMLInputElement).value;
            if (this.options.onChange) this.options.onChange(this.value);
        });

        inputContainer.appendChild(this.inputEl);

        if (isPassword) {
            this.toggleBtn = this.createEl('button', 'k-input-icon k-input-icon--right k-input-icon--clickable', {
                type: 'button',
                tabIndex: -1,
                innerHTML: ICONS.eyeSlash
            });
            
            this.toggleBtn.addEventListener('click', () => {
                this.isPasswordVisible = !this.isPasswordVisible;
                this.inputEl.type = this.isPasswordVisible ? 'text' : 'password';
                if (this.toggleBtn) {
                    this.toggleBtn.innerHTML = this.isPasswordVisible ? ICONS.eye : ICONS.eyeSlash;
                }
            });
            
            inputContainer.appendChild(this.toggleBtn);
        }

        this.wrapperEl.appendChild(inputContainer);

        if (this.options.error) {
            this.errorEl = this.createEl('p', 'k-input-error-text', { textContent: this.options.error });
            this.wrapperEl.appendChild(this.errorEl);
        } else if (this.options.description) {
            this.descEl = this.createEl('p', 'k-input-description', { textContent: this.options.description });
            this.wrapperEl.appendChild(this.descEl);
        }

        this.container.appendChild(this.wrapperEl);
    }

    public getValue(): string {
        return this.value;
    }

    public setValue(val: string) {
        if (this.value === val) return;
        this.value = val;
        this.inputEl.value = val;
    }

    public setDisabled(disabled: boolean) {
        this.options.disabled = disabled;
        this.inputEl.disabled = disabled;
        this.inputEl.classList.toggle('k-input-field--disabled', disabled);
    }

    public setError(error?: string) {
        this.options.error = error;
        this.inputEl.classList.toggle('k-input-field--error', !!error);
        
        if (error) {
            if (this.descEl) this.descEl.style.display = 'none';
            if (!this.errorEl) {
                this.errorEl = this.createEl('p', 'k-input-error-text');
                this.wrapperEl.appendChild(this.errorEl);
            }
            this.errorEl.textContent = error;
            this.errorEl.style.display = 'block';
        } else {
            if (this.errorEl) this.errorEl.style.display = 'none';
            if (this.descEl) this.descEl.style.display = 'block';
        }
    }

    public updateOptions(newOptions: Partial<InputOptions>) {
        this.options = { ...this.options, ...newOptions };
        
        if (newOptions.label !== undefined) {
             if (this.labelEl) {
                 this.labelEl.textContent = newOptions.label;
             } else if (newOptions.label) {
                 this.labelEl = this.createEl('label', 'k-input-label', { 
                    htmlFor: this.id, 
                    textContent: newOptions.label 
                });
                this.wrapperEl.insertBefore(this.labelEl, this.wrapperEl.firstChild);
             }
        }

        if (newOptions.placeholder !== undefined) {
            this.inputEl.placeholder = newOptions.placeholder;
        }

        if (newOptions.disabled !== undefined) {
            this.setDisabled(newOptions.disabled);
        }

        if (newOptions.error !== undefined) {
            this.setError(newOptions.error);
        }
        
        if(newOptions.value !== undefined) {
            this.setValue(newOptions.value);
        }
    }

    public unmount() {
        this.container.innerHTML = '';
    }
}