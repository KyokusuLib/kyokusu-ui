export interface KyokusuMessages {
  selectPlaceholder: string;
  searchPlaceholder: string;
  noResults: string;
  startTyping: string;
  imagePlaceholder: string;
  invalidImageType: string;
  fileTooLarge: string;
  closeDialog: string;
  selectYear: string;
  datePlaceholder: string;
  confirmTitle: string;
  confirmDescription: string;
  confirmText: string;
  cancelText: string;
  notifications: string;
  removeTag: string;
  loading: string;
  closeNotification: string;
  contextMenu: string;
}

const en: KyokusuMessages = {
  selectPlaceholder: 'Select an item',
  searchPlaceholder: 'Search...',
  noResults: 'Nothing found',
  startTyping: 'Start typing...',
  imagePlaceholder: 'Click or drag an image here',
  invalidImageType: 'Please select an image file',
  fileTooLarge: 'File is too large. Maximum: {size} MB',
  closeDialog: 'Close dialog',
  selectYear: 'Select year',
  datePlaceholder: 'DD.MM.YYYY',
  confirmTitle: 'Confirmation',
  confirmDescription: 'Are you sure you want to proceed?',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  notifications: 'Notifications',
  removeTag: 'Remove {label}',
  loading: 'Loading',
  closeNotification: 'Close notification',
  contextMenu: 'Context menu',
};

const ru: KyokusuMessages = {
  selectPlaceholder: 'Выберите из списка',
  searchPlaceholder: 'Поиск...',
  noResults: 'Ничего не найдено',
  startTyping: 'Начните вводить...',
  imagePlaceholder: 'Нажмите или перетащите изображение',
  invalidImageType: 'Выберите файл изображения',
  fileTooLarge: 'Файл слишком большой. Максимум: {size} МБ',
  closeDialog: 'Закрыть окно',
  selectYear: 'Выберите год',
  datePlaceholder: 'ДД.ММ.ГГГГ',
  confirmTitle: 'Подтверждение',
  confirmDescription: 'Вы уверены, что хотите продолжить?',
  confirmText: 'Подтвердить',
  cancelText: 'Отмена',
  notifications: 'Уведомления',
  removeTag: 'Удалить {label}',
  loading: 'Загрузка',
  closeNotification: 'Закрыть уведомление',
  contextMenu: 'Контекстное меню',
};

const dictionaries: Record<string, KyokusuMessages> = { en, ru };

/** Locale used when an instance does not specify one. */
export const DEFAULT_LOCALE = 'en';

function resolveMessages(locale?: string): KyokusuMessages {
  if (!locale) return en;
  const key = locale.toLowerCase();
  return dictionaries[key] ?? dictionaries[key.slice(0, 2)] ?? en;
}

/**
 * Translates a built-in UI string. Consumers can pass their own locale to any
 * component; unknown locales fall back to English.
 */
export function t(
  locale: string | undefined,
  key: keyof KyokusuMessages,
  vars?: Record<string, string | number>
): string {
  const messages = resolveMessages(locale);
  let value = messages[key] ?? en[key];
  if (vars) {
    for (const [name, replacement] of Object.entries(vars)) {
      value = value.replaceAll(`{${name}}`, String(replacement));
    }
  }
  return value;
}

/** True when the given locale should use Russian date formatting. */
export function isRussianLocale(locale?: string): boolean {
  return (locale ?? DEFAULT_LOCALE).toLowerCase().startsWith('ru');
}
