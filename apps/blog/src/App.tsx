import { useEffect, useRef } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Badge, DockNavigation, UIFoundation } from '@ilovecode33/ui';
import { createEditor } from '@ilovecode33/editor-core';
import styles from './app.module.css';

const ROUTES = {
  posts: '/',
  about: '/about',
} as const;

type RouteId = keyof typeof ROUTES;
const ROUTE_IDS = Object.keys(ROUTES) as RouteId[];

const LINKS = [
  { id: 'posts', label: 'Posts' },
  { id: 'about', label: 'About' },
];

const ARTICLE_HTML = '<h1>Hallo world!</h1>';

function routeIdFromPath(path: string): RouteId {
  return ROUTE_IDS.find((id) => ROUTES[id] === path) ?? 'posts';
}

function SiteNavigation() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const activeId = routeIdFromPath(pathname);

  return (
    <DockNavigation
      label="Site navigation"
      items={LINKS.map((link) => ({ ...link, href: ROUTES[link.id as RouteId] }))}
      activeId={activeId}
      defaultCollapsed
      collapseLabel="Collapse navigation"
      expandLabel="Expand navigation"
      onSelect={(id, event) => {
        // Keep real hrefs for accessibility, but let the router navigate.
        event?.preventDefault();
        navigate(ROUTES[id as RouteId]);
      }}
    />
  );
}

function Article() {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = contentRef.current;
    if (!element) return;
    const editor = createEditor({
      element,
      readonly: true,
      initialHTML: ARTICLE_HTML,
    });
    if (editor.isReadonly() && editor.getText().trim() !== 'Hallo world!') {
      throw new Error('Article content was not loaded correctly');
    }
    return () => editor.destroy();
  }, []);

  return (
    <article>
      <div className={styles.blogPostMeta}>
        <time dateTime="2026-11-21">November 21, 2026</time>
        <Badge tone="accent">Readonly mode</Badge>
      </div>
      <div
        ref={contentRef}
        className={styles.blogPostContent}
        aria-label="Article content"
      />
    </article>
  );
}

function About() {
  return (
    <article>
      <div className={styles.blogPostMeta}>
        <Badge tone="accent">About</Badge>
      </div>
      <div className={styles.blogPostContent}>
        <h1>About</h1>
        <p>
          This blog is a small demo of the shared component library. Every
          surface, control and motion value comes from the same design tokens.
        </p>
      </div>
    </article>
  );
}

export function App() {
  return (
    <UIFoundation defaultTheme="system" className={styles.blogApp}>
      <main className={styles.blogMain}>
        <Routes>
          <Route path="/" element={<Article />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Article />} />
        </Routes>
      </main>
      <footer className={styles.blogFooter}>
        <p>© 2026 ilovecode33</p>
      </footer>
      <SiteNavigation />
    </UIFoundation>
  );
}
