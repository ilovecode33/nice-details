import './styles.css';
import { createEditor, type HeadingLevel } from '@ilovecode33/editor-core';

const surface = document.querySelector<HTMLElement>('#editor');
const status = document.querySelector<HTMLElement>('#status');
const output = document.querySelector<HTMLElement>('#output');

if (!surface || !status || !output) {
  throw new Error('Editor template is missing required elements');
}

const buttons = Array.from(
  document.querySelectorAll<HTMLButtonElement>('[data-command]'),
);

const editor = createEditor({
  element: surface,
  onChange: ({ html, text }) => {
    output.textContent = html.trim() || '<!-- empty -->';
    status.textContent = `${text.replace(/\s/g, '').length} characters`;
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
  // Keep the editor selection when a toolbar button is pressed
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
  '<h1>Welcome to the editor</h1><p>Select some text and press <strong>B</strong> or <em>I</em>, or switch between H1 / H2 / H3.</p>',
);
editor.focus();
