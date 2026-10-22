import { afterEach, describe, expect, it, vi } from 'vitest';
import { ModalWindow } from './modal-window';

describe('ModalWindow (core)', () => {
  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
    document.body.style.overflow = '';
  });

  it('exposes dialog semantics and a numeric width', () => {
    const modal = new ModalWindow({ title: 'Delete item', content: 'Sure?', width: 480 });
    modal.open();

    const dialog = document.querySelector('[role="dialog"]');
    const content = document.querySelector('.k-modal-content') as HTMLElement;
    const title = document.querySelector('.k-modal-title') as HTMLElement;

    expect(dialog).not.toBeNull();
    expect(dialog?.getAttribute('aria-modal')).toBe('true');
    expect(dialog?.getAttribute('aria-labelledby')).toBe(title.id);
    expect(content.style.maxWidth).toBe('480px');
    expect(title.textContent).toBe('Delete item');

    modal.destroy();
  });

  it('closes on Escape and restores body scroll', () => {
    vi.useFakeTimers();
    const modal = new ModalWindow({ title: 'Title', width: '32rem' });
    modal.open();

    expect(document.body.style.overflow).toBe('hidden');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(document.body.style.overflow).toBe('');
    vi.advanceTimersByTime(400);
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });

  it('uses the locale for the close button label', () => {
    const modal = new ModalWindow({ title: 'Title', locale: 'ru' });
    modal.open();

    expect(document.querySelector('.k-modal-close')?.getAttribute('aria-label')).toBe(
      'Закрыть окно'
    );

    modal.destroy();
  });
});
