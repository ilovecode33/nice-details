import './styles.css';
import { createEditor, type HeadingLevel } from '@ilovecode33/editor-core';

const surface = document.querySelector<HTMLElement>('#editor');
const status = document.querySelector<HTMLElement>('#status');
const output = document.querySelector<HTMLElement>('#output');

if (!surface || !status || !output) {
  throw new Error('編輯器模板缺少必要元素');
}

const buttons = Array.from(
  document.querySelectorAll<HTMLButtonElement>('[data-command]'),
);

const editor = createEditor({
  element: surface,
  onChange: ({ html, text }) => {
    output.textContent = html.trim() || '<!-- 空白 -->';
    status.textContent = `${text.replace(/\s/g, '').length} 字元`;
  },
  onStateChange: ({ bold, italic, heading }) => {
    for (const button of buttons) {
      const command = button.dataset.command;
      let active = false;

      if (command === 'bold') active = bold;
      if (command === 'italic') active = italic;
      if (command === 'heading') {
        active = heading === Number(button.dataset.level);
      }

      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    }
  },
});

for (const button of buttons) {
  // 防止按下工具列時焦點轉移、造成編輯器內的選取範圍消失
  button.addEventListener('mousedown', (event) => event.preventDefault());

  button.addEventListener('click', () => {
    const command = button.dataset.command;

    if (command === 'bold') editor.bold();
    if (command === 'italic') editor.italic();
    if (command === 'heading') {
      editor.setHeading(Number(button.dataset.level) as HeadingLevel);
    }

    editor.focus();
  });
}

editor.setHTML(
  '<h1>歡迎使用編輯器</h1><p>試著選取一段文字，然後按 <strong>B</strong> 或 <em>I</em>，或切換 H1 / H2 / H3。</p>',
);
editor.focus();
