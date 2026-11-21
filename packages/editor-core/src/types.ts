export type HeadingLevel = 1 | 2 | 3;

export interface EditorSnapshot {
  html: string;
  text: string;
}

export interface EditorState {
  bold: boolean;
  italic: boolean;
  heading: HeadingLevel | null;
}

export interface EditorOptions {
  element: HTMLElement;
  /** 唯讀模式：使用者無法編輯，只由宿主傳入內容展示 */
  readonly?: boolean;
  /** 初始 HTML 內容，唯讀模式常用 */
  initialHTML?: string;
  onChange?: (snapshot: EditorSnapshot) => void;
  onStateChange?: (state: EditorState) => void;
}

export interface EditorController {
  bold(): void;
  italic(): void;
  setHeading(level: HeadingLevel): void;
  getHTML(): string;
  /** 由宿主寫入內容；唯讀模式下仍可用於載入文章 */
  setHTML(html: string): void;
  getText(): string;
  getState(): EditorState;
  isReadonly(): boolean;
  focus(): void;
  destroy(): void;
}
