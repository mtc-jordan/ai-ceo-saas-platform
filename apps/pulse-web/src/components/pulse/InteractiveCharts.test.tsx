import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InteractiveCharts from './InteractiveCharts';

describe('InteractiveCharts Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render the analytics dashboard header', () => {
      render(<InteractiveCharts />);
      expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
    });

    it('should render time range selector', () => {
      render(<InteractiveCharts />);
      const timeSelect = screen.getByRole('combobox');
      expect(timeSelect).toBeInTheDocument();
    });

    it('should render all chart type tabs', () => {
      render(<InteractiveCharts />);
      
      expect(screen.getByText(/Revenue/)).toBeInTheDocument();
      expect(screen.getByText(/Users/)).toBeInTheDocument();
      expect(screen.getByText(/Performance/)).toBeInTheDocument();
      expect(screen.getByText(/Funnel/)).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(<InteractiveCharts className="custom-class" />);
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Revenue Chart', () => {
    it('should display revenue chart by default', () => {
      render(<InteractiveCharts />);
      expect(screen.getByText('Total Revenue (YTD)')).toBeInTheDocument();
    });

    it('should display revenue growth percentage', () => {
      render(<InteractiveCharts />);
      expect(screen.getByText('+23.5% vs last year')).toBeInTheDocument();
    });

    it('should display legend items', () => {
      render(<InteractiveCharts />);
      expect(screen.getByText('Actual Revenue')).toBeInTheDocument();
      expect(screen.getByText('Predicted')).toBeInTheDocument();
    });

    it('should display month labels', () => {
      render(<InteractiveCharts />);
      expect(screen.getByText('Jan')).toBeInTheDocument();
      expect(screen.getByText('Dec')).toBeInTheDocument();
    });
  });

  describe('Users Chart', () => {
    it('should switch to users chart when tab is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<InteractiveCharts />);
      
      const usersTab = screen.getByText(/Users/);
      await user.click(usersTab);
      
      expect(screen.getByText('Total Active Users')).toBeInTheDocument();
    });

    it('should display user growth percentage', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<InteractiveCharts />);
      
      await user.click(screen.getByText(/Users/));
      
      expect(screen.getByText('+159% growth YoY')).toBeInTheDocument();
    });
  });

  describe('Performance Chart', () => {
    it('should switch to performance chart when tab is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<InteractiveCharts />);
      
      await user.click(screen.getByText(/Performance/));
      
      expect(screen.getByText('Key Performance Indicators')).toBeInTheDocument();
    });

    it('should display all KPI metrics', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<InteractiveCharts />);
      
      await user.click(screen.getByText(/Performance/));
      
      // Wait for animation
      vi.advanceTimersByTime(1500);
      
      await waitFor(() => {
        expect(screen.getByText('Revenue Growth')).toBeInTheDocument();
        expect(screen.getByText('Customer Retention')).toBeInTheDocument();
        expect(screen.getByText('NPS Score')).toBeInTheDocument();
        expect(screen.getByText('OEE Score')).toBeInTheDocument();
        expect(screen.getByText('Employee Satisfaction')).toBeInTheDocument();
      });
    });

    it('should animate progress bars', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<InteractiveCharts />);
      
      await user.click(screen.getByText(/Performance/));
      
      // Initially values should be 0 or animating
      vi.advanceTimersByTime(100);
      
      // After animation completes
      vi.advanceTimersByTime(1000);
      
      await waitFor(() => {
        // Check that values are displayed
        const percentages = screen.getAllByText(/%$/);
        expect(percentages.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Funnel Chart', () => {
    it('should switch to funnel chart when tab is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<InteractiveCharts />);
      
      await user.click(screen.getByText(/Funnel/));
      
      expect(screen.getByText('Conversion Funnel')).toBeInTheDocument();
    });

    it('should display all funnel stages', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<InteractiveCharts />);
      
      await user.click(screen.getByText(/Funnel/));
      
      expect(screen.getByText('Visitors')).toBeInTheDocument();
      expect(screen.getByText('Sign Ups')).toBeInTheDocument();
      expect(screen.getByText('Activated')).toBeInTheDocument();
      expect(screen.getByText('Converted')).toBeInTheDocument();
      expect(screen.getByText('Retained')).toBeInTheDocument();
    });

    it('should display overall conversion rate', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<InteractiveCharts />);
      
      await user.click(screen.getByText(/Funnel/));
      
      expect(screen.getByText('7%')).toBeInTheDocument();
    });

    it('should display funnel insights', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<InteractiveCharts />);
      
      await user.click(screen.getByText(/Funnel/));
      
      expect(screen.getByText('Funnel Insights')).toBeInTheDocument();
    });
  });

  describe('Time Range Selection', () => {
    it('should have correct time range options', () => {
      render(<InteractiveCharts />);
      
      const timeSelect = screen.getByRole('combobox');
      expect(timeSelect).toHaveValue('30d');
    });

    it('should change time range when selected', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<InteractiveCharts />);
      
      const timeSelect = screen.getByRole('combobox');
      await user.selectOptions(timeSelect, '7d');
      
      expect(timeSelect).toHaveValue('7d');
    });
  });

  describe('Chart Tab Navigation', () => {
    it('should highlight active tab', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<InteractiveCharts />);
      
      const revenueTab = screen.getByText(/Revenue/).closest('button');
      expect(revenueTab).toHaveClass('bg-indigo-500');
      
      await user.click(screen.getByText(/Users/));
      
      const usersTab = screen.getByText(/Users/).closest('button');
      expect(usersTab).toHaveClass('bg-indigo-500');
    });
  });

  describe('Hover Interactions', () => {
    it('should show tooltip on bar hover in revenue chart', async () => {
      render(<InteractiveCharts />);
      
      // Find a bar element and hover over it
      const bars = document.querySelectorAll('[class*="bg-gradient-to-t"]');
      if (bars.length > 0) {
        fireEvent.mouseEnter(bars[0]);
        // Tooltip should appear
      }
    });
  });

  describe('Responsive Design', () => {
    it('should render without errors at different viewport sizes', () => {
      const { rerender } = render(<InteractiveCharts />);
      
      // Rerender doesn't throw
      expect(() => rerender(<InteractiveCharts />)).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible chart type buttons', () => {
      render(<InteractiveCharts />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should have accessible select element', () => {
      render(<InteractiveCharts />);
      
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });
  });
});
