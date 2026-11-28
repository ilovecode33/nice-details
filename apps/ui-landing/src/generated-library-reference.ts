// Generated from @ilovecode33/ui exports and their TSDoc/JSDoc. Do not edit by hand.
type LibraryPropDoc = { name: string; type: string; optional: boolean; description: string };
type LibraryParameterDoc = LibraryPropDoc & { options: LibraryPropDoc[] };
export type LibraryReferenceEntry = { name: string; kind: 'component' | 'hook'; description: string; returnType: string; parameters: LibraryParameterDoc[]; props: LibraryPropDoc[]; nativeElement?: 'button' | 'input' | 'textarea' | 'html'; example: string };
export const LIBRARY_REFERENCE: LibraryReferenceEntry[] = [
  {
    "name": "AccentProvider",
    "kind": "component",
    "description": "Provides the active accent to descendants via context.\nRestores a saved accent on mount (falling back to `defaultAccent`) and persists\nchanges to localStorage and the `data-accent` attribute. Palette variables are set\non <html> before paint so a restored accent never flashes the default color.",
    "returnType": "JSX.Element",
    "parameters": [
      {
        "name": "options",
        "type": "{ children: ReactNode; defaultAccent?: Accent; }",
        "optional": false,
        "description": "",
        "options": [
          {
            "name": "children",
            "type": "ReactNode",
            "optional": false,
            "description": ""
          },
          {
            "name": "defaultAccent",
            "type": "\"warmth\" | \"serenity\" | \"growth\" | \"gentle\" | \"vitality\" | undefined",
            "optional": true,
            "description": ""
          }
        ]
      }
    ],
    "props": [
      {
        "name": "children",
        "type": "ReactNode",
        "optional": false,
        "description": ""
      },
      {
        "name": "defaultAccent",
        "type": "\"warmth\" | \"serenity\" | \"growth\" | \"gentle\" | \"vitality\" | undefined",
        "optional": true,
        "description": ""
      }
    ],
    "example": ""
  },
  {
    "name": "AccentSwitcher",
    "kind": "component",
    "description": "Renders a Select for choosing an accent by meaning, bound to AccentProvider state.\nEach option shows a swatch from the palette of the currently resolved theme.\nAll visible labels come from `labels`, with English defaults.",
    "returnType": "JSX.Element",
    "parameters": [
      {
        "name": "options",
        "type": "{ labels?: AccentSwitcherLabels; }",
        "optional": false,
        "description": "",
        "options": [
          {
            "name": "labels",
            "type": "AccentSwitcherLabels | undefined",
            "optional": true,
            "description": ""
          }
        ]
      }
    ],
    "props": [
      {
        "name": "labels",
        "type": "AccentSwitcherLabels | undefined",
        "optional": true,
        "description": ""
      }
    ],
    "example": "<AccentSwitcher labels={{\n        group: t('accent.group'),\n        warmth: t('accent.warmth'),\n        serenity: t('accent.serenity'),\n        growth: t('accent.growth'),\n        gentle: t('accent.gentle'),\n        vitality: t('accent.vitality'),\n    }}/>"
  },
  {
    "name": "ActionSheet",
    "kind": "component",
    "description": "Renders a bottom sheet of actions with a separate cancel button.\nControlled by `open`; Escape, scrim click, cancel, and action selection all close\nit (the action's `onSelect` runs before `onClose`). Destructive actions are styled\ndistinctly. Labels come from props, with `cancelLabel` defaulting to \"Cancel\".",
    "returnType": "JSX.Element | null",
    "parameters": [
      {
        "name": "options",
        "type": "{ open: boolean; onClose: () => void; title: string; actions: ActionItem[]; cancelLabel?: string; }",
        "optional": false,
        "description": "",
        "options": [
          {
            "name": "open",
            "type": "boolean",
            "optional": false,
            "description": ""
          },
          {
            "name": "onClose",
            "type": "() => void",
            "optional": false,
            "description": ""
          },
          {
            "name": "title",
            "type": "string",
            "optional": false,
            "description": ""
          },
          {
            "name": "actions",
            "type": "ActionItem[]",
            "optional": false,
            "description": ""
          },
          {
            "name": "cancelLabel",
            "type": "string | undefined",
            "optional": true,
            "description": ""
          }
        ]
      }
    ],
    "props": [
      {
        "name": "open",
        "type": "boolean",
        "optional": false,
        "description": ""
      },
      {
        "name": "onClose",
        "type": "() => void",
        "optional": false,
        "description": ""
      },
      {
        "name": "title",
        "type": "string",
        "optional": false,
        "description": ""
      },
      {
        "name": "actions",
        "type": "ActionItem[]",
        "optional": false,
        "description": ""
      },
      {
        "name": "cancelLabel",
        "type": "string | undefined",
        "optional": true,
        "description": ""
      }
    ],
    "example": "<ActionSheet open={actionOpen} onClose={() => setActionOpen(false)} title={t('progress.actionSheet')} actions={[\n        { label: t('progress.action1'), onSelect: () => undefined },\n        { label: t('progress.action2'), onSelect: () => undefined, destructive: true },\n    ]}/>"
  },
  {
    "name": "ActivityIndicator",
    "kind": "component",
    "description": "Renders an indeterminate loading spinner for waits of unknown duration.\nUses `role=\"status\"` with an accessible name while the visual ring is hidden from\nassistive tech. `label` supplies that name and defaults to \"Loading\".",
    "returnType": "JSX.Element",
    "parameters": [
      {
        "name": "options",
        "type": "{ label?: string; }",
        "optional": false,
        "description": "",
        "options": [
          {
            "name": "label",
            "type": "string | undefined",
            "optional": true,
            "description": ""
          }
        ]
      }
    ],
    "props": [
      {
        "name": "label",
        "type": "string | undefined",
        "optional": true,
        "description": ""
      }
    ],
    "example": "<ActivityIndicator label={t('progress.loading')}/>"
  },
  {
    "name": "AlertDialog",
    "kind": "component",
    "description": "Renders a modal confirmation dialog on the shared Sheet surface.\nControlled by `open`; Escape, scrim click, and cancel call `onClose`, while confirm\nruns `onConfirm` first. `destructive` switches the confirm button to the danger style.\nLabels come from props, with \"Confirm\" and \"Cancel\" as English defaults.",
    "returnType": "JSX.Element | null",
    "parameters": [
      {
        "name": "options",
        "type": "{ open: boolean; onClose: () => void; title: string; message: ReactNode; confirmLabel?: string; cancelLabel?: string; destructive?: boolean; onConfirm: () => void; }",
        "optional": false,
        "description": "",
        "options": [
          {
            "name": "open",
            "type": "boolean",
            "optional": false,
            "description": ""
          },
          {
            "name": "onClose",
            "type": "() => void",
            "optional": false,
            "description": ""
          },
          {
            "name": "title",
            "type": "string",
            "optional": false,
            "description": ""
          },
          {
            "name": "message",
            "type": "ReactNode",
            "optional": false,
            "description": ""
          },
          {
            "name": "confirmLabel",
            "type": "string | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "cancelLabel",
            "type": "string | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "destructive",
            "type": "boolean | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "onConfirm",
            "type": "() => void",
            "optional": false,
            "description": ""
          }
        ]
      }
    ],
    "props": [
      {
        "name": "open",
        "type": "boolean",
        "optional": false,
        "description": ""
      },
      {
        "name": "onClose",
        "type": "() => void",
        "optional": false,
        "description": ""
      },
      {
        "name": "title",
        "type": "string",
        "optional": false,
        "description": ""
      },
      {
        "name": "message",
        "type": "ReactNode",
        "optional": false,
        "description": ""
      },
      {
        "name": "confirmLabel",
        "type": "string | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "cancelLabel",
        "type": "string | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "destructive",
        "type": "boolean | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "onConfirm",
        "type": "() => void",
        "optional": false,
        "description": ""
      }
    ],
    "example": "<AlertDialog open={alertOpen} onClose={() => setAlertOpen(false)} title={t('confirm.title')} message={t('confirm.body')} cancelLabel={t('confirm.cancel')} confirmLabel={t('confirm.confirm')} destructive onConfirm={() => setAlertOpen(false)}/>"
  },
  {
    "name": "AspectImage",
    "kind": "component",
    "description": "Renders a lazily loaded image inside a box with a fixed aspect ratio.\nWithout `src` it shows `children` as a labelled `role=\"img\"` placeholder (for example\nan emoji); native images fall back to an empty `alt`. `ratio` defaults to \"4 / 3\"\nand `style` is merged after it, so callers can override the layout.",
    "returnType": "JSX.Element",
    "parameters": [
      {
        "name": "options",
        "type": "{ src?: string; alt?: string; ratio?: string; style?: CSSProperties; children?: ReactNode; }",
        "optional": false,
        "description": "",
        "options": [
          {
            "name": "src",
            "type": "string | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "alt",
            "type": "string | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "ratio",
            "type": "string | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "style",
            "type": "CSSProperties | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "children",
            "type": "ReactNode",
            "optional": true,
            "description": ""
          }
        ]
      }
    ],
    "props": [
      {
        "name": "src",
        "type": "string | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "alt",
        "type": "string | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "ratio",
        "type": "string | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "style",
        "type": "CSSProperties | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "children",
        "type": "ReactNode",
        "optional": true,
        "description": ""
      }
    ],
    "example": "<AspectImage style={photoItems[0].style} alt={photoItems[0].alt}>\n  {/* content */}\n</AspectImage>"
  },
  {
    "name": "Avatar",
    "kind": "component",
    "description": "Renders a circular avatar with an image or an initials fallback.\nInitials take the first letter of up to two space-separated parts of `name`,\nuppercased. The wrapper is labelled `role=\"img\"` and images use an empty `alt`\nbecause `name` already provides the accessible label. `size` defaults to \"default\".",
    "returnType": "JSX.Element",
    "parameters": [
      {
        "name": "options",
        "type": "{ name: string; src?: string; size?: \"small\" | \"default\"; }",
        "optional": false,
        "description": "",
        "options": [
          {
            "name": "name",
            "type": "string",
            "optional": false,
            "description": ""
          },
          {
            "name": "src",
            "type": "string | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "size",
            "type": "\"small\" | \"default\" | undefined",
            "optional": true,
            "description": ""
          }
        ]
      }
    ],
    "props": [
      {
        "name": "name",
        "type": "string",
        "optional": false,
        "description": ""
      },
      {
        "name": "src",
        "type": "string | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "size",
        "type": "\"small\" | \"default\" | undefined",
        "optional": true,
        "description": ""
      }
    ],
    "example": "<Avatar name=\"Ada Lovelace\"/>"
  },
  {
    "name": "Badge",
    "kind": "component",
    "description": "Renders a small inline badge for status or categorization.\n`tone` selects one of four visual variants and defaults to \"neutral\"; all content\ncomes from `children`, so the component builds in no user-facing text.",
    "returnType": "JSX.Element",
    "parameters": [
      {
        "name": "options",
        "type": "{ children: ReactNode; tone?: \"neutral\" | \"accent\" | \"success\" | \"danger\"; }",
        "optional": false,
        "description": "",
        "options": [
          {
            "name": "children",
            "type": "ReactNode",
            "optional": false,
            "description": ""
          },
          {
            "name": "tone",
            "type": "\"neutral\" | \"accent\" | \"success\" | \"danger\" | undefined",
            "optional": true,
            "description": ""
          }
        ]
      }
    ],
    "props": [
      {
        "name": "children",
        "type": "ReactNode",
        "optional": false,
        "description": ""
      },
      {
        "name": "tone",
        "type": "\"neutral\" | \"accent\" | \"success\" | \"danger\" | undefined",
        "optional": true,
        "description": ""
      }
    ],
    "example": "<Badge tone=\"accent\">\n  {/* content */}\n</Badge>"
  },
  {
    "name": "Banner",
    "kind": "component",
    "description": "Renders an inline message banner with a tone-driven icon and role.\nThe action button appears only with `actionLabel`; the dismiss button appears only\nwith `onDismiss`. Labels come from props: `dismissLabel` defaults to \"Dismiss\" and\n`tone` defaults to \"info\".",
    "returnType": "JSX.Element",
    "parameters": [
      {
        "name": "options",
        "type": "{ tone?: FeedbackTone; message: string; actionLabel?: string; onAction?: () => void; onDismiss?: () => void; dismissLabel?: string; }",
        "optional": false,
        "description": "",
        "options": [
          {
            "name": "tone",
            "type": "FeedbackTone | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "message",
            "type": "string",
            "optional": false,
            "description": ""
          },
          {
            "name": "actionLabel",
            "type": "string | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "onAction",
            "type": "(() => void) | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "onDismiss",
            "type": "(() => void) | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "dismissLabel",
            "type": "string | undefined",
            "optional": true,
            "description": ""
          }
        ]
      }
    ],
    "props": [
      {
        "name": "tone",
        "type": "FeedbackTone | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "message",
        "type": "string",
        "optional": false,
        "description": ""
      },
      {
        "name": "actionLabel",
        "type": "string | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "onAction",
        "type": "(() => void) | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "onDismiss",
        "type": "(() => void) | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "dismissLabel",
        "type": "string | undefined",
        "optional": true,
        "description": ""
      }
    ],
    "example": "<Banner tone=\"info\" message={t('progress.banner')} onDismiss={() => setBannerVisible(false)}/>"
  },
  {
    "name": "Button",
    "kind": "component",
    "description": "Renders a pressable button with optional icon, variants, and deformation feedback.\nWith `haloPortal`, the whole button is portalled to `document.body` and tethered to a\ntransparent anchor placeholder so its glow cannot be clipped; `deform` keeps vertical\nscrolling while still allowing horizontal drag feedback. Text comes from `children`.",
    "returnType": "JSX.Element",
    "parameters": [
      {
        "name": "options",
        "type": "ButtonProps",
        "optional": false,
        "description": "",
        "options": [
          {
            "name": "variant",
            "type": "\"primary\" | \"secondary\" | \"destructive\" | \"plain\" | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "size",
            "type": "\"default\" | \"compact\" | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "icon",
            "type": "ReactNode",
            "optional": true,
            "description": ""
          },
          {
            "name": "block",
            "type": "boolean | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "deform",
            "type": "boolean | undefined",
            "optional": true,
            "description": "Directional press/drag deformation. Disabled automatically under reduced motion."
          },
          {
            "name": "haloPortal",
            "type": "boolean | undefined",
            "optional": true,
            "description": "Render the button on document.body with CSS Anchor Positioning so neither\nthe button nor its glow is clipped by a scrolling ancestor. A transparent\nplaceholder keeps the layout slot and acts as the anchor. Requires\nanchor-positioning browser support."
          }
        ]
      }
    ],
    "props": [
      {
        "name": "variant",
        "type": "\"primary\" | \"secondary\" | \"destructive\" | \"plain\" | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "size",
        "type": "\"default\" | \"compact\" | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "icon",
        "type": "ReactNode",
        "optional": true,
        "description": ""
      },
      {
        "name": "block",
        "type": "boolean | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "deform",
        "type": "boolean | undefined",
        "optional": true,
        "description": "Directional press/drag deformation. Disabled automatically under reduced motion."
      },
      {
        "name": "haloPortal",
        "type": "boolean | undefined",
        "optional": true,
        "description": "Render the button on document.body with CSS Anchor Positioning so neither\nthe button nor its glow is clipped by a scrolling ancestor. A transparent\nplaceholder keeps the layout slot and acts as the anchor. Requires\nanchor-positioning browser support."
      }
    ],
    "nativeElement": "button",
    "example": "<Button variant=\"secondary\" onClick={() => onOpenReference('TextInput')}>\n  {/* content */}\n</Button>"
  },
  {
    "name": "Card",
    "kind": "component",
    "description": "Renders a container surface with an optional header and a content body.\nThe header is skipped unless `title` or `actions` is provided, so a `subtitle`\nalone is not rendered. `padded` defaults to true; extra props reach the `<section>`.",
    "returnType": "JSX.Element",
    "parameters": [
      {
        "name": "options",
        "type": "CardProps",
        "optional": false,
        "description": "",
        "options": [
          {
            "name": "title",
            "type": "ReactNode",
            "optional": true,
            "description": ""
          },
          {
            "name": "subtitle",
            "type": "ReactNode",
            "optional": true,
            "description": ""
          },
          {
            "name": "actions",
            "type": "ReactNode",
            "optional": true,
            "description": ""
          },
          {
            "name": "padded",
            "type": "boolean | undefined",
            "optional": true,
            "description": ""
          }
        ]
      }
    ],
    "props": [
      {
        "name": "title",
        "type": "ReactNode",
        "optional": true,
        "description": ""
      },
      {
        "name": "subtitle",
        "type": "ReactNode",
        "optional": true,
        "description": ""
      },
      {
        "name": "actions",
        "type": "ReactNode",
        "optional": true,
        "description": ""
      },
      {
        "name": "padded",
        "type": "boolean | undefined",
        "optional": true,
        "description": ""
      }
    ],
    "example": "<Card id=\"group-button\" title={t(group('button').title)} subtitle={t(group('button').subtitle)}>\n  {/* content */}\n</Card>"
  },
  {
    "name": "Carousel",
    "kind": "component",
    "description": "Renders a snap-aligned, controlled horizontal carousel of `AspectImage` slides.\n`index`/`onIndexChange` drive state; arrow keys, nav buttons, and scrolling update it,\nwith bounds from `mediaReducer` and smooth scrolling via `scrollTo`. `label` and\n`labels` (previous/next) have English defaults; nav buttons disable at the ends.",
    "returnType": "JSX.Element",
    "parameters": [
      {
        "name": "options",
        "type": "{ items: PhotoItem[]; index: number; onIndexChange: (index: number) => void; label?: string; labels?: { previous?: string; next?: string; }; }",
        "optional": false,
        "description": "",
        "options": [
          {
            "name": "items",
            "type": "PhotoItem[]",
            "optional": false,
            "description": ""
          },
          {
            "name": "index",
            "type": "number",
            "optional": false,
            "description": ""
          },
          {
            "name": "onIndexChange",
            "type": "(index: number) => void",
            "optional": false,
            "description": ""
          },
          {
            "name": "label",
            "type": "string | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "labels",
            "type": "{ previous?: string; next?: string; } | undefined",
            "optional": true,
            "description": ""
          }
        ]
      }
    ],
    "props": [
      {
        "name": "items",
        "type": "PhotoItem[]",
        "optional": false,
        "description": ""
      },
      {
        "name": "index",
        "type": "number",
        "optional": false,
        "description": ""
      },
      {
        "name": "onIndexChange",
        "type": "(index: number) => void",
        "optional": false,
        "description": ""
      },
      {
        "name": "label",
        "type": "string | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "labels",
        "type": "{ previous?: string; next?: string; } | undefined",
        "optional": true,
        "description": ""
      }
    ],
    "example": "<Carousel items={photoItems.slice(0, 3)} label={t('gallery.carouselLabel')} index={carouselIndex} onIndexChange={setCarouselIndex}/>"
  },
  {
    "name": "Checkbox",
    "kind": "component",
    "description": "Renders a controlled checkbox with field-state styling and a visible text label.\nA button with `role=\"checkbox\"` and synced `aria-checked` toggles `!checked` on click;\nthe control and its text share a `<label>`. `deform` adds press/drag feedback without\nblocking vertical scrolling. The label text comes from `label`.",
    "returnType": "JSX.Element",
    "parameters": [
      {
        "name": "options",
        "type": "{ checked: boolean; onChange: (checked: boolean) => void; label: string; deform?: boolean; }",
        "optional": false,
        "description": "",
        "options": [
          {
            "name": "checked",
            "type": "boolean",
            "optional": false,
            "description": ""
          },
          {
            "name": "onChange",
            "type": "(checked: boolean) => void",
            "optional": false,
            "description": ""
          },
          {
            "name": "label",
            "type": "string",
            "optional": false,
            "description": ""
          },
          {
            "name": "deform",
            "type": "boolean | undefined",
            "optional": true,
            "description": ""
          }
        ]
      }
    ],
    "props": [
      {
        "name": "checked",
        "type": "boolean",
        "optional": false,
        "description": ""
      },
      {
        "name": "onChange",
        "type": "(checked: boolean) => void",
        "optional": false,
        "description": ""
      },
      {
        "name": "label",
        "type": "string",
        "optional": false,
        "description": ""
      },
      {
        "name": "deform",
        "type": "boolean | undefined",
        "optional": true,
        "description": ""
      }
    ],
    "example": "<Checkbox checked={checked} onChange={setChecked} label={t('create.originals')}/>"
  },
  {
    "name": "Chip",
    "kind": "component",
    "description": "Renders a compact chip whose `selected` state is mirrored to `aria-pressed`.\nThe chip stays controlled by the caller and `onClick` is optional; `label` supplies\nan optional accessible name. Visible content comes from `children`.",
    "returnType": "JSX.Element",
    "parameters": [
      {
        "name": "options",
        "type": "{ children: ReactNode; selected?: boolean; onClick?: () => void; label?: string; }",
        "optional": false,
        "description": "",
        "options": [
          {
            "name": "children",
            "type": "ReactNode",
            "optional": false,
            "description": ""
          },
          {
            "name": "selected",
            "type": "boolean | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "onClick",
            "type": "(() => void) | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "label",
            "type": "string | undefined",
            "optional": true,
            "description": ""
          }
        ]
      }
    ],
    "props": [
      {
        "name": "children",
        "type": "ReactNode",
        "optional": false,
        "description": ""
      },
      {
        "name": "selected",
        "type": "boolean | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "onClick",
        "type": "(() => void) | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "label",
        "type": "string | undefined",
        "optional": true,
        "description": ""
      }
    ],
    "example": "<Chip key={value} selected={chip === value} onClick={() => setChip(value)}>\n  {/* content */}\n</Chip>"
  },
  {
    "name": "DatePicker",
    "kind": "component",
    "description": "Renders a native date input with field-state styling.\nAll `InputHTMLAttributes` are forwarded to the underlying `<input type=\"date\">`,\nwith `className` appended after the component's own class. No labels are built in.",
    "returnType": "JSX.Element",
    "parameters": [
      {
        "name": "props",
        "type": "InputHTMLAttributes<HTMLInputElement>",
        "optional": false,
        "description": "",
        "options": []
      }
    ],
    "props": [],
    "nativeElement": "input",
    "example": "<DatePicker value={startDate} onChange={(event) => setStartDate(event.target.value)}/>"
  },
  {
    "name": "Deformable",
    "kind": "component",
    "description": "Wraps children in a div with drag-driven deformation and a press glow.\nPointer handling comes from `useDeform` and overrides conflicting props in `rest`;\ncaller `style` overrides the generated transform. When supplied, `onDragStateChange`\nis called in an effect on each deformation state change.",
    "returnType": "JSX.Element",
    "parameters": [
      {
        "name": "options",
        "type": "HTMLAttributes<HTMLDivElement> & { max?: number; axis?: DeformAxis; enabled?: boolean; touchAction?: CSSProperties[\"touchAction\"]; longPressMs?: number; onGesture?: (snapshot: GestureSnapshot) => void; onDragStateChange?: (state: DeformState) => void; }",
        "optional": false,
        "description": "",
        "options": [
          {
            "name": "max",
            "type": "number | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "axis",
            "type": "DeformAxis | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "enabled",
            "type": "boolean | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "touchAction",
            "type": "Property.TouchAction | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "longPressMs",
            "type": "number | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "onGesture",
            "type": "((snapshot: GestureSnapshot) => void) | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "onDragStateChange",
            "type": "((state: DeformState) => void) | undefined",
            "optional": true,
            "description": ""
          }
        ]
      }
    ],
    "props": [
      {
        "name": "max",
        "type": "number | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "axis",
        "type": "DeformAxis | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "enabled",
        "type": "boolean | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "touchAction",
        "type": "Property.TouchAction | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "longPressMs",
        "type": "number | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "onGesture",
        "type": "((snapshot: GestureSnapshot) => void) | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "onDragStateChange",
        "type": "((state: DeformState) => void) | undefined",
        "optional": true,
        "description": ""
      }
    ],
    "example": "<Deformable axis=\"x\" className=\"landing__deform-chip\">\n  {/* content */}\n</Deformable>"
  },
  {
    "name": "Disclosure",
    "kind": "component",
    "description": "Renders a disclosure that toggles its content, backed by `DisclosureState`.\nControlled when `open` is provided; otherwise it keeps internal state seeded by\n`defaultOpen`. `onOpenChange` reports the next value in both modes. The body is\nmounted only while open and linked to the trigger via `aria-controls`/`aria-expanded`.",
    "returnType": "JSX.Element",
    "parameters": [
      {
        "name": "options",
        "type": "{ title: ReactNode; children: ReactNode; defaultOpen?: boolean; open?: boolean; onOpenChange?: (open: boolean) => void; }",
        "optional": false,
        "description": "",
        "options": [
          {
            "name": "title",
            "type": "ReactNode",
            "optional": false,
            "description": ""
          },
          {
            "name": "children",
            "type": "ReactNode",
            "optional": false,
            "description": ""
          },
          {
            "name": "defaultOpen",
            "type": "boolean | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "open",
            "type": "boolean | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "onOpenChange",
            "type": "((open: boolean) => void) | undefined",
            "optional": true,
            "description": ""
          }
        ]
      }
    ],
    "props": [
      {
        "name": "title",
        "type": "ReactNode",
        "optional": false,
        "description": ""
      },
      {
        "name": "children",
        "type": "ReactNode",
        "optional": false,
        "description": ""
      },
      {
        "name": "defaultOpen",
        "type": "boolean | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "open",
        "type": "boolean | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "onOpenChange",
        "type": "((open: boolean) => void) | undefined",
        "optional": true,
        "description": ""
      }
    ],
    "example": "<Disclosure title={t('library.details')} defaultOpen>\n  {/* content */}\n</Disclosure>"
  },
  {
    "name": "Divider",
    "kind": "component",
    "description": "Renders a thin horizontal rule separating content sections.\nExtra `HTMLAttributes` are forwarded to the `<hr>`; `className` is appended after\nthe component's own class. It carries no text or built-in labels.",
    "returnType": "JSX.Element",
    "parameters": [
      {
        "name": "props",
        "type": "HTMLAttributes<HTMLHRElement>",
        "optional": false,
        "description": "",
        "options": []
      }
    ],
    "props": [],
    "nativeElement": "html",
    "example": "<Divider />"
  },
  {
    "name": "DockNavigation",
    "kind": "component",
    "description": "Floating dock that collapses to a compact strip and expands into a wrapped\npanel, keeping the active item centred while collapsed. Collapse is controlled\nwhen `collapsed` is passed, otherwise tracked internally; the ref exposes\n`toggle`/`setCollapsed`. Item labels come from `items`; `label`, `collapseLabel`\nand `expandLabel` are props with English defaults.",
    "returnType": "ReactNode",
    "parameters": [
      {
        "name": "props",
        "type": "DockNavigationProps & RefAttributes<DockNavigationHandle>",
        "optional": false,
        "description": "",
        "options": [
          {
            "name": "items",
            "type": "readonly DockItem[]",
            "optional": false,
            "description": ""
          },
          {
            "name": "activeId",
            "type": "string | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "onSelect",
            "type": "((id: string, event?: ReactMouseEvent<HTMLElement>) => void) | undefined",
            "optional": true,
            "description": "Receives the click event; drag selection calls it without one."
          },
          {
            "name": "label",
            "type": "string | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "collapsible",
            "type": "boolean | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "collapsed",
            "type": "boolean | undefined",
            "optional": true,
            "description": "Controlled collapse state."
          },
          {
            "name": "defaultCollapsed",
            "type": "boolean | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "onCollapsedChange",
            "type": "((collapsed: boolean) => void) | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "collapseLabel",
            "type": "string | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "expandLabel",
            "type": "string | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "deform",
            "type": "boolean | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "className",
            "type": "string | undefined",
            "optional": true,
            "description": ""
          }
        ]
      }
    ],
    "props": [
      {
        "name": "items",
        "type": "readonly DockItem[]",
        "optional": false,
        "description": ""
      },
      {
        "name": "activeId",
        "type": "string | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "onSelect",
        "type": "((id: string, event?: ReactMouseEvent<HTMLElement>) => void) | undefined",
        "optional": true,
        "description": "Receives the click event; drag selection calls it without one."
      },
      {
        "name": "label",
        "type": "string | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "collapsible",
        "type": "boolean | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "collapsed",
        "type": "boolean | undefined",
        "optional": true,
        "description": "Controlled collapse state."
      },
      {
        "name": "defaultCollapsed",
        "type": "boolean | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "onCollapsedChange",
        "type": "((collapsed: boolean) => void) | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "collapseLabel",
        "type": "string | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "expandLabel",
        "type": "string | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "deform",
        "type": "boolean | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "className",
        "type": "string | undefined",
        "optional": true,
        "description": ""
      }
    ],
    "example": "<DockNavigation ref={dockRef} label={t('floating.footer')} items={COMPONENT_GROUPS.map((item) => ({\n        id: item.id,\n        label: t(item.title),\n    }))} activeId={activeGroup} onSelect={goToGroup} collapsed={dockCollapsed} onCollapsedChange={setDockCollapsed} collapseLabel={t('floating.hideDemo')} expandLabel={t('floating.openDemo')}/>"
  },
  {
    "name": "EmptyState",
    "kind": "component",
    "description": "Placeholder shown when a collection has no items: an optional decorative icon\nhidden from assistive tech, a title and an optional detail line. All text is\nsupplied by the caller through props; there are no built-in label defaults.",
    "returnType": "JSX.Element",
    "parameters": [
      {
        "name": "options",
        "type": "{ icon?: ReactNode; title: string; detail?: string; }",
        "optional": false,
        "description": "",
        "options": [
          {
            "name": "icon",
            "type": "ReactNode",
            "optional": true,
            "description": ""
          },
          {
            "name": "title",
            "type": "string",
            "optional": false,
            "description": ""
          },
          {
            "name": "detail",
            "type": "string | undefined",
            "optional": true,
            "description": ""
          }
        ]
      }
    ],
    "props": [
      {
        "name": "icon",
        "type": "ReactNode",
        "optional": true,
        "description": ""
      },
      {
        "name": "title",
        "type": "string",
        "optional": false,
        "description": ""
      },
      {
        "name": "detail",
        "type": "string | undefined",
        "optional": true,
        "description": ""
      }
    ],
    "example": "<EmptyState icon={<Search />} title={t('search.emptyTitle')} detail={t('search.emptyDetail')}/>"
  },
  {
    "name": "Field",
    "kind": "component",
    "description": "Inline `label` wrapper for compact form rows: a label, the control and an\noptional hint. All text is passed in via props; no labels are built in.\nClicking the label text names the row but does not activate a Select or a\nSwitch inside it — opening a menu or toggling from the caption is too easy\nto trigger by accident while scrolling.",
    "returnType": "JSX.Element",
    "parameters": [
      {
        "name": "options",
        "type": "{ label: string; hint?: string; children: ReactNode; }",
        "optional": false,
        "description": "",
        "options": [
          {
            "name": "label",
            "type": "string",
            "optional": false,
            "description": ""
          },
          {
            "name": "hint",
            "type": "string | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "children",
            "type": "ReactNode",
            "optional": false,
            "description": ""
          }
        ]
      }
    ],
    "props": [
      {
        "name": "label",
        "type": "string",
        "optional": false,
        "description": ""
      },
      {
        "name": "hint",
        "type": "string | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "children",
        "type": "ReactNode",
        "optional": false,
        "description": ""
      }
    ],
    "example": "<Field label={t('settings.sort')}>\n  {/* content */}\n</Field>"
  },
  {
    "name": "FloatingBar",
    "kind": "component",
    "description": "Floating glass surface hosting top/bottom/leading chrome above content (the\nhost reserves scroll space). Optional toggle controls collapse: controlled\nwhen `collapsed` is passed, otherwise internal, with `onCollapsedChange`\nalways notified. Deformation is on by default and reduced-motion aware;\n`collapseLabel`/`expandLabel` default to English, `label` is caller-supplied.",
    "returnType": "JSX.Element",
    "parameters": [
      {
        "name": "options",
        "type": "{ position?: \"top\" | \"bottom\" | \"leading\"; label?: string; className?: string; collapsible?: boolean; collapsed?: boolean; onCollapsedChange?: (collapsed: boolean) => void; collapseLabel?: string; expandLabel?: string; deform?: boolean; children: ReactNode; }",
        "optional": false,
        "description": "",
        "options": [
          {
            "name": "position",
            "type": "\"top\" | \"bottom\" | \"leading\" | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "label",
            "type": "string | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "className",
            "type": "string | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "collapsible",
            "type": "boolean | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "collapsed",
            "type": "boolean | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "onCollapsedChange",
            "type": "((collapsed: boolean) => void) | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "collapseLabel",
            "type": "string | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "expandLabel",
            "type": "string | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "deform",
            "type": "boolean | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "children",
            "type": "ReactNode",
            "optional": false,
            "description": ""
          }
        ]
      }
    ],
    "props": [
      {
        "name": "position",
        "type": "\"top\" | \"bottom\" | \"leading\" | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "label",
        "type": "string | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "className",
        "type": "string | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "collapsible",
        "type": "boolean | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "collapsed",
        "type": "boolean | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "onCollapsedChange",
        "type": "((collapsed: boolean) => void) | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "collapseLabel",
        "type": "string | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "expandLabel",
        "type": "string | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "deform",
        "type": "boolean | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "children",
        "type": "ReactNode",
        "optional": false,
        "description": ""
      }
    ],
    "example": ""
  },
  {
    "name": "FormField",
    "kind": "component",
    "description": "Wraps a control with a label, hint and error message, injecting `id`,\n`aria-describedby` and `aria-invalid` into a cloned element or a render\ncallback. An error replaces the hint and is announced via `role=\"alert\"`.\nAll text is passed in through props; no labels are built in.",
    "returnType": "JSX.Element",
    "parameters": [
      {
        "name": "options",
        "type": "{ label: string; hint?: string; error?: string; id?: string; children: ReactNode | ((props: FieldControlProps) => ReactNode); }",
        "optional": false,
        "description": "",
        "options": [
          {
            "name": "label",
            "type": "string",
            "optional": false,
            "description": ""
          },
          {
            "name": "hint",
            "type": "string | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "error",
            "type": "string | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "id",
            "type": "string | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "children",
            "type": "ReactNode | ((props: FieldControlProps) => ReactNode)",
            "optional": false,
            "description": ""
          }
        ]
      }
    ],
    "props": [
      {
        "name": "label",
        "type": "string",
        "optional": false,
        "description": ""
      },
      {
        "name": "hint",
        "type": "string | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "error",
        "type": "string | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "id",
        "type": "string | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "children",
        "type": "ReactNode | ((props: FieldControlProps) => ReactNode)",
        "optional": false,
        "description": ""
      }
    ],
    "example": "<FormField label={t('create.name')} hint={t('create.nameHint')} error={draftError}>\n  {/* content */}\n</FormField>"
  },
  {
    "name": "GlassSurface",
    "kind": "component",
    "description": "Glass material surface forwarding native `div` attributes and merging caller\nstyles with deformation styles. With `deform` enabled, press handlers and a\nreduced-motion-aware glow are attached. Visible text comes only from\n`children`; no labels are built in.",
    "returnType": "JSX.Element",
    "parameters": [
      {
        "name": "options",
        "type": "HTMLAttributes<HTMLDivElement> & { elevation?: \"default\" | \"raised\"; deform?: boolean; }",
        "optional": false,
        "description": "",
        "options": [
          {
            "name": "elevation",
            "type": "\"default\" | \"raised\" | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "deform",
            "type": "boolean | undefined",
            "optional": true,
            "description": ""
          }
        ]
      }
    ],
    "props": [
      {
        "name": "elevation",
        "type": "\"default\" | \"raised\" | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "deform",
        "type": "boolean | undefined",
        "optional": true,
        "description": ""
      }
    ],
    "example": "<GlassSurface elevation=\"raised\" className=\"landing__glass-sample\" deform>\n  {/* content */}\n</GlassSurface>"
  },
  {
    "name": "List",
    "kind": "component",
    "description": "Accessible list that maps items to selectable/expandable rows using shared\nlist semantics. `selectedId` and `expandedIds` are controlled by the caller;\nselection and disclosure callbacks fire without internal state. Item text\ncomes from `items`; `label` is an optional caller-supplied prop.",
    "returnType": "JSX.Element",
    "parameters": [
      {
        "name": "options",
        "type": "{ items: Array<ListItem<T>>; selectedId?: T; expandedIds?: readonly T[]; onSelect?: (id: T) => void; onToggleExpanded?: (id: T) => void; label?: string; }",
        "optional": false,
        "description": "",
        "options": [
          {
            "name": "items",
            "type": "ListItem<T>[]",
            "optional": false,
            "description": ""
          },
          {
            "name": "selectedId",
            "type": "T | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "expandedIds",
            "type": "readonly T[] | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "onSelect",
            "type": "((id: T) => void) | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "onToggleExpanded",
            "type": "((id: T) => void) | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "label",
            "type": "string | undefined",
            "optional": true,
            "description": ""
          }
        ]
      }
    ],
    "props": [
      {
        "name": "items",
        "type": "ListItem<T>[]",
        "optional": false,
        "description": ""
      },
      {
        "name": "selectedId",
        "type": "T | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "expandedIds",
        "type": "readonly T[] | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "onSelect",
        "type": "((id: T) => void) | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "onToggleExpanded",
        "type": "((id: T) => void) | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "label",
        "type": "string | undefined",
        "optional": true,
        "description": ""
      }
    ],
    "example": "<List label={t('library.listLabel')} items={albums} selectedId={listState.selectedId} expandedIds={listState.expandedIds} onSelect={(id) => dispatchList({ type: 'select', value: id })} onToggleExpanded={(id) => dispatchList({ type: 'toggleExpanded', value: id })}/>"
  },
  {
    "name": "ListRow",
    "kind": "component",
    "description": "Single row inside a `List`: a button that reports selection and, when the\nitem has `expandedContent`, toggles a disclosure region linked by `useId`.\nSelection and expansion are fully controlled by props; one click fires both\ncallbacks. Text comes from the `item`; no labels are built in.",
    "returnType": "JSX.Element",
    "parameters": [
      {
        "name": "options",
        "type": "{ item: ListItem<T>; selected?: boolean; expanded?: boolean; onSelect?: (id: T) => void; onToggleExpanded?: (id: T) => void; }",
        "optional": false,
        "description": "",
        "options": [
          {
            "name": "item",
            "type": "ListItem<T>",
            "optional": false,
            "description": ""
          },
          {
            "name": "selected",
            "type": "boolean | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "expanded",
            "type": "boolean | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "onSelect",
            "type": "((id: T) => void) | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "onToggleExpanded",
            "type": "((id: T) => void) | undefined",
            "optional": true,
            "description": ""
          }
        ]
      }
    ],
    "props": [
      {
        "name": "item",
        "type": "ListItem<T>",
        "optional": false,
        "description": ""
      },
      {
        "name": "selected",
        "type": "boolean | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "expanded",
        "type": "boolean | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "onSelect",
        "type": "((id: T) => void) | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "onToggleExpanded",
        "type": "((id: T) => void) | undefined",
        "optional": true,
        "description": ""
      }
    ],
    "example": ""
  },
  {
    "name": "NavBar",
    "kind": "component",
    "description": "Top navigation header rendering a title, optional subtitle, optional trailing\nactions and a back button shown only when `onBack` is provided. `title` and\n`subtitle` are React nodes; the back button's accessible name comes from\n`backLabel`, which defaults to English.",
    "returnType": "JSX.Element",
    "parameters": [
      {
        "name": "options",
        "type": "{ title: ReactNode; subtitle?: ReactNode; backLabel?: string; onBack?: () => void; actions?: ReactNode; }",
        "optional": false,
        "description": "",
        "options": [
          {
            "name": "title",
            "type": "ReactNode",
            "optional": false,
            "description": ""
          },
          {
            "name": "subtitle",
            "type": "ReactNode",
            "optional": true,
            "description": ""
          },
          {
            "name": "backLabel",
            "type": "string | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "onBack",
            "type": "(() => void) | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "actions",
            "type": "ReactNode",
            "optional": true,
            "description": ""
          }
        ]
      }
    ],
    "props": [
      {
        "name": "title",
        "type": "ReactNode",
        "optional": false,
        "description": ""
      },
      {
        "name": "subtitle",
        "type": "ReactNode",
        "optional": true,
        "description": ""
      },
      {
        "name": "backLabel",
        "type": "string | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "onBack",
        "type": "(() => void) | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "actions",
        "type": "ReactNode",
        "optional": true,
        "description": ""
      }
    ],
    "example": "<NavBar title={t('library.navTitle')} subtitle={t('library.navSubtitle')} backLabel={t('library.back')} onBack={() => setLibraryTab('albums')} actions={<Badge tone=\"accent\">{t('library.plan')}</Badge>}/>"
  },
  {
    "name": "NumberField",
    "kind": "component",
    "description": "Native `type=\"number\"` input with `inputMode=\"decimal\"` and field-state\nstyling. Value and behaviour are governed entirely by the forwarded input\nattributes; the control supplies no text or label of its own.",
    "returnType": "JSX.Element",
    "parameters": [
      {
        "name": "props",
        "type": "InputHTMLAttributes<HTMLInputElement>",
        "optional": false,
        "description": "",
        "options": []
      }
    ],
    "props": [],
    "nativeElement": "input",
    "example": "<NumberField value={budget} min={0} onChange={(event) => setBudget(event.target.value)}/>"
  },
  {
    "name": "PhotoGrid",
    "kind": "component",
    "description": "Grid of photo buttons rendered from `items`. In selection mode the buttons\nexpose `aria-pressed` and call `onToggle`; otherwise they call `onOpen` with\nthe item's index. `label` and the per-button accessible names use English\ndefaults built from `item.alt`.",
    "returnType": "JSX.Element",
    "parameters": [
      {
        "name": "options",
        "type": "{ items: PhotoItem[]; selectedIds?: readonly string[]; selectionMode?: boolean; onToggle?: (id: string) => void; onOpen?: (index: number) => void; label?: string; }",
        "optional": false,
        "description": "",
        "options": [
          {
            "name": "items",
            "type": "PhotoItem[]",
            "optional": false,
            "description": ""
          },
          {
            "name": "selectedIds",
            "type": "readonly string[] | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "selectionMode",
            "type": "boolean | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "onToggle",
            "type": "((id: string) => void) | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "onOpen",
            "type": "((index: number) => void) | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "label",
            "type": "string | undefined",
            "optional": true,
            "description": ""
          }
        ]
      }
    ],
    "props": [
      {
        "name": "items",
        "type": "PhotoItem[]",
        "optional": false,
        "description": ""
      },
      {
        "name": "selectedIds",
        "type": "readonly string[] | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "selectionMode",
        "type": "boolean | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "onToggle",
        "type": "((id: string) => void) | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "onOpen",
        "type": "((index: number) => void) | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "label",
        "type": "string | undefined",
        "optional": true,
        "description": ""
      }
    ],
    "example": "<PhotoGrid items={photoItems} label={t('gallery.gridLabel')} selectionMode={selection.active} selectedIds={selection.selectedIds} onToggle={(id) => dispatchSelection({ type: 'toggle', id })} onOpen={setViewerIndex}/>"
  },
  {
    "name": "PhotoViewer",
    "kind": "component",
    "description": "Fullscreen dialog showing one photo with previous/next controls, a scrim and\nswipe/arrow-key navigation. `index` is controlled; steps are clamped by the\nshared media reducer. Escape or a downward swipe closes via `onClose`.\n`title` and the three button `labels` have English defaults.",
    "returnType": "JSX.Element",
    "parameters": [
      {
        "name": "options",
        "type": "{ items: PhotoItem[]; index: number; onIndexChange: (index: number) => void; onClose: () => void; title?: string; labels?: { close?: string; previous?: string; next?: string; }; }",
        "optional": false,
        "description": "",
        "options": [
          {
            "name": "items",
            "type": "PhotoItem[]",
            "optional": false,
            "description": ""
          },
          {
            "name": "index",
            "type": "number",
            "optional": false,
            "description": ""
          },
          {
            "name": "onIndexChange",
            "type": "(index: number) => void",
            "optional": false,
            "description": ""
          },
          {
            "name": "onClose",
            "type": "() => void",
            "optional": false,
            "description": ""
          },
          {
            "name": "title",
            "type": "string | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "labels",
            "type": "{ close?: string; previous?: string; next?: string; } | undefined",
            "optional": true,
            "description": ""
          }
        ]
      }
    ],
    "props": [
      {
        "name": "items",
        "type": "PhotoItem[]",
        "optional": false,
        "description": ""
      },
      {
        "name": "index",
        "type": "number",
        "optional": false,
        "description": ""
      },
      {
        "name": "onIndexChange",
        "type": "(index: number) => void",
        "optional": false,
        "description": ""
      },
      {
        "name": "onClose",
        "type": "() => void",
        "optional": false,
        "description": ""
      },
      {
        "name": "title",
        "type": "string | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "labels",
        "type": "{ close?: string; previous?: string; next?: string; } | undefined",
        "optional": true,
        "description": ""
      }
    ],
    "example": "<PhotoViewer items={photoItems} index={viewerIndex} onIndexChange={setViewerIndex} onClose={() => setViewerIndex(null)} title={t('gallery.viewerLabel')}/>"
  },
  {
    "name": "Popover",
    "kind": "component",
    "description": "Small anchored dialog rendered only while `open`. A document-level pointer\nlistener closes it on outside presses and Escape also calls `onClose`; both\nlisteners are attached only while open. Visibility is fully controlled by\nthe caller, and `label` supplies its accessible name.",
    "returnType": "JSX.Element | null",
    "parameters": [
      {
        "name": "options",
        "type": "{ open: boolean; onClose: () => void; label: string; children: ReactNode; }",
        "optional": false,
        "description": "",
        "options": [
          {
            "name": "open",
            "type": "boolean",
            "optional": false,
            "description": ""
          },
          {
            "name": "onClose",
            "type": "() => void",
            "optional": false,
            "description": ""
          },
          {
            "name": "label",
            "type": "string",
            "optional": false,
            "description": ""
          },
          {
            "name": "children",
            "type": "ReactNode",
            "optional": false,
            "description": ""
          }
        ]
      }
    ],
    "props": [
      {
        "name": "open",
        "type": "boolean",
        "optional": false,
        "description": ""
      },
      {
        "name": "onClose",
        "type": "() => void",
        "optional": false,
        "description": ""
      },
      {
        "name": "label",
        "type": "string",
        "optional": false,
        "description": ""
      },
      {
        "name": "children",
        "type": "ReactNode",
        "optional": false,
        "description": ""
      }
    ],
    "example": "<Popover open label={t('progress.popover')} onClose={() => setPopoverOpen(false)}>\n  {/* content */}\n</Popover>"
  },
  {
    "name": "PressGlow",
    "kind": "component",
    "description": "Decorative bloom layer for an element using `useDeform().style`. `pulse`\nremounts the layer per press; `held` keeps it visible until release. It is\naria-hidden, never focusable, and returns null when `pulse` is zero.",
    "returnType": "JSX.Element | null",
    "parameters": [
      {
        "name": "options",
        "type": "{ pulse: number; held?: boolean; }",
        "optional": false,
        "description": "",
        "options": [
          {
            "name": "pulse",
            "type": "number",
            "optional": false,
            "description": ""
          },
          {
            "name": "held",
            "type": "boolean | undefined",
            "optional": true,
            "description": ""
          }
        ]
      }
    ],
    "props": [
      {
        "name": "pulse",
        "type": "number",
        "optional": false,
        "description": ""
      },
      {
        "name": "held",
        "type": "boolean | undefined",
        "optional": true,
        "description": ""
      }
    ],
    "example": ""
  },
  {
    "name": "ProgressBar",
    "kind": "component",
    "description": "Determinate progress bar exposing ARIA value semantics and a visible\npercentage. `value` is clamped to 0–`max` for the fill width while the raw\n`value` is reported to assistive tech; `max <= 0` renders an empty bar.\n`label` is a prop with an English default.",
    "returnType": "JSX.Element",
    "parameters": [
      {
        "name": "options",
        "type": "{ value: number; max?: number; label?: string; }",
        "optional": false,
        "description": "",
        "options": [
          {
            "name": "value",
            "type": "number",
            "optional": false,
            "description": ""
          },
          {
            "name": "max",
            "type": "number | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "label",
            "type": "string | undefined",
            "optional": true,
            "description": ""
          }
        ]
      }
    ],
    "props": [
      {
        "name": "value",
        "type": "number",
        "optional": false,
        "description": ""
      },
      {
        "name": "max",
        "type": "number | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "label",
        "type": "string | undefined",
        "optional": true,
        "description": ""
      }
    ],
    "example": "<ProgressBar value={quality} label={t('progress.loading')}/>"
  },
  {
    "name": "RadioGroup",
    "kind": "component",
    "description": "Controlled radio group: `value` and `onChange` come from the caller, with\nonly the checked option in the tab order. Arrow Up/Down wrap through the\noptions and call `onChange`. Option labels, including the group `label`, are\ncaller-supplied; no English defaults are built in.",
    "returnType": "JSX.Element",
    "parameters": [
      {
        "name": "options",
        "type": "{ options: Array<RadioOption<T>>; value: T; onChange: (value: T) => void; label: string; }",
        "optional": false,
        "description": "",
        "options": [
          {
            "name": "options",
            "type": "RadioOption<T>[]",
            "optional": false,
            "description": ""
          },
          {
            "name": "value",
            "type": "T",
            "optional": false,
            "description": ""
          },
          {
            "name": "onChange",
            "type": "(value: T) => void",
            "optional": false,
            "description": ""
          },
          {
            "name": "label",
            "type": "string",
            "optional": false,
            "description": ""
          }
        ]
      }
    ],
    "props": [
      {
        "name": "options",
        "type": "RadioOption<T>[]",
        "optional": false,
        "description": ""
      },
      {
        "name": "value",
        "type": "T",
        "optional": false,
        "description": ""
      },
      {
        "name": "onChange",
        "type": "(value: T) => void",
        "optional": false,
        "description": ""
      },
      {
        "name": "label",
        "type": "string",
        "optional": false,
        "description": ""
      }
    ],
    "example": "<RadioGroup label={t('create.visibility')} value={visibility} onChange={setVisibility} options={[\n        { value: 'private', label: t('create.private') },\n        { value: 'shared', label: t('create.shared') },\n    ]}/>"
  },
  {
    "name": "Row",
    "kind": "component",
    "description": "Minimal horizontal layout container forwarding native `div` attributes and a\ncaller-supplied class name. It renders `children` unchanged and provides no\ntext or labels of its own.",
    "returnType": "JSX.Element",
    "parameters": [
      {
        "name": "props",
        "type": "HTMLAttributes<HTMLDivElement>",
        "optional": false,
        "description": "",
        "options": []
      }
    ],
    "props": [],
    "nativeElement": "html",
    "example": ""
  },
  {
    "name": "SearchBar",
    "kind": "component",
    "description": "Controlled search input with a leading icon and a clear button that appears\nonly when `value` is non-empty. Clearing calls `onChange('')` then `onClear`.\n`placeholder`, `label` and `clearLabel` are props with English defaults.",
    "returnType": "JSX.Element",
    "parameters": [
      {
        "name": "options",
        "type": "{ value: string; onChange: (value: string) => void; placeholder?: string; label?: string; clearLabel?: string; onClear?: () => void; }",
        "optional": false,
        "description": "",
        "options": [
          {
            "name": "value",
            "type": "string",
            "optional": false,
            "description": ""
          },
          {
            "name": "onChange",
            "type": "(value: string) => void",
            "optional": false,
            "description": ""
          },
          {
            "name": "placeholder",
            "type": "string | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "label",
            "type": "string | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "clearLabel",
            "type": "string | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "onClear",
            "type": "(() => void) | undefined",
            "optional": true,
            "description": ""
          }
        ]
      }
    ],
    "props": [
      {
        "name": "value",
        "type": "string",
        "optional": false,
        "description": ""
      },
      {
        "name": "onChange",
        "type": "(value: string) => void",
        "optional": false,
        "description": ""
      },
      {
        "name": "placeholder",
        "type": "string | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "label",
        "type": "string | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "clearLabel",
        "type": "string | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "onClear",
        "type": "(() => void) | undefined",
        "optional": true,
        "description": ""
      }
    ],
    "example": "<SearchBar value={searchText} onChange={setSearchText} label={t('create.search')} placeholder={t('create.searchPlaceholder')}/>"
  },
  {
    "name": "Segmented",
    "kind": "component",
    "description": "iOS-style segmented control rendering a measured pill over option buttons.\nControlled through `value`/`onChange`; slot geometry is measured in a layout\neffect so the pill mounts at its final size and snaps on drag release.\nOnly the selected pill is draggable; arrow/Home/End keys change selection.\nOption labels and the optional `label` are supplied by props.\n\nThe drag engine lives in `useSegmentPillDrag`: the outer pill is a static\nseat that only owns the slot `left`/`width`, while a persistent inner layer\nowns the whole visible pill. `translate` carries the damped follow and\nuseDeform's `transform` supplies scale/elastic feedback on that same layer, so\nthe two compose instead of cancelling. Releases are re-based against the new\nseat so a drag that ends on the last slot never jumps or rebounds.",
    "returnType": "JSX.Element",
    "parameters": [
      {
        "name": "options",
        "type": "{ options: SegmentOption<T>[]; value: T; onChange: (v: T) => void; label?: string; deform?: boolean; }",
        "optional": false,
        "description": "",
        "options": [
          {
            "name": "options",
            "type": "SegmentOption<T>[]",
            "optional": false,
            "description": ""
          },
          {
            "name": "value",
            "type": "T",
            "optional": false,
            "description": ""
          },
          {
            "name": "onChange",
            "type": "(v: T) => void",
            "optional": false,
            "description": ""
          },
          {
            "name": "label",
            "type": "string | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "deform",
            "type": "boolean | undefined",
            "optional": true,
            "description": ""
          }
        ]
      }
    ],
    "props": [
      {
        "name": "options",
        "type": "SegmentOption<T>[]",
        "optional": false,
        "description": ""
      },
      {
        "name": "value",
        "type": "T",
        "optional": false,
        "description": ""
      },
      {
        "name": "onChange",
        "type": "(v: T) => void",
        "optional": false,
        "description": ""
      },
      {
        "name": "label",
        "type": "string | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "deform",
        "type": "boolean | undefined",
        "optional": true,
        "description": ""
      }
    ],
    "example": "<Segmented label={t('settings.filter')} value={filter} onChange={setFilter} options={[\n        { value: 'all', label: t('settings.all') },\n        { value: 'active', label: t('settings.active') },\n        { value: 'archived', label: t('settings.archived') },\n    ]}/>"
  },
  {
    "name": "Select",
    "kind": "component",
    "description": "Custom listbox-style dropdown supporting rich option content (leading nodes,\nicons) with full keyboard and ARIA combobox behavior.\nControlled via `value` or uncontrolled via `defaultValue`; closes on outside\npointerdown or Escape (focus returns to the trigger on select and Escape).\nA vertical-dominant trigger drag opens the menu toward the drag; a\nhorizontal-dominant drag is ignored; a plain click toggles. On touch the drag\narms only after a long press, so swiping the page over the trigger scrolls\ninstead of opening the menu.\n`placeholder` defaults to 'Select...'; labels come from props or children.",
    "returnType": "JSX.Element",
    "parameters": [
      {
        "name": "options",
        "type": "SelectProps<T>",
        "optional": false,
        "description": "",
        "options": [
          {
            "name": "options",
            "type": "SelectOption<T>[] | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "value",
            "type": "T | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "defaultValue",
            "type": "T | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "onChange",
            "type": "((event: SelectChangeEvent<T>) => void) | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "placeholder",
            "type": "string | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "label",
            "type": "string | undefined",
            "optional": true,
            "description": "Alias for aria-label"
          },
          {
            "name": "aria-label",
            "type": "string | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "disabled",
            "type": "boolean | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "className",
            "type": "string | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "id",
            "type": "string | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "name",
            "type": "string | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "deform",
            "type": "boolean | undefined",
            "optional": true,
            "description": "Elastic drag feedback. Defaults to true."
          },
          {
            "name": "children",
            "type": "ReactNode",
            "optional": true,
            "description": "Backward compatibility: <option> children"
          }
        ]
      }
    ],
    "props": [
      {
        "name": "options",
        "type": "SelectOption<T>[] | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "value",
        "type": "T | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "defaultValue",
        "type": "T | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "onChange",
        "type": "((event: SelectChangeEvent<T>) => void) | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "placeholder",
        "type": "string | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "label",
        "type": "string | undefined",
        "optional": true,
        "description": "Alias for aria-label"
      },
      {
        "name": "aria-label",
        "type": "string | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "disabled",
        "type": "boolean | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "className",
        "type": "string | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "id",
        "type": "string | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "name",
        "type": "string | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "deform",
        "type": "boolean | undefined",
        "optional": true,
        "description": "Elastic drag feedback. Defaults to true."
      },
      {
        "name": "children",
        "type": "ReactNode",
        "optional": true,
        "description": "Backward compatibility: <option> children"
      }
    ],
    "example": "<Select value={selectValue} onChange={(event) => setSelectValue(event.target.value)} options={[\n        { value: 'newest', label: t('settings.newest') },\n        { value: 'oldest', label: t('settings.oldest') },\n        { value: 'name', label: t('settings.byName') },\n    ]}/>"
  },
  {
    "name": "Sheet",
    "kind": "component",
    "description": "Modal sheet rendering a scrim, panel, title, close button, and children.\nControlled by `open`; the scrim, close button, and Escape call `onClose`.\nFocus moves to the close button on open and is restored on close.\n`title` and `closeLabel` come from props; the close label defaults to English.",
    "returnType": "JSX.Element | null",
    "parameters": [
      {
        "name": "options",
        "type": "{ open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; style?: CSSProperties; closeLabel?: string; }",
        "optional": false,
        "description": "",
        "options": [
          {
            "name": "open",
            "type": "boolean",
            "optional": false,
            "description": ""
          },
          {
            "name": "onClose",
            "type": "() => void",
            "optional": false,
            "description": ""
          },
          {
            "name": "title",
            "type": "ReactNode",
            "optional": false,
            "description": ""
          },
          {
            "name": "children",
            "type": "ReactNode",
            "optional": false,
            "description": ""
          },
          {
            "name": "style",
            "type": "CSSProperties | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "closeLabel",
            "type": "string | undefined",
            "optional": true,
            "description": ""
          }
        ]
      }
    ],
    "props": [
      {
        "name": "open",
        "type": "boolean",
        "optional": false,
        "description": ""
      },
      {
        "name": "onClose",
        "type": "() => void",
        "optional": false,
        "description": ""
      },
      {
        "name": "title",
        "type": "ReactNode",
        "optional": false,
        "description": ""
      },
      {
        "name": "children",
        "type": "ReactNode",
        "optional": false,
        "description": ""
      },
      {
        "name": "style",
        "type": "CSSProperties | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "closeLabel",
        "type": "string | undefined",
        "optional": true,
        "description": ""
      }
    ],
    "example": "<Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={t('intro.title')}>\n  {/* content */}\n</Sheet>"
  },
  {
    "name": "Skeleton",
    "kind": "component",
    "description": "Decorative shimmer placeholder for loading states, hidden from assistive\ntechnology. `width` and `height` default to 100% and 16px.",
    "returnType": "JSX.Element",
    "parameters": [
      {
        "name": "options",
        "type": "{ width?: string; height?: string; }",
        "optional": false,
        "description": "",
        "options": [
          {
            "name": "width",
            "type": "string | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "height",
            "type": "string | undefined",
            "optional": true,
            "description": ""
          }
        ]
      }
    ],
    "props": [
      {
        "name": "width",
        "type": "string | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "height",
        "type": "string | undefined",
        "optional": true,
        "description": ""
      }
    ],
    "example": "<Skeleton width=\"70%\"/>"
  },
  {
    "name": "SliderRow",
    "kind": "component",
    "description": "Labelled native range input with a live formatted value output.\nFully controlled through `value`/`onChange`; `label` and `fmt` are supplied\nby props (there is no default label).",
    "returnType": "JSX.Element",
    "parameters": [
      {
        "name": "options",
        "type": "{ label: string; min: number; max: number; step: number; value: number; fmt: (v: number) => string; onChange: (v: number) => void; }",
        "optional": false,
        "description": "",
        "options": [
          {
            "name": "label",
            "type": "string",
            "optional": false,
            "description": ""
          },
          {
            "name": "min",
            "type": "number",
            "optional": false,
            "description": ""
          },
          {
            "name": "max",
            "type": "number",
            "optional": false,
            "description": ""
          },
          {
            "name": "step",
            "type": "number",
            "optional": false,
            "description": ""
          },
          {
            "name": "value",
            "type": "number",
            "optional": false,
            "description": ""
          },
          {
            "name": "fmt",
            "type": "(v: number) => string",
            "optional": false,
            "description": ""
          },
          {
            "name": "onChange",
            "type": "(v: number) => void",
            "optional": false,
            "description": ""
          }
        ]
      }
    ],
    "props": [
      {
        "name": "label",
        "type": "string",
        "optional": false,
        "description": ""
      },
      {
        "name": "min",
        "type": "number",
        "optional": false,
        "description": ""
      },
      {
        "name": "max",
        "type": "number",
        "optional": false,
        "description": ""
      },
      {
        "name": "step",
        "type": "number",
        "optional": false,
        "description": ""
      },
      {
        "name": "value",
        "type": "number",
        "optional": false,
        "description": ""
      },
      {
        "name": "fmt",
        "type": "(v: number) => string",
        "optional": false,
        "description": ""
      },
      {
        "name": "onChange",
        "type": "(v: number) => void",
        "optional": false,
        "description": ""
      }
    ],
    "example": "<SliderRow label={t('settings.quality')} min={10} max={100} step={5} value={quality} fmt={(v) => `${v}%`} onChange={setQuality}/>"
  },
  {
    "name": "Stack",
    "kind": "component",
    "description": "Vertical layout container that maps `gap` to a data attribute for styling\nand forwards all other div attributes. Defaults to the `md` gap.",
    "returnType": "JSX.Element",
    "parameters": [
      {
        "name": "options",
        "type": "HTMLAttributes<HTMLDivElement> & { gap?: \"sm\" | \"md\" | \"lg\"; }",
        "optional": false,
        "description": "",
        "options": [
          {
            "name": "gap",
            "type": "\"sm\" | \"md\" | \"lg\" | undefined",
            "optional": true,
            "description": ""
          }
        ]
      }
    ],
    "props": [
      {
        "name": "gap",
        "type": "\"sm\" | \"md\" | \"lg\" | undefined",
        "optional": true,
        "description": ""
      }
    ],
    "example": ""
  },
  {
    "name": "Stat",
    "kind": "component",
    "description": "Compact stat displaying a value above its label, with an optional tone\nclass. `label` and `value` come from props.",
    "returnType": "JSX.Element",
    "parameters": [
      {
        "name": "options",
        "type": "{ label: string; value: ReactNode; tone?: \"accent\" | \"success\" | \"danger\"; }",
        "optional": false,
        "description": "",
        "options": [
          {
            "name": "label",
            "type": "string",
            "optional": false,
            "description": ""
          },
          {
            "name": "value",
            "type": "ReactNode",
            "optional": false,
            "description": ""
          },
          {
            "name": "tone",
            "type": "\"accent\" | \"success\" | \"danger\" | undefined",
            "optional": true,
            "description": ""
          }
        ]
      }
    ],
    "props": [
      {
        "name": "label",
        "type": "string",
        "optional": false,
        "description": ""
      },
      {
        "name": "value",
        "type": "ReactNode",
        "optional": false,
        "description": ""
      },
      {
        "name": "tone",
        "type": "\"accent\" | \"success\" | \"danger\" | undefined",
        "optional": true,
        "description": ""
      }
    ],
    "example": "<Stat label={t('upload.albums')} value={12} tone=\"accent\"/>"
  },
  {
    "name": "StatusStat",
    "kind": "component",
    "description": "Status stat pairing a value and label with a status icon and color.\nSuccess/danger colors stay fixed rather than following the theme accent.\n`label` and `value` are supplied by props; the icon is decorative.",
    "returnType": "JSX.Element",
    "parameters": [
      {
        "name": "options",
        "type": "{ label: string; value: ReactNode; status: \"success\" | \"danger\" | \"neutral\"; }",
        "optional": false,
        "description": "",
        "options": [
          {
            "name": "label",
            "type": "string",
            "optional": false,
            "description": ""
          },
          {
            "name": "value",
            "type": "ReactNode",
            "optional": false,
            "description": ""
          },
          {
            "name": "status",
            "type": "\"neutral\" | \"success\" | \"danger\"",
            "optional": false,
            "description": ""
          }
        ]
      }
    ],
    "props": [
      {
        "name": "label",
        "type": "string",
        "optional": false,
        "description": ""
      },
      {
        "name": "value",
        "type": "ReactNode",
        "optional": false,
        "description": ""
      },
      {
        "name": "status",
        "type": "\"neutral\" | \"success\" | \"danger\"",
        "optional": false,
        "description": ""
      }
    ],
    "example": "<StatusStat label={t('upload.success')} value={24} status=\"success\"/>"
  },
  {
    "name": "Stepper",
    "kind": "component",
    "description": "Numeric stepper with decrement/increment buttons and a polite live output.\nControlled via `value`/`onChange`; steps are clamped to `min`/`max` (0-99 by\ndefault) and buttons disable at the bounds. `label`, `decreaseLabel` and\n`increaseLabel` are supplied by props and default to English.",
    "returnType": "JSX.Element",
    "parameters": [
      {
        "name": "options",
        "type": "{ value: number; onChange: (value: number) => void; min?: number; max?: number; step?: number; label: string; decreaseLabel?: string; increaseLabel?: string; }",
        "optional": false,
        "description": "",
        "options": [
          {
            "name": "value",
            "type": "number",
            "optional": false,
            "description": ""
          },
          {
            "name": "onChange",
            "type": "(value: number) => void",
            "optional": false,
            "description": ""
          },
          {
            "name": "min",
            "type": "number | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "max",
            "type": "number | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "step",
            "type": "number | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "label",
            "type": "string",
            "optional": false,
            "description": ""
          },
          {
            "name": "decreaseLabel",
            "type": "string | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "increaseLabel",
            "type": "string | undefined",
            "optional": true,
            "description": ""
          }
        ]
      }
    ],
    "props": [
      {
        "name": "value",
        "type": "number",
        "optional": false,
        "description": ""
      },
      {
        "name": "onChange",
        "type": "(value: number) => void",
        "optional": false,
        "description": ""
      },
      {
        "name": "min",
        "type": "number | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "max",
        "type": "number | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "step",
        "type": "number | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "label",
        "type": "string",
        "optional": false,
        "description": ""
      },
      {
        "name": "decreaseLabel",
        "type": "string | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "increaseLabel",
        "type": "string | undefined",
        "optional": true,
        "description": ""
      }
    ],
    "example": "<Stepper label={t('create.copies')} value={copies} min={1} max={5} onChange={setCopies}/>"
  },
  {
    "name": "Switch",
    "kind": "component",
    "description": "Toggle switch with `aria-checked` synced to the controlled `checked` prop.\nClicking calls `onChange` with the toggled value. A touch drag arms only\nafter a long press, so swiping the page never flips the switch; dragging the\nknob then follows the pointer (with `Deformable` supplying stretch/squash\nfeedback) and commits the side it ends on. Mouse drags stay immediate.\nPress phases and click suppression come from the shared gesture machine.\n`label` is supplied by props and used as the accessible name.",
    "returnType": "JSX.Element",
    "parameters": [
      {
        "name": "options",
        "type": "{ checked: boolean; onChange: (v: boolean) => void; label: string; deform?: boolean; }",
        "optional": false,
        "description": "",
        "options": [
          {
            "name": "checked",
            "type": "boolean",
            "optional": false,
            "description": ""
          },
          {
            "name": "onChange",
            "type": "(v: boolean) => void",
            "optional": false,
            "description": ""
          },
          {
            "name": "label",
            "type": "string",
            "optional": false,
            "description": ""
          },
          {
            "name": "deform",
            "type": "boolean | undefined",
            "optional": true,
            "description": ""
          }
        ]
      }
    ],
    "props": [
      {
        "name": "checked",
        "type": "boolean",
        "optional": false,
        "description": ""
      },
      {
        "name": "onChange",
        "type": "(v: boolean) => void",
        "optional": false,
        "description": ""
      },
      {
        "name": "label",
        "type": "string",
        "optional": false,
        "description": ""
      },
      {
        "name": "deform",
        "type": "boolean | undefined",
        "optional": true,
        "description": ""
      }
    ],
    "example": "<Switch checked={backup} onChange={setBackup} label={t('settings.backup')}/>"
  },
  {
    "name": "TabBar",
    "kind": "component",
    "description": "iOS-style navigation tab bar rendering a tab per item in a nav landmark.\nControlled via `value`/`onChange`; arrow/Home/End keys move selection.\n`label` defaults to 'Sections'; item labels, icons, and badges come from props.",
    "returnType": "JSX.Element",
    "parameters": [
      {
        "name": "options",
        "type": "{ items: Array<TabItem<T>>; value: T; onChange: (value: T) => void; label?: string; variant?: \"inline\" | \"fixed\"; }",
        "optional": false,
        "description": "",
        "options": [
          {
            "name": "items",
            "type": "TabItem<T>[]",
            "optional": false,
            "description": ""
          },
          {
            "name": "value",
            "type": "T",
            "optional": false,
            "description": ""
          },
          {
            "name": "onChange",
            "type": "(value: T) => void",
            "optional": false,
            "description": ""
          },
          {
            "name": "label",
            "type": "string | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "variant",
            "type": "\"inline\" | \"fixed\" | undefined",
            "optional": true,
            "description": ""
          }
        ]
      }
    ],
    "props": [
      {
        "name": "items",
        "type": "TabItem<T>[]",
        "optional": false,
        "description": ""
      },
      {
        "name": "value",
        "type": "T",
        "optional": false,
        "description": ""
      },
      {
        "name": "onChange",
        "type": "(value: T) => void",
        "optional": false,
        "description": ""
      },
      {
        "name": "label",
        "type": "string | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "variant",
        "type": "\"inline\" | \"fixed\" | undefined",
        "optional": true,
        "description": ""
      }
    ],
    "example": "<TabBar variant=\"inline\" label={t('library.tabsLabel')} value={libraryTab} onChange={setLibraryTab} items={[\n        { value: 'albums', label: t('library.tabAlbums'), icon: <LayoutGrid /> },\n        { value: 'shared', label: t('library.tabShared'), icon: <CircleDot /> },\n        { value: 'archive', label: t('library.tabArchive'), icon: <Clock />, badge: '3' },\n    ]}/>"
  },
  {
    "name": "TextArea",
    "kind": "component",
    "description": "Native multi-line text input with field-state styling. Forwards all textarea\nattributes; labels and placeholder come from the caller.",
    "returnType": "JSX.Element",
    "parameters": [
      {
        "name": "props",
        "type": "TextareaHTMLAttributes<HTMLTextAreaElement>",
        "optional": false,
        "description": "",
        "options": []
      }
    ],
    "props": [],
    "nativeElement": "textarea",
    "example": "import { FormField, TextArea } from '@ilovecode33/ui';\n\n<FormField label=\"Notes\" hint=\"Optional description\">\n  <TextArea id=\"notes\" name=\"notes\" rows={4} placeholder=\"Add notes\" />\n</FormField>"
  },
  {
    "name": "TextInput",
    "kind": "component",
    "description": "Native single-line text input with field-state styling. Forwards all input\nattributes; labels and placeholder come from the caller.",
    "returnType": "JSX.Element",
    "parameters": [
      {
        "name": "props",
        "type": "InputHTMLAttributes<HTMLInputElement>",
        "optional": false,
        "description": "",
        "options": []
      }
    ],
    "props": [],
    "nativeElement": "input",
    "example": "import { FormField, TextInput } from '@ilovecode33/ui';\n\n<FormField label=\"Album name\" hint=\"Up to 20 characters\">\n  <TextInput id=\"album-name\" name=\"albumName\" placeholder=\"Album name\" />\n</FormField>"
  },
  {
    "name": "ThemeProvider",
    "kind": "component",
    "description": "Provides theme context, applying the saved/default theme to `data-theme`\nin a layout effect so dark mode is set before paint. Reads saved preferences\non mount, follows system changes for `system`, and persists to localStorage.",
    "returnType": "JSX.Element",
    "parameters": [
      {
        "name": "options",
        "type": "{ children: ReactNode; defaultTheme?: Theme; }",
        "optional": false,
        "description": "",
        "options": [
          {
            "name": "children",
            "type": "ReactNode",
            "optional": false,
            "description": ""
          },
          {
            "name": "defaultTheme",
            "type": "Theme | undefined",
            "optional": true,
            "description": ""
          }
        ]
      }
    ],
    "props": [
      {
        "name": "children",
        "type": "ReactNode",
        "optional": false,
        "description": ""
      },
      {
        "name": "defaultTheme",
        "type": "Theme | undefined",
        "optional": true,
        "description": ""
      }
    ],
    "example": ""
  },
  {
    "name": "ThemeSwitcher",
    "kind": "component",
    "description": "Three-option appearance picker (system / light / dark) with `aria-pressed`\nsynced to the current theme. A sliding pill reuses the same drag engine as\n`Segmented` (`useSegmentPillDrag`), so the appearance control feels identical:\nheavy breakaway, damped follow, and a re-based settle with no boundary\nrebound. Labels default to English and can be passed via `labels`.",
    "returnType": "JSX.Element",
    "parameters": [
      {
        "name": "options",
        "type": "{ labels?: ThemeSwitcherLabels; }",
        "optional": false,
        "description": "",
        "options": [
          {
            "name": "labels",
            "type": "ThemeSwitcherLabels | undefined",
            "optional": true,
            "description": ""
          }
        ]
      }
    ],
    "props": [
      {
        "name": "labels",
        "type": "ThemeSwitcherLabels | undefined",
        "optional": true,
        "description": ""
      }
    ],
    "example": "<ThemeSwitcher labels={{\n        group: t('theme.group'),\n        system: t('theme.system'),\n        light: t('theme.light'),\n        dark: t('theme.dark'),\n    }}/>"
  },
  {
    "name": "Thumbnail",
    "kind": "component",
    "description": "Small square thumbnail rendering a lazy-loaded image, or an emoji fallback\nthat is hidden from assistive technology. `alt` defaults to an empty string.",
    "returnType": "JSX.Element",
    "parameters": [
      {
        "name": "options",
        "type": "{ src?: string; alt?: string; emoji?: ReactNode; }",
        "optional": false,
        "description": "",
        "options": [
          {
            "name": "src",
            "type": "string | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "alt",
            "type": "string | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "emoji",
            "type": "ReactNode",
            "optional": true,
            "description": ""
          }
        ]
      }
    ],
    "props": [
      {
        "name": "src",
        "type": "string | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "alt",
        "type": "string | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "emoji",
        "type": "ReactNode",
        "optional": true,
        "description": ""
      }
    ],
    "example": "<Thumbnail emoji=\"🌅\"/>"
  },
  {
    "name": "Toast",
    "kind": "component",
    "description": "Conditionally rendered transient message with tone styling and optional\naction/dismiss buttons. Renders nothing when `visible` is false; danger\nmessages are announced assertively. `message`, `actionLabel`, and\n`dismissLabel` (default 'Dismiss') come from props.",
    "returnType": "JSX.Element | null",
    "parameters": [
      {
        "name": "options",
        "type": "{ tone?: FeedbackTone; message: string; visible: boolean; actionLabel?: string; onAction?: () => void; onDismiss?: () => void; dismissLabel?: string; }",
        "optional": false,
        "description": "",
        "options": [
          {
            "name": "tone",
            "type": "FeedbackTone | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "message",
            "type": "string",
            "optional": false,
            "description": ""
          },
          {
            "name": "visible",
            "type": "boolean",
            "optional": false,
            "description": ""
          },
          {
            "name": "actionLabel",
            "type": "string | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "onAction",
            "type": "(() => void) | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "onDismiss",
            "type": "(() => void) | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "dismissLabel",
            "type": "string | undefined",
            "optional": true,
            "description": ""
          }
        ]
      }
    ],
    "props": [
      {
        "name": "tone",
        "type": "FeedbackTone | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "message",
        "type": "string",
        "optional": false,
        "description": ""
      },
      {
        "name": "visible",
        "type": "boolean",
        "optional": false,
        "description": ""
      },
      {
        "name": "actionLabel",
        "type": "string | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "onAction",
        "type": "(() => void) | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "onDismiss",
        "type": "(() => void) | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "dismissLabel",
        "type": "string | undefined",
        "optional": true,
        "description": ""
      }
    ],
    "example": "<Toast tone=\"success\" message={t('progress.toast')} visible={toastVisible} actionLabel={t('progress.undo')} onAction={() => setToastVisible(false)} onDismiss={() => setToastVisible(false)}/>"
  },
  {
    "name": "UIFoundation",
    "kind": "component",
    "description": "Single entry point composing theme, accent, and locale context providers,\nwith `defaultTheme`/`defaultAccent` overrides.\nLocale is controlled via `locale` or uncontrolled via `defaultLocale`\n(default 'en'); dictionaries come from the host and `t` falls back to the key.\nWrapped content disables text selection; form fields keep it.",
    "returnType": "JSX.Element",
    "parameters": [
      {
        "name": "options",
        "type": "UIFoundationProps",
        "optional": false,
        "description": "",
        "options": [
          {
            "name": "children",
            "type": "ReactNode",
            "optional": false,
            "description": ""
          },
          {
            "name": "defaultTheme",
            "type": "Theme | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "defaultAccent",
            "type": "\"warmth\" | \"serenity\" | \"growth\" | \"gentle\" | \"vitality\" | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "locale",
            "type": "string | undefined",
            "optional": true,
            "description": "Controlled locale."
          },
          {
            "name": "defaultLocale",
            "type": "string | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "onLocaleChange",
            "type": "((locale: string) => void) | undefined",
            "optional": true,
            "description": ""
          },
          {
            "name": "dictionary",
            "type": "Record<string, string> | undefined",
            "optional": true,
            "description": "Active message map."
          },
          {
            "name": "dictionaries",
            "type": "Record<string, Record<string, string>> | undefined",
            "optional": true,
            "description": "All locales keyed by locale name; resolved from `locale`."
          },
          {
            "name": "localeStorageKey",
            "type": "string | undefined",
            "optional": true,
            "description": "localStorage key for the locale. Empty string disables persistence."
          },
          {
            "name": "className",
            "type": "string | undefined",
            "optional": true,
            "description": ""
          }
        ]
      }
    ],
    "props": [
      {
        "name": "children",
        "type": "ReactNode",
        "optional": false,
        "description": ""
      },
      {
        "name": "defaultTheme",
        "type": "Theme | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "defaultAccent",
        "type": "\"warmth\" | \"serenity\" | \"growth\" | \"gentle\" | \"vitality\" | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "locale",
        "type": "string | undefined",
        "optional": true,
        "description": "Controlled locale."
      },
      {
        "name": "defaultLocale",
        "type": "string | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "onLocaleChange",
        "type": "((locale: string) => void) | undefined",
        "optional": true,
        "description": ""
      },
      {
        "name": "dictionary",
        "type": "Record<string, string> | undefined",
        "optional": true,
        "description": "Active message map."
      },
      {
        "name": "dictionaries",
        "type": "Record<string, Record<string, string>> | undefined",
        "optional": true,
        "description": "All locales keyed by locale name; resolved from `locale`."
      },
      {
        "name": "localeStorageKey",
        "type": "string | undefined",
        "optional": true,
        "description": "localStorage key for the locale. Empty string disables persistence."
      },
      {
        "name": "className",
        "type": "string | undefined",
        "optional": true,
        "description": ""
      }
    ],
    "example": "import { Button, UIFoundation } from '@ilovecode33/ui';\n\n<UIFoundation defaultTheme=\"system\" defaultAccent=\"warmth\">\n  <Button variant=\"primary\">Save changes</Button>\n</UIFoundation>"
  },
  {
    "name": "useAccent",
    "kind": "hook",
    "description": "Return the accent context (`accent` and `setAccent`) supplied by\n`<AccentProvider>`. Throws when called outside that provider so consumers\nalways receive a non-null value.",
    "returnType": "AccentValue",
    "parameters": [],
    "props": [],
    "example": "function AccentAction() {\n  const { accent, setAccent } = useAccent();\n  return <button onClick={() => setAccent('serenity')}>Accent: {accent}</button>;\n}"
  },
  {
    "name": "useDeform",
    "kind": "hook",
    "description": "Pointer-drag feedback returning handlers for the target, a transform/glow\nstyle, the deform state, and a `pulse` counter incremented per press. `max`\nis the px resistance limit, `axis` selects responsive directions, `enabled`\ndisables feedback, `touchAction` overrides the axis-derived default, and\n`longPressMs` delays touch gestures so page swipes still scroll.\n\nPress bookkeeping lives in `createGestureMachine`; this hook maps its phases\nto deform feedback, pointer capture, scroll blocking, and click suppression,\nand reports each snapshot through `onGesture`.",
    "returnType": "DeformResult",
    "parameters": [
      {
        "name": "options",
        "type": "DeformOptions",
        "optional": false,
        "description": "",
        "options": [
          {
            "name": "max",
            "type": "number | undefined",
            "optional": true,
            "description": "Resistance limit in px. Farther drags approach it asymptotically."
          },
          {
            "name": "axis",
            "type": "DeformAxis | undefined",
            "optional": true,
            "description": "Which axis responds to the drag."
          },
          {
            "name": "enabled",
            "type": "boolean | undefined",
            "optional": true,
            "description": "Set false to disable gesture feedback."
          },
          {
            "name": "touchAction",
            "type": "Property.TouchAction | undefined",
            "optional": true,
            "description": "Override `touch-action`; by axis: x → pan-y, y → pan-x, both → none."
          },
          {
            "name": "longPressMs",
            "type": "number | undefined",
            "optional": true,
            "description": "Touch press (ms) that arms drag feedback. Until it elapses, movement\nscrolls the page and never deforms the control. Mouse input is immediate."
          },
          {
            "name": "onGesture",
            "type": "((snapshot: GestureSnapshot) => void) | undefined",
            "optional": true,
            "description": "Observes the press and drag phases, e.g. to open a list on a vertical drag."
          }
        ]
      }
    ],
    "props": [],
    "example": "const motion = useDeform({ axis: 'x', touchAction: 'pan-y' });\nreturn <button {...motion.handlers} style={motion.style}>Drag me</button>;"
  },
  {
    "name": "useLocale",
    "kind": "hook",
    "description": "Return the locale context from `<UIFoundation>`: the active `locale`, `setLocale`,\nthe `t` translator, and the current `dictionary`. Throws outside the provider.",
    "returnType": "LocaleValue",
    "parameters": [],
    "props": [],
    "example": "function PageTitle() {\n  const { locale, t } = useLocale();\n  return <h1 lang={locale}>{t('settings.title')}</h1>;\n}"
  },
  {
    "name": "usePrefersReducedMotion",
    "kind": "hook",
    "description": "Track the `prefers-reduced-motion: reduce` media query. Initializes from the\ncurrent match (false on the server) and subscribes to changes for the lifetime\nof the component. Returns true while the user requests reduced motion.",
    "returnType": "boolean",
    "parameters": [],
    "props": [],
    "example": "const reduced = usePrefersReducedMotion();"
  },
  {
    "name": "useSegmentPillDrag",
    "kind": "hook",
    "description": "Shared pointer-drag engine for a sliding \"pill\" over a row of equal-or-mixed\nwidth options. It measures each `[data-index]` item inside `trackRef`, tracks\nthe weighted drag offset on a dedicated inner shift layer, re-bases the\npost-release settle against the new seat (so releasing at a boundary never\njumps or rebounds), and composes with `useDeform` for stretch/glow feedback.\n\nRender the returned refs/styles on three nested elements:\n`trackRef` → outer scroll/layout row, `thumbRef` → absolutely positioned\nseat, `shiftRef` → the visible pill carrying the drag offset.",
    "returnType": "{ trackRef: RefObject<HTMLDivElement | null>; thumbRef: RefObject<HTMLDivElement | null>; shiftRef: RefObject<HTMLDivElement | null>; slots: SegmentPillSlot[] | null; geometry: SegmentPillSlot; activeIndex: number; dragging: boolean; settling: boolean; hoveredIndex: number | null; setHoveredIndex: Dispatch<SetStateAction<number | null>>; glow: { x: number; y: number; held: boolean; }; handlers: { onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void; onPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void; onPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => void; onPointerCancel: (event: ReactPointerEvent<HTMLDivElement>) => void; }; thumbStyle: CSSProperties; shiftStyle: CSSProperties; }",
    "parameters": [
      {
        "name": "options",
        "type": "UseSegmentPillDragOptions<T>",
        "optional": false,
        "description": "",
        "options": [
          {
            "name": "values",
            "type": "readonly T[]",
            "optional": false,
            "description": "Option values in render order. Keep this reference or at least its length stable."
          },
          {
            "name": "value",
            "type": "T",
            "optional": false,
            "description": "Currently selected value; drives the settled seat."
          },
          {
            "name": "layoutKey",
            "type": "unknown",
            "optional": true,
            "description": "Re-measures slot geometry when the track switches between layouts."
          },
          {
            "name": "onChange",
            "type": "(value: T) => void",
            "optional": false,
            "description": "Called once on release when the pointer's nearest slot differs."
          },
          {
            "name": "onSlotChange",
            "type": "((value: T, index: number) => void) | undefined",
            "optional": true,
            "description": "Called immediately while dragging when the pointer crosses into a different slot."
          },
          {
            "name": "isDisabled",
            "type": "((index: number) => boolean) | undefined",
            "optional": true,
            "description": "Marks an index as non-draggable/non-selectable."
          },
          {
            "name": "deform",
            "type": "boolean | undefined",
            "optional": true,
            "description": "Disables the elastic deform feedback (still allows selection)."
          },
          {
            "name": "feel",
            "type": "SegmentPillFeel | undefined",
            "optional": true,
            "description": "Overrides the drag-feel constants (snap radius, dead zone, breakaway, magnet)."
          }
        ]
      }
    ],
    "props": [],
    "example": "const pill = useSegmentPillDrag({\n    values: items.map((item) => item.id),\n    value: activeId ?? items[0]?.id ?? '',\n    onChange: (id) => {\n        if (!dragHapticFiredRef.current)\n            triggerHaptic('selection');\n        dragHapticFiredRef.current = false;\n        onSelect?.(id);\n    },\n    onSlotChange: () => {\n        if (triggerHaptic('selection')) {\n            dragHapticFiredRef.current = true;\n        }\n    },\n    deform,\n    layoutKey: collapsed,\n});"
  },
  {
    "name": "useSelectionMode",
    "kind": "hook",
    "description": "Manage multi-selection mode with `selectionModeReducer`. `initial` seeds the\nselected ids while the mode starts inactive. Returns the `active` flag,\n`selectedIds`, and dispatchers for `toggle`, `enter`, `exit`, and `clear`;\nexiting or clearing empties the selection, while entering preserves it.",
    "returnType": "{ active: boolean; selectedIds: readonly string[]; toggle: (id: string) => void; enter: () => void; exit: () => void; clear: () => void; }",
    "parameters": [
      {
        "name": "initial",
        "type": "readonly string[]",
        "optional": false,
        "description": "",
        "options": []
      }
    ],
    "props": [],
    "example": "function PhotoSelection({ id }: { id: string }) {\n  const selection = useSelectionMode();\n  return (\n    <button\n      aria-pressed={selection.selectedIds.includes(id)}\n      onClick={() => selection.toggle(id)}\n    >\n      Select photo\n    </button>\n  );\n}"
  },
  {
    "name": "useTheme",
    "kind": "hook",
    "description": "Return the theme context: `theme`, the resolved `light`/`dark` value, and\n`setTheme`. Throws when used outside `<ThemeProvider>`.",
    "returnType": "ThemeValue",
    "parameters": [],
    "props": [],
    "example": "function ThemeStatus() {\n  const { resolved, setTheme } = useTheme();\n  return <button onClick={() => setTheme('system')}>Theme: {resolved}</button>;\n}"
  }
];
