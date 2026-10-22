import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import RichText from './RichText.vue';

enableAutoUnmount(afterEach);

Object.defineProperty(HTMLElement.prototype, 'innerText', {
    configurable: true,
    get() {
        return this.textContent ?? '';
    },
    set(value: string) {
        this.textContent = value;
    },
});

let execCommand: ReturnType<typeof vi.fn>;
let queryCommandState: ReturnType<typeof vi.fn>;

beforeEach(() => {
    execCommand = vi.fn();
    queryCommandState = vi.fn(() => false);
    Object.defineProperty(document, 'execCommand', {
        configurable: true,
        value: execCommand,
    });
    Object.defineProperty(document, 'queryCommandState', {
        configurable: true,
        value: queryCommandState,
    });
});

afterEach(() => {
    document.body.innerHTML = '';
});

describe('RichText (vue)', () => {
    it('renders its label, toolbar, counter and error state', async () => {
        const wrapper = mount(RichText, {
            props: {
                id: 'bio',
                label: 'Bio',
                modelValue: '<b>Hello</b>',
                maxLength: 10,
                error: 'Required',
                disabled: true,
            },
        });
        await nextTick();

        expect(wrapper.get('label').attributes('for')).toBe('bio');
        expect(wrapper.get('.k-editor-content').attributes('contenteditable')).toBe('false');
        expect(wrapper.get('.k-editor-content').element.innerHTML).toBe('<b>Hello</b>');
        expect(wrapper.get('.k-editor-counter').text()).toBe('5 / 10');
        expect(wrapper.get('.k-editor-error-text').text()).toBe('Required');
        expect(wrapper.findAll('.k-editor-btn')).toHaveLength(3);
        expect(wrapper.get('.k-editor-btn').attributes('disabled')).toBeDefined();
    });

    it('emits the HTML content on input', async () => {
        const wrapper = mount(RichText, {
            props: { maxLength: 20 },
        });
        const editor = wrapper.get('.k-editor-content');

        editor.element.innerHTML = '<p>Hi there</p>';
        await editor.trigger('input');

        expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['<p>Hi there</p>']);
        expect(wrapper.get('.k-editor-counter').text()).toBe('8 / 20');
    });

    it('rejects content beyond maxLength', async () => {
        const wrapper = mount(RichText, {
            props: { modelValue: '<p>12345</p>', maxLength: 5 },
        });
        const editor = wrapper.get('.k-editor-content');

        editor.element.innerHTML = '<p>123456</p>';
        await editor.trigger('input');

        expect(wrapper.emitted('update:modelValue')).toBeUndefined();
        expect(editor.element.innerHTML).toBe('<p>12345</p>');
        expect(wrapper.get('.k-editor-counter').classes()).toContain(
            'k-editor-counter--limit',
        );
    });

    it('runs toolbar commands and reflects active state', async () => {
        queryCommandState.mockImplementation((command: string) => command === 'bold');
        const wrapper = mount(RichText);

        await wrapper.findAll('.k-editor-btn')[0]?.trigger('click');

        expect(execCommand).toHaveBeenCalledWith('bold', false);
        expect(wrapper.findAll('.k-editor-btn')[0]?.classes()).toContain(
            'k-editor-btn--active',
        );
    });

    it('does not run commands while disabled', async () => {
        const wrapper = mount(RichText, {
            props: { disabled: true },
        });

        await wrapper.findAll('.k-editor-btn')[0]?.trigger('click');

        expect(execCommand).not.toHaveBeenCalled();
    });

    it('synchronizes an externally controlled value', async () => {
        const wrapper = mount(RichText, {
            props: { modelValue: '<p>One</p>' },
        });
        const editor = wrapper.get('.k-editor-content');

        expect(editor.element.innerHTML).toBe('<p>One</p>');

        await wrapper.setProps({ modelValue: '<p>Two</p>' });

        expect(editor.element.innerHTML).toBe('<p>Two</p>');
    });
});
