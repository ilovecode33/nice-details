import { createEmptyHistoryState, registerHistory } from '@lexical/history';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import {
  $createHeadingNode,
  $isHeadingNode,
  HeadingNode,
  registerRichText,
} from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import {
  $createParagraphNode,
  $getRoot,
  $getSelection,
  $isParagraphNode,
  $isRangeSelection,
  createEditor as createLexicalEditor,
  type EditorState,
  type LexicalEditor,
  type LexicalNode,
  type RangeSelection,
} from 'lexical';
import type {
  EditorController,
  EditorOptions,
  EditorSnapshot,
  EditorState as PublicEditorState,
  HeadingLevel,
} from './types';

const headingLevelFromTag = (tag: string): HeadingLevel | null =>
  tag === 'h1' || tag === 'h2' || tag === 'h3'
    ? (Number(tag[1]) as HeadingLevel)
    : null;

function readHeading(selection: RangeSelection): HeadingLevel | null {
  const anchor = selection.anchor.getNode();
  let node: LexicalNode | null =
    $isParagraphNode(anchor) || $isHeadingNode(anchor)
      ? anchor
      : anchor.getParent();

  while (node) {
    if ($isHeadingNode(node)) return headingLevelFromTag(node.getTag());
    if ($isParagraphNode(node)) return null;
    node = node.getParent();
  }
  return null;
}

/**
 * 以 Lexical 為核心的極簡 WYSIWYG SDK。
 * 對外 API 維持不變，內部改用結構化文件狀態，
 * 因此跨瀏覽器一致性、undo/redo、序列化都交給 Lexical 處理。
 */
export function createEditor(options: EditorOptions): EditorController {
  const {
    element,
    readonly = false,
    initialHTML = '',
    onChange,
    onStateChange,
  } = options;

  const editor: LexicalEditor = createLexicalEditor({
    namespace: 'ilovecode33-editor',
    nodes: [HeadingNode],
    onError: (error) => {
      throw error;
    },
  });

  element.setAttribute('role', 'textbox');
  element.setAttribute('aria-multiline', 'true');
  if (readonly) element.setAttribute('aria-readonly', 'true');

  editor.setRootElement(element);
  editor.setEditable(!readonly);

  const unregister = [
    registerRichText(editor),
    registerHistory(editor, createEmptyHistoryState(), 300),
    editor.registerUpdateListener(({ editorState }) => {
      onChange?.(readSnapshot(editorState));
      onStateChange?.(readState(editorState));
    }),
  ];

  function readSnapshot(editorState: EditorState): EditorSnapshot {
    return editorState.read(() => ({
      html: $generateHtmlFromNodes(editor, null),
      text: $getRoot().getTextContent(),
    }));
  }

  function readState(editorState: EditorState): PublicEditorState {
    return editorState.read(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) {
        return { bold: false, italic: false, heading: null };
      }
      return {
        bold: selection.hasFormat('bold'),
        italic: selection.hasFormat('italic'),
        heading: readHeading(selection),
      };
    });
  }

  function updateSelection(fn: (selection: RangeSelection) => void): void {
    if (readonly) return;
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) fn(selection);
    });
  }

  function setHTML(html: string): void {
    const dom = new DOMParser().parseFromString(html, 'text/html');
    editor.update(() => {
      const nodes = $generateNodesFromDOM(editor, dom);
      const root = $getRoot();
      root.clear();
      root.append(...(nodes.length > 0 ? nodes : [$createParagraphNode()]));
    });
  }

  if (initialHTML) setHTML(initialHTML);

  return {
    bold: () => updateSelection((selection) => selection.formatText('bold')),
    italic: () => updateSelection((selection) => selection.formatText('italic')),
    setHeading: (level: HeadingLevel) =>
      updateSelection((selection) => {
        if (readHeading(selection) === level) {
          $setBlocksType(selection, () => $createParagraphNode());
        } else {
          $setBlocksType(selection, () => $createHeadingNode(`h${level}`));
        }
      }),
    getHTML: () => readSnapshot(editor.getEditorState()).html,
    setHTML,
    getText: () => readSnapshot(editor.getEditorState()).text,
    getState: () => readState(editor.getEditorState()),
    isReadonly: () => readonly,
    focus: () => editor.focus(),
    destroy: () => {
      for (const unregisterFn of unregister) unregisterFn();
      editor.setRootElement(null);
    },
  };
}
