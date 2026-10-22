import {
  computed,
  inject,
  toValue,
  type App,
  type InjectionKey,
  type MaybeRefOrGetter,
} from 'vue';

export interface KyokusuMessages {
  selectPlaceholder: string;
  searchPlaceholder: string;
  noResults: string;
  noData: string;
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
  edit: string;
  delete: string;
  bold: string;
  italic: string;
  strikeThrough: string;
  loading: string;
  actions: string;
  closeNotification: string;
  contextMenu: string;
}

const en: KyokusuMessages = {
  selectPlaceholder: 'Select an item',
  searchPlaceholder: 'Search...',
  noResults: 'Nothing found',
  noData: 'No data found',
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
  edit: 'Edit',
  delete: 'Delete',
  bold: 'Bold',
  italic: 'Italic',
  strikeThrough: 'Strikethrough',
  loading: 'Loading',
  actions: 'Actions',
  closeNotification: 'Close notification',
  contextMenu: 'Context menu',
};

const ru: KyokusuMessages = {
  selectPlaceholder: 'Выберите из списка',
  searchPlaceholder: 'Поиск...',
  noResults: 'Ничего не найдено',
  noData: 'Данные не найдены',
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
  edit: 'Редактировать',
  delete: 'Удалить',
  bold: 'Жирный',
  italic: 'Курсив',
  strikeThrough: 'Зачеркнутый',
  loading: 'Загрузка',
  actions: 'Действия',
  closeNotification: 'Закрыть уведомление',
  contextMenu: 'Контекстное меню',
};

const dictionaries: Record<string, KyokusuMessages> = { en, ru };

export const DEFAULT_LOCALE = 'en';

export interface KyokusuConfig {
  /** Default locale for all components in the application. */
  locale?: string;
  /** Override or extend built-in dictionaries, keyed by locale. */
  messages?: Record<string, Partial<KyokusuMessages>>;
}

export const kyokusuConfigKey: InjectionKey<KyokusuConfig> = Symbol('kyokusu-config');

/**
 * Installs the global Kyokusu UI configuration.
 *
 * @example
 * app.use(createKyokusuUI({ locale: 'ru' }))
 */
export function createKyokusuUI(config: KyokusuConfig = {}) {
  return {
    install(app: App) {
      app.provide(kyokusuConfigKey, config);
    },
  };
}

function resolveMessages(locale: string, overrides?: KyokusuConfig['messages']): KyokusuMessages {
  const key = locale.toLowerCase();
  const base = dictionaries[key] ?? dictionaries[key.slice(0, 2)] ?? en;
  const custom = overrides?.[key] ?? overrides?.[key.slice(0, 2)];
  return custom ? { ...base, ...custom } : base;
}

export function translate(
  locale: string | undefined,
  key: keyof KyokusuMessages,
  vars?: Record<string, string | number>,
  overrides?: KyokusuConfig['messages']
): string {
  let value = resolveMessages(locale ?? DEFAULT_LOCALE, overrides)[key];
  if (vars) {
    for (const [name, replacement] of Object.entries(vars)) {
      value = value.replaceAll(`{${name}}`, String(replacement));
    }
  }
  return value;
}

/**
 * Component-level translation helper. Reads the locale from a prop first, then
 * from the application config, and finally falls back to English.
 */
export function useKyokusuLocale(locale?: MaybeRefOrGetter<string | undefined>) {
  const config = inject(kyokusuConfigKey, null);

  const resolvedLocale = computed(
    () => toValue(locale) ?? config?.locale ?? DEFAULT_LOCALE
  );

  const t = (
    key: keyof KyokusuMessages,
    vars?: Record<string, string | number>
  ): string => translate(resolvedLocale.value, key, vars, config?.messages);

  return { locale: resolvedLocale, t };
}
