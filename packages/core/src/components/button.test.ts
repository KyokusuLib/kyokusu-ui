import { describe, expect, it, vi } from 'vitest';
import { Button } from './button';

describe('Button (core)', () => {
  it('renders text and handles clicks', () => {
    document.body.innerHTML = '<button id="btn"></button>';
    const onClick = vi.fn();

    const button = new Button('#btn', { text: 'Save', onClick });

    expect(button.getElement().textContent).toContain('Save');
    expect(button.getElement().className).toContain('k-button');

    button.getElement().click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not fire onClick when disabled or loading', () => {
    document.body.innerHTML = '<button id="btn"></button>';
    const onClick = vi.fn();
    const button = new Button('#btn', { text: 'Save', onClick, disabled: true });

    button.getElement().click();
    expect(onClick).not.toHaveBeenCalled();

    button.updateOptions({ disabled: false, loading: true });
    button.getElement().click();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('removes its listener on unmount', () => {
    document.body.innerHTML = '<button id="btn"></button>';
    const onClick = vi.fn();
    const button = new Button('#btn', { text: 'Save', onClick });

    button.unmount();
    button.getElement().click();

    expect(onClick).not.toHaveBeenCalled();
  });
});
