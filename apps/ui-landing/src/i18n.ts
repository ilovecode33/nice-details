import { useEffect, useState } from 'react';

export const LOCALES = ['en', 'zh-TW', 'de'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  'zh-TW': '繁體中文',
  de: 'Deutsch',
};

const en = {
  'language.label': 'Language',

  'hero.eyebrow': 'Component gallery',
  'hero.title': '@ilovecode33/ui',
  'hero.subtitle': 'React Component Library',
  'hero.lead':
    'Buttons, forms, data display and overlays — seen together in real screens.',
  'hero.ctaDemo': 'Try it',
  'hero.ctaDetails': 'View details',

  'details.title': 'Component details',
  'details.subtitle': 'How each component looks in a real situation.',

  'upload.title': 'Album upload',
  'upload.subtitle': '26 photos in progress, results and next actions in one place',
  'upload.history': 'View history',
  'upload.albums': 'Albums',
  'upload.success': 'Uploaded',
  'upload.failed': 'Failed',
  'upload.retry': 'Retry 2 files',
  'upload.continue': 'Continue upload',

  'settings.title': 'Album settings',
  'settings.subtitle': 'Rename, sort, filter and adjust compression',
  'settings.name': 'Album name',
  'settings.nameHint': 'Up to 20 characters',
  'settings.namePlaceholder': 'Album name',
  'settings.albumDefault': 'Travel album',
  'settings.sort': 'Sort by',
  'settings.newest': 'Newest first',
  'settings.oldest': 'Oldest first',
  'settings.byName': 'By name',
  'settings.tone': 'Photo tone',
  'settings.toneHint': 'Each option shows its color',
  'settings.toneCurrent': 'Current tone',
  'settings.filter': 'Filter',
  'settings.all': 'All',
  'settings.active': 'Active',
  'settings.archived': 'Archived',
  'settings.backup': 'Auto backup',
  'settings.quality': 'Compression quality',

  'search.title': 'Search results',
  'search.subtitle': 'When nothing is found, offer the next step',
  'search.emptyTitle': 'No photos found',
  'search.emptyDetail': 'Try another keyword or change the filter',
  'search.add': 'Add photo',

  'delete.title': 'Delete photo',
  'delete.subtitle': 'Confirm before removing; cancel keeps everything as is',
  'delete.button': 'Delete this photo',

  'intro.title': 'Library features',
  'intro.body':
    'Any content can go here. Bottom sheet on phones, centered dialog on desktop. Tap the backdrop or ✕ to close.',
  'intro.gotIt': 'Got it',

  'confirm.title': 'Delete photo?',
  'confirm.body': 'This cannot be undone. Current photo:',
  'confirm.cancel': 'Cancel',
  'confirm.confirm': 'Delete',

  'footer': '© 2026 ilovecode33 · @ilovecode33/ui',

  'theme.group': 'Appearance',
  'theme.system': 'Follow system',
  'theme.light': 'Light',
  'theme.dark': 'Dark',

  'accent.group': 'Accent color',
  'accent.warmth': 'Warmth',
  'accent.serenity': 'Serenity',
  'accent.growth': 'Growth',
  'accent.gentle': 'Gentle',
  'accent.vitality': 'Vitality',

  'tone.warm': 'Warm orange',
  'tone.ocean': 'Ocean blue',
  'tone.forest': 'Forest green',
  'tone.violet': 'Violet',
  'tone.citrus': 'Citrus',
} as const;

export type TranslationKey = keyof typeof en;
type Dictionary = Record<TranslationKey, string>;

const zhTW: Dictionary = {
  'language.label': '語言',
  'hero.eyebrow': '元件展示',
  'hero.title': '@ilovecode33/ui',
  'hero.subtitle': 'React 組件庫',
  'hero.lead': '按鈕、表單、資訊呈現與彈出層，在實際畫面中一起看。',
  'hero.ctaDemo': '立即體驗',
  'hero.ctaDetails': '查看明細',
  'details.title': '組件明細',
  'details.subtitle': '同一個元件在不同情境下的實際樣子。',
  'upload.title': '相簿上傳',
  'upload.subtitle': '26 張照片正在處理，結果與下一步動作放在同一處',
  'upload.history': '查看紀錄',
  'upload.albums': '相簿數',
  'upload.success': '上傳成功',
  'upload.failed': '上傳失敗',
  'upload.retry': '重試 2 張',
  'upload.continue': '繼續上傳',
  'settings.title': '相簿設定',
  'settings.subtitle': '重新命名、排序、篩選與壓縮品質',
  'settings.name': '相簿名稱',
  'settings.nameHint': '最多 20 個字',
  'settings.namePlaceholder': '輸入相簿名稱',
  'settings.albumDefault': '旅行相簿',
  'settings.sort': '排序方式',
  'settings.newest': '由新到舊',
  'settings.oldest': '由舊到新',
  'settings.byName': '按名稱',
  'settings.tone': '照片色調',
  'settings.toneHint': '下拉選項直接顯示色彩範例',
  'settings.toneCurrent': '目前色調',
  'settings.filter': '篩選',
  'settings.all': '全部',
  'settings.active': '使用中',
  'settings.archived': '已封存',
  'settings.backup': '自動備份',
  'settings.quality': '壓縮品質',
  'search.title': '搜尋結果',
  'search.subtitle': '找不到照片時，直接給下一個動作',
  'search.emptyTitle': '找不到符合的照片',
  'search.emptyDetail': '試試其他關鍵字，或切換篩選條件',
  'search.add': '新增照片',
  'delete.title': '刪除照片',
  'delete.subtitle': '移除前先確認，取消則保持原狀',
  'delete.button': '刪除這張照片',
  'intro.title': '元件庫特色',
  'intro.body': '這裡可以放任何內容，手機上是底部彈出層，桌面置中顯示。按背景或 ✕ 關閉。',
  'intro.gotIt': '知道了',
  'confirm.title': '刪除照片？',
  'confirm.body': '刪除後無法復原。目前照片：',
  'confirm.cancel': '取消',
  'confirm.confirm': '確認刪除',
  'footer': '© 2026 ilovecode33 · @ilovecode33/ui',
  'theme.group': '外觀',
  'theme.system': '跟隨系統',
  'theme.light': '淺色',
  'theme.dark': '深色',
  'accent.group': '強調色',
  'accent.warmth': '暖意',
  'accent.serenity': '寧靜',
  'accent.growth': '生機',
  'accent.gentle': '溫柔',
  'accent.vitality': '活力',
  'tone.warm': '暖橙',
  'tone.ocean': '海藍',
  'tone.forest': '森林綠',
  'tone.violet': '紫羅蘭',
  'tone.citrus': '檸檬黃',
};

const de: Dictionary = {
  'language.label': 'Sprache',
  'hero.eyebrow': 'Komponentenübersicht',
  'hero.title': '@ilovecode33/ui',
  'hero.subtitle': 'React-Komponentenbibliothek',
  'hero.lead':
    'Buttons, Formulare, Datenanzeige und Overlays – gemeinsam in echten Ansichten.',
  'hero.ctaDemo': 'Ausprobieren',
  'hero.ctaDetails': 'Details ansehen',
  'details.title': 'Komponentendetails',
  'details.subtitle': 'So sieht jede Komponente in einer echten Situation aus.',
  'upload.title': 'Album-Upload',
  'upload.subtitle': '26 Fotos in Bearbeitung, Ergebnisse und nächste Schritte an einem Ort',
  'upload.history': 'Verlauf ansehen',
  'upload.albums': 'Alben',
  'upload.success': 'Hochgeladen',
  'upload.failed': 'Fehlgeschlagen',
  'upload.retry': '2 Dateien erneut versuchen',
  'upload.continue': 'Upload fortsetzen',
  'settings.title': 'Album-Einstellungen',
  'settings.subtitle': 'Umbenennen, sortieren, filtern und Kompression anpassen',
  'settings.name': 'Albumname',
  'settings.nameHint': 'Maximal 20 Zeichen',
  'settings.namePlaceholder': 'Albumname eingeben',
  'settings.albumDefault': 'Reisealbum',
  'settings.sort': 'Sortieren nach',
  'settings.newest': 'Neueste zuerst',
  'settings.oldest': 'Älteste zuerst',
  'settings.byName': 'Nach Name',
  'settings.tone': 'Farbton',
  'settings.toneHint': 'Jede Option zeigt ihre Farbe',
  'settings.toneCurrent': 'Aktueller Farbton',
  'settings.filter': 'Filtern',
  'settings.all': 'Alle',
  'settings.active': 'Aktiv',
  'settings.archived': 'Archiviert',
  'settings.backup': 'Automatische Sicherung',
  'settings.quality': 'Kompressionsqualität',
  'search.title': 'Suchergebnisse',
  'search.subtitle': 'Wenn nichts gefunden wird, den nächsten Schritt anbieten',
  'search.emptyTitle': 'Keine Fotos gefunden',
  'search.emptyDetail': 'Anderen Suchbegriff versuchen oder Filter ändern',
  'search.add': 'Foto hinzufügen',
  'delete.title': 'Foto löschen',
  'delete.subtitle': 'Vor dem Löschen bestätigen; Abbrechen ändert nichts',
  'delete.button': 'Dieses Foto löschen',
  'intro.title': 'Bibliotheksfunktionen',
  'intro.body':
    'Hier kann beliebiger Inhalt stehen. Auf dem Telefon ein Bottom Sheet, auf dem Desktop ein zentriertes Dialogfenster. Hintergrund oder ✕ schließt es.',
  'intro.gotIt': 'Verstanden',
  'confirm.title': 'Foto löschen?',
  'confirm.body': 'Dies kann nicht rückgängig gemacht werden. Aktuelles Foto:',
  'confirm.cancel': 'Abbrechen',
  'confirm.confirm': 'Löschen',
  'footer': '© 2026 ilovecode33 · @ilovecode33/ui',
  'theme.group': 'Darstellung',
  'theme.system': 'System folgen',
  'theme.light': 'Hell',
  'theme.dark': 'Dunkel',
  'accent.group': 'Akzentfarbe',
  'accent.warmth': 'Wärme',
  'accent.serenity': 'Ruhe',
  'accent.growth': 'Wachstum',
  'accent.gentle': 'Sanft',
  'accent.vitality': 'Lebendig',
  'tone.warm': 'Warmes Orange',
  'tone.ocean': 'Ozeanblau',
  'tone.forest': 'Waldgrün',
  'tone.violet': 'Violett',
  'tone.citrus': 'Zitronengelb',
};

const dictionaries: Record<Locale, Dictionary> = { en, 'zh-TW': zhTW, de };

const STORAGE_KEY = 'ui-landing.locale';

function readSaved(): Locale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && (LOCALES as readonly string[]).includes(saved)) {
      return saved as Locale;
    }
  } catch {
    /* storage unavailable */
  }
  return DEFAULT_LOCALE;
}

export function useI18n() {
  const [locale, setLocale] = useState<Locale>(readSaved);

  useEffect(() => {
    document.documentElement.lang = locale;
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      /* storage unavailable */
    }
  }, [locale]);

  return {
    locale,
    setLocale,
    t: (key: TranslationKey): string => dictionaries[locale][key],
  };
}
