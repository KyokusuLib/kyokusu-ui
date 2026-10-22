import { afterEach, describe, expect, it } from 'vitest';
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import MultiSelect from './MultiSelect.vue';

enableAutoUnmount(afterEach);

afterEach(() => {
    document.body.innerHTML = '';
});

const options = ['alpha', 'beta', 'gamma'];

function mountMultiSelect(props: Record<string, unknown> = {}) {
    return mount(MultiSelect, {
        props: {
            options,
            ...props,
        },
        attachTo: document.body,
    });
}

describe('MultiSelect (vue)', () => {
    it('renders labels, selected tags and forwarded attributes', () => {
        const wrapper = mountMultiSelect({
            id: 'skills',
            label: 'Skills',
            placeholder: 'Pick skills',
            modelValue: ['alpha'],
            class: 'custom-select',
        });

        expect(wrapper.get('label').attributes('for')).toBe('skills');
        expect(wrapper.get('input').attributes('id')).toBe('skills');
        expect(wrapper.get('.k-multiselect-tag').text()).toContain('alpha');
        expect(wrapper.get('.k-multiselect-tag-close').attributes('aria-label')).toBe(
            'Remove alpha',
        );
        expect(wrapper.get('.k-multiselect-wrapper').classes()).toContain('custom-select');
        expect(wrapper.get('input').attributes('placeholder')).toBe('');
    });

    it('opens the list and selects an option', async () => {
        const wrapper = mountMultiSelect();
        const trigger = wrapper.get('.k-multiselect-trigger');

        expect(wrapper.get('input').attributes('aria-expanded')).toBe('false');
        await trigger.trigger('click');

        expect(wrapper.get('input').attributes('aria-expanded')).toBe('true');
        expect(wrapper.findAll('.k-multiselect-item')).toHaveLength(3);

        await wrapper.findAll('.k-multiselect-item')[1]?.trigger('click');

        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([
            [{ id: 'beta', label: 'beta' }],
        ]);
    });

    it('removes a selected tag', async () => {
        const wrapper = mountMultiSelect({
            modelValue: ['alpha', 'beta'],
        });

        await wrapper.get('.k-multiselect-tag-close').trigger('click');

        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['beta']]);
    });

    it('closes on outside mousedown', async () => {
        const wrapper = mountMultiSelect();
        await wrapper.get('.k-multiselect-trigger').trigger('click');

        document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        await nextTick();

        expect(wrapper.find('.k-multiselect-popup').exists()).toBe(false);
    });

    it('filters options and reports the search query', async () => {
        const wrapper = mountMultiSelect();
        await wrapper.get('.k-multiselect-trigger').trigger('click');
        const input = wrapper.get('input');

        await input.setValue('ga');

        expect(wrapper.emitted('search')?.at(-1)).toEqual(['ga']);
        expect(wrapper.findAll('.k-multiselect-item')).toHaveLength(1);
        expect(wrapper.get('.k-multiselect-item').text()).toBe('gamma');

        await input.setValue('missing');

        expect(wrapper.get('.k-multiselect-empty').text()).toBe('Nothing found');
    });

    it('supports keyboard navigation and selection', async () => {
        const wrapper = mountMultiSelect();
        const input = wrapper.get('input');

        await input.trigger('focus');
        await input.trigger('keydown', { key: 'ArrowDown' });
        expect(wrapper.get('.k-multiselect-item').classes()).toContain(
            'k-multiselect-item--active',
        );

        await input.trigger('keydown', { key: 'Enter' });
        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([
            [{ id: 'alpha', label: 'alpha' }],
        ]);

        await input.trigger('keydown', { key: 'Escape' });
        expect(wrapper.find('.k-multiselect-popup').exists()).toBe(false);
    });

    it('removes the last tag with backspace on an empty query', async () => {
        const wrapper = mountMultiSelect({
            modelValue: ['alpha', 'beta'],
        });

        await wrapper.get('input').trigger('keydown', { key: 'Backspace' });

        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['alpha']]);
    });

    it('does not open or remove tags while disabled', async () => {
        const wrapper = mountMultiSelect({
            disabled: true,
            modelValue: ['alpha', 'beta'],
        });

        await wrapper.get('.k-multiselect-trigger').trigger('click');
        await wrapper.get('.k-multiselect-tag-close').trigger('click');

        expect(wrapper.find('.k-multiselect-popup').exists()).toBe(false);
        expect(wrapper.emitted('update:modelValue')).toBeUndefined();
        expect(wrapper.get('input').attributes('disabled')).toBeDefined();
    });

    it('shows a loading indicator and an empty state', async () => {
        const loadingWrapper = mountMultiSelect({ loading: true });
        await loadingWrapper.get('.k-multiselect-trigger').trigger('click');
        expect(loadingWrapper.find('.k-multiselect-loader').exists()).toBe(true);
        expect(loadingWrapper.find('.k-multiselect-empty').exists()).toBe(false);

        const emptyWrapper = mountMultiSelect({ options: [] });
        await emptyWrapper.get('.k-multiselect-trigger').trigger('click');
        expect(emptyWrapper.get('.k-multiselect-empty').text()).toBe('Start typing...');
    });

    it('accepts option objects in the model value', async () => {
        const wrapper = mountMultiSelect({
            modelValue: [{ id: 'alpha', label: 'Alpha label' }],
        });

        expect(wrapper.get('.k-multiselect-tag').text()).toContain('Alpha label');

        await wrapper.get('.k-multiselect-trigger').trigger('click');

        expect(wrapper.findAll('.k-multiselect-item').map((item) => item.text())).toEqual([
            'beta',
            'gamma',
        ]);
    });
});
