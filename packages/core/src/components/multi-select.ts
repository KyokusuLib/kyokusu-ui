import '../styles/multi-select.css';
import { createId } from '../utils/id';
import { t } from '../i18n';

export interface MultiSelectOption {
    id: string | number;
    label: string;
}

export interface MultiSelectOptions {
    value?: (string | number | MultiSelectOption)[];
    options: (string | MultiSelectOption)[];
    id?: string;
    label?: string;
    placeholder?: string;
    error?: string;
    disabled?: boolean;
    loading?: boolean;
    onChange?: (value: MultiSelectOption[]) => void;
    onSearch?: (query: string) => void;
    /** BCP-47 locale used for built-in UI strings. */
    locale?: string;
}

const CLOSE_ICON = `<svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>`;

export class MultiSelect {
    private container: HTMLElement;
    private options: MultiSelectOptions;
    
    private value: MultiSelectOption[] = [];
    private normalizedOptions: MultiSelectOption[] = [];
    private isOpen = false;
    private searchQuery = '';

    private wrapperEl!: HTMLDivElement;
    private triggerEl!: HTMLDivElement;
    private inputEl!: HTMLInputElement;
    private popupEl?: HTMLDivElement;
    private listEl?: HTMLUListElement;

    private readonly listboxId = createId('k-ms-list');
    private activeIndex = -1;

    private documentClickHandler: (e: MouseEvent) => void;

    constructor(element: HTMLElement | string, options: MultiSelectOptions) {
        const target = typeof element === 'string' ? document.querySelector(element) : element;
        if (!target) throw new Error('[Kyokusu UI] Target element for MultiSelect not found');

        this.container = target as HTMLElement;
        this.options = {
            ...options,
            placeholder: options.placeholder ?? t(options.locale, 'selectPlaceholder')
        };
        
        this.normalizeOptions();
        this.normalizeValue();
        
        this.documentClickHandler = this.handleClickOutside.bind(this);
        
        this.mount();
        document.addEventListener('mousedown', this.documentClickHandler);
    }

    private normalizeOptions() {
        this.normalizedOptions = this.options.options.map(opt => 
            typeof opt === 'string' ? { id: opt, label: opt } : opt
        );
    }

    private normalizeValue() {
        if (!this.options.value) {
            this.value = [];
            return;
        }
        this.value = this.options.value.map(val => {
            if (typeof val === 'object' && val !== null) return val as MultiSelectOption;
            const found = this.normalizedOptions.find(opt => opt.id === val);
            return found || { id: val, label: String(val) };
        });
    }

    private get availableOptions() {
        const selectedIds = this.value.map(s => s.id);
        return this.normalizedOptions.filter(opt => !selectedIds.includes(opt.id));
    }

    private get filteredOptions() {
        if (!this.searchQuery) return this.availableOptions;
        const q = this.searchQuery.toLowerCase();
        return this.availableOptions.filter(opt => opt.label.toLowerCase().includes(q));
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
        this.wrapperEl = this.createEl('div', 'k-multiselect-wrapper');

        if (this.options.label) {
            const id = this.options.id || createId('k-ms');
            this.options.id = id;
            this.wrapperEl.appendChild(this.createEl('label', 'k-multiselect-label', {
                htmlFor: id, textContent: this.options.label
            }));
        }

        this.triggerEl = this.createEl('div', 'k-multiselect-trigger');
        if (this.options.disabled) this.triggerEl.classList.add('k-multiselect-trigger--disabled');
        if (this.options.error) this.triggerEl.classList.add('k-multiselect-trigger--error');

        this.triggerEl.addEventListener('click', () => {
            if (this.options.disabled) return;
            this.openDropdown();
        });

        this.renderTags();

        this.inputEl = this.createEl('input', 'k-multiselect-input', {
            id: this.options.id || '',
            type: 'text',
            disabled: !!this.options.disabled,
            role: 'combobox',
            'aria-haspopup': 'listbox',
            'aria-expanded': 'false',
            'aria-controls': this.listboxId,
            'aria-autocomplete': 'list'
        });
        if (this.options.disabled) this.inputEl.setAttribute('aria-disabled', 'true');
        this.updateInputPlaceholder();

        this.inputEl.addEventListener('input', (e) => {
            this.searchQuery = (e.target as HTMLInputElement).value;
            this.activeIndex = 0;
            if (this.options.onSearch) this.options.onSearch(this.searchQuery);
            if (this.isOpen) this.renderList();
        });

        this.inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !this.searchQuery && this.value.length > 0) {
                this.removeOption(this.value.length - 1);
                return;
            }
            this.handleListKeydown(e);
        });

        this.inputEl.addEventListener('focus', () => {
            this.openDropdown();
        });

        this.triggerEl.appendChild(this.inputEl);

        if (this.options.loading) {
            this.triggerEl.appendChild(this.createEl('div', 'k-multiselect-loader'));
        }

        this.wrapperEl.appendChild(this.triggerEl);

        if (this.options.error) {
            this.wrapperEl.appendChild(this.createEl('p', 'k-multiselect-error-text', { textContent: this.options.error }));
        }

        this.container.appendChild(this.wrapperEl);
    }

    private updateInputPlaceholder() {
        if (!this.inputEl) return;
        this.inputEl.placeholder = this.value.length === 0 ? (this.options.placeholder || '') : '';
    }

    private renderTags() {
        const existingTags = this.triggerEl.querySelectorAll('.k-multiselect-tag');
        existingTags.forEach(t => t.remove());

        this.value.forEach((item, index) => {
            const tag = this.createEl('div', 'k-multiselect-tag');
            tag.appendChild(this.createEl('span', '', { textContent: item.label }));
            
            const closeBtn = this.createEl('button', 'k-multiselect-tag-close', {
                type: 'button',
                innerHTML: CLOSE_ICON,
                'aria-label': t(this.options.locale, 'removeTag', { label: item.label })
            });
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeOption(index);
            });
            
            tag.appendChild(closeBtn);
            this.triggerEl.insertBefore(tag, this.inputEl);
        });
    }

    private openDropdown() {
        if (this.options.disabled) return;
        if (this.isOpen) {
            this.inputEl?.focus();
            return;
        }
        this.isOpen = true;
        this.activeIndex = -1;
        this.inputEl.setAttribute('aria-expanded', 'true');
        this.triggerEl.classList.add('k-multiselect-trigger--focus');
        this.renderPopup();
        this.inputEl?.focus();
    }

    private closeDropdown() {
        this.isOpen = false;
        this.activeIndex = -1;
        this.searchQuery = '';
        this.inputEl.setAttribute('aria-expanded', 'false');
        this.inputEl.removeAttribute('aria-activedescendant');
        if (this.inputEl) this.inputEl.value = '';
        this.triggerEl.classList.remove('k-multiselect-trigger--focus');
        
        if (this.popupEl) {
            this.popupEl.style.opacity = '0';
            this.popupEl.style.transform = 'translateY(-8px)';
            setTimeout(() => {
                if (this.popupEl && this.popupEl.parentNode) {
                    this.popupEl.parentNode.removeChild(this.popupEl);
                }
                this.popupEl = undefined;
            }, 200);
        }
    }

    private handleClickOutside(e: MouseEvent) {
        if (this.isOpen && this.wrapperEl && !this.wrapperEl.contains(e.target as Node)) {
            this.closeDropdown();
        }
    }

    private optionId(index: number): string {
        return `${this.listboxId}-option-${index}`;
    }

    private updateActiveOption() {
        const options = this.listEl?.querySelectorAll<HTMLElement>('.k-multiselect-item');
        options?.forEach((el, index) => {
            el.classList.toggle('k-multiselect-item--active', index === this.activeIndex);
        });

        const activeId = this.activeIndex >= 0 ? this.optionId(this.activeIndex) : '';
        if (activeId) this.inputEl.setAttribute('aria-activedescendant', activeId);
        else this.inputEl.removeAttribute('aria-activedescendant');
    }

    private moveActive(delta: number) {
        const items = this.filteredOptions;
        if (items.length === 0) {
            this.activeIndex = -1;
            this.updateActiveOption();
            return;
        }
        this.activeIndex = (this.activeIndex + delta + items.length) % items.length;
        this.updateActiveOption();
        const active = this.listEl?.querySelector<HTMLElement>('.k-multiselect-item--active');
        active?.scrollIntoView?.({ block: 'nearest' });
    }

    private handleListKeydown(e: KeyboardEvent) {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (!this.isOpen) {
                    this.openDropdown();
                    this.activeIndex = 0;
                    this.updateActiveOption();
                } else {
                    this.moveActive(1);
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                if (!this.isOpen) {
                    this.openDropdown();
                    this.activeIndex = Math.max(this.filteredOptions.length - 1, 0);
                    this.updateActiveOption();
                } else {
                    this.moveActive(-1);
                }
                break;
            case 'Home':
                if (!this.isOpen) return;
                e.preventDefault();
                this.activeIndex = 0;
                this.updateActiveOption();
                break;
            case 'End':
                if (!this.isOpen) return;
                e.preventDefault();
                this.activeIndex = Math.max(this.filteredOptions.length - 1, 0);
                this.updateActiveOption();
                break;
            case 'Enter':
                if (this.isOpen && this.activeIndex >= 0) {
                    e.preventDefault();
                    const option = this.filteredOptions[this.activeIndex];
                    if (option) this.selectItem(option);
                }
                break;
            case 'Escape':
                if (this.isOpen) {
                    e.preventDefault();
                    this.closeDropdown();
                }
                break;
            case 'Tab':
                if (this.isOpen) this.closeDropdown();
                break;
        }
    }

    private renderPopup() {
        if (this.popupEl && this.popupEl.parentNode) {
            this.popupEl.parentNode.removeChild(this.popupEl);
        }

        this.popupEl = this.createEl('div', 'k-multiselect-popup');
        this.popupEl.style.opacity = '0';
        this.popupEl.style.transform = 'translateY(-8px)';
        this.popupEl.style.transition = 'all 0.2s ease';

        this.listEl = this.createEl('ul', 'k-multiselect-list', {
            role: 'listbox',
            id: this.listboxId
        });
        this.renderList();
        this.popupEl.appendChild(this.listEl);

        this.wrapperEl.appendChild(this.popupEl);

        requestAnimationFrame(() => {
            if (this.popupEl) {
                this.popupEl.style.opacity = '1';
                this.popupEl.style.transform = 'translateY(0)';
            }
        });
    }

    private renderList() {
        if (!this.listEl) return;
        this.listEl.innerHTML = '';

        const items = this.filteredOptions;

        if (items.length === 0 && !this.options.loading) {
            const msg = this.searchQuery
                ? t(this.options.locale, 'noResults')
                : t(this.options.locale, 'startTyping');
            this.listEl.appendChild(this.createEl('li', 'k-multiselect-empty', {
                textContent: msg,
                role: 'presentation'
            }));
            this.activeIndex = -1;
            this.updateActiveOption();
            return;
        }

        if (this.activeIndex >= items.length) this.activeIndex = items.length > 0 ? 0 : -1;

        items.forEach((item, index) => {
            const li = this.createEl('li', 'k-multiselect-item', {
                id: this.optionId(index),
                textContent: item.label,
                role: 'option',
                'aria-selected': 'false'
            });
            if (index === this.activeIndex) li.classList.add('k-multiselect-item--active');
            li.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectItem(item);
            });
            li.addEventListener('mousemove', () => {
                this.activeIndex = index;
                this.updateActiveOption();
            });
            this.listEl!.appendChild(li);
        });

        this.updateActiveOption();
    }

    private selectItem(option: MultiSelectOption) {
        if (this.value.some(item => item.id === option.id)) return;
        
        this.value.push(option);
        this.searchQuery = '';
        this.activeIndex = -1;
        if (this.inputEl) this.inputEl.value = '';
        
        this.renderTags();
        this.updateInputPlaceholder();
        this.renderList(); // re-render list to remove selected
        
        this.inputEl?.focus();
        
        if (this.options.onChange) {
            this.options.onChange([...this.value]);
        }
    }

    private removeOption(index: number) {
        if (this.options.disabled) return;
        this.value.splice(index, 1);
        
        this.renderTags();
        this.updateInputPlaceholder();
        if (this.isOpen) this.renderList();

        if (this.options.onChange) {
            this.options.onChange([...this.value]);
        }
    }

    public updateOptions(newOptions: Partial<MultiSelectOptions>) {
        this.options = { ...this.options, ...newOptions };
        
        if (newOptions.options) {
            this.normalizeOptions();
            if (this.isOpen) this.renderList();
        }
        
        if (newOptions.value !== undefined) {
            this.normalizeValue();
            this.renderTags();
            this.updateInputPlaceholder();
        }
        
        if (newOptions.disabled !== undefined) {
            this.triggerEl.classList.toggle('k-multiselect-trigger--disabled', !!newOptions.disabled);
            this.inputEl.disabled = !!newOptions.disabled;
            this.inputEl.setAttribute('aria-disabled', String(!!newOptions.disabled));
            if (newOptions.disabled && this.isOpen) this.closeDropdown();
        }
        
        if (newOptions.error !== undefined) {
            this.triggerEl.classList.toggle('k-multiselect-trigger--error', !!newOptions.error);
        }

        if (newOptions.loading !== undefined) {
            const loader = this.triggerEl.querySelector('.k-multiselect-loader');
            if (newOptions.loading && !loader) {
                this.triggerEl.appendChild(this.createEl('div', 'k-multiselect-loader'));
            } else if (!newOptions.loading && loader) {
                loader.remove();
            }
            if (this.isOpen) this.renderList();
        }
    }

    public unmount() {
        document.removeEventListener('mousedown', this.documentClickHandler);
        this.container.innerHTML = '';
    }
}