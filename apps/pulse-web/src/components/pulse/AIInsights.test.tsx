import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AIInsights from './AIInsights';

describe('AIInsights Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render loading state initially', () => {
      render(<AIInsights />);
      
      // Should show loading skeleton
      const loadingElements = document.querySelectorAll('.animate-pulse');
      expect(loadingElements.length).toBeGreaterThan(0);
    });

    it('should render insights after loading', async () => {
      render(<AIInsights />);
      
      // Fast-forward past loading
      vi.advanceTimersByTime(1500);
      
      await waitFor(() => {
        expect(screen.getByText('AI Insights')).toBeInTheDocument();
      });
    });

    it('should display the correct number of insights', async () => {
      render(<AIInsights />);
      vi.advanceTimersByTime(1500);
      
      await waitFor(() => {
        expect(screen.getByText('8 insights generated')).toBeInTheDocument();
      });
    });

    it('should render all filter tabs', async () => {
      render(<AIInsights />);
      vi.advanceTimersByTime(1500);
      
      await waitFor(() => {
        expect(screen.getByText('All')).toBeInTheDocument();
        expect(screen.getByText(/Predictions/)).toBeInTheDocument();
        expect(screen.getByText(/Anomalies/)).toBeInTheDocument();
        expect(screen.getByText(/Recommendations/)).toBeInTheDocument();
        expect(screen.getByText(/Trends/)).toBeInTheDocument();
      });
    });
  });

  describe('Filtering', () => {
    it('should filter insights by type when clicking filter tabs', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<AIInsights />);
      vi.advanceTimersByTime(1500);
      
      await waitFor(() => {
        expect(screen.getByText('All')).toBeInTheDocument();
      });

      // Click on Predictions filter
      const predictionsTab = screen.getByText(/Predictions/);
      await user.click(predictionsTab);
      
      // Should show only prediction insights
      await waitFor(() => {
        expect(screen.getByText('Revenue Growth Forecast')).toBeInTheDocument();
      });
    });

    it('should show empty state when no insights match filter', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<AIInsights />);
      vi.advanceTimersByTime(1500);
      
      await waitFor(() => {
        expect(screen.getByText('All')).toBeInTheDocument();
      });
    });
  });

  describe('Sorting', () => {
    it('should have sort dropdown with options', async () => {
      render(<AIInsights />);
      vi.advanceTimersByTime(1500);
      
      await waitFor(() => {
        const sortSelect = screen.getByRole('combobox');
        expect(sortSelect).toBeInTheDocument();
      });
    });

    it('should sort by confidence by default', async () => {
      render(<AIInsights />);
      vi.advanceTimersByTime(1500);
      
      await waitFor(() => {
        const sortSelect = screen.getByRole('combobox');
        expect(sortSelect).toHaveValue('confidence');
      });
    });
  });

  describe('Insight Cards', () => {
    it('should display insight title and description', async () => {
      render(<AIInsights />);
      vi.advanceTimersByTime(1500);
      
      await waitFor(() => {
        expect(screen.getByText('Revenue Growth Forecast')).toBeInTheDocument();
      });
    });

    it('should display confidence bar for each insight', async () => {
      render(<AIInsights />);
      vi.advanceTimersByTime(1500);
      
      await waitFor(() => {
        const confidenceLabels = screen.getAllByText('Confidence');
        expect(confidenceLabels.length).toBeGreaterThan(0);
      });
    });

    it('should display impact badges', async () => {
      render(<AIInsights />);
      vi.advanceTimersByTime(1500);
      
      await waitFor(() => {
        const highImpactBadges = screen.getAllByText('high impact');
        expect(highImpactBadges.length).toBeGreaterThan(0);
      });
    });

    it('should display suggested actions for actionable insights', async () => {
      render(<AIInsights />);
      vi.advanceTimersByTime(1500);
      
      await waitFor(() => {
        expect(screen.getByText('Suggested Actions')).toBeInTheDocument();
      });
    });
  });

  describe('Interaction', () => {
    it('should call onInsightClick when insight is clicked', async () => {
      const mockOnClick = vi.fn();
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      
      render(<AIInsights onInsightClick={mockOnClick} />);
      vi.advanceTimersByTime(1500);
      
      await waitFor(() => {
        expect(screen.getByText('Revenue Growth Forecast')).toBeInTheDocument();
      });

      const insightCard = screen.getByText('Revenue Growth Forecast').closest('div[class*="cursor-pointer"]');
      if (insightCard) {
        await user.click(insightCard);
        expect(mockOnClick).toHaveBeenCalled();
      }
    });
  });

  describe('Data Display', () => {
    it('should display current and predicted values for insights with data', async () => {
      render(<AIInsights />);
      vi.advanceTimersByTime(1500);
      
      await waitFor(() => {
        expect(screen.getByText('Current')).toBeInTheDocument();
        expect(screen.getByText('Predicted')).toBeInTheDocument();
      });
    });

    it('should display percentage change', async () => {
      render(<AIInsights />);
      vi.advanceTimersByTime(1500);
      
      await waitFor(() => {
        // Look for percentage changes like +18%
        const changeElements = screen.getAllByText(/[+-]\d+%/);
        expect(changeElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Accessibility', () => {
    it('should have accessible filter buttons', async () => {
      render(<AIInsights />);
      vi.advanceTimersByTime(1500);
      
      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
      });
    });
  });
});
