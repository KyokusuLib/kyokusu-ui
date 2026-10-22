import { describe, expect, it } from 'vitest';
import { t, isRussianLocale } from './i18n';

describe('core i18n', () => {
  it('falls back to English', () => {
    expect(t(undefined, 'closeDialog')).toBe('Close dialog');
    expect(t('fr', 'closeDialog')).toBe('Close dialog');
  });

  it('supports locale prefixes', () => {
    expect(t('ru-RU', 'closeDialog')).toBe('Закрыть окно');
    expect(isRussianLocale('ru-RU')).toBe(true);
    expect(isRussianLocale('en-US')).toBe(false);
  });

  it('interpolates variables', () => {
    expect(t('en', 'fileTooLarge', { size: 3 })).toBe(
      'File is too large. Maximum: 3 MB'
    );
  });
});
