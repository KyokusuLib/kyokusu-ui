import { afterEach, describe, expect, it } from 'vitest';
import { enableAutoUnmount, mount } from '@vue/test-utils';
import DatePicker from './DatePicker.vue';

enableAutoUnmount(afterEach);

afterEach(() => {
    document.body.innerHTML = '';
});

function mountDatePicker(props: Record<string, unknown> = {}) {
    return mount(DatePicker, {
        props,
        attachTo: document.body,
    });
}

describe('DatePicker (vue)', () => {
    it('links the label and formats the selected date', () => {
        const wrapper = mountDatePicker({
            id: 'birthday',
            label: 'Birthday',
            locale: 'en-US',
            modelValue: '2024-03-15',
        });
        const input = wrapper.get('input');

        expect(wrapper.get('label').attributes('for')).toBe('birthday');
        expect(input.attributes('id')).toBe('birthday');
        expect(input.element.value).toBe('03/15/2024');
    });

    it('opens the calendar and selects a day', async () => {
        const wrapper = mountDatePicker({ locale: 'en-US' });

        await wrapper.get('input').trigger('click');
        expect(wrapper.find('.k-datepicker-popup').exists()).toBe(true);

        await wrapper.get('.k-datepicker-day').trigger('click');

        const value = wrapper.emitted('update:modelValue')?.[0]?.[0];
        expect(value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(wrapper.find('.k-datepicker-popup').exists()).toBe(false);
    });

    it('navigates between months', async () => {
        const wrapper = mountDatePicker({
            locale: 'en-US',
            modelValue: '2024-03-15',
        });

        await wrapper.get('input').trigger('click');
        const monthBefore = wrapper.get('.k-datepicker-month').text();

        await wrapper.findAll('.k-datepicker-nav-btn')[0]?.trigger('click');

        expect(wrapper.get('.k-datepicker-month').text()).not.toBe(monthBefore);
    });

    it('selects a year in year mode', async () => {
        const wrapper = mountDatePicker({
            locale: 'en-US',
            type: 'year',
        });
        const currentYear = String(new Date().getFullYear());

        await wrapper.get('input').trigger('click');
        const yearButton = wrapper
            .findAll('.k-datepicker-year')
            .find((button) => button.text() === currentYear);

        expect(yearButton).toBeDefined();
        await yearButton?.trigger('click');

        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([currentYear]);
        expect(wrapper.find('.k-datepicker-popup').exists()).toBe(false);
    });

    it('does not open while disabled', async () => {
        const wrapper = mountDatePicker({ disabled: true });

        await wrapper.get('input').trigger('click');

        expect(wrapper.find('.k-datepicker-popup').exists()).toBe(false);
    });

    it('uses Russian UI strings through the locale prop', () => {
        const wrapper = mountDatePicker({ locale: 'ru-RU' });

        expect(wrapper.get('input').attributes('placeholder')).toBe('ДД.ММ.ГГГГ');
    });
});
