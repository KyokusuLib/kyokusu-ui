import { describe, expect, it } from 'vitest';
import { translate } from './index';

describe('vue i18n', () => {
  it('resolves locales and falls back to English', () => {
    expect(translate('ru', 'closeDialog')).toBe('Закрыть окно');
    expect(translate('de', 'closeDialog')).toBe('Close dialog');
  });

  it('accepts custom messages', () => {
    expect(
      translate('en', 'closeDialog', undefined, { en: { closeDialog: 'Dismiss' } })
    ).toBe('Dismiss');
  });
});
