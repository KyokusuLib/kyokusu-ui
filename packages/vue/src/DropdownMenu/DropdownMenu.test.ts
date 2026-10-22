import { afterEach, describe, expect, it } from 'vitest';
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import DropdownMenu from './DropdownMenu.vue';
import type { MenuItem } from './types';

enableAutoUnmount(afterEach);

const query = <T extends Element>(selector: string) => document.body.querySelector<T>(selector);
const queryAll = <T extends Element>(selector: string) =>
    Array.from(document.body.querySelectorAll<T>(selector));

afterEach(() => {
    document.body.innerHTML = '';
});

const basicItems: MenuItem[] = [
    { id: 'copy', label: 'Copy' },
    { id: 'sep', label: '', separator: true },
    { id: 'paste', label: 'Paste', disabled: true },
    { id: 'delete', label: 'Delete' },
];

function mountMenu(props: Record<string, unknown> = {}) {
    return mount(DropdownMenu, {
        props: {
            items: basicItems,
            ...props,
        },
        slots: {
            default: '<button type="button">Actions</button>',
        },
        attachTo: document.body,
    });
}

async function openMenu(wrapper: ReturnType<typeof mountMenu>) {
    await wrapper.get('.k-dropdown-trigger').trigger('click');
    await nextTick();
    await nextTick();
}

describe('DropdownMenu (vue)', () => {
    it('opens a teleported menu with menu semantics', async () => {
        const wrapper = mountMenu();

        await openMenu(wrapper);

        const trigger = wrapper.get('.k-dropdown-trigger');
        const menu = query<HTMLElement>('.k-dropdown-menu');

        expect(trigger.attributes('aria-haspopup')).toBe('menu');
        expect(trigger.attributes('aria-expanded')).toBe('true');
        expect(menu?.getAttribute('role')).toBe('menu');
        expect(menu?.querySelectorAll('[role="menuitem"]')).toHaveLength(3);
        expect(menu?.querySelector('[role="separator"]')).not.toBeNull();
        expect(wrapper.emitted('open')).toHaveLength(1);
    });

    it('selects an item and closes the menu', async () => {
        const wrapper = mountMenu();
        await openMenu(wrapper);

        queryAll<HTMLElement>('.k-dropdown-menu [role="menuitem"]')[0]?.click();
        await nextTick();

        expect(wrapper.emitted('select')?.[0]?.[0]).toMatchObject({ id: 'copy' });
        expect(wrapper.emitted('close')).toHaveLength(1);
        expect(query('.k-dropdown-menu')).toBeNull();
    });

    it('ignores disabled items', async () => {
        const wrapper = mountMenu();
        await openMenu(wrapper);

        queryAll<HTMLElement>('.k-dropdown-menu [role="menuitem"]')[1]?.click();
        await nextTick();

        expect(wrapper.emitted('select')).toBeUndefined();
        expect(query('.k-dropdown-menu')).not.toBeNull();
    });

    it('updates a radio selection', async () => {
        const wrapper = mountMenu({
            items: [
                { id: 'a', label: 'Alpha' },
                { id: 'b', label: 'Beta' },
            ],
            selectionType: 'radio',
            modelValue: 'a',
        });
        await openMenu(wrapper);

        queryAll<HTMLElement>('.k-dropdown-menu [role="menuitem"]')[1]?.click();

        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['b']);
    });

    it('toggles checkbox selections', async () => {
        const items = [
            { id: 'a', label: 'Alpha' },
            { id: 'b', label: 'Beta' },
        ];
        const wrapper = mountMenu({
            items,
            selectionType: 'checkbox',
            modelValue: ['a'],
        });
        await openMenu(wrapper);

        queryAll<HTMLElement>('.k-dropdown-menu [role="menuitem"]')[1]?.click();
        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['a', 'b']]);

        await wrapper.setProps({ modelValue: ['a', 'b'] });
        await openMenu(wrapper);
        queryAll<HTMLElement>('.k-dropdown-menu [role="menuitem"]')[0]?.click();
        expect(wrapper.emitted('update:modelValue')?.[1]).toEqual([['b']]);
    });

    it('supports keyboard navigation and closes on Escape', async () => {
        const wrapper = mountMenu();
        await openMenu(wrapper);

        const menu = query<HTMLElement>('.k-dropdown-menu');
        const items = queryAll<HTMLElement>(
            '.k-dropdown-menu [role="menuitem"]:not([aria-disabled="true"])',
        );

        expect(document.activeElement).toBe(items[0]);

        menu?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
        await nextTick();
        expect(document.activeElement).toBe(items[1]);

        menu?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
        await nextTick();
        expect(document.activeElement).toBe(items[0]);

        menu?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await nextTick();
        expect(query('.k-dropdown-menu')).toBeNull();
        expect(wrapper.emitted('close')).toHaveLength(1);
    });

    it('opens a submenu without selecting the parent item', async () => {
        const wrapper = mountMenu({
            items: [
                {
                    id: 'share',
                    label: 'Share',
                    submenu: [{ id: 'link', label: 'Copy link' }],
                },
            ],
        });
        await openMenu(wrapper);

        query<HTMLElement>('.k-dropdown-menu [role="menuitem"]')?.click();
        await nextTick();
        await nextTick();

        expect(wrapper.emitted('select')).toBeUndefined();
        expect(query('.k-dropdown-submenu')).not.toBeNull();
    });

    it('closes on an outside click', async () => {
        const wrapper = mountMenu();
        await openMenu(wrapper);

        document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await nextTick();

        expect(query('.k-dropdown-menu')).toBeNull();
        expect(wrapper.emitted('close')).toHaveLength(1);
    });
});
