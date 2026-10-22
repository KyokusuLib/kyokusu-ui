import '../styles/notification.css';
import { createId } from '../utils/id';
import { t } from '../i18n';

export interface NotificationPayload {
    title: string;
    content?: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
}

export interface NotificationItem extends NotificationPayload {
    id: string;
}

const ICONS = {
    success: `<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
    error: `<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
    warning: `<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>`,
    info: `<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`
};

const CLOSE_ICON = `<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>`;

export class NotificationManager {
    private container: HTMLDivElement;
    private notifications: Map<string, { el: HTMLDivElement, timer?: ReturnType<typeof setTimeout> }> = new Map();
    
    // Throttle duplicate notifications
    private duplicateMap = new Map<string, { timer: ReturnType<typeof setTimeout> | null, next: NotificationPayload | null }>();
    private readonly THROTTLE_DELAY = 3000;
    private readonly locale?: string;

    constructor(
        position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' = 'top-right',
        locale?: string
    ) {
        this.locale = locale;
        let container = document.querySelector('.k-notification-container') as HTMLDivElement;
        if (!container) {
            container = document.createElement('div');
            container.className = `k-notification-container k-notification-container--${position}`;
            container.setAttribute('role', 'region');
            container.setAttribute('aria-label', t(locale, 'notifications'));
            container.setAttribute('aria-live', 'polite');
            document.body.appendChild(container);
        }
        this.container = container;
    }

    public notify(payload: NotificationPayload) {
        const key = `${payload.title}|${payload.content || ""}`;

        if (this.duplicateMap.has(key)) {
            const entry = this.duplicateMap.get(key)!;
            entry.next = payload;
            return;
        }

        this.pushNotification(payload);

        const entry = {
            timer: null as ReturnType<typeof setTimeout> | null,
            next: null as NotificationPayload | null,
        };
        this.duplicateMap.set(key, entry);

        const startCooldown = () => {
            entry.timer = setTimeout(() => {
                if (entry.next) {
                    this.pushNotification(entry.next);
                    entry.next = null;
                    startCooldown();
                } else {
                    this.duplicateMap.delete(key);
                }
            }, this.THROTTLE_DELAY);
        };

        startCooldown();
    }

    private pushNotification(payload: NotificationPayload) {
        const id = createId('k-notification');
        const duration = payload.duration !== undefined ? payload.duration : 5000;

        const el = document.createElement('div');
        el.className = 'k-notification-item k-notification-enter-from';
        
        const type = payload.type || 'info';
        el.setAttribute('role', type === 'error' ? 'alert' : 'status');
        el.setAttribute('aria-atomic', 'true');
        
        const iconDiv = document.createElement('div');
        iconDiv.className = `k-notification-icon k-notification-icon--${type}`;
        iconDiv.innerHTML = ICONS[type];

        const contentDiv = document.createElement('div');
        contentDiv.className = 'k-notification-content';
        
        const titleP = document.createElement('p');
        titleP.className = 'k-notification-title';
        titleP.textContent = payload.title;
        contentDiv.appendChild(titleP);

        if (payload.content) {
            const descP = document.createElement('p');
            descP.className = 'k-notification-desc';
            descP.textContent = payload.content;
            contentDiv.appendChild(descP);
        }

        const closeDiv = document.createElement('div');
        closeDiv.className = 'k-notification-close-wrapper';
        
        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'k-notification-close';
        closeBtn.setAttribute('aria-label', t(this.locale, 'closeNotification'));
        closeBtn.innerHTML = CLOSE_ICON;
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.remove(id);
        });
        closeDiv.appendChild(closeBtn);

        el.appendChild(iconDiv);
        el.appendChild(contentDiv);
        el.appendChild(closeDiv);

        this.attachSwipeListeners(el, id);

        this.container.appendChild(el);

        // Trigger animation
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                el.classList.remove('k-notification-enter-from');
                el.classList.add('k-notification-enter-active');
            });
        });

        let timer;
        if (duration > 0) {
            timer = setTimeout(() => {
                this.remove(id);
            }, duration);
        }

        this.notifications.set(id, { el, timer });
    }

    public remove(id: string) {
        const item = this.notifications.get(id);
        if (!item) return;

        if (item.timer) clearTimeout(item.timer);

        item.el.style.transform = 'translateX(100%)';
        item.el.style.opacity = '0';
        item.el.style.transition = 'transform 0.3s ease-in, opacity 0.3s ease-in';

        setTimeout(() => {
            if (item.el.parentNode) {
                item.el.parentNode.removeChild(item.el);
            }
            this.notifications.delete(id);
        }, 300);
    }

    private attachSwipeListeners(el: HTMLElement, id: string) {
        let startX = 0;
        let currentX = 0;
        let isDragging = false;

        const onStart = (clientX: number) => {
            startX = clientX;
            isDragging = true;
            el.style.transition = 'none';
        };

        const onMove = (clientX: number) => {
            if (!isDragging) return;
            const delta = clientX - startX;
            if (delta > 0) {
                currentX = delta;
                el.style.transform = `translateX(${currentX}px)`;
                el.style.opacity = `${1 - currentX / 300}`;
            }
        };

        const onEnd = () => {
            if (!isDragging) return;
            isDragging = false;

            if (currentX > 100) {
                this.remove(id);
            } else {
                currentX = 0;
                el.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
                el.style.transform = `translateX(0px)`;
                el.style.opacity = '1';
            }
        };

        el.addEventListener('touchstart', (e) => onStart(e.touches[0].clientX), { passive: true });
        el.addEventListener('touchmove', (e) => onMove(e.touches[0].clientX), { passive: true });
        el.addEventListener('touchend', () => onEnd());

        const handleMouseMove = (e: MouseEvent) => onMove(e.clientX);
        const handleMouseUp = () => {
            onEnd();
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };

        el.addEventListener('mousedown', (e) => {
            onStart(e.clientX);
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
        });
    }
}

let notificationManagerInstance: NotificationManager | null = null;

/**
 * Returns the shared notification manager, creating it on first use.
 * The manager touches `document`, so it must not be constructed at import
 * time (that would break SSR and Node-based tooling).
 */
export function getNotificationManager(): NotificationManager {
    if (!notificationManagerInstance) {
        notificationManagerInstance = new NotificationManager();
    }
    return notificationManagerInstance;
}

/**
 * Backwards-compatible lazy singleton. Every property access is forwarded to
 * the manager returned by {@link getNotificationManager}.
 */
export const notificationManager: NotificationManager = new Proxy({} as NotificationManager, {
    get(_target, property) {
        const manager = getNotificationManager() as unknown as Record<PropertyKey, unknown>;
        const value = manager[property];
        return typeof value === 'function' ? value.bind(manager) : value;
    },
});
