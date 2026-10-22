import { afterEach, describe, expect, it } from 'vitest';
import { enableAutoUnmount, mount } from '@vue/test-utils';
import Toggle from './Toggle.vue';

enableAutoUnmount(afterEach);

afterEach(() => {
    document.body.innerHTML = '';
});

describe('Toggle (vue)', () => {
    it('renders switch semantics and toggles through v-model', async () => {
        const wrapper = mount(Toggle, {
            props: { label: 'Notifications', modelValue: false },
        });
        const button = wrapper.get('button');

        expect(button.attributes('role')).toBe('switch');
        expect(button.attributes('aria-checked')).toBe('false');
        expect(button.text()).toContain('Notifications');

        await button.trigger('click');

        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true]);
    });

    it('reflects the controlled value', async () => {
        const wrapper = mount(Toggle, {
            props: { modelValue: true },
        });

        expect(wrapper.get('button').attributes('aria-checked')).toBe('true');

        await wrapper.setProps({ modelValue: false });

        expect(wrapper.get('button').attributes('aria-checked')).toBe('false');
    });

    it('toggles when the label is clicked', async () => {
        const wrapper = mount(Toggle, {
            props: { label: 'Notifications', modelValue: false },
        });

        await wrapper.get('label').trigger('click');

        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true]);
    });

    it('does not toggle while disabled', async () => {
        const wrapper = mount(Toggle, {
            props: { disabled: true, modelValue: false },
        });

        await wrapper.get('button').trigger('click');

        expect(wrapper.emitted('update:modelValue')).toBeUndefined();
        expect(wrapper.get('button').attributes('disabled')).toBeDefined();
    });
});
