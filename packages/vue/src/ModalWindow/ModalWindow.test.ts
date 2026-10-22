import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import ModalWindow from './ModalWindow.vue';

const query = <T extends Element>(selector: string) =>
  document.body.querySelector<T>(selector);

describe('ModalWindow (vue)', () => {
  it('links the dialog to a unique title and applies the max width', () => {
    const wrapper = mount(ModalWindow, {
      props: { modelValue: true, title: 'Delete', width: 480 },
      attachTo: document.body,
    });

    const dialog = query('[role="dialog"]');
    const title = query('.k-modal-title');
    const content = query<HTMLElement>('.k-modal-content');

    expect(dialog?.getAttribute('aria-modal')).toBe('true');
    expect(dialog?.getAttribute('aria-labelledby')).toBe(title?.id);
    expect(content?.style.maxWidth).toBe('480px');

    wrapper.unmount();
  });

  it('does not reuse the same title id across instances in one app', () => {
    const Host = defineComponent({
      render: () =>
        h('div', [
          h(ModalWindow, { modelValue: true, title: 'One' }),
          h(ModalWindow, { modelValue: true, title: 'Two' }),
        ]),
    });

    const wrapper = mount(Host, { attachTo: document.body });
    const titles = document.body.querySelectorAll('.k-modal-title');

    expect(titles).toHaveLength(2);
    expect(titles[0].id).not.toBe(titles[1].id);

    wrapper.unmount();
  });
});
