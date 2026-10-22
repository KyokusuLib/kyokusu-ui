<script setup lang="ts">
import { ref, computed, useId, useAttrs, type PropType } from "vue";
import { 
    PhMagnifyingGlass, 
    PhPencilSimple, 
    PhTrash,
    PhCaretUp,
    PhCaretDown,
    PhCaretUpDown
} from "@phosphor-icons/vue";
import { useKyokusuLocale } from "../i18n";

export interface TableHeader {
    key: string;
    label: string;
    sortable?: boolean;
    align?: 'left' | 'center' | 'right';
}

const props = withDefaults(defineProps<{
    headers: TableHeader[];
    items: Record<string, any>[];
    searchable?: boolean;
    searchPlaceholder?: string;
    showActions?: boolean;
    emptyText?: string;
    loading?: boolean;
    locale?: string;
}>(), {
    searchable: true,
    showActions: true,
    loading: false
});

const { t } = useKyokusuLocale(() => props.locale);

const emit = defineEmits<{
    (e: 'edit', item: Record<string, any>): void;
    (e: 'delete', item: Record<string, any>): void;
}>();

const attrs = useAttrs();

const searchQuery = ref("");
const sortKey = ref<string | null>(null);
const sortAsc = ref(true);

const handleSort = (key: string, sortable?: boolean) => {
    if (!sortable) return;
    if (sortKey.value === key) {
        sortAsc.value = !sortAsc.value;
    } else {
        sortKey.value = key;
        sortAsc.value = true;
    }
};

const filteredAndSortedItems = computed(() => {
    let result = [...props.items];

    // Search
    if (props.searchable && searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(item => {
            return Object.values(item).some(val => {
                if (val === null || val === undefined) return false;
                return String(val).toLowerCase().includes(query);
            });
        });
    }

    // Sort
    if (sortKey.value) {
        result.sort((a, b) => {
            const valA = a[sortKey.value as keyof Record<string, any>];
            const valB = b[sortKey.value as keyof Record<string, any>];
            
            if (valA === valB) return 0;
            if (valA === null || valA === undefined) return sortAsc.value ? 1 : -1;
            if (valB === null || valB === undefined) return sortAsc.value ? -1 : 1;

            const comparison = valA < valB ? -1 : 1;
            return sortAsc.value ? comparison : -comparison;
        });
    }

    return result;
});
</script>

<template>
    <div class="k-table-container" :class="attrs.class" :style="attrs.style as any">
        <!-- Toolbar -->
        <div v-if="searchable" class="k-table-toolbar">
            <div class="k-table-search">
                <PhMagnifyingGlass class="k-table-search-icon" :size="16" />
                <input 
                    v-model="searchQuery" 
                    type="text" 
                    class="k-table-search-input" 
                    :placeholder="searchPlaceholder ?? t('searchPlaceholder')"
                />
            </div>
            <slot name="toolbar-actions"></slot>
        </div>

        <!-- Table Wrapper (Responsive scroll) -->
        <div class="k-table-wrapper">
            <table class="k-table">
                <thead>
                    <tr>
                        <th 
                            v-for="header in headers" 
                            :key="String(header.key)"
                            :class="[
                                `k-table-align-${header.align || 'left'}`,
                                { 'k-table-th-sortable': header.sortable }
                            ]"
                            @click="handleSort(String(header.key), header.sortable)"
                        >
                            <div class="k-table-th-content">
                                {{ header.label }}
                                <span v-if="header.sortable" class="k-table-sort-icon">
                                    <template v-if="sortKey === String(header.key)">
                                        <PhCaretUp v-if="sortAsc" :size="14" weight="bold" />
                                        <PhCaretDown v-else :size="14" weight="bold" />
                                    </template>
                                    <PhCaretUpDown v-else :size="14" weight="bold" class="k-table-sort-idle" />
                                </span>
                            </div>
                        </th>
                        <th v-if="showActions" class="k-table-align-right k-table-th-actions">
                            {{ t('actions') }}
                        </th>
                    </tr>
                </thead>
                
                <tbody>
                    <tr v-if="loading">
                        <td :colspan="showActions ? headers.length + 1 : headers.length" class="k-table-state-cell">
                            <div class="k-table-loader"></div>
                        </td>
                    </tr>
                    <tr v-else-if="filteredAndSortedItems.length === 0">
                        <td :colspan="showActions ? headers.length + 1 : headers.length" class="k-table-state-cell">
                            <span class="k-table-empty-text">{{ emptyText ?? t('noData') }}</span>
                        </td>
                    </tr>
                    <tr v-else v-for="(item, index) in filteredAndSortedItems" :key="index" class="k-table-row">
                        <td 
                            v-for="header in headers" 
                            :key="String(header.key)"
                            :class="`k-table-align-${header.align || 'left'}`"
                        >
                            <slot :name="`cell-${String(header.key)}`" :item="item" :value="item[header.key]">
                                {{ item[header.key] }}
                            </slot>
                        </td>
                        <td v-if="showActions" class="k-table-align-right k-table-actions-cell">
                            <div class="k-table-actions">
                                <button class="k-table-action-btn k-table-action-edit" @click="emit('edit', item)" :aria-label="t('edit')">
                                    <PhPencilSimple :size="16" weight="duotone" />
                                </button>
                                <button class="k-table-action-btn k-table-action-delete" @click="emit('delete', item)" :aria-label="t('delete')">
                                    <PhTrash :size="16" weight="duotone" />
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- Footer -->
        <div v-if="$slots.footer" class="k-table-footer">
            <slot name="footer" :items="filteredAndSortedItems"></slot>
        </div>
    </div>
</template>

<style scoped>
.k-table-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
    font-family: inherit;

    --k-table-bg: var(--k-white);
    --k-table-border: var(--k-zinc-200);
    --k-table-text: var(--k-zinc-900);
    --k-table-text-muted: var(--k-zinc-500);
    --k-table-header-bg: var(--k-zinc-100);
    --k-table-row-hover: var(--k-zinc-100);
    
    --k-table-search-bg: var(--k-zinc-100);
    --k-table-search-border: transparent;
    --k-table-search-focus: var(--k-yellow-500);
    --k-table-search-ring: rgba(234, 179, 8, 0.1);
    
    --k-table-action-edit: var(--k-blue-500);
    --k-table-action-edit-hover: rgba(59, 130, 246, 0.1);
    --k-table-action-delete: var(--k-red-500);
    --k-table-action-delete-hover: rgba(239, 68, 68, 0.1);
}

.dark .k-table-container {
    --k-table-bg: var(--k-zinc-900);
    --k-table-border: var(--k-zinc-800);
    --k-table-text: var(--k-zinc-200);
    --k-table-text-muted: var(--k-zinc-400);
    --k-table-header-bg: var(--k-zinc-800);
    --k-table-row-hover: var(--k-zinc-800);
    
    --k-table-search-bg: var(--k-zinc-800);
    --k-table-search-border: var(--k-zinc-800);
    --k-table-search-focus: rgba(234, 179, 8, 0.5);
    --k-table-search-ring: rgba(234, 179, 8, 0.05);
}

/* Toolbar & Search */
.k-table-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
}

.k-table-search {
    position: relative;
    max-width: 320px;
    width: 100%;
    display: flex;
    align-items: center;
}

.k-table-search-icon {
    position: absolute;
    left: 12px;
    color: var(--k-table-text-muted);
    pointer-events: none;
}

.k-table-search-input {
    width: 100%;
    background-color: var(--k-table-search-bg);
    border: 1px solid var(--k-table-search-border);
    border-radius: 8px;
    padding: 8px 16px 8px 36px;
    font-size: 14px;
    color: var(--k-table-text);
    outline: none;
    transition: all 0.2s ease;
}

.k-table-search-input::placeholder {
    color: var(--k-table-text-muted);
}

.k-table-search-input:focus {
    border-color: var(--k-table-search-focus);
    box-shadow: 0 0 0 2px var(--k-table-search-ring);
}

/* Table Wrapper */
.k-table-wrapper {
    width: 100%;
    overflow-x: auto;
    border: 1px solid var(--k-table-border);
    border-radius: 12px;
    background-color: var(--k-table-bg);
}

/* Table */
.k-table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
    font-size: 14px;
    white-space: nowrap;
}

.k-table th,
.k-table td {
    padding: 16px;
    border-bottom: 1px solid var(--k-table-border);
}

.k-table tr:last-child td {
    border-bottom: none;
}

.k-table th {
    background-color: var(--k-table-header-bg);
    color: var(--k-table-text-muted);
    font-weight: 600;
    text-transform: uppercase;
    font-size: 12px;
    letter-spacing: 0.05em;
    user-select: none;
}

.k-table-th-sortable {
    cursor: pointer;
    transition: color 0.2s ease;
}

.k-table-th-sortable:hover {
    color: var(--k-table-text);
}

.k-table-th-content {
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.k-table-sort-icon {
    display: flex;
    align-items: center;
    color: var(--k-table-text);
}

.k-table-sort-idle {
    color: var(--k-table-text-muted);
    opacity: 0.5;
}

.k-table-row {
    transition: background-color 0.2s ease;
}

.k-table-row:hover {
    background-color: var(--k-table-row-hover);
}

.k-table td {
    color: var(--k-table-text);
    vertical-align: middle;
}

/* Alignments */
.k-table-align-left { text-align: left; justify-content: flex-start; }
.k-table-align-center { text-align: center; justify-content: center; }
.k-table-align-right { text-align: right; justify-content: flex-end; }
.k-table-th-actions { width: 100px; }

/* Actions */
.k-table-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
}

.k-table-action-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: none;
    background: transparent;
    cursor: pointer;
    transition: all 0.2s ease;
}

.k-table-action-edit { color: var(--k-table-action-edit); }
.k-table-action-edit:hover { background-color: var(--k-table-action-edit-hover); }

.k-table-action-delete { color: var(--k-table-action-delete); }
.k-table-action-delete:hover { background-color: var(--k-table-action-delete-hover); }

/* State cells (Empty, Loading) */
.k-table-state-cell {
    padding: 48px !important;
    text-align: center !important;
}

.k-table-empty-text {
    color: var(--k-table-text-muted);
    font-size: 14px;
}

.k-table-loader {
    width: 24px;
    height: 24px;
    border: 2px solid var(--k-table-border);
    border-top-color: var(--k-table-text-muted);
    border-radius: 50%;
    animation: k-table-spin 0.8s linear infinite;
    margin: 0 auto;
}

.k-table-footer {
    padding-top: 8px;
}

@keyframes k-table-spin {
    to { transform: rotate(360deg); }
}
</style>
