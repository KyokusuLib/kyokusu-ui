import { afterEach, describe, expect, it } from 'vitest';
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import SearchSelect from './SearchSelect.vue';

enableAutoUnmount(afterEach);

afterEach(() => {
    document.body.innerHTML = '';
});

const options = [
    { id: 'apple', label: 'Apple' },
    { id: 'apricot', label: 'Apricot' },
    { id: 'banana', label: 'Banana' },
];

function mountSearchSelect(props: Record<string, unknown> = {}) {
    return mount(SearchSelect, {
        props: {
            options,
            ...props,
        },
        attachTo: document.body,
    });
}

describe('SearchSelect (vue)', () => {
    it('renders the label, placeholder and selected value', () => {
        const wrapper = mountSearchSelect({
            id: 'fruit',
            label: 'Fruit',
            modelValue: 'banana',
            class: 'custom-search',
        });

        expect(wrapper.get('label').attributes('for')).toBe('fruit');
        expect(wrapper.get('.k-searchselect-trigger').attributes('role')).toBe('combobox');
        expect(wrapper.get('.k-searchselect-value').text()).toBe('Banana');
        expect(wrapper.get('.k-searchselect-value').classes()).toContain(
            'k-searchselect-value--selected',
        );
        expect(wrapper.get('.k-searchselect-wrapper').classes()).toContain('custom-search');
    });

    it('falls back to the placeholder', () => {
        const wrapper = mountSearchSelect({ placeholder: 'Choose fruit' });

        expect(wrapper.get('.k-searchselect-value').text()).toBe('Choose fruit');
    });

    it('opens, lists options and selects an item', async () => {
        const wrapper = mountSearchSelect();
        const trigger = wrapper.get('.k-searchselect-trigger');

        await trigger.trigger('click');

        expect(trigger.attributes('aria-expanded')).toBe('true');
        expect(wrapper.findAll('.k-searchselect-item')).toHaveLength(3);

        await wrapper.findAll('.k-searchselect-item')[2]?.trigger('click');
        await nextTick();

        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['banana']);
        expect(wrapper.find('.k-searchselect-popup').exists()).toBe(false);
        expect(document.activeElement).toBe(trigger.element);
    });

    it('marks the selected option with a dot', async () => {
        const wrapper = mountSearchSelect({ modelValue: 'apple' });
        await wrapper.get('.k-searchselect-trigger').trigger('click');

        const selected = wrapper.findAll('.k-searchselect-item')[0];
        expect(selected?.classes()).toContain('k-searchselect-item--selected');
        expect(selected?.attributes('aria-selected')).toBe('true');
        expect(selected?.find('.k-searchselect-item-dot').exists()).toBe(true);
    });

    it('filters options and shows the empty state', async () => {
        const wrapper = mountSearchSelect();
        await wrapper.get('.k-searchselect-trigger').trigger('click');
        const search = wrapper.get('.k-searchselect-search-input');

        await search.setValue('apr');

        expect(wrapper.findAll('.k-searchselect-item').map((item) => item.text())).toEqual([
            'Apricot',
        ]);

        await search.setValue('missing');

        expect(wrapper.get('.k-searchselect-empty').text()).toBe('Nothing found');
    });

    it('supports keyboard navigation and selection', async () => {
        const wrapper = mountSearchSelect();
        const trigger = wrapper.get('.k-searchselect-trigger');

        await trigger.trigger('keydown', { key: 'ArrowDown' });
        await nextTick();

        expect(wrapper.find('.k-searchselect-popup').exists()).toBe(true);
        expect(wrapper.findAll('.k-searchselect-item')[0]?.classes()).toContain(
            'k-searchselect-item--active',
        );

        await trigger.trigger('keydown', { key: 'Enter' });

        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['apple']);
        expect(wrapper.find('.k-searchselect-popup').exists()).toBe(false);
    });

    it('closes on Escape and Tab', async () => {
        const wrapper = mountSearchSelect();
        const trigger = wrapper.get('.k-searchselect-trigger');

        await trigger.trigger('click');
        await trigger.trigger('keydown', { key: 'Escape' });
        expect(wrapper.find('.k-searchselect-popup').exists()).toBe(false);

        await trigger.trigger('click');
        await trigger.trigger('keydown', { key: 'Tab' });
        expect(wrapper.find('.k-searchselect-popup').exists()).toBe(false);
    });

    it('closes on outside mousedown', async () => {
        const wrapper = mountSearchSelect();
        await wrapper.get('.k-searchselect-trigger').trigger('click');

        document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        await nextTick();

        expect(wrapper.find('.k-searchselect-popup').exists()).toBe(false);
    });

    it('does not open while disabled', async () => {
        const wrapper = mountSearchSelect({ disabled: true });

        await wrapper.get('.k-searchselect-trigger').trigger('click');

        expect(wrapper.find('.k-searchselect-popup').exists()).toBe(false);
        expect(wrapper.get('.k-searchselect-trigger').attributes('aria-disabled')).toBe('true');
    });
});
