import { describe, expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { expectComponentSnapshot } from '../test-utils/snapshot';
import { Field } from './Field';
import { Select } from './Select';
describe('Field', () => {
  test('associates a label, control and hint', () => {
    render(<Field label="Title" hint="Shown in the gallery"><input aria-label="Title" /></Field>);
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Shown in the gallery')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Title' })).toBeInTheDocument();
  });

  test('clicking the label does not open a Select inside the field', () => {
    render(
      <Field label="Sort">
        <Select
          value="newest"
          onChange={() => {}}
          options={[{ value: 'newest', label: 'Newest' }]}
        />
      </Field>,
    );

    // Browsers run a label's activation behavior only for a non-canceled click.
    // jsdom still forwards a canceled label click, so assert the cancellation
    // that stops the control from opening rather than the forwarded result.
    expect(fireEvent.click(screen.getByText('Sort'))).toBe(false);
  });

  test('clicking the control still opens the Select', () => {
    render(
      <Field label="Sort">
        <Select
          value="newest"
          onChange={() => {}}
          options={[{ value: 'newest', label: 'Newest' }]}
        />
      </Field>,
    );

    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toBeTruthy();
  });

  test('matches its structural snapshot', () => {
    expectComponentSnapshot(
      <Field label="Title" hint="Shown in the gallery">
        <input aria-label="Title" />
      </Field>,
    );
  });
});
