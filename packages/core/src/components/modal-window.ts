import '../styles/modal-window.css';
import { createId } from '../utils/id';
import { t } from '../i18n';

export interface ModalWindowOptions {
    title?: string;
    /** CSS max-width value, e.g. "32rem", "512px" or a number of pixels. */
    width?: number | string;
    height?: string;
    centerTitle?: boolean;
    content?: string | HTMLElement;
    footer?: string | HTMLElement;
    /** BCP-47 locale used for built-in UI strings. */
    locale?: string;
    onClose?: () => void;
}

const CLOSE_ICON = `<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>`;

const FOCUSABLE_SELECTOR = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(',');

export class ModalWindow {
    private options: ModalWindowOptions;
    private isOpen = false;

    private overlayEl?: HTMLDivElement;
    private backdropEl?: HTMLDivElement;
    private contentContainerEl?: HTMLDivElement;
    private titleEl?: HTMLHeadingElement;
    private bodyEl?: HTMLDivElement;
    private footerEl?: HTMLDivElement;
    private closeBtn?: HTMLButtonElement;

    private readonly titleId = createId('k-modal-title');
    private previouslyFocused: HTMLElement | null = null;
    private previousBodyOverflow = '';

    private readonly keydownHandler = this.handleKeydown.bind(this);

    constructor(options: ModalWindowOptions = {}) {
        this.options = { width: '32rem', centerTitle: false, ...options };
    }

    private applyWidth(el: HTMLElement, width: number | string | undefined) {
        if (width === undefined) return;
        el.style.maxWidth = typeof width === 'number' ? `${width}px` : width;
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
        if (this.overlayEl) return;

        this.previouslyFocused = document.activeElement as HTMLElement | null;
        this.previousBodyOverflow = document.body.style.overflow;

        this.overlayEl = this.createEl('div', 'k-modal-overlay', {
            role: 'dialog',
            'aria-modal': 'true',
            'aria-labelledby': this.titleId,
        });

        this.backdropEl = this.createEl('div', 'k-modal-backdrop');
        this.backdropEl.addEventListener('click', () => this.close());

        const scrollContainer = this.createEl('div', 'k-modal-scroll-container');
        const centeringDiv = this.createEl('div', 'k-modal-centering');

        this.contentContainerEl = this.createEl('div', 'k-modal-content');
        this.contentContainerEl.tabIndex = -1;
        this.applyWidth(this.contentContainerEl, this.options.width);
        this.contentContainerEl.addEventListener('click', (e) => e.stopPropagation());

        const headerClass = this.options.centerTitle ? 'k-modal-header--center' : 'k-modal-header--between';
        const headerEl = this.createEl('div', `k-modal-header ${headerClass}`);

        this.titleEl = this.createEl('h3', 'k-modal-title', {
            textContent: this.options.title || '',
            id: this.titleId,
        });
        headerEl.appendChild(this.titleEl);

        const closeClass = this.options.centerTitle ? 'k-modal-close--absolute' : 'k-modal-close--relative';
        this.closeBtn = this.createEl('button', `k-modal-close ${closeClass}`, {
            type: 'button',
            innerHTML: CLOSE_ICON,
            'aria-label': t(this.options.locale, 'closeDialog'),
        });
        this.closeBtn.addEventListener('click', () => this.close());
        headerEl.appendChild(this.closeBtn);

        this.bodyEl = this.createEl('div', `k-modal-body ${this.options.height || ''}`);
        if (this.options.content) {
            if (typeof this.options.content === 'string') {
                this.bodyEl.innerHTML = this.options.content;
            } else {
                this.bodyEl.appendChild(this.options.content);
            }
        }

        this.contentContainerEl.appendChild(headerEl);
        this.contentContainerEl.appendChild(this.bodyEl);

        if (this.options.footer) {
            this.footerEl = this.createEl('div', 'k-modal-footer');
            if (typeof this.options.footer === 'string') {
                this.footerEl.innerHTML = this.options.footer;
            } else {
                this.footerEl.appendChild(this.options.footer);
            }
            this.contentContainerEl.appendChild(this.footerEl);
        }

        centeringDiv.appendChild(this.contentContainerEl);
        scrollContainer.appendChild(centeringDiv);

        this.overlayEl.appendChild(this.backdropEl);
        this.overlayEl.appendChild(scrollContainer);

        // Pre-animate state
        this.backdropEl.style.opacity = '0';
        this.contentContainerEl.style.opacity = '0';
        this.contentContainerEl.style.transform = 'translateY(10px) scale(0.95)';

        document.body.appendChild(this.overlayEl);

        document.addEventListener('keydown', this.keydownHandler);
        document.body.style.overflow = 'hidden';

        // Move focus into the dialog so keyboard and screen reader users are
        // not left behind on the page underneath.
        this.closeBtn.focus();

        // Trigger animations
        requestAnimationFrame(() => {
            if (this.backdropEl && this.contentContainerEl) {
                this.backdropEl.style.opacity = '1';
                this.contentContainerEl.style.opacity = '1';
                this.contentContainerEl.style.transform = 'translateY(0) scale(1)';
            }
        });
    }

    public open() {
        if (this.isOpen) return;
        this.isOpen = true;
        this.mount();
    }

    public close() {
        if (!this.isOpen || !this.overlayEl) return;
        this.isOpen = false;

        document.removeEventListener('keydown', this.keydownHandler);
        document.body.style.overflow = this.previousBodyOverflow;

        if (this.backdropEl && this.contentContainerEl) {
            this.backdropEl.style.opacity = '0';
            this.contentContainerEl.style.opacity = '0';
            this.contentContainerEl.style.transform = 'translateY(10px) scale(0.95)';
        }

        setTimeout(() => {
            if (this.overlayEl && this.overlayEl.parentNode) {
                this.overlayEl.parentNode.removeChild(this.overlayEl);
            }
            this.overlayEl = undefined;
            this.previouslyFocused?.focus();
            this.previouslyFocused = null;
            this.options.onClose?.();
        }, 300);
    }

    private handleKeydown(e: KeyboardEvent) {
        if (!this.isOpen) return;

        if (e.key === 'Escape') {
            e.preventDefault();
            this.close();
            return;
        }

        if (e.key !== 'Tab' || !this.contentContainerEl) return;

        const focusables = Array.from(
            this.contentContainerEl.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
        ).filter((el) => el.offsetParent !== null);

        if (focusables.length === 0) {
            e.preventDefault();
            this.contentContainerEl.focus();
            return;
        }

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }

    public updateOptions(newOptions: Partial<ModalWindowOptions>) {
        this.options = { ...this.options, ...newOptions };

        if (!this.isOpen) return;

        if (this.titleEl && newOptions.title !== undefined) {
            this.titleEl.textContent = newOptions.title || '';
        }

        if (this.contentContainerEl && newOptions.width !== undefined) {
            this.applyWidth(this.contentContainerEl, newOptions.width);
        }

        if (this.bodyEl && newOptions.content !== undefined) {
            this.bodyEl.innerHTML = '';
            if (typeof newOptions.content === 'string') {
                this.bodyEl.innerHTML = newOptions.content;
            } else {
                this.bodyEl.appendChild(newOptions.content);
            }
        }
    }

    public destroy() {
        if (this.isOpen) this.close();
    }
}
