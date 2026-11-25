import { describe, expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { UIFoundation } from '../components/UIFoundation';
import { useLocale } from './useLocale';

describe('useLocale', () => {
  test('translates keys from the active dictionary', () => {
    function Probe() {
      const { t, locale } = useLocale();
      return <span>{locale}:{t('hello')}</span>;
    }
    render(
      <UIFoundation defaultLocale="de" dictionary={{ hello: 'Hallo' }}><Probe /></UIFoundation>,
    );
    expect(screen.getByText('de:Hallo')).toBeInTheDocument();
  });
});
