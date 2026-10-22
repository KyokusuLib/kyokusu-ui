import { afterEach, describe, expect, it } from 'vitest';
import { enableAutoUnmount, mount } from '@vue/test-utils';
import PageLayout from './PageLayout.vue';

enableAutoUnmount(afterEach);

afterEach(() => {
    document.body.innerHTML = '';
});

describe('PageLayout (vue)', () => {
    it('applies width and background styles and renders the slot', () => {
        const wrapper = mount(PageLayout, {
            props: { maxWidth: '48rem', bg: '#fafafa' },
            slots: { default: '<main>Page</main>' },
        });

        expect(wrapper.get('.k-page-layout').attributes('style')).toContain(
            'background-color: rgb(250, 250, 250)',
        );
        expect(wrapper.get('.k-page-layout-inner').attributes('style')).toContain(
            'max-width: 48rem',
        );
        expect(wrapper.get('main').text()).toBe('Page');
    });
});
