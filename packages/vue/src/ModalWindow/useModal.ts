import { nextTick, onMounted, onUnmounted, watch, type Ref } from "vue";

const FOCUSABLE_SELECTOR = [
	"a[href]",
	"button:not([disabled])",
	"textarea:not([disabled])",
	"input:not([disabled])",
	"select:not([disabled])",
	'[tabindex]:not([tabindex="-1"])',
].join(",");

/**
 * Shared dialog behaviour: Escape to close, scroll lock, focus trap and focus
 * restoration. Keeping it in one place guarantees every dialog built on top of
 * ModalWindow behaves the same for keyboard users.
 */
export function useModalLogic(
	isOpen: Ref<boolean>,
	closeCallback: () => void,
	contentRef?: Ref<HTMLElement | null>
) {
	let previouslyFocused: HTMLElement | null = null;
	let previousBodyOverflow = "";

	const getFocusable = (): HTMLElement[] => {
		const root = contentRef?.value;
		if (!root) return [];
		return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
			(el) => el.offsetParent !== null
		);
	};

	const focusFirst = () => {
		const focusables = getFocusable();
		if (focusables.length > 0) {
			focusables[0].focus();
		} else {
			contentRef?.value?.focus();
		}
	};

	const handleKeydown = (e: KeyboardEvent) => {
		if (e.key === "Escape" && isOpen.value) {
			e.preventDefault();
			closeCallback();
			return;
		}

		if (e.key !== "Tab" || !isOpen.value || !contentRef?.value) return;

		const focusables = getFocusable();
		if (focusables.length === 0) {
			e.preventDefault();
			contentRef.value.focus();
			return;
		}

		const first = focusables[0];
		const last = focusables[focusables.length - 1];

		if (e.shiftKey && document.activeElement === first) {
			e.preventDefault();
			last.focus();
		} else if (!e.shiftKey && document.activeElement === last) {
			e.preventDefault();
			first.focus();
		}
	};

	watch(isOpen, async (val) => {
		if (typeof document === "undefined") return;

		if (val) {
			previouslyFocused = document.activeElement as HTMLElement | null;
			previousBodyOverflow = document.body.style.overflow;
			document.body.style.overflow = "hidden";
			await nextTick();
			focusFirst();
		} else {
			document.body.style.overflow = previousBodyOverflow;
			previouslyFocused?.focus();
			previouslyFocused = null;
		}
	});

	onMounted(async () => {
		document.addEventListener("keydown", handleKeydown);

		// Support dialogs that are open on first render (for example when the
		// initial state is restored from a store or from SSR markup).
		if (isOpen.value) {
			previouslyFocused = document.activeElement as HTMLElement | null;
			previousBodyOverflow = document.body.style.overflow;
			document.body.style.overflow = "hidden";
			await nextTick();
			focusFirst();
		}
	});

	onUnmounted(() => {
		document.removeEventListener("keydown", handleKeydown);
		document.body.style.overflow = previousBodyOverflow;
	});
}
