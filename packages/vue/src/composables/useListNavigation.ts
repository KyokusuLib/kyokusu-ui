import { computed, nextTick, ref, watch, type Ref } from "vue";

export interface UseListNavigationOptions<T> {
  /** Current, already filtered list of options. */
  items: () => T[];
  isOpen: Ref<boolean>;
  onSelect: (item: T, index: number) => void;
  onOpen?: () => void;
  onClose?: () => void;
  /** Stable DOM id for an option; used for aria-activedescendant. */
  optionId: (index: number) => string;
  /**
   * Whether Space selects the active option. Disable for widgets whose primary
   * control is a text input, where Space must remain a typeable character.
   */
  selectOnSpace?: boolean;
}

/**
 * Shared keyboard model for select/combobox/listbox widgets.
 *
 * Implements the WAI-ARIA patterns: Arrow keys move the active option, Home/End
 * jump to the edges, Enter/Space select, Escape closes. It deliberately keeps
 * DOM ownership in the component so it works for both inline and teleported
 * popups.
 */
export function useListNavigation<T>(options: UseListNavigationOptions<T>) {
  const activeIndex = ref(-1);

  const activeDescendant = computed(() =>
    options.isOpen.value && activeIndex.value >= 0
      ? options.optionId(activeIndex.value)
      : undefined
  );

  const reset = () => {
    activeIndex.value = -1;
  };

  const scrollActiveIntoView = async () => {
    await nextTick();
    if (activeIndex.value < 0) return;
    const el = document.getElementById(options.optionId(activeIndex.value));
    el?.scrollIntoView?.({ block: "nearest" });
  };

  const move = (delta: number) => {
    const list = options.items();
    if (list.length === 0) {
      activeIndex.value = -1;
      return;
    }
    const current = activeIndex.value;
    activeIndex.value = current < 0
      ? (delta > 0 ? 0 : list.length - 1)
      : (current + delta + list.length) % list.length;
    void scrollActiveIntoView();
  };

  const handleKeydown = (event: KeyboardEvent) => {
    const open = options.isOpen.value;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (!open) {
          options.onOpen?.();
          activeIndex.value = 0;
          void scrollActiveIntoView();
        } else {
          move(1);
        }
        break;
      case "ArrowUp":
        event.preventDefault();
        if (!open) {
          options.onOpen?.();
          activeIndex.value = Math.max(options.items().length - 1, 0);
          void scrollActiveIntoView();
        } else {
          move(-1);
        }
        break;
      case "Home":
        if (!open) return;
        event.preventDefault();
        activeIndex.value = 0;
        void scrollActiveIntoView();
        break;
      case "End":
        if (!open) return;
        event.preventDefault();
        activeIndex.value = Math.max(options.items().length - 1, 0);
        void scrollActiveIntoView();
        break;
      case "Enter":
      case " ":
        if (event.key === " " && options.selectOnSpace === false) return;
        if (!open) {
          event.preventDefault();
          options.onOpen?.();
          return;
        }
        if (activeIndex.value >= 0) {
          const item = options.items()[activeIndex.value];
          if (item !== undefined) {
            event.preventDefault();
            options.onSelect(item, activeIndex.value);
          }
        }
        break;
      case "Escape":
        if (!open) return;
        event.preventDefault();
        options.onClose?.();
        reset();
        break;
      case "Tab":
        if (open) options.onClose?.();
        break;
    }
  };

  watch(options.isOpen, (open) => {
    if (!open) reset();
  });

  watch(options.items, (items) => {
    if (activeIndex.value >= items.length) activeIndex.value = -1;
  });

  return {
    activeIndex,
    activeDescendant,
    handleKeydown,
    reset,
  };
}
