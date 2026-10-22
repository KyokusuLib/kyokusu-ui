import { afterEach, describe, expect, it } from 'vitest';
import { enableAutoUnmount, mount } from '@vue/test-utils';
import Label from './Label.vue';

enableAutoUnmount(afterEach);

afterEach(() => {
    document.body.innerHTML = '';
});

describe('Label (vue)', () => {
    it('renders a label linked to a control', () => {
        const wrapper = mount(Label, {
            props: { label: 'Email', for: 'email-input' },
        });

        expect(wrapper.get('label').attributes('for')).toBe('email-input');
        expect(wrapper.text()).toBe('Email');
    });

    it('renders nothing for an empty label', () => {
        const wrapper = mount(Label, {
            props: { label: '' },
        });

        expect(wrapper.find('label').exists()).toBe(false);
    });
});
