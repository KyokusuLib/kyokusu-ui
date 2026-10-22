import { afterEach, describe, expect, it, vi } from 'vitest';
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import NotificationContainer from './NotificationContainer.vue';
import NotificationItem from './NotificationItem.vue';
import { useNotificationProvider } from './useNotification';
import type { NotificationItem as NotificationItemData } from './NotificationItem.vue';

enableAutoUnmount(afterEach);

afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
});

const notifications: NotificationItemData[] = [
    {
        id: 'success',
        title: 'Saved',
        content: 'Your changes are safe',
        type: 'success',
        duration: 0,
    },
    {
        id: 'error',
        title: 'Failed',
        type: 'error',
        duration: 0,
    },
];

describe('Notification (vue)', () => {
    it('renders a labelled live region and notification roles', () => {
        const wrapper = mount(NotificationContainer, {
            props: { notifications },
        });

        const region = wrapper.get('.k-notification-container');
        const items = wrapper.findAll('.k-notification-item');

        expect(region.attributes('role')).toBe('region');
        expect(region.attributes('aria-live')).toBe('polite');
        expect(region.attributes('aria-label')).toBe('Notifications');
        expect(items).toHaveLength(2);
        expect(items[0]?.attributes('role')).toBe('status');
        expect(items[1]?.attributes('role')).toBe('alert');
    });

    it('emits remove when the close button is clicked', async () => {
        const wrapper = mount(NotificationContainer, {
            props: { notifications },
        });

        await wrapper.get('.k-notification-close').trigger('click');

        expect(wrapper.emitted('remove')?.[0]).toEqual(['success']);
    });

    it('removes a notification by dragging it to the right', async () => {
        const wrapper = mount(NotificationItem, {
            props: { notification: notifications[0]! },
            attachTo: document.body,
        });

        await wrapper.trigger('mousedown', { clientX: 0 });
        window.dispatchEvent(new MouseEvent('mousemove', { clientX: 150 }));
        window.dispatchEvent(new MouseEvent('mouseup'));
        await nextTick();

        expect(wrapper.emitted('remove')?.[0]).toEqual(['success']);
    });

    it('auto-removes notifications after their duration', () => {
        vi.useFakeTimers();
        const { notifications: items, notify } = useNotificationProvider();
        items.value = [];

        notify({ title: 'Auto remove', duration: 1000 });
        expect(items.value).toHaveLength(1);

        vi.advanceTimersByTime(1000);
        expect(items.value).toHaveLength(0);

        vi.clearAllTimers();
    });

    it('throttles duplicate notifications and replays the latest one', () => {
        vi.useFakeTimers();
        const { notifications: items, notify } = useNotificationProvider();
        items.value = [];

        notify({ title: 'Duplicate', duration: 0 });
        notify({ title: 'Duplicate', duration: 0 });

        expect(items.value).toHaveLength(1);

        vi.advanceTimersByTime(3000);
        expect(items.value).toHaveLength(2);

        vi.clearAllTimers();
    });

    it('removes notifications by id', () => {
        const { notifications: items, remove } = useNotificationProvider();
        items.value = [...notifications];

        remove('success');

        expect(items.value.map((item) => item.id)).toEqual(['error']);
    });
});
