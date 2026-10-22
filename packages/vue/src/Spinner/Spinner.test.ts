import { afterEach, describe, expect, it } from 'vitest';
import { enableAutoUnmount, mount } from '@vue/test-utils';
import Spinner from './Spinner.vue';

enableAutoUnmount(afterEach);

afterEach(() => {
    document.body.innerHTML = '';
});

describe('Spinner (vue)', () => {
    it('renders a status with size and variant classes', () => {
        const wrapper = mount(Spinner, {
            props: { size: 'lg', variant: 'primary' },
        });

        const spinner = wrapper.get('[role="status"]');
        expect(spinner.classes()).toContain('k-spinner--lg');
        expect(spinner.classes()).toContain('k-spinner--primary');
        expect(spinner.attributes('aria-label')).toBe('Loading');
        expect(wrapper.find('svg').exists()).toBe(true);
    });

    it('uses inline dimensions for numeric sizes', () => {
        const wrapper = mount(Spinner, {
            props: { size: 40 },
        });

        expect(wrapper.get('[role="status"]').attributes('style')).toContain('width: 40px');
        expect(wrapper.get('[role="status"]').attributes('style')).toContain('height: 40px');
    });

    it('localizes the accessible label', () => {
        const wrapper = mount(Spinner, {
            props: { locale: 'ru' },
        });

        expect(wrapper.get('[role="status"]').attributes('aria-label')).toBe('Загрузка');
    });
});
