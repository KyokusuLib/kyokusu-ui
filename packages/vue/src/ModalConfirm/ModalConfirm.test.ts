import { afterEach, describe, expect, it } from 'vitest';
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ModalConfirm from './ModalConfirm.vue';

enableAutoUnmount(afterEach);

afterEach(() => {
    document.body.innerHTML = '';
});

function mountConfirm(props: Record<string, unknown> = {}) {
    return mount(ModalConfirm, {
        props: {
            modelValue: true,
            ...props,
        },
        attachTo: document.body,
    });
}

function actionButtons() {
    return Array.from(
        document.body.querySelectorAll<HTMLButtonElement>('.k-modal-confirm-actions .k-button'),
    );
}

describe('ModalConfirm (vue)', () => {
    it('renders default texts and dialog semantics', () => {
        mountConfirm();

        const dialog = document.body.querySelector('[role="dialog"]');
        expect(dialog?.textContent).toContain('Confirmation');
        expect(dialog?.textContent).toContain('Are you sure you want to proceed?');
        expect(actionButtons()).toHaveLength(2);
    });

    it('emits confirm and closes', async () => {
        const wrapper = mountConfirm({
            title: 'Delete item',
            description: 'This cannot be undone.',
        });

        actionButtons()[1]?.click();
        await nextTick();

        expect(wrapper.emitted('confirm')).toHaveLength(1);
        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false]);
    });

    it('emits cancel and closes', async () => {
        const wrapper = mountConfirm();

        actionButtons()[0]?.click();
        await nextTick();

        expect(wrapper.emitted('cancel')).toHaveLength(1);
        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false]);
    });

    it('uses localized default texts', () => {
        mountConfirm({ locale: 'ru' });

        const dialog = document.body.querySelector('[role="dialog"]');
        expect(dialog?.textContent).toContain('Подтверждение');
        expect(dialog?.textContent).toContain('Подтвердить');
    });
});
