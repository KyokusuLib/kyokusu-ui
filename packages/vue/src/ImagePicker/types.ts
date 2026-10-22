export interface ImagePickerProps {
    /** Размер превью: 'sm' | 'md' | 'lg' | число в пикселях */
    size?: 'sm' | 'md' | 'lg' | number
    /** Стиль бордера: 'solid' | 'dashed' | 'none' */
    border?: 'solid' | 'dashed' | 'none'
    /** Форма превью: 'square' | 'circle' */
    shape?: 'square' | 'circle'
    /** Допустимые типы файлов (accept атрибут input) */
    accept?: string
    /** Максимальный размер файла в мегабайтах */
    maxSize?: number
    /** Заголовок над превью */
    label?: string
    /** Подсказка при пустом превью */
    placeholder?: string
    /** Заблокирован ли компонент */
    disabled?: boolean
    /** BCP-47 locale для встроенных строк интерфейса */
    locale?: string
}
