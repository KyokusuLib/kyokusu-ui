import '../styles/rich-text.css';
import { createId } from '../utils/id';

export interface EditorOptions {
    value?: string;
    id?: string;
    label?: string;
    maxLength?: number;
    error?: string;
    disabled?: boolean;
    placeholder?: string;
    onChange?: (value: string) => void;
}

const ICONS = {
    bold: `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path></svg>`,
    italic: `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="19" y1="4" x2="10" y2="4"></line><line x1="14" y1="20" x2="5" y2="20"></line><line x1="15" y1="4" x2="9" y2="20"></line></svg>`,
    strikeThrough: `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"></line><path d="M16 6C16 6 14.5 4 12 4 9.5 4 8 6 8 8c0 2 2.5 3 4 4s4 2 4 4c0 2-1.5 4-4 4-2.5 0-4-2-4-2"></path></svg>`
};

export class RichText {
    private container: HTMLElement;
    private options: EditorOptions;
    private value: string;
    private id: string;
    
    private boxEl!: HTMLDivElement;
    private contentEl!: HTMLDivElement;
    private counterEl?: HTMLDivElement;
    private errorEl?: HTMLParagraphElement;
    private buttons: Record<string, HTMLButtonElement> = {};

    constructor(element: HTMLElement | string, options: EditorOptions) {
        const target = typeof element === 'string' ? document.querySelector(element) : element;
        if (!target) throw new Error('[Kyokusu UI] Target element for Editor not found');

        this.container = target as HTMLElement;
        this.options = options;
        this.value = options.value ?? '';
        this.id = options.id ?? createId('k-editor');

        this.mount();
    }

    private mount() {
        this.container.innerHTML = '';

        const root = document.createElement('div');
        root.className = 'k-editor-wrapper';

        if (this.options.label) {
            const label = document.createElement('label');
            label.className = 'k-editor-label';
            label.htmlFor = this.id;
            label.textContent = this.options.label;
            root.appendChild(label);
        }

        this.boxEl = document.createElement('div');
        this.boxEl.className = 'k-editor-box';
        if (this.options.error) this.boxEl.classList.add('k-editor-box--error');
        if (this.options.disabled) this.boxEl.classList.add('k-editor-box--disabled');

        this.contentEl = document.createElement('div');
        this.contentEl.className = 'k-editor-content';
        this.contentEl.id = this.id;
        this.contentEl.contentEditable = this.options.disabled ? 'false' : 'true';
        this.contentEl.innerHTML = this.value;
        if (this.options.placeholder) {
            this.contentEl.dataset.placeholder = this.options.placeholder;
        }

        const handleInput = () => {
            const content = this.contentEl.innerHTML;
            const text = this.contentEl.innerText.trim();

            if (this.options.maxLength && text.length > this.options.maxLength) {
                this.contentEl.innerHTML = this.value;
                return;
            }

            this.value = content === '<br>' ? '' : content;
            this.updateCounter();
            this.syncStates();
            if (this.options.onChange) this.options.onChange(this.value);
        };

        this.contentEl.addEventListener('input', handleInput);
        this.contentEl.addEventListener('keyup', () => this.syncStates());
        this.contentEl.addEventListener('mouseup', () => this.syncStates());

        const toolbar = document.createElement('div');
        toolbar.className = 'k-editor-toolbar';

        ['bold', 'italic', 'strikeThrough'].forEach(command => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'k-editor-btn';
            btn.disabled = !!this.options.disabled;
            btn.innerHTML = ICONS[command as keyof typeof ICONS];
            btn.title = command;

            btn.addEventListener('click', () => {
                if (this.options.disabled) return;
                document.execCommand(command, false);
                this.contentEl.focus();
                handleInput();
            });

            this.buttons[command] = btn;
            toolbar.appendChild(btn);
        });

        if (this.options.maxLength !== undefined) {
            this.counterEl = document.createElement('div');
            this.counterEl.className = 'k-editor-counter';
            toolbar.appendChild(this.counterEl);
            this.updateCounter();
        }

        this.boxEl.appendChild(this.contentEl);
        this.boxEl.appendChild(toolbar);
        root.appendChild(this.boxEl);

        if (this.options.error) {
            this.errorEl = document.createElement('p');
            this.errorEl.className = 'k-editor-error-text';
            this.errorEl.textContent = this.options.error;
            root.appendChild(this.errorEl);
        }

        this.container.appendChild(root);
    }

    private syncStates() {
        if (this.options.disabled) return;
        ['bold', 'italic', 'strikeThrough'].forEach(command => {
            if (document.queryCommandState(command)) {
                this.buttons[command].classList.add('k-editor-btn--active');
            } else {
                this.buttons[command].classList.remove('k-editor-btn--active');
            }
        });
    }

    private updateCounter() {
        if (!this.counterEl || this.options.maxLength === undefined) return;
        const length = this.contentEl.innerText.trim().length;
        this.counterEl.textContent = `${length} / ${this.options.maxLength}`;
        if (length >= this.options.maxLength) {
            this.counterEl.classList.add('k-editor-counter--limit');
        } else {
            this.counterEl.classList.remove('k-editor-counter--limit');
        }
    }

    public getValue(): string {
        return this.value;
    }

    public setValue(val: string) {
        if (this.value === val) return;
        this.value = val;
        this.contentEl.innerHTML = val;
        this.updateCounter();
    }

    public setDisabled(disabled: boolean) {
        this.options.disabled = disabled;
        this.contentEl.contentEditable = disabled ? 'false' : 'true';
        
        if (disabled) {
            this.boxEl.classList.add('k-editor-box--disabled');
        } else {
            this.boxEl.classList.remove('k-editor-box--disabled');
        }

        Object.values(this.buttons).forEach(btn => {
            btn.disabled = disabled;
        });
    }

    public setError(error?: string) {
        this.options.error = error;
        
        if (error) {
            this.boxEl.classList.add('k-editor-box--error');
            if (!this.errorEl) {
                this.errorEl = document.createElement('p');
                this.errorEl.className = 'k-editor-error-text';
                this.container.firstChild?.appendChild(this.errorEl);
            }
            this.errorEl.textContent = error;
        } else {
            this.boxEl.classList.remove('k-editor-box--error');
            if (this.errorEl) {
                this.errorEl.remove();
                this.errorEl = undefined;
            }
        }
    }

    public unmount() {
        this.container.innerHTML = '';
    }
}