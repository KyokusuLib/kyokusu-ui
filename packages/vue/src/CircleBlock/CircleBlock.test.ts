import { afterEach, describe, expect, it } from 'vitest';
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { h } from 'vue';
import CircleBlock from './CircleBlock.vue';

enableAutoUnmount(afterEach);

afterEach(() => {
    document.body.innerHTML = '';
});

describe('CircleBlock (vue)', () => {
    it('derives initials from two words', () => {
        const wrapper = mount(CircleBlock, {
            props: { text: 'Ada Lovelace', size: 'lg', border: true, bg: 'navy', color: 'white' },
        });

        expect(wrapper.get('.k-circle-block-text').text()).toBe('AL');
        expect(wrapper.get('.k-circle-block').attributes('style')).toContain('width: 56px');
        expect(wrapper.get('.k-circle-block').attributes('style')).toContain('border-width: 2px');
    });

    it('uses the first two letters for a single word', () => {
        const wrapper = mount(CircleBlock, {
            props: { text: 'Kyokusu', size: 32 },
        });

        expect(wrapper.get('.k-circle-block-text').text()).toBe('KY');
        expect(wrapper.get('.k-circle-block-text').attributes('style')).toContain(
            'font-size: 11px',
        );
    });

    it('renders an image when src is set', () => {
        const wrapper = mount(CircleBlock, {
            props: { src: '/avatar.png', text: 'Ignored' },
        });

        expect(wrapper.get('img').attributes('src')).toBe('/avatar.png');
        expect(wrapper.find('.k-circle-block-text').exists()).toBe(false);
    });

    it('renders an icon when icon is set', () => {
        const Icon = { render: () => h('svg', { class: 'custom-icon' }) };
        const wrapper = mount(CircleBlock, {
            props: { icon: Icon, text: 'Ignored' },
        });

        expect(wrapper.find('.custom-icon').exists()).toBe(true);
        expect(wrapper.find('.k-circle-block-text').exists()).toBe(false);
    });
});
