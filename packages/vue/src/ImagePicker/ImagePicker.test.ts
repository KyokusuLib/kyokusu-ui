import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ImagePicker from './ImagePicker.vue';

enableAutoUnmount(afterEach);

let createObjectURL: ReturnType<typeof vi.fn>;
let revokeObjectURL: ReturnType<typeof vi.fn>;

beforeEach(() => {
    createObjectURL = vi.fn(() => 'blob:preview');
    revokeObjectURL = vi.fn();
    Object.defineProperty(URL, 'createObjectURL', {
        configurable: true,
        value: createObjectURL,
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
        configurable: true,
        value: revokeObjectURL,
    });
});

afterEach(() => {
    document.body.innerHTML = '';
});

function imageFile(name = 'photo.png', type = 'image/png') {
    return new File(['image'], name, { type });
}

function mountImagePicker(props: Record<string, unknown> = {}) {
    return mount(ImagePicker, {
        props,
        attachTo: document.body,
    });
}

function chooseFile(wrapper: ReturnType<typeof mountImagePicker>, file: File) {
    const input = wrapper.get('input[type="file"]');
    Object.defineProperty(input.element, 'files', {
        configurable: true,
        value: [file],
    });
    return input.trigger('change');
}

describe('ImagePicker (vue)', () => {
    it('renders the label and placeholder', () => {
        const wrapper = mountImagePicker({ label: 'Avatar', placeholder: 'Upload a photo' });

        expect(wrapper.get('.k-image-picker-label').text()).toBe('Avatar');
        expect(wrapper.get('.k-image-picker-text').text()).toBe('Upload a photo');
        expect(wrapper.find('.k-image-picker-preview').exists()).toBe(false);
    });

    it('accepts a valid image file', async () => {
        const wrapper = mountImagePicker();
        const file = imageFile();

        await chooseFile(wrapper, file);

        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([file]);
        expect(wrapper.emitted('change')?.[0]).toEqual([file]);
        expect(wrapper.emitted('error')).toBeUndefined();
    });

    it('renders a preview for an initial file and removes it', async () => {
        const file = imageFile();
        const wrapper = mountImagePicker({ modelValue: file });

        expect(createObjectURL).toHaveBeenCalledWith(file);
        expect(wrapper.get('.k-image-picker-preview').attributes('src')).toBe('blob:preview');

        await wrapper.get('.k-image-picker-remove').trigger('click');

        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([null]);
        expect(wrapper.emitted('change')).toBeUndefined();
    });

    it('rejects non-image files', async () => {
        const wrapper = mountImagePicker();

        await chooseFile(wrapper, new File(['text'], 'notes.txt', { type: 'text/plain' }));

        expect(wrapper.emitted('error')?.[0]).toEqual(['Please select an image file']);
        expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    });

    it('rejects files above the size limit', async () => {
        const wrapper = mountImagePicker({ maxSize: 0.000001 });

        await chooseFile(wrapper, imageFile());

        expect(wrapper.emitted('error')?.[0]).toEqual([
            'File is too large. Maximum: 0.000001 MB',
        ]);
    });

    it('handles drag over, drag leave and drop', async () => {
        const wrapper = mountImagePicker();
        const picker = wrapper.get('.k-image-picker');
        const file = imageFile();

        picker.element.dispatchEvent(new Event('dragover', { bubbles: true, cancelable: true }));
        await nextTick();
        expect(picker.classes()).toContain('k-image-picker--drag-over');

        picker.element.dispatchEvent(new Event('dragleave'));
        await nextTick();
        expect(picker.classes()).not.toContain('k-image-picker--drag-over');

        const drop = new Event('drop', { bubbles: true, cancelable: true });
        Object.defineProperty(drop, 'dataTransfer', {
            value: { files: [file] },
        });
        picker.element.dispatchEvent(drop);
        await nextTick();

        expect(wrapper.emitted('change')?.[0]).toEqual([file]);
    });

    it('applies size, shape and border styles', () => {
        const wrapper = mountImagePicker({
            size: 'lg',
            shape: 'circle',
            border: 'none',
        });

        const picker = wrapper.get('.k-image-picker');
        expect(picker.attributes('style')).toContain('width: 160px');
        expect(picker.attributes('style')).toContain('height: 160px');
        expect(picker.attributes('style')).toContain('border-radius: 50%');
        expect(picker.attributes('style')).not.toContain('border:');
    });

    it('does not open or accept files while disabled', async () => {
        const wrapper = mountImagePicker({
            disabled: true,
            modelValue: imageFile(),
        });
        const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click');

        await wrapper.get('.k-image-picker').trigger('click');
        await chooseFile(wrapper, imageFile());

        expect(clickSpy).not.toHaveBeenCalled();
        expect(wrapper.emitted('update:modelValue')).toBeUndefined();
        expect(wrapper.find('.k-image-picker-remove').exists()).toBe(false);
    });
});
