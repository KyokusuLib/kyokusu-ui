import { afterEach, describe, expect, it } from 'vitest';
import { enableAutoUnmount, mount } from '@vue/test-utils';
import Separator from './Separator.vue';

enableAutoUnmount(afterEach);

afterEach(() => {
    document.body.innerHTML = '';
});

describe('Separator (vue)', () => {
    it('renders a horizontal labelled separator', () => {
        const wrapper = mount(Separator, {
            props: { label: 'Or', labelPosition: 'left', dashed: true, color: 'red' },
        });

        const separator = wrapper.get('.k-separator');
        expect(separator.attributes('role')).toBe('separator');
        expect(separator.attributes('aria-orientation')).toBe('horizontal');
        expect(separator.classes()).toContain('k-separator--label-left');
        expect(separator.classes()).toContain('k-separator--dashed');
        expect(separator.classes()).toContain('k-separator--has-label');
        expect(separator.attributes('style')).toContain('--k-sep-color: red');
        expect(wrapper.get('.k-separator-label').text()).toBe('Or');
    });

    it('ignores the label for vertical separators', () => {
        const wrapper = mount(Separator, {
            props: { orientation: 'vertical', label: 'Hidden' },
        });

        const separator = wrapper.get('.k-separator');
        expect(separator.attributes('aria-orientation')).toBe('vertical');
        expect(separator.classes()).toContain('k-separator--vertical');
        expect(wrapper.find('.k-separator-label').exists()).toBe(false);
    });
});
