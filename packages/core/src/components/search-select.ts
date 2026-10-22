import '../styles/search-select.css';
import { createId } from '../utils/id';
import { t } from '../i18n';

export interface SearchSelectOption {
    id: string | number;
    label: string;
}

export interface SearchSelectOptions {
    value?: string | number | null;
    id?: string;
    label?: string;
    placeholder?: string;
    options: (string | SearchSelectOption)[];
    disabled?: boolean;
    error?: string;
    /** BCP-47 locale used for built-in UI strings. */
    locale?: string;
    onChange?: (value: string | number) => void;
}

const ICONS = {
    chevronDown: `<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>`,
    search: `<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>`
};

export class SearchSelect {
    private container: HTMLElement;
    private options: SearchSelectOptions;
    
    private value: string | number | null = null;
    private isOpen = false;
    private searchQuery = '';
    private normalizedOptions: SearchSelectOption[] = [];

    private wrapperEl!: HTMLDivElement;
    private triggerEl!: HTMLDivElement;
    private popupEl?: HTMLDivElement;
    private listEl?: HTMLUListElement;
    private searchInputEl?: HTMLInputElement;
    private valueEl!: HTMLSpanElement;

    private readonly listboxId = createId('k-sselect-list');
    private activeIndex = -1;

    private documentClickHandler: (e: MouseEvent) => void;

    constructor(element: HTMLElement | string, options: SearchSelectOptions) {
        const target = typeof element === 'string' ? document.querySelector(element) : element;
        if (!target) throw new Error('[Kyokusu UI] Target element for SearchSelect not found');

        this.container = target as HTMLElement;
        this.options = {
            ...options,
            placeholder: options.placeholder ?? t(options.locale, 'selectPlaceholder')
        };
        this.value = options.value ?? null;
        
        this.normalizeOptions();
        this.documentClickHandler = this.handleClickOutside.bind(this);
        
        this.mount();
        document.addEventListener('mousedown', this.documentClickHandler);
    }

    private normalizeOptions() {
        this.normalizedOptions = this.options.options.map(opt => 
            typeof opt === 'string' ? { id: opt, label: opt } : opt
        );
    }

    private get currentLabel() {
        const found = this.normalizedOptions.find(opt => opt.id === this.value);
        return found ? found.label : '';
    }

    private get filteredOptions() {
        if (!this.searchQuery) return this.normalizedOptions;
        const q = this.searchQuery.toLowerCase();
        return this.normalizedOptions.filter(opt => opt.label.toLowerCase().includes(q));
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
        this.wrapperEl = this.createEl('div', 'k-searchselect-wrapper');

        if (this.options.label) {
            const id = this.options.id || createId('k-sselect');
            this.options.id = id;
            this.wrapperEl.appendChild(this.createEl('label', 'k-searchselect-label', {
                htmlFor: id, textContent: this.options.label
            }));
        }

        const triggerContainer = this.createEl('div', 'k-searchselect-trigger-container');
        
        this.triggerEl = this.createEl('div', 'k-searchselect-trigger');
        if (this.options.disabled) this.triggerEl.classList.add('k-searchselect-trigger--disabled');
        if (this.options.error) this.triggerEl.classList.add('k-searchselect-trigger--error');
        this.triggerEl.setAttribute('role', 'combobox');
        this.triggerEl.setAttribute('tabindex', this.options.disabled ? '-1' : '0');
        this.triggerEl.setAttribute('aria-haspopup', 'listbox');
        this.triggerEl.setAttribute('aria-expanded', 'false');
        this.triggerEl.setAttribute('aria-controls', this.listboxId);
        if (this.options.disabled) this.triggerEl.setAttribute('aria-disabled', 'true');

        this.valueEl = this.createEl('span', 'k-searchselect-value');
        this.updateTriggerText();

        const iconContainer = this.createEl('div', 'k-searchselect-icon', { innerHTML: ICONS.chevronDown });

        this.triggerEl.appendChild(this.valueEl);
        this.triggerEl.appendChild(iconContainer);

        this.triggerEl.addEventListener('click', () => {
            if (this.options.disabled) return;
            this.toggleDropdown();
        });

        this.triggerEl.addEventListener('keydown', (e) => {
            if (this.options.disabled) return;
            if ((e.key === 'Enter' || e.key === ' ') && !this.isOpen) {
                e.preventDefault();
                this.toggleDropdown();
                return;
            }
            this.handleListKeydown(e);
        });

        triggerContainer.appendChild(this.triggerEl);
        this.wrapperEl.appendChild(triggerContainer);

        if (this.options.error) {
            this.wrapperEl.appendChild(this.createEl('p', 'k-searchselect-error-text', { textContent: this.options.error }));
        }

        this.container.appendChild(this.wrapperEl);
    }

    private updateTriggerText() {
        const label = this.currentLabel;
        if (label) {
            this.valueEl.textContent = label;
            this.valueEl.classList.add('k-searchselect-value--selected');
        } else {
            this.valueEl.textContent = this.options.placeholder || '';
            this.valueEl.classList.remove('k-searchselect-value--selected');
        }
    }

    private toggleDropdown() {
        this.isOpen = !this.isOpen;
        this.triggerEl.setAttribute('aria-expanded', String(this.isOpen));
        
        if (this.isOpen) {
            this.triggerEl.classList.add('k-searchselect-trigger--open');
            this.searchQuery = '';
            const selected = this.filteredOptions.findIndex((opt) => opt.id === this.value);
            this.activeIndex = selected >= 0 ? selected : 0;
            this.renderPopup();
            // trigger reflow
            void this.popupEl?.offsetWidth;
            if (this.searchInputEl) {
                setTimeout(() => this.searchInputEl?.focus(), 10);
            }
        } else {
            this.activeIndex = -1;
            this.triggerEl.removeAttribute('aria-activedescendant');
            this.triggerEl.classList.remove('k-searchselect-trigger--open');
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
    }

    private handleClickOutside(e: MouseEvent) {
        if (this.isOpen && this.wrapperEl && !this.wrapperEl.contains(e.target as Node)) {
            this.toggleDropdown();
        }
    }

    private optionId(index: number): string {
        return `${this.listboxId}-option-${index}`;
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
        const active = this.listEl?.querySelector<HTMLElement>('.k-searchselect-item--active');
        active?.scrollIntoView?.({ block: 'nearest' });
    }

    private updateActiveOption() {
        const options = this.listEl?.querySelectorAll<HTMLElement>('.k-searchselect-item');
        options?.forEach((el, index) => {
            el.classList.toggle('k-searchselect-item--active', index === this.activeIndex);
        });

        const activeId = this.activeIndex >= 0 ? this.optionId(this.activeIndex) : '';
        for (const el of [this.searchInputEl, this.triggerEl]) {
            if (!el) continue;
            if (activeId) el.setAttribute('aria-activedescendant', activeId);
            else el.removeAttribute('aria-activedescendant');
        }
    }

    private handleListKeydown(e: KeyboardEvent) {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (!this.isOpen) {
                    this.toggleDropdown();
                    this.activeIndex = 0;
                    this.updateActiveOption();
                } else {
                    this.moveActive(1);
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                if (!this.isOpen) {
                    this.toggleDropdown();
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
                    const item = this.filteredOptions[this.activeIndex];
                    if (item) this.selectItem(item.id);
                }
                break;
            case ' ':
                if (!this.isOpen) {
                    e.preventDefault();
                    this.toggleDropdown();
                }
                break;
            case 'Escape':
                if (this.isOpen) {
                    e.preventDefault();
                    this.toggleDropdown();
                    this.triggerEl.focus();
                }
                break;
            case 'Tab':
                if (this.isOpen) this.toggleDropdown();
                break;
        }
    }

    private renderPopup() {
        if (this.popupEl && this.popupEl.parentNode) {
            this.popupEl.parentNode.removeChild(this.popupEl);
        }

        this.popupEl = this.createEl('div', 'k-searchselect-popup');
        this.popupEl.style.opacity = '0';
        this.popupEl.style.transform = 'translateY(-8px)';
        this.popupEl.style.transition = 'all 0.2s ease';

        const header = this.createEl('div', 'k-searchselect-search-header');
        const searchContainer = this.createEl('div', 'k-searchselect-search-container');
        
        this.searchInputEl = this.createEl('input', 'k-searchselect-search-input', {
            type: 'text',
            placeholder: t(this.options.locale, 'searchPlaceholder')
        });
        
        this.searchInputEl.setAttribute('aria-controls', this.listboxId);
        this.searchInputEl.setAttribute('aria-autocomplete', 'list');
        this.searchInputEl.addEventListener('click', e => e.stopPropagation());
        this.searchInputEl.addEventListener('input', (e) => {
            this.searchQuery = (e.target as HTMLInputElement).value;
            this.activeIndex = 0;
            this.renderList();
        });
        this.searchInputEl.addEventListener('keydown', (e) => this.handleListKeydown(e));

        const searchIcon = this.createEl('div', 'k-searchselect-search-icon', { innerHTML: ICONS.search });

        searchContainer.appendChild(this.searchInputEl);
        searchContainer.appendChild(searchIcon);
        header.appendChild(searchContainer);
        this.popupEl.appendChild(header);

        this.listEl = this.createEl('ul', 'k-searchselect-list', {
            role: 'listbox',
            id: this.listboxId
        });
        this.renderList();
        this.popupEl.appendChild(this.listEl);

        const triggerContainer = this.wrapperEl.querySelector('.k-searchselect-trigger-container');
        triggerContainer?.appendChild(this.popupEl);

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

        if (items.length === 0) {
            this.listEl.appendChild(this.createEl('li', 'k-searchselect-empty', {
                textContent: t(this.options.locale, 'noResults'),
                role: 'presentation'
            }));
            this.activeIndex = -1;
            this.updateActiveOption();
            return;
        }

        if (this.activeIndex >= items.length) this.activeIndex = 0;

        items.forEach((item, index) => {
            const li = this.createEl('li', 'k-searchselect-item', {
                id: this.optionId(index),
                textContent: item.label,
                role: 'option',
                'aria-selected': String(this.value === item.id)
            });
            if (this.value === item.id) {
                li.classList.add('k-searchselect-item--selected');
                li.appendChild(this.createEl('div', 'k-searchselect-item-dot'));
            }
            if (index === this.activeIndex) li.classList.add('k-searchselect-item--active');
            
            li.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectItem(item.id);
            });
            li.addEventListener('mousemove', () => {
                this.activeIndex = index;
                this.updateActiveOption();
            });
            
            this.listEl!.appendChild(li);
        });

        this.updateActiveOption();
    }

    private selectItem(id: string | number) {
        this.value = id;
        this.updateTriggerText();
        this.toggleDropdown();
        this.triggerEl.focus();
        if (this.options.onChange) {
            this.options.onChange(id);
        }
    }

    public updateOptions(newOptions: Partial<SearchSelectOptions>) {
        this.options = { ...this.options, ...newOptions };
        if (newOptions.options) {
            this.normalizeOptions();
            if (this.isOpen) this.renderList();
        }
        if (newOptions.value !== undefined) {
            this.value = newOptions.value;
            this.updateTriggerText();
        }
        if (newOptions.disabled !== undefined) {
            this.triggerEl.classList.toggle('k-searchselect-trigger--disabled', !!newOptions.disabled);
            this.triggerEl.setAttribute('tabindex', newOptions.disabled ? '-1' : '0');
            this.triggerEl.setAttribute('aria-disabled', String(!!newOptions.disabled));
            if (newOptions.disabled && this.isOpen) this.toggleDropdown();
        }
        if (newOptions.error !== undefined) {
            this.triggerEl.classList.toggle('k-searchselect-trigger--error', !!newOptions.error);
        }
    }

    public unmount() {
        document.removeEventListener('mousedown', this.documentClickHandler);
        this.container.innerHTML = '';
    }
}
