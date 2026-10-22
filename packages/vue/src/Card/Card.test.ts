import { afterEach, describe, expect, it } from 'vitest';
import { enableAutoUnmount, mount } from '@vue/test-utils';
import Card from './Card.vue';

enableAutoUnmount(afterEach);

afterEach(() => {
    document.body.innerHTML = '';
});

describe('Card (vue)', () => {
    it('renders the default structure and padding', () => {
        const wrapper = mount(Card, {
            slots: { default: '<p>Body</p>' },
        });

        const card = wrapper.get('.k-card');
        expect(card.element.tagName).toBe('DIV');
        expect(card.classes()).toContain('k-card--default');
        expect(card.classes()).toContain('k-card--padding-md');
        expect(card.find('.k-card-header').exists()).toBe(false);
        expect(card.find('.k-card-footer').exists()).toBe(false);
        expect(card.text()).toContain('Body');
    });

    it('renders header and footer slots', () => {
        const wrapper = mount(Card, {
            slots: {
                header: '<h2>Title</h2>',
                default: '<p>Body</p>',
                footer: '<small>Footer</small>',
            },
        });

        expect(wrapper.get('.k-card-header').text()).toBe('Title');
        expect(wrapper.get('.k-card-footer').text()).toBe('Footer');
    });

    it('supports a custom tag, variant, shadow and attributes', () => {
        const wrapper = mount(Card, {
            props: { tag: 'section', variant: 'outline', padding: 'none', shadow: true },
            attrs: { 'aria-label': 'Settings' },
        });

        const card = wrapper.get('section.k-card');
        expect(card.classes()).toContain('k-card--outline');
        expect(card.classes()).toContain('k-card--padding-none');
        expect(card.classes()).toContain('k-card--shadow');
        expect(card.attributes('aria-label')).toBe('Settings');
    });
});
