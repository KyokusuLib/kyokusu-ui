import { afterEach, describe, expect, it } from 'vitest';
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { h } from 'vue';
import Table from './Table.vue';
import type { TableHeader } from './Table.vue';

enableAutoUnmount(afterEach);

afterEach(() => {
    document.body.innerHTML = '';
});

const headers: TableHeader[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'age', label: 'Age', align: 'center' },
];

const items = [
    { id: 1, name: 'Bob', age: 25 },
    { id: 2, name: 'Alice', age: 30 },
];

function mountTable(
    props: Record<string, unknown> = {},
    slots: Record<string, unknown> = {},
) {
    return mount(Table, {
        props: {
            headers,
            items,
            ...props,
        },
        slots,
        attachTo: document.body,
    });
}

function rowTexts(wrapper: ReturnType<typeof mountTable>) {
    return wrapper.findAll('tbody tr.k-table-row').map((row) => row.text());
}

describe('Table (vue)', () => {
    it('renders headers, rows and action buttons', () => {
        const wrapper = mountTable();

        expect(wrapper.findAll('thead th')).toHaveLength(3);
        expect(wrapper.get('.k-table-search-input').attributes('placeholder')).toBe('Search...');
        expect(rowTexts(wrapper)).toEqual(['Bob25', 'Alice30']);
        expect(wrapper.findAll('.k-table-action-edit')).toHaveLength(2);
        expect(wrapper.findAll('.k-table-action-delete')).toHaveLength(2);
    });

    it('emits edit and delete events with the row item', async () => {
        const wrapper = mountTable();

        await wrapper.findAll('.k-table-action-edit')[1]?.trigger('click');
        await wrapper.findAll('.k-table-action-delete')[0]?.trigger('click');

        expect(wrapper.emitted('edit')?.[0]).toEqual([items[1]]);
        expect(wrapper.emitted('delete')?.[0]).toEqual([items[0]]);
    });

    it('filters rows by the search query', async () => {
        const wrapper = mountTable();
        const search = wrapper.get('.k-table-search-input');

        await search.setValue('bob');
        expect(rowTexts(wrapper)).toEqual(['Bob25']);

        await search.setValue('nobody');
        expect(wrapper.get('.k-table-empty-text').text()).toBe('No data found');
    });

    it('sorts rows in both directions', async () => {
        const wrapper = mountTable();
        const nameHeader = wrapper.findAll('thead th')[0]!;

        await nameHeader.trigger('click');
        expect(rowTexts(wrapper)).toEqual(['Alice30', 'Bob25']);

        await nameHeader.trigger('click');
        expect(rowTexts(wrapper)).toEqual(['Bob25', 'Alice30']);
    });

    it('does not sort non-sortable columns', async () => {
        const wrapper = mountTable();

        await wrapper.findAll('thead th')[1]?.trigger('click');

        expect(rowTexts(wrapper)).toEqual(['Bob25', 'Alice30']);
    });

    it('renders loading and empty states', () => {
        const loadingWrapper = mountTable({ loading: true });
        expect(loadingWrapper.find('.k-table-loader').exists()).toBe(true);
        expect(loadingWrapper.find('.k-table-row').exists()).toBe(false);

        const emptyWrapper = mountTable({ items: [], emptyText: 'Nothing here' });
        expect(emptyWrapper.get('.k-table-empty-text').text()).toBe('Nothing here');
    });

    it('supports custom cells, footer and table attributes', () => {
        const wrapper = mountTable({
            searchable: false,
            showActions: false,
            class: 'custom-table',
            style: 'margin-top: 4px',
        });
        expect(wrapper.find('.k-table-toolbar').exists()).toBe(false);
        expect(wrapper.findAll('thead th')).toHaveLength(2);
        expect(wrapper.get('.k-table-container').classes()).toContain('custom-table');
        expect(wrapper.get('.k-table-container').attributes('style')).toContain(
            'margin-top: 4px',
        );

        const slotted = mountTable(
            { searchable: false },
            {
                'cell-name': ({ value }: { value: string }) =>
                    h('strong', { class: 'name-cell' }, value.toUpperCase()),
                footer: ({ items: visible }: { items: unknown[] }) =>
                    h('div', { class: 'table-footer' }, `${visible.length} rows`),
            },
        );

        expect(slotted.findAll('.name-cell').map((cell) => cell.text())).toEqual([
            'BOB',
            'ALICE',
        ]);
        expect(slotted.get('.table-footer').text()).toBe('2 rows');
    });

    it('uses a custom search placeholder', () => {
        const wrapper = mountTable({ searchPlaceholder: 'Find a user' });

        expect(wrapper.get('.k-table-search-input').attributes('placeholder')).toBe(
            'Find a user',
        );
    });
});
