<script lang="ts" setup>
import { computed, onUnmounted, ref } from "vue";
import { PhCheckCircle, PhXCircle, PhWarningCircle, PhInfo, PhX } from "@phosphor-icons/vue";
import { useKyokusuLocale } from "../i18n";

export interface NotificationPayload {
    title: string;
    content?: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
}

export interface NotificationItem extends NotificationPayload {
    id: string;
}

const props = defineProps<{
    notification: NotificationItem;
}>();

const emit = defineEmits(["remove"]);
const { t } = useKyokusuLocale();

const el = ref<HTMLElement | null>(null);
const startX = ref(0);
const currentX = ref(0);
const isDragging = ref(false);

const getIcon = (type?: string) => {
    switch (type) {
        case "success": return PhCheckCircle;
        case "error": return PhXCircle;
        case "warning": return PhWarningCircle;
        default: return PhInfo;
    }
};

const onStart = (clientX: number) => {
    startX.value = clientX;
    isDragging.value = true;
};

const onMove = (clientX: number) => {
    if (!isDragging.value) return;
    const delta = clientX - startX.value;
    if (delta > 0) {
        currentX.value = delta;
    }
};

const onEnd = () => {
    if (!isDragging.value) return;
    isDragging.value = false;

    if (currentX.value > 100) {
        emit("remove", props.notification.id);
    } else {
        currentX.value = 0;
    }
};

const handleTouchStart = (e: TouchEvent) => onStart(e.touches[0]!.clientX);
const handleTouchMove = (e: TouchEvent) => onMove(e.touches[0]!.clientX);
const handleTouchEnd = () => onEnd();

const handleMouseDown = (e: MouseEvent) => {
    onStart(e.clientX);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
};

const handleMouseMove = (e: MouseEvent) => onMove(e.clientX);
const handleMouseUp = () => {
    onEnd();
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
};

onUnmounted(() => {
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
});

const style = computed(() => ({
    transform: `translateX(${currentX.value}px)`,
    opacity: 1 - currentX.value / 300,
    transition: isDragging.value
        ? "none"
        : "transform 0.3s ease-out, opacity 0.3s ease-out",
    touchAction: "pan-y",
}));
</script>

<template>
    <div 
        ref="el"
        class="k-notification-item"
        :style="style"
        :role="notification.type === 'error' ? 'alert' : 'status'"
        aria-atomic="true"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
        @mousedown="handleMouseDown"
    >
        <div class="k-notification-icon" :class="`k-notification-icon--${notification.type || 'info'}`">
            <component :is="getIcon(notification.type)" :size="20" weight="fill" />
        </div>
        
        <div class="k-notification-content">
            <p class="k-notification-title">
                {{ notification.title }}
            </p>
            <p v-if="notification.content" class="k-notification-desc">
                {{ notification.content }}
            </p>
        </div>

        <button
            type="button"
            @mousedown.stop
            @click.stop="emit('remove', notification.id)"
            class="k-notification-close"
            :aria-label="t('closeNotification')"
        >
            <PhX :size="16" weight="bold" />
        </button>
    </div>
</template>

<style scoped>
.k-notification-item {
    pointer-events: auto;
    width: 100%;
    box-sizing: border-box;
    background-color: var(--k-notif-bg, var(--k-white));
    border: 1px solid var(--k-notif-border, rgba(24, 24, 27, 0.05));
    border-radius: 8px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    padding: 16px;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    cursor: grab;
    user-select: none;
    touch-action: pan-y;
}

.k-notification-item:active {
    cursor: grabbing;
}

.dark .k-notification-item {
    --k-notif-bg: var(--k-zinc-900);
    --k-notif-border: rgba(255, 255, 255, 0.1);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3);
}

.k-notification-icon {
    flex-shrink: 0;
    margin-top: 2px;
}

.k-notification-icon--success { color: var(--k-green-400); }
.k-notification-icon--error { color: var(--k-red-400); }
.k-notification-icon--warning { color: var(--k-yellow-400); }
.k-notification-icon--info { color: var(--k-blue-400); }

.k-notification-content {
    flex: 1;
    min-width: 0;
}

.k-notification-title {
    font-size: 14px;
    font-weight: bold;
    color: var(--k-notif-title, var(--k-zinc-900));
    margin: 0;
}

.dark .k-notification-title {
    --k-notif-title: var(--k-zinc-100);
}

.k-notification-desc {
    margin-top: 4px;
    font-size: 14px;
    color: var(--k-notif-desc, var(--k-zinc-500));
    margin-bottom: 0;
}

.dark .k-notification-desc {
    --k-notif-desc: var(--k-zinc-400);
}

.k-notification-close {
    flex-shrink: 0;
    margin-left: 16px;
    background: transparent;
    border: none;
    color: var(--k-notif-close, var(--k-zinc-400));
    padding: 2px;
    border-radius: 4px;
    cursor: pointer;
    transition: color 0.2s;
    display: inline-flex;
}

.k-notification-close:hover {
    color: var(--k-notif-close-hover, var(--k-zinc-900));
}

.dark .k-notification-close {
    --k-notif-close: var(--k-zinc-500);
    --k-notif-close-hover: var(--k-zinc-100);
}
</style>
