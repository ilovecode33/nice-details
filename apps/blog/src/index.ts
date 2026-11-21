import './styles.css';
import { createEditor } from '@ilovecode33/editor-core';

const content = document.querySelector<HTMLElement>('#post-content');

if (!content) {
  throw new Error('Article container not found');
}

// The blog only needs display: readonly mode attaches no input listeners and
// disables bold / italic / setHeading.
const editor = createEditor({
  element: content,
  readonly: true,
  initialHTML: '<h1>Hallo world!</h1>',
});

if (editor.isReadonly() && editor.getText().trim() !== 'Hallo world!') {
  throw new Error('Article content was not loaded correctly');
}
