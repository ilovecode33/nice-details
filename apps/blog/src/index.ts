import './styles.css';
import { createEditor } from '@ilovecode33/editor-core';

const content = document.querySelector<HTMLElement>('#post-content');

if (!content) {
  throw new Error('找不到文章容器');
}

// 博客只需要展示：readonly 模式不會掛載輸入監聽，
// 也不允許 bold / italic / setHeading 等編輯操作。
const editor = createEditor({
  element: content,
  readonly: true,
  initialHTML: '<h1>Hallo world!</h1>',
});

if (editor.isReadonly() && editor.getText().trim() !== 'Hallo world!') {
  throw new Error('文章內容未正確載入');
}
