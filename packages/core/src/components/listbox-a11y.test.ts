import { afterEach, describe, expect, it, vi } from 'vitest';
import { SearchSelect } from './search-select';
import { MultiSelect } from './multi-select';
import { DropdownMenu } from './dropdown-menu';

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = '';
});

describe('SearchSelect (core) keyboard support', () => {
  it('exposes combobox semantics and selects with the keyboard', () => {
    document.body.innerHTML = '<div id="root"></div>';
    const onChange = vi.fn();
    const select = new SearchSelect('#root', {
      options: ['Alpha', 'Beta'],
      locale: 'en',
      onChange,
    });

    const trigger = document.querySelector<HTMLElement>('.k-searchselect-trigger');
    expect(trigger?.getAttribute('role')).toBe('combobox');
    expect(trigger?.getAttribute('aria-expanded')).toBe('false');

    trigger?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(trigger?.getAttribute('aria-expanded')).toBe('true');

    const input = document.querySelector<HTMLInputElement>('.k-searchselect-search-input');
    expect(input?.getAttribute('aria-controls')).toBeTruthy();

    input?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    input?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

    expect(onChange).toHaveBeenCalledWith('Beta');
    select.unmount();
  });
});

describe('MultiSelect (core) keyboard support', () => {
  it('uses a listbox and adds an option with Enter', () => {
    document.body.innerHTML = '<div id="root"></div>';
    const onChange = vi.fn();
    const select = new MultiSelect('#root', {
      options: ['Alpha', 'Beta'],
      locale: 'en',
      onChange,
    });

    const input = document.querySelector<HTMLInputElement>('.k-multiselect-input');
    expect(input?.getAttribute('role')).toBe('combobox');
    expect(input?.getAttribute('aria-expanded')).toBe('false');

    input?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(input?.getAttribute('aria-expanded')).toBe('true');
    expect(document.querySelector('.k-multiselect-list')?.getAttribute('role')).toBe('listbox');

    input?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0][0].label).toBe('Alpha');
    select.unmount();
  });
});

describe('DropdownMenu (core) semantics', () => {
  it('renders menu, menuitem and separator roles', () => {
    document.body.innerHTML = '<button id="trigger">Menu</button>';
    const menu = new DropdownMenu('#trigger', {
      items: [
        { id: 'one', label: 'One', action: () => {} },
        { id: 'sep', label: '', separator: true },
        { id: 'two', label: 'Two', action: () => {} },
      ],
    });

    const trigger = document.getElementById('trigger');
    expect(trigger?.getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger?.getAttribute('aria-expanded')).toBe('false');

    trigger?.click();

    const menuEl = document.querySelector('.k-dropdown-menu');
    expect(menuEl?.getAttribute('role')).toBe('menu');
    expect(menuEl?.querySelectorAll('[role="menuitem"]')).toHaveLength(2);
    expect(menuEl?.querySelector('[role="separator"]')).not.toBeNull();
    expect(trigger?.getAttribute('aria-expanded')).toBe('true');

    menu.destroy();
  });
});
