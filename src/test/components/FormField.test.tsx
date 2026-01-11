import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormField } from '../../components/FormField';

describe('FormField Component', () => {
  it('should render label correctly', () => {
    render(
      <FormField label="Test Label">
        <input type="text" />
      </FormField>
    );

    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('should show required asterisk when required prop is true', () => {
    render(
      <FormField label="Required Field" required>
        <input type="text" />
      </FormField>
    );

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('should not show required asterisk when required prop is false', () => {
    render(
      <FormField label="Optional Field">
        <input type="text" />
      </FormField>
    );

    expect(screen.queryByText('*')).not.toBeInTheDocument();
  });

  it('should show error message when touched and error exists', () => {
    render(
      <FormField label="Field" error="This field is required" touched>
        <input type="text" />
      </FormField>
    );

    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('should not show error message when not touched', () => {
    render(
      <FormField label="Field" error="This field is required" touched={false}>
        <input type="text" />
      </FormField>
    );

    expect(screen.queryByText('This field is required')).not.toBeInTheDocument();
  });

  it('should show help text when provided and no error', () => {
    render(
      <FormField label="Field" helpText="This is help text">
        <input type="text" />
      </FormField>
    );

    expect(screen.getByText('This is help text')).toBeInTheDocument();
  });

  it('should hide help text when error is shown', () => {
    render(
      <FormField
        label="Field"
        helpText="This is help text"
        error="Error message"
        touched
      >
        <input type="text" />
      </FormField>
    );

    expect(screen.queryByText('This is help text')).not.toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('should render children correctly', () => {
    render(
      <FormField label="Field">
        <input type="text" data-testid="test-input" />
      </FormField>
    );

    expect(screen.getByTestId('test-input')).toBeInTheDocument();
  });
});
