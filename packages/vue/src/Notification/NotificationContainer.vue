<script lang="ts" setup>
import { computed } from "vue";
import NotificationItemComponent from "./NotificationItem.vue";
import type { NotificationItem } from "./NotificationItem.vue";
import { useKyokusuLocale } from "../i18n";

const props = withDefaults(defineProps<{
    notifications: NotificationItem[];
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}>(), {
    position: 'top-right'
});

const emit = defineEmits(["remove"]);
const { t } = useKyokusuLocale();
</script>

<template>
    <div
        class="k-notification-container"
        :class="`k-notification-container--${position}`"
        role="region"
        :aria-label="t('notifications')"
        aria-live="polite"
    >
        <TransitionGroup 
            name="k-notification"
        >
            <NotificationItemComponent
                v-for="notification in notifications"
                :key="notification.id"
                :notification="notification"
                @remove="(id) => emit('remove', id)"
            />
        </TransitionGroup>
    </div>
</template>

<style>
.k-notification-container {
    position: fixed;
    z-index: var(--k-z-popover);
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
    max-width: 384px;
    pointer-events: none;
    overflow-x: hidden;
    overflow-y: auto;
    max-height: calc(100vh - 48px);
    scrollbar-width: none; /* Firefox */
}

.k-notification-container::-webkit-scrollbar {
    display: none; /* Safari and Chrome */
}

.k-notification-container--top-right { top: 24px; right: 32px; }
.k-notification-container--top-left { top: 24px; left: 32px; }
.k-notification-container--bottom-right { bottom: 24px; right: 32px; }
.k-notification-container--bottom-left { bottom: 24px; left: 32px; }

@media (max-width: 640px) {
    .k-notification-container {
        right: 16px !important;
        left: 16px !important;
        max-width: calc(100% - 32px) !important;
        top: 24px !important;
        bottom: auto !important;
    }
}

/* Animations */
.k-notification-enter-active,
.k-notification-leave-active {
    transition: all 0.3s ease-out;
}

.k-notification-leave-active {
    position: absolute;
    width: 100%;
}

.k-notification-enter-from {
    opacity: 0;
    transform: translateY(8px);
}
@media (min-width: 640px) {
    .k-notification-container--top-right .k-notification-enter-from,
    .k-notification-container--bottom-right .k-notification-enter-from {
        transform: translateX(16px);
    }
    .k-notification-container--top-left .k-notification-enter-from,
    .k-notification-container--bottom-left .k-notification-enter-from {
        transform: translateX(-16px);
    }
}

.k-notification-container--top-right .k-notification-leave-to,
.k-notification-container--bottom-right .k-notification-leave-to {
    opacity: 0;
    transform: translateX(100%);
}

.k-notification-container--top-left .k-notification-leave-to,
.k-notification-container--bottom-left .k-notification-leave-to {
    opacity: 0;
    transform: translateX(-100%);
}

.k-notification-move {
    transition: transform 0.3s ease-out;
}
</style>