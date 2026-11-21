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
  /** Readonly mode: the user cannot edit; the host supplies the content */
  readonly?: boolean;
  /** Initial HTML content, commonly used in readonly mode */
  initialHTML?: string;
  onChange?: (snapshot: EditorSnapshot) => void;
  onStateChange?: (state: EditorState) => void;
}

export interface EditorController {
  bold(): void;
  italic(): void;
  setHeading(level: HeadingLevel): void;
  getHTML(): string;
  /** Written by the host; still available in readonly mode to load content */
  setHTML(html: string): void;
  getText(): string;
  getState(): EditorState;
  isReadonly(): boolean;
  focus(): void;
  destroy(): void;
}
