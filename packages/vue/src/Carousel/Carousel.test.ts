import { afterEach, describe, expect, it } from 'vitest';
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import Carousel from './Carousel.vue';

enableAutoUnmount(afterEach);

afterEach(() => {
    document.body.innerHTML = '';
});

function mountCarousel() {
    return mount(Carousel, {
        props: {
            interval: 0,
            items: [{ title: 'One' }, { title: 'Two' }, { title: 'Three' }],
        },
        slots: {
            card: ({ item }: { item: { title: string } }) =>
                h('article', { class: 'demo-card' }, item.title),
        },
        attachTo: document.body,
    });
}

describe('Carousel (vue)', () => {
    it('renders every item through the card slot', () => {
        const wrapper = mountCarousel();

        expect(wrapper.findAll('.k-carousel-item')).toHaveLength(3);
        expect(wrapper.findAll('.demo-card').map((card) => card.text())).toEqual([
            'One',
            'Two',
            'Three',
        ]);
    });

    it('drags the container and restores styles on release', async () => {
        const wrapper = mountCarousel();
        const container = wrapper.get('.k-carousel-container');
        let scrollLeft = 0;
        Object.defineProperty(container.element, 'scrollLeft', {
            configurable: true,
            get: () => scrollLeft,
            set: (value: number) => {
                scrollLeft = value;
            },
        });

        const mouseEvent = (type: string, pageX: number) => {
            const event = new MouseEvent(type, { bubbles: true, cancelable: true });
            Object.defineProperty(event, 'pageX', { value: pageX });
            return event;
        };

        container.element.dispatchEvent(mouseEvent('mousedown', 100));
        await nextTick();
        expect(container.element.style.cursor).toBe('grabbing');
        expect(container.element.style.scrollSnapType).toBe('none');

        container.element.dispatchEvent(mouseEvent('mousemove', 50));
        await nextTick();
        expect(container.element.scrollLeft).toBe(75);

        container.element.dispatchEvent(mouseEvent('mouseup', 50));
        expect(container.element.style.cursor).toBe('grab');
        expect(container.element.style.scrollSnapType).toBe('x mandatory');
    });
});
