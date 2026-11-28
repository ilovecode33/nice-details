import { useMemo, useState } from 'react';
import { Button, FormField, TextArea, TextInput } from '@ilovecode33/ui';
import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import { LIBRARY_REFERENCE } from './generated-library-reference';
import type { TranslationKey } from './i18n';
import { hasComponentDemo } from './component-groups';
import styles from './ComponentReference.module.css';

type ReferenceEntry = (typeof LIBRARY_REFERENCE)[number];
type ReferenceProp = ReferenceEntry['props'][number];
type Translate = (key: TranslationKey) => string;
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('xml', xml);

function UsageCode({ source }: { source: string }) {
  const highlighted = hljs.highlight(source, { language: 'tsx', ignoreIllegals: true }).value;
  return (
    <pre className={styles['reference__code']}>
      <code className="hljs" dangerouslySetInnerHTML={{ __html: highlighted }} />
    </pre>
  );
}

export type ComponentReferenceProps = {
  selectedName: string;
  t: Translate;
  onClose: () => void;
  onSelect: (name: string) => void;
  onViewExample: (name: string) => void;
};

function PropRows({ props, t }: { props: readonly ReferenceProp[]; t: Translate }) {
  return (
    <dl className={styles['reference__props']}>
      {props.map((prop) => (
        <div className={styles['reference__prop']} key={prop.name}>
          <dt>
            <code>{prop.name}</code>
            <span className={styles['reference__prop-state']}>
              {prop.optional ? t('reference.optional') : t('reference.required')}
            </span>
          </dt>
          <dd>
            <code className={styles['reference__type']}>{prop.type}</code>
            {prop.description && <p>{prop.description}</p>}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function LivePreview({ name, t }: { name: string; t: Translate }) {
  const [inputValue, setInputValue] = useState('Travel album');
  const [notes, setNotes] = useState('A few details for the trip.');
  const [actionSent, setActionSent] = useState(false);

  if (name === 'TextInput') {
    return (
      <FormField label={t('reference.inputLabel')} hint={t('reference.inputHint')}>
        <TextInput
          name="albumName"
          placeholder={t('reference.inputPlaceholder')}
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
        />
      </FormField>
    );
  }

  if (name === 'TextArea') {
    return (
      <FormField label={t('reference.textareaLabel')} hint={t('reference.textareaHint')}>
        <TextArea
          name="notes"
          placeholder={t('reference.textareaPlaceholder')}
          rows={3}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
      </FormField>
    );
  }

  if (name === 'FormField') {
    return (
      <FormField label={t('reference.inputLabel')} hint={t('reference.inputHint')}>
        <TextInput
          name="albumName"
          placeholder={t('reference.inputPlaceholder')}
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
        />
      </FormField>
    );
  }

  if (name === 'Button') {
    return (
      <div className={styles['reference__button-preview']}>
        <Button variant="primary" onClick={() => setActionSent(true)}>
          {t('reference.previewAction')}
        </Button>
        {actionSent && <p role="status">{t('reference.previewFeedback')}</p>}
      </div>
    );
  }

  return null;
}

function usageCode(entry: ReferenceEntry): string {
  if (!entry.example) return '';
  if (/^\s*import\s/m.test(entry.example)) return entry.example;
  return `import { ${entry.name} } from '@ilovecode33/ui';\n\n${entry.example}`;
}

export function ComponentReference({ selectedName, t, onClose, onSelect, onViewExample }: ComponentReferenceProps) {
  const [search, setSearch] = useState('');
  const selected = LIBRARY_REFERENCE.find((entry) => entry.name === selectedName) ?? LIBRARY_REFERENCE[0];
  const visibleEntries = useMemo(() => {
    const normalized = search.trim().toLocaleLowerCase();
    return LIBRARY_REFERENCE.filter((entry) => !normalized || entry.name.toLocaleLowerCase().includes(normalized));
  }, [search]);
  const example = usageCode(selected);
  const nativeAttributeKey: Record<NonNullable<ReferenceEntry['nativeElement']>, TranslationKey> = {
    input: 'reference.nativeInput',
    textarea: 'reference.nativeTextarea',
    button: 'reference.nativeButton',
    html: 'reference.nativeHtml',
  };
  const selectEntry = (name: string) => {
    onSelect(name);
    if (window.matchMedia('(max-width: 767px)').matches) {
      document.getElementById('reference-detail')?.scrollIntoView({ behavior: 'auto' });
    }
  };

  return (
    <section className={styles['reference']} aria-labelledby="reference-title">
      <header className={styles['reference__header']}>
        <Button variant="plain" onClick={onClose}>{t('reference.back')}</Button>
        <div>
          <h1 id="reference-title">{t('reference.title')}</h1>
          <p>{t('reference.subtitle')}</p>
        </div>
      </header>

      <div className={styles['reference__layout']}>
        <aside className={styles['reference__browser']} aria-label={t('reference.search')}>
          <TextInput
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('reference.search')}
            aria-label={t('reference.search')}
          />
          {(['component', 'hook'] as const).map((kind) => {
            const entries = visibleEntries.filter((entry) => entry.kind === kind);
            if (!entries.length) return null;
            return (
              <div className={styles['reference__group']} key={kind}>
                <h2>{t(kind === 'component' ? 'reference.components' : 'reference.hooks')}</h2>
                <nav aria-label={t(kind === 'component' ? 'reference.components' : 'reference.hooks')}>
                  {entries.map((entry) => (
                    <button
                      className={styles['reference__item']}
                      type="button"
                      key={entry.name}
                      aria-current={entry.name === selected.name ? 'page' : undefined}
                      onClick={() => selectEntry(entry.name)}
                    >
                      <span>{entry.name}</span>
                      <span aria-hidden="true">{entry.kind === 'component' ? 'UI' : 'ƒ'}</span>
                    </button>
                  ))}
                </nav>
              </div>
            );
          })}
          {visibleEntries.length === 0 && <p className={styles['reference__empty']}>{t('reference.noUsage')}</p>}
        </aside>

        <article id="reference-detail" className={styles['reference__detail']}>
          <div className={styles['reference__title-row']}>
            <div>
              <p className={styles['reference__kind']}>
                {t(selected.kind === 'component' ? 'reference.componentKind' : 'reference.hookKind')}
              </p>
              <h2>{selected.name}</h2>
            </div>
            {selected.kind === 'component' && hasComponentDemo(selected.name) && (
              <Button variant="secondary" onClick={() => onViewExample(selected.name)}>
                {t('reference.viewExample')}
              </Button>
            )}
          </div>

          {selected.description && <p className={styles['reference__description']}>{selected.description}</p>}

          {selected.kind === 'component' && (
            <section className={styles['reference__section']} aria-labelledby="reference-preview-title">
              <h3 id="reference-preview-title">{t('reference.preview')}</h3>
              {['TextInput', 'TextArea', 'FormField', 'Button'].includes(selected.name) ? (
                <div className={styles['reference__preview']}>
                  <LivePreview name={selected.name} t={t} />
                </div>
              ) : (
                <div className={styles['reference__preview-note']}>
                  {hasComponentDemo(selected.name)
                    ? t('reference.previewNote')
                    : t('reference.noUsage')}
                </div>
              )}
            </section>
          )}

          {selected.kind === 'component' ? (
            <section className={styles['reference__section']} aria-labelledby="reference-props-title">
              <h3 id="reference-props-title">{t('reference.props')}</h3>
              {selected.props.length > 0
                ? <PropRows props={selected.props} t={t} />
                : <p className={styles['reference__muted']}>{t('reference.noProps')}</p>}
              {selected.nativeElement && (
                <p className={styles['reference__native']}>{t(nativeAttributeKey[selected.nativeElement])}</p>
              )}
            </section>
          ) : (
            <section className={styles['reference__section']} aria-labelledby="reference-parameters-title">
              <h3 id="reference-parameters-title">{t('reference.parameters')}</h3>
              {selected.parameters.length === 0
                ? <p className={styles['reference__muted']}>{t('reference.noProps')}</p>
                : selected.parameters.map((parameter) => (
                  <div className={styles['reference__parameter']} key={parameter.name}>
                    <div className={styles['reference__parameter-heading']}>
                      <code>{parameter.name}</code>
                      <code className={styles['reference__type']}>{parameter.type}</code>
                      <span className={styles['reference__prop-state']}>
                        {parameter.optional ? t('reference.optional') : t('reference.required')}
                      </span>
                    </div>
                    {parameter.description && <p>{parameter.description}</p>}
                    {parameter.options.length > 0 && (
                      <div className={styles['reference__nested-options']}>
                        <h4>{t('reference.options')}</h4>
                        <PropRows props={parameter.options} t={t} />
                      </div>
                    )}
                  </div>
                ))}
              <p className={styles['reference__returns']}>
                <span>{t('reference.returns')}</span>
                <code className={styles['reference__type']}>{selected.returnType}</code>
              </p>
            </section>
          )}

          <section className={styles['reference__section']} aria-labelledby="reference-usage-title">
            <h3 id="reference-usage-title">{t('reference.usage')}</h3>
            {example
              ? <UsageCode source={example} />
              : <p className={styles['reference__muted']}>{t('reference.noUsage')}</p>}
          </section>
        </article>
      </div>
    </section>
  );
}
