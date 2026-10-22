<script setup lang="ts">
import { ref, useId } from "vue";

interface Props {
	text: string;
	position?: "top" | "bottom" | "left" | "right";
	delay?: number;
}

const props = withDefaults(defineProps<Props>(), {
	position: "top",
	delay: 200,
});

const isVisible = ref(false);
const tooltipId = useId();
let timeout: ReturnType<typeof setTimeout> | null = null;

const show = () => {
	timeout = setTimeout(() => {
		isVisible.value = true;
	}, props.delay);
};

const hide = () => {
	if (timeout) clearTimeout(timeout);
	isVisible.value = false;
};
</script>

<template>
  <div 
    class="k-tooltip-wrapper"
    @mouseenter="show"
    @mouseleave="hide"
    @focusin="show"
    @focusout="hide"
  >
    <slot />

    <Transition name="k-tooltip">
      <div 
        v-if="isVisible && text"
        :id="tooltipId"
        class="k-tooltip-content"
        :class="`k-tooltip-content--${position}`"
        role="tooltip"
      >
        <div class="k-tooltip-box">
          {{ text }}
          
          <div 
            class="k-tooltip-arrow"
            :class="`k-tooltip-arrow--${position}`"
          ></div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.k-tooltip-wrapper {
    position: relative;
    display: inline-block;
    width: fit-content;
}

.k-tooltip-content {
    position: absolute;
    z-index: var(--k-z-overlay);
    white-space: nowrap;
    pointer-events: none;
}

.k-tooltip-content--top {
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-bottom: 8px;
}

.k-tooltip-content--bottom {
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-top: 8px;
}

.k-tooltip-content--left {
    right: 100%;
    top: 50%;
    transform: translateY(-50%);
    margin-right: 8px;
}

.k-tooltip-content--right {
    left: 100%;
    top: 50%;
    transform: translateY(-50%);
    margin-left: 8px;
}

.k-tooltip-box {
    background-color: var(--k-white);
    color: var(--k-zinc-900);
    font-size: 10px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    padding: 6px 12px;
    border-radius: 8px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    border: 1px solid var(--k-zinc-900);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    position: relative;
}

.dark .k-tooltip-box {
    background-color: var(--k-zinc-700);
    color: var(--k-white);
    border-color: rgba(255, 255, 255, 0.05);
}

.k-tooltip-arrow {
    position: absolute;
    width: 8px;
    height: 8px;
    background-color: inherit;
    border-color: inherit;
    border-style: solid;
    border-width: 0;
}

.k-tooltip-arrow--top {
    top: 100%;
    transform: translate(-50%, -50%) rotate(45deg);
    left: 50%;
    border-bottom-width: 1px;
    border-right-width: 1px;
}

.k-tooltip-arrow--bottom {
    bottom: 100%;
    transform: translate(-50%, 50%) rotate(45deg);
    left: 50%;
    border-top-width: 1px;
    border-left-width: 1px;
}

.k-tooltip-arrow--left {
    left: 100%;
    transform: translate(-50%, -50%) rotate(45deg);
    top: 50%;
    border-top-width: 1px;
    border-right-width: 1px;
}

.k-tooltip-arrow--right {
    right: 100%;
    transform: translate(50%, -50%) rotate(45deg);
    top: 50%;
    border-bottom-width: 1px;
    border-left-width: 1px;
}

.k-tooltip-enter-active,
.k-tooltip-leave-active {
  transition: opacity 0.1s ease, transform 0.1s ease;
}

.k-tooltip-enter-from,
.k-tooltip-leave-to {
  opacity: 0;
}

.k-tooltip-enter-from.k-tooltip-content--top,
.k-tooltip-leave-to.k-tooltip-content--top,
.k-tooltip-enter-from.k-tooltip-content--bottom,
.k-tooltip-leave-to.k-tooltip-content--bottom {
  transform: translate(-50%, 5px) scale(0.85);
}

.k-tooltip-enter-from.k-tooltip-content--left,
.k-tooltip-leave-to.k-tooltip-content--left,
.k-tooltip-enter-from.k-tooltip-content--right,
.k-tooltip-leave-to.k-tooltip-content--right {
  transform: translate(5px, -50%) scale(0.85);
}
</style>
