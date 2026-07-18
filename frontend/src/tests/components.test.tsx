import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

describe('UI Components Accessibility & Rendering', () => {
  it('renders Card component with title and children', () => {
    render(
      <Card title="Test Title">
        <div>Test Content</div>
      </Card>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders Button component with children and supports disabled states', () => {
    render(<Button disabled>Click Me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });
});
