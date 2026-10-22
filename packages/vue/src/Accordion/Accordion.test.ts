import { afterEach, describe, expect, it } from 'vitest';
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import Accordion from './Accordion.vue';
import AccordionItem from './AccordionItem.vue';

enableAutoUnmount(afterEach);

afterEach(() => {
    document.body.innerHTML = '';
});

function mountAccordion(props: Record<string, unknown> = {}) {
    return mount(Accordion, {
        props,
        slots: {
            default: () => [
                h(AccordionItem, { title: 'First' }, { default: () => 'First content' }),
                h(AccordionItem, { title: 'Second' }, { default: () => 'Second content' }),
            ],
        },
        attachTo: document.body,
    });
}

describe('Accordion (vue)', () => {
    it('opens one item at a time in single mode', async () => {
        const wrapper = mountAccordion();
        const triggers = wrapper.findAll('.k-accordion-trigger');
        const items = wrapper.findAll('.k-accordion-item');

        expect(wrapper.get('.k-accordion').classes()).toContain('k-accordion--border');
        expect(triggers[0]?.attributes('aria-expanded')).toBe('false');

        await triggers[0]?.trigger('click');
        expect(items[0]?.classes()).toContain('k-accordion-item--open');
        expect(triggers[0]?.attributes('aria-expanded')).toBe('true');

        await triggers[1]?.trigger('click');
        expect(items[0]?.classes()).not.toContain('k-accordion-item--open');
        expect(items[1]?.classes()).toContain('k-accordion-item--open');
    });

    it('keeps several items open in multiple mode', async () => {
        const wrapper = mountAccordion({ multiple: true, border: false });
        const triggers = wrapper.findAll('.k-accordion-trigger');
        const items = wrapper.findAll('.k-accordion-item');

        await triggers[0]?.trigger('click');
        await triggers[1]?.trigger('click');

        expect(items[0]?.classes()).toContain('k-accordion-item--open');
        expect(items[1]?.classes()).toContain('k-accordion-item--open');
        expect(wrapper.get('.k-accordion').classes()).not.toContain('k-accordion--border');
    });

    it('closes an open item when its trigger is clicked again', async () => {
        const wrapper = mountAccordion();
        const trigger = wrapper.findAll('.k-accordion-trigger')[0]!;

        await trigger.trigger('click');
        await trigger.trigger('click');

        expect(wrapper.findAll('.k-accordion-item')[0]?.classes()).not.toContain(
            'k-accordion-item--open',
        );
    });

    it('works standalone without an accordion provider', async () => {
        const wrapper = mount(AccordionItem, {
            props: { title: 'Standalone' },
            slots: { default: 'Content' },
        });

        await wrapper.get('.k-accordion-trigger').trigger('click');
        await nextTick();

        expect(wrapper.get('.k-accordion-trigger').attributes('aria-expanded')).toBe('false');
        expect(wrapper.text()).toContain('Standalone');
    });
});
