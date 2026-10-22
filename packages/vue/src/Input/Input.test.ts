import { afterEach, describe, expect, it } from 'vitest';
import { enableAutoUnmount, mount } from '@vue/test-utils';
import Input from './Input.vue';

enableAutoUnmount(afterEach);

afterEach(() => {
    document.body.innerHTML = '';
});

describe('Input (vue)', () => {
    it('links the label and forwards form attributes to the input', () => {
        const wrapper = mount(Input, {
            props: {
                id: 'email',
                label: 'Email',
                placeholder: 'you@example.com',
            },
            attrs: {
                name: 'email',
                autocomplete: 'email',
            },
        });

        const label = wrapper.get('label');
        const input = wrapper.get('input');

        expect(label.attributes('for')).toBe('email');
        expect(input.attributes('id')).toBe('email');
        expect(input.attributes('name')).toBe('email');
        expect(input.attributes('autocomplete')).toBe('email');
        expect(input.attributes('placeholder')).toBe('you@example.com');
    });

    it('supports v-model updates', async () => {
        const wrapper = mount(Input);

        await wrapper.get('input').setValue('hello');

        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['hello']);
    });

    it('shows an error instead of the description', async () => {
        const wrapper = mount(Input, {
            props: {
                description: 'We never share it',
                error: 'Email is required',
            },
        });

        expect(wrapper.text()).toContain('Email is required');
        expect(wrapper.text()).not.toContain('We never share it');
    });

    it('toggles password visibility', async () => {
        const wrapper = mount(Input, {
            props: { type: 'password' },
        });
        const input = wrapper.get('input');

        expect(input.attributes('type')).toBe('password');

        await wrapper.get('button').trigger('click');
        expect(input.attributes('type')).toBe('text');

        await wrapper.get('button').trigger('click');
        expect(input.attributes('type')).toBe('password');
    });

    it('does not toggle password visibility while disabled', async () => {
        const wrapper = mount(Input, {
            props: { type: 'password', disabled: true },
        });

        await wrapper.get('button').trigger('click');

        expect(wrapper.get('input').attributes('type')).toBe('password');
    });
});
