import { afterEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ContextMenu from './ContextMenu.vue';

const query = <T extends Element>(selector: string) => document.body.querySelector<T>(selector);

async function openMenu(wrapper: ReturnType<typeof mount>, x = 30, y = 40) {
    const area = wrapper.find('.area');
    const event = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y,
    });
    area.element.dispatchEvent(event);
    await nextTick();
    await nextTick();
    return event;
}

function mountMenu() {
    return mount(ContextMenu, {
        props: {
            items: [
                { id: 'copy', label: 'Copy' },
                { id: 'sep', label: '', separator: true },
                { id: 'delete', label: 'Delete' },
            ],
        },
        slots: {
            default: '<div class="area" tabindex="0">Right-click area</div>',
        },
        attachTo: document.body,
    });
}

describe('ContextMenu (vue)', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('teleports the menu to body and opens at pointer coordinates', async () => {
        const wrapper = mountMenu();

        const event = await openMenu(wrapper);

        expect(event.defaultPrevented).toBe(true);
        const menu = query<HTMLElement>('.k-context-menu');
        expect(menu).not.toBeNull();
        expect(menu?.getAttribute('role')).toBe('menu');
        expect(menu?.style.left).toBe('30px');
        expect(menu?.style.top).toBe('40px');
        expect(menu?.querySelectorAll('[role="menuitem"]')).toHaveLength(2);
        expect(menu?.querySelector('[role="separator"]')).not.toBeNull();
        expect(wrapper.emitted('open')?.[0]?.[0]).toEqual({ x: 30, y: 40 });

        wrapper.unmount();
    });

    it('emits select, closes and restores focus after choosing an item', async () => {
        const wrapper = mountMenu();
        const area = wrapper.find('.area').element as HTMLElement;
        area.focus();

        await openMenu(wrapper);
        const item = query<HTMLElement>('.k-context-menu [role="menuitem"]');
        expect(document.activeElement).toBe(item);

        item?.click();
        await nextTick();

        expect(wrapper.emitted('select')?.[0]?.[0]).toMatchObject({ id: 'copy' });
        expect(wrapper.emitted('close')).toHaveLength(1);
        expect(document.activeElement).toBe(area);

        wrapper.unmount();
    });

    it('does not open when disabled', async () => {
        const wrapper = mount(ContextMenu, {
            props: {
                items: [{ id: 'copy', label: 'Copy' }],
                disabled: true,
            },
            slots: { default: '<div class="area">Area</div>' },
            attachTo: document.body,
        });

        const event = await openMenu(wrapper);

        expect(event.defaultPrevented).toBe(false);
        expect(query('.k-context-menu')).toBeNull();
        expect(wrapper.emitted('open')).toBeUndefined();

        wrapper.unmount();
    });

    it('closes when the disabled prop becomes true', async () => {
        const wrapper = mountMenu();

        await openMenu(wrapper);
        await wrapper.setProps({ disabled: true });
        await nextTick();

        expect(wrapper.emitted('close')).toHaveLength(1);

        wrapper.unmount();
    });

    it('closes on Escape and outside click', async () => {
        const wrapper = mountMenu();

        await openMenu(wrapper);
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await nextTick();
        expect(wrapper.emitted('close')).toHaveLength(1);

        await openMenu(wrapper);
        document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        await nextTick();
        expect(wrapper.emitted('close')).toHaveLength(2);

        wrapper.unmount();
    });
});
