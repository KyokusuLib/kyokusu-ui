import { afterEach, describe, expect, it, vi } from 'vitest';
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import Tooltip from './Tooltip.vue';

enableAutoUnmount(afterEach);

afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
});

function mountTooltip(props: Record<string, unknown> = {}) {
    return mount(Tooltip, {
        props: {
            text: 'Helpful hint',
            delay: 200,
            ...props,
        },
        slots: {
            default: '<button type="button">Hover me</button>',
        },
        attachTo: document.body,
    });
}

describe('Tooltip (vue)', () => {
    it('waits for the delay and renders the tooltip content', async () => {
        vi.useFakeTimers();
        const wrapper = mountTooltip();
        const trigger = wrapper.get('.k-tooltip-wrapper');

        await trigger.trigger('mouseenter');
        vi.advanceTimersByTime(100);
        await nextTick();
        expect(wrapper.find('.k-tooltip-content').exists()).toBe(false);

        vi.advanceTimersByTime(100);
        await nextTick();

        const tooltip = wrapper.get('.k-tooltip-content');
        expect(tooltip.attributes('role')).toBe('tooltip');
        expect(tooltip.text()).toContain('Helpful hint');
    });

    it('shows on focus and hides on blur', async () => {
        vi.useFakeTimers();
        const wrapper = mountTooltip({ delay: 0 });
        const trigger = wrapper.get('.k-tooltip-wrapper');

        await trigger.trigger('focusin');
        vi.advanceTimersByTime(0);
        await nextTick();
        expect(wrapper.find('.k-tooltip-content').exists()).toBe(true);

        await trigger.trigger('focusout');
        await nextTick();
        expect(wrapper.find('.k-tooltip-content').exists()).toBe(false);
    });

    it('applies the requested position class', async () => {
        vi.useFakeTimers();
        const wrapper = mountTooltip({ delay: 0, position: 'right' });

        await wrapper.get('.k-tooltip-wrapper').trigger('mouseenter');
        vi.advanceTimersByTime(0);
        await nextTick();

        expect(wrapper.get('.k-tooltip-content').classes()).toContain(
            'k-tooltip-content--right',
        );
    });

    it('does not render empty text', async () => {
        vi.useFakeTimers();
        const wrapper = mountTooltip({ delay: 0, text: '' });

        await wrapper.get('.k-tooltip-wrapper').trigger('mouseenter');
        vi.advanceTimersByTime(0);
        await nextTick();

        expect(wrapper.find('.k-tooltip-content').exists()).toBe(false);
    });
});
