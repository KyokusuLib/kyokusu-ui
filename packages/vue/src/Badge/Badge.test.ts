import { afterEach, describe, expect, it } from 'vitest';
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { h } from 'vue';
import Badge from './Badge.vue';

enableAutoUnmount(afterEach);

afterEach(() => {
    document.body.innerHTML = '';
});

describe('Badge (vue)', () => {
    it('renders text with variant and size classes', () => {
        const wrapper = mount(Badge, {
            props: { text: 'New', variant: 'secondary', size: 'lg' },
        });

        expect(wrapper.get('span').classes()).toEqual(
            expect.arrayContaining(['k-badge', 'k-badge--secondary', 'k-badge--lg']),
        );
        expect(wrapper.text()).toBe('New');
    });

    it('renders a link when the link prop is set', () => {
        const wrapper = mount(Badge, {
            props: { text: 'Docs', link: 'https://example.com' },
            attrs: { id: 'docs-badge' },
        });

        const link = wrapper.get('a');
        expect(link.attributes('href')).toBe('https://example.com');
        expect(link.attributes('target')).toBe('_blank');
        expect(link.attributes('rel')).toBe('noopener noreferrer');
        expect(link.attributes('id')).toBe('docs-badge');
    });

    it('applies a custom background and renders icon components', () => {
        const StartIcon = { render: () => h('i', { class: 'start-icon' }) };
        const EndIcon = { render: () => h('i', { class: 'end-icon' }) };

        const wrapper = mount(Badge, {
            props: {
                text: 'Beta',
                bg: 'tomato',
                iconStart: StartIcon,
                iconEnd: EndIcon,
            },
        });

        expect(wrapper.get('span').attributes('style')).toContain('background-color: tomato');
        expect(wrapper.find('.start-icon').exists()).toBe(true);
        expect(wrapper.find('.end-icon').exists()).toBe(true);
    });

    it('prefers the default slot over the text prop', () => {
        const wrapper = mount(Badge, {
            props: { text: 'Fallback' },
            slots: { default: '<strong>Slotted</strong>' },
        });

        expect(wrapper.find('strong').text()).toBe('Slotted');
        expect(wrapper.text()).not.toContain('Fallback');
    });
});
