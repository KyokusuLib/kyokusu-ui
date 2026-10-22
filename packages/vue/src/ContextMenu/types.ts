import type { MenuItem } from '../DropdownMenu/types';

export interface ContextMenuProps {
    /** Items rendered inside the menu. Supports icons, separators and submenus. */
    items: MenuItem[];
    /** Disables the menu and lets the native context menu open instead. */
    disabled?: boolean;
    /** Menu width in pixels or any CSS length. */
    width?: number | string;
    /** BCP-47 locale used for the built-in accessible label. */
    locale?: string;
}

export interface ContextMenuPosition {
    x: number;
    y: number;
}
