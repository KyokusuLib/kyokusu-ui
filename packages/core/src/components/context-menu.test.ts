import { afterEach, describe, expect, it, vi } from 'vitest';
import { ContextMenu } from './context-menu';

function createArea() {
    const area = document.createElement('button');
    area.textContent = 'Right-click area';
    document.body.appendChild(area);
    return area;
}

function openByContextMenu(area: HTMLElement, x = 40, y = 50) {
    const event = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y,
    });
    area.dispatchEvent(event);
    return event;
}

describe('ContextMenu (core)', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('opens at pointer coordinates and renders shared DropdownMenu items', () => {
        const area = createArea();
        const onOpen = vi.fn();
        const menu = new ContextMenu(area, {
            items: [
                { id: 'copy', label: 'Copy' },
                { id: 'sep', label: '', separator: true },
                { id: 'delete', label: 'Delete' },
            ],
            onOpen,
        });

        const event = openByContextMenu(area);

        expect(event.defaultPrevented).toBe(true);
        expect(onOpen).toHaveBeenCalledWith({ x: 40, y: 50 });

        const menuEl = document.querySelector<HTMLElement>('.k-context-menu');
        expect(menuEl).not.toBeNull();
        expect(menuEl?.classList.contains('k-dropdown-menu')).toBe(true);
        expect(menuEl?.style.display).toBe('block');
        expect(menuEl?.style.left).toBe('40px');
        expect(menuEl?.style.top).toBe('50px');
        expect(menuEl?.getAttribute('role')).toBe('menu');
        expect(menuEl?.getAttribute('aria-label')).toBe('Context menu');

        menu.destroy();
    });

    it('selects an item, closes the menu and restores focus on Escape', () => {
        const area = createArea();
        area.focus();
        const onSelect = vi.fn();
        const menu = new ContextMenu(area, {
            items: [{ id: 'copy', label: 'Copy' }],
            onSelect,
        });

        openByContextMenu(area);
        const item = document.querySelector<HTMLElement>('.k-context-menu [role="menuitem"]');
        expect(item).not.toBeNull();

        item?.focus();
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

        expect(document.querySelector<HTMLElement>('.k-context-menu')?.style.display).toBe('none');
        expect(document.activeElement).toBe(area);

        openByContextMenu(area);
        document.querySelector<HTMLElement>('.k-context-menu [role="menuitem"]')?.click();

        expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'copy' }));
        expect(document.querySelector<HTMLElement>('.k-context-menu')?.style.display).toBe('none');

        menu.destroy();
    });

    it('does not intercept the native menu when disabled or after destroy', () => {
        const area = createArea();
        const onOpen = vi.fn();
        const menu = new ContextMenu(area, {
            items: [{ id: 'copy', label: 'Copy' }],
            disabled: true,
            onOpen,
        });

        const disabledEvent = openByContextMenu(area);
        expect(disabledEvent.defaultPrevented).toBe(false);
        expect(onOpen).not.toHaveBeenCalled();

        menu.updateOptions({ disabled: false });
        openByContextMenu(area);
        expect(onOpen).toHaveBeenCalledTimes(1);

        menu.destroy();
        openByContextMenu(area);
        expect(onOpen).toHaveBeenCalledTimes(1);
    });

    it('closes when clicking outside', () => {
        const area = createArea();
        const onClose = vi.fn();
        const menu = new ContextMenu(area, {
            items: [{ id: 'copy', label: 'Copy' }],
            onClose,
        });

        openByContextMenu(area);
        expect(document.querySelector<HTMLElement>('.k-context-menu')?.style.display).toBe('block');

        document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));

        expect(document.querySelector<HTMLElement>('.k-context-menu')?.style.display).toBe('none');
        expect(onClose).toHaveBeenCalledTimes(1);

        menu.destroy();
    });
});
