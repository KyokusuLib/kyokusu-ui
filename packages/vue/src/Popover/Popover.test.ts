import { afterEach, describe, expect, it, vi } from 'vitest';
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import Popover from './Popover.vue';

enableAutoUnmount(afterEach);

const query = <T extends Element>(selector: string) => document.body.querySelector<T>(selector);

afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
});

function mountPopover(props: Record<string, unknown> = {}) {
    return mount(Popover, {
        props,
        slots: {
            default: '<button type="button">Open</button>',
            content: '<p class="popover-content">Popover body</p>',
        },
        attachTo: document.body,
    });
}

describe('Popover (vue)', () => {
    it('opens and closes on trigger click', async () => {
        const wrapper = mountPopover({ title: 'Details' });

        await wrapper.get('.k-popover-trigger').trigger('click');
        await nextTick();

        const popover = query<HTMLElement>('.k-popover');
        expect(popover?.getAttribute('role')).toBe('dialog');
        expect(popover?.textContent).toContain('Details');
        expect(popover?.textContent).toContain('Popover body');
        expect(wrapper.emitted('open')).toHaveLength(1);

        await wrapper.get('.k-popover-trigger').trigger('click');
        await nextTick();

        expect(query('.k-popover')).toBeNull();
        expect(wrapper.emitted('close')).toHaveLength(1);
    });

    it('supports controlled visibility', async () => {
        const wrapper = mountPopover({ modelValue: false });

        await wrapper.get('.k-popover-trigger').trigger('click');
        await nextTick();

        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true]);
        expect(query('.k-popover')).toBeNull();

        await wrapper.setProps({ modelValue: true });
        await nextTick();
        expect(query('.k-popover')).not.toBeNull();

        await wrapper.get('.k-popover-trigger').trigger('click');
        expect(wrapper.emitted('update:modelValue')?.[1]).toEqual([false]);
    });

    it('closes on an outside click', async () => {
        const wrapper = mountPopover();
        await wrapper.get('.k-popover-trigger').trigger('click');
        await nextTick();

        document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await nextTick();

        expect(query('.k-popover')).toBeNull();
        expect(wrapper.emitted('close')).toHaveLength(1);
    });

    it('opens on hover and hides after the leave delay', async () => {
        vi.useFakeTimers();
        const wrapper = mountPopover({ trigger: 'hover' });
        const trigger = wrapper.get('.k-popover-trigger');

        await trigger.trigger('mouseenter');
        await nextTick();
        expect(query('.k-popover')).not.toBeNull();

        await trigger.trigger('mouseleave');
        vi.advanceTimersByTime(150);
        await nextTick();

        expect(query('.k-popover')).toBeNull();
    });
});
