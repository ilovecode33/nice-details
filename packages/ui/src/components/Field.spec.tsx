import { describe, expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { Field } from './Field';
describe('Field', () => {
  test('associates a label, control and hint', () => {
    render(<Field label="Title" hint="Shown in the gallery"><input aria-label="Title" /></Field>);
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Shown in the gallery')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Title' })).toBeInTheDocument();
  });
});
