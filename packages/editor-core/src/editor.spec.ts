import { afterEach, describe, expect, test } from '@rstest/core';
import { createEditor } from './editor';
import type { EditorController, EditorOptions, EditorSnapshot } from './types';

type MountOptions = Partial<Omit<EditorOptions, 'element'>>;

const controllers: EditorController[] = [];
const elements: HTMLElement[] = [];

/**
 * Mount `createEditor` on a real DOM element. Track both so every case leaves
 * no listeners or nodes behind.
 */
function mount(options: MountOptions = {}): {
  controller: EditorController;
  element: HTMLElement;
} {
  const element = document.createElement('div');
  document.body.appendChild(element);
  elements.push(element);
  const controller = createEditor({ element, ...options });
  controllers.push(controller);
  return { controller, element };
}

afterEach(() => {
  for (const controller of controllers.splice(0)) controller.destroy();
  for (const element of elements.splice(0)) element.remove();
});

describe('createEditor', () => {
  test('exposes an empty document with default state', () => {
    const { controller } = mount();

    expect(controller.getHTML()).toBe('');
    expect(controller.getText()).toBe('');
    expect(controller.getState()).toEqual({
      bold: false,
      italic: false,
      heading: null,
    });
    expect(controller.isReadonly()).toBe(false);
  });

  test('marks the host element as a multiline textbox', () => {
    const { controller, element } = mount();

    expect(element.getAttribute('role')).toBe('textbox');
    expect(element.getAttribute('aria-multiline')).toBe('true');
    expect(element.hasAttribute('aria-readonly')).toBe(false);
    expect(controller.isReadonly()).toBe(false);
  });

  test('seeds the document from initialHTML', () => {
    const { controller } = mount({
      initialHTML: '<p>Hello <strong>world</strong></p>',
    });

    expect(controller.getText()).toBe('Hello world');
    expect(controller.getHTML()).toContain('Hello');
    expect(controller.getHTML()).toMatch(/<strong[^>]*>world<\/strong>/);
  });

  test('setHTML replaces the document and is visible synchronously', () => {
    const { controller } = mount({ initialHTML: '<p>First</p>' });

    expect(controller.getText()).toBe('First');
    controller.setHTML('<p>Second</p>');
    expect(controller.getText()).toBe('Second');
    expect(controller.getHTML()).toContain('Second');
    expect(controller.getHTML()).not.toContain('First');
  });

  test('setHTML inserts an empty paragraph for blank HTML', () => {
    const { controller } = mount({ initialHTML: '<p>Seed</p>' });

    controller.setHTML('');
    expect(controller.getText()).toBe('');
    expect(controller.getHTML()).toBe('<p><br></p>');
  });

  test('loads content in readonly mode and reports readonly', () => {
    const { controller, element } = mount({
      readonly: true,
      initialHTML: '<p>Read only</p>',
    });

    expect(controller.isReadonly()).toBe(true);
    expect(element.getAttribute('aria-readonly')).toBe('true');
    expect(controller.getText()).toBe('Read only');

    // The host can still supply content in readonly mode.
    controller.setHTML('<p>Host supplied</p>');
    expect(controller.getText()).toBe('Host supplied');
  });

  test('reports snapshots through onChange', () => {
    const snapshots: EditorSnapshot[] = [];
    const { controller } = mount({
      initialHTML: '<p>Seed</p>',
      onChange: (snapshot) => snapshots.push(snapshot),
    });

    expect(snapshots.length).toBeGreaterThan(0);
    controller.setHTML('<p>Updated</p>');
    expect(snapshots.at(-1)).toEqual({
      html: expect.stringContaining('Updated'),
      text: 'Updated',
    });
  });
});
