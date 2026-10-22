import '../styles/context-menu.css';
import { t } from '../i18n';
import { DropdownMenu } from './dropdown-menu';
import type { DropdownMenuItem } from './dropdown-menu';

export type ContextMenuItem = DropdownMenuItem;

export interface ContextMenuPosition {
    x: number;
    y: number;
}

export interface ContextMenuOptions {
    items: ContextMenuItem[];
    width?: number | string;
    disabled?: boolean;
    onSelect?: (item: ContextMenuItem) => void;
    onOpen?: (position: ContextMenuPosition) => void;
    onClose?: () => void;
    /** BCP-47 locale used for the built-in accessible menu label. */
    locale?: string;
}

/**
 * Right-click menu bound to an area. The menu surface and item behaviour are
 * shared with DropdownMenu, so keyboard navigation, separators, icons and
 * submenus work the same way.
 */
export class ContextMenu {
    private container: HTMLElement;
    private options: ContextMenuOptions;
    private menu: DropdownMenu;
    private triggerEl: HTMLElement;
    private previousActive: HTMLElement | null = null;
    private isOpen = false;
    private skipFocusRestore = false;
    private destroying = false;
    private boundHandlers: Array<
        [EventTarget, string, EventListenerOrEventListenerObject, AddEventListenerOptions?]
    > = [];

    constructor(element: HTMLElement | string, options: ContextMenuOptions) {
        const target = typeof element === 'string' ? document.querySelector(element) : element;
        if (!target) throw new Error('[Kyokusu UI] Target element for ContextMenu not found');

        this.container = target as HTMLElement;
        this.options = {
            width: 200,
            disabled: false,
            ...options,
        };

        // DropdownMenu needs an element for its ARIA attributes. It is hidden
        // because the menu is positioned at the pointer instead of the trigger.
        this.triggerEl = document.createElement('div');
        this.triggerEl.hidden = true;
        this.triggerEl.setAttribute('aria-hidden', 'true');
        document.body.appendChild(this.triggerEl);

        this.menu = new DropdownMenu(this.triggerEl, {
            items: this.options.items,
            width: this.options.width,
            className: 'k-context-menu',
            onSelect: (item) => this.options.onSelect?.(item),
            onClose: () => {
                this.isOpen = false;
                this.restoreFocus();
                this.options.onClose?.();
            },
        });
        this.syncAriaLabel();

        this.bind(this.container, 'contextmenu', (event) => {
            this.handleContextMenu(event as MouseEvent);
        });
        this.bind(
            document,
            'mousedown',
            (event) => {
                if (!this.isOpen) return;
                const target = event.target as Node | null;
                if (!target) return;
                if (this.container.contains(target)) return;
                if (this.menu.getMenuElement().contains(target)) return;
                if ((target as Element).closest?.('.k-dropdown-menu')) return;
                this.skipFocusRestore = true;
            },
            { capture: true },
        );
        this.bind(
            document,
            'contextmenu',
            (event) => {
                if (!this.isOpen) return;
                const target = event.target as Node | null;
                if (!target) return;
                if (this.container.contains(target)) return;
                if (this.menu.getMenuElement().contains(target)) {
                    event.preventDefault();
                    return;
                }
                if ((target as Element).closest?.('.k-dropdown-menu')) {
                    event.preventDefault();
                    return;
                }
                this.close();
            },
            { capture: true },
        );
        this.bind(window, 'scroll', () => this.closeSilently(), { passive: true });
        this.bind(window, 'resize', () => this.closeSilently());
        this.bind(window, 'blur', () => this.closeSilently());
    }

    private bind(
        target: EventTarget,
        event: string,
        handler: EventListenerOrEventListenerObject,
        options?: AddEventListenerOptions,
    ) {
        target.addEventListener(event, handler, options);
        this.boundHandlers.push([target, event, handler, options]);
    }

    private handleContextMenu(event: MouseEvent) {
        if (this.options.disabled) return;

        event.preventDefault();
        event.stopPropagation();
        const target = event.target as HTMLElement | null;
        const targetRect = target?.getBoundingClientRect?.();

        // Keyboard-invoked context menus (Shift+F10 / ContextMenu key) have
        // clientX/clientY equal to zero, so anchor them to the target element.
        const x = event.clientX || targetRect?.left || 0;
        const y = event.clientY || targetRect?.top || 0;

        this.openAt(x, y);
    }

    private syncAriaLabel() {
        this.menu
            .getMenuElement()
            .setAttribute('aria-label', t(this.options.locale, 'contextMenu'));
    }

    private restoreFocus() {
        if (this.destroying) return;
        if (this.skipFocusRestore) {
            this.skipFocusRestore = false;
            return;
        }
        const element = this.previousActive;
        this.previousActive = null;
        if (element?.isConnected) element.focus();
    }

    /** Opens the menu at viewport coordinates. */
    public openAt(x: number, y: number) {
        if (this.options.disabled) return;
        this.skipFocusRestore = false;
        const wasOpen = this.isOpen;
        if (!wasOpen) {
            this.previousActive =
                document.activeElement instanceof HTMLElement ? document.activeElement : null;
        }
        this.isOpen = true;
        if (!wasOpen) this.options.onOpen?.({ x, y });
        this.menu.openAt(x, y);
    }

    public close() {
        this.menu.close();
    }

    private closeSilently() {
        this.skipFocusRestore = true;
        this.close();
    }

    public updateOptions(newOptions: Partial<ContextMenuOptions>) {
        this.options = { ...this.options, ...newOptions };

        if (newOptions.items !== undefined || newOptions.width !== undefined) {
            this.menu.updateOptions({
                items: this.options.items,
                width: this.options.width,
            });
        }

        this.syncAriaLabel();

        if (newOptions.disabled && this.isOpen) {
            this.close();
        }
    }

    public destroy() {
        this.destroying = true;
        this.boundHandlers.forEach(([target, event, handler, options]) => {
            target.removeEventListener(event, handler, options);
        });
        this.boundHandlers = [];
        this.menu.destroy();
        this.triggerEl.remove();
    }
}
