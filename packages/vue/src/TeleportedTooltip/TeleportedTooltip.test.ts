import { afterEach, describe, expect, it, vi } from 'vitest';
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import TeleportedTooltip from './TeleportedTooltip.vue';

enableAutoUnmount(afterEach);

afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
});

const query = (selector: string) => document.body.querySelector<HTMLElement>(selector);

function mountTooltip(props: Record<string, unknown> = {}) {
    return mount(TeleportedTooltip, {
        props: {
            text: 'Tooltip text',
            ...props,
        },
        slots: {
            default: '<button type="button">Trigger</button>',
        },
        attachTo: document.body,
    });
}

async function flushTooltip() {
    await nextTick();
    await nextTick();
}

describe('TeleportedTooltip (vue)', () => {
    it('teleports the tooltip after the delay and hides on leave', async () => {
        vi.useFakeTimers();
        const wrapper = mountTooltip({ delay: 200 });
        const trigger = wrapper.get('.k-ttip-wrapper');

        await trigger.trigger('mouseenter');
        vi.advanceTimersByTime(100);
        await flushTooltip();
        expect(query('.k-ttip-content')).toBeNull();

        vi.advanceTimersByTime(100);
        await flushTooltip();

        const tooltip = query('.k-ttip-content');
        expect(tooltip?.getAttribute('role')).toBe('tooltip');
        expect(tooltip?.textContent).toContain('Tooltip text');

        await trigger.trigger('mouseleave');
        await flushTooltip();
        expect(query('.k-ttip-content')).toBeNull();
    });

    it('shows on focus and hides on blur', async () => {
        vi.useFakeTimers();
        const wrapper = mountTooltip({ delay: 0 });
        const trigger = wrapper.get('.k-ttip-wrapper');

        await trigger.trigger('focusin');
        vi.advanceTimersByTime(0);
        await flushTooltip();
        expect(query('.k-ttip-content')).not.toBeNull();

        await trigger.trigger('focusout');
        await flushTooltip();
        expect(query('.k-ttip-content')).toBeNull();
    });

    it('does not render empty text', async () => {
        vi.useFakeTimers();
        const wrapper = mountTooltip({ delay: 0, text: '' });

        await wrapper.get('.k-ttip-wrapper').trigger('mouseenter');
        vi.advanceTimersByTime(0);
        await flushTooltip();

        expect(query('.k-ttip-content')).toBeNull();
    });

    it.each([
        ['top', '125px', '192px', 'translate(-50%, -100%)'],
        ['bottom', '125px', '228px', 'translateX(-50%)'],
        ['left', '92px', '210px', 'translate(-100%, -50%)'],
        ['right', '158px', '210px', 'translateY(-50%)'],
    ])('positions the tooltip on the %s side', async (position, left, top, transform) => {
        vi.useFakeTimers();
        const wrapper = mountTooltip({ delay: 0, position });
        const trigger = wrapper.get('.k-ttip-wrapper');

        trigger.element.getBoundingClientRect = vi.fn(() => ({
            left: 100,
            top: 200,
            right: 150,
            bottom: 220,
            width: 50,
            height: 20,
            x: 100,
            y: 200,
            toJSON: () => ({}),
        }));

        await trigger.trigger('mouseenter');
        vi.advanceTimersByTime(0);
        await flushTooltip();

        const tooltip = query('.k-ttip-content');
        expect(tooltip?.style.left).toBe(left);
        expect(tooltip?.style.top).toBe(top);
        expect(tooltip?.style.transform).toBe(transform);
    });

    it('repositions on scroll', async () => {
        vi.useFakeTimers();
        const wrapper = mountTooltip({ delay: 0, position: 'top' });
        const trigger = wrapper.get('.k-ttip-wrapper');
        let left = 100;
        trigger.element.getBoundingClientRect = vi.fn(() => ({
            left,
            top: 200,
            right: left + 50,
            bottom: 220,
            width: 50,
            height: 20,
            x: left,
            y: 200,
            toJSON: () => ({}),
        }));

        await trigger.trigger('mouseenter');
        vi.advanceTimersByTime(0);
        await flushTooltip();
        expect(query('.k-ttip-content')?.style.left).toBe('125px');

        left = 200;
        window.dispatchEvent(new Event('scroll'));
        await nextTick();

        expect(query('.k-ttip-content')?.style.left).toBe('225px');
    });
});
