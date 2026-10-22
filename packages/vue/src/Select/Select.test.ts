import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import Select from './Select.vue';
import { createKyokusuUI } from '../i18n';

const options = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
];

describe('Select (vue)', () => {
  it('renders combobox and listbox semantics', async () => {
    const wrapper = mount(Select, { props: { options, label: 'Letter' } });
    const trigger = wrapper.get('.k-select-trigger');

    expect(trigger.attributes('role')).toBe('combobox');
    expect(trigger.attributes('aria-expanded')).toBe('false');

    await trigger.trigger('keydown', { key: 'ArrowDown' });

    expect(trigger.attributes('aria-expanded')).toBe('true');
    const listbox = wrapper.get('[role="listbox"]');
    expect(listbox.findAll('[role="option"]')).toHaveLength(2);
  });

  it('selects an option with the keyboard', async () => {
    const wrapper = mount(Select, { props: { options } });
    const trigger = wrapper.get('.k-select-trigger');

    await trigger.trigger('keydown', { key: 'ArrowDown' });
    await trigger.trigger('keydown', { key: 'ArrowDown' });
    await trigger.trigger('keydown', { key: 'Enter' });

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['b']);
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
  });

  it('closes on Escape', async () => {
    const wrapper = mount(Select, { props: { options } });
    const trigger = wrapper.get('.k-select-trigger');

    await trigger.trigger('keydown', { key: 'ArrowDown' });
    await trigger.trigger('keydown', { key: 'Escape' });

    expect(trigger.attributes('aria-expanded')).toBe('false');
  });

  it('uses the locale from the app config', () => {
    const wrapper = mount(Select, {
      props: { options },
      global: { plugins: [createKyokusuUI({ locale: 'ru' })] },
    });

    expect(wrapper.text()).toContain('Выберите из списка');
  });
});
