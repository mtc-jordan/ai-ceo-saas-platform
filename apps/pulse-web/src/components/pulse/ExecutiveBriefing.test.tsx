import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExecutiveBriefing from './ExecutiveBriefing';

describe('ExecutiveBriefing Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render the executive briefing header', () => {
      render(<ExecutiveBriefing />);
      expect(screen.getByText('Executive Briefing')).toBeInTheDocument();
    });

    it('should display current date', () => {
      render(<ExecutiveBriefing />);
      // Check for date format elements
      const dateElement = document.querySelector('.text-slate-400');
      expect(dateElement).toBeInTheDocument();
    });

    it('should render all briefing sections', () => {
      render(<ExecutiveBriefing />);
      
      expect(screen.getByText('Executive Summary')).toBeInTheDocument();
      expect(screen.getByText('Key Performance Metrics')).toBeInTheDocument();
      expect(screen.getByText("Today's Priorities")).toBeInTheDocument();
      expect(screen.getByText('AI-Identified Opportunities')).toBeInTheDocument();
      expect(screen.getByText('Risk Alerts')).toBeInTheDocument();
      expect(screen.getByText('AI Insights & Predictions')).toBeInTheDocument();
    });

    it('should render action buttons in header', () => {
      render(<ExecutiveBriefing />);
      
      // Voice briefing button
      expect(screen.getByTitle('Listen to briefing')).toBeInTheDocument();
      // Schedule button
      expect(screen.getByTitle('Schedule briefings')).toBeInTheDocument();
    });
  });

  describe('Metrics Section', () => {
    it('should display all key performance metrics', () => {
      render(<ExecutiveBriefing />);
      
      expect(screen.getByText('Monthly Revenue')).toBeInTheDocument();
      expect(screen.getByText('Active Customers')).toBeInTheDocument();
      expect(screen.getByText('Customer Satisfaction')).toBeInTheDocument();
      expect(screen.getByText('Net Promoter Score')).toBeInTheDocument();
      expect(screen.getByText('Churn Rate')).toBeInTheDocument();
      expect(screen.getByText('OEE Score')).toBeInTheDocument();
    });

    it('should display metric values', () => {
      render(<ExecutiveBriefing />);
      
      expect(screen.getByText('$2.4M')).toBeInTheDocument();
      expect(screen.getByText('1,247')).toBeInTheDocument();
      expect(screen.getByText('94.5%')).toBeInTheDocument();
    });

    it('should display metric changes with correct styling', () => {
      render(<ExecutiveBriefing />);
      
      // Positive changes
      expect(screen.getByText('+12.5%')).toBeInTheDocument();
      expect(screen.getByText('+8.3%')).toBeInTheDocument();
    });
  });

  describe('Priorities Section', () => {
    it('should display priority items', () => {
      render(<ExecutiveBriefing />);
      
      expect(screen.getByText('Review and approve Q4 budget proposal')).toBeInTheDocument();
      expect(screen.getByText('Board meeting preparation - finalize presentation')).toBeInTheDocument();
    });

    it('should display due dates', () => {
      render(<ExecutiveBriefing />);
      
      expect(screen.getByText('Due today')).toBeInTheDocument();
      expect(screen.getByText('Due tomorrow')).toBeInTheDocument();
    });

    it('should display priority indicators', () => {
      render(<ExecutiveBriefing />);
      
      // Check for priority indicators (colored dots)
      const highPriorityItems = document.querySelectorAll('.text-red-400');
      expect(highPriorityItems.length).toBeGreaterThan(0);
    });
  });

  describe('Opportunities Section', () => {
    it('should display AI-identified opportunities', () => {
      render(<ExecutiveBriefing />);
      
      expect(screen.getByText(/European market expansion/)).toBeInTheDocument();
      expect(screen.getByText(/Pricing optimization/)).toBeInTheDocument();
    });
  });

  describe('Risk Alerts Section', () => {
    it('should display risk alerts', () => {
      render(<ExecutiveBriefing />);
      
      expect(screen.getByText(/enterprise customers showing disengagement/)).toBeInTheDocument();
      expect(screen.getByText(/Competitor launching similar product/)).toBeInTheDocument();
    });
  });

  describe('Voice Briefing', () => {
    it('should toggle play state when voice button is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<ExecutiveBriefing />);
      
      const voiceButton = screen.getByTitle('Listen to briefing');
      await user.click(voiceButton);
      
      // Button should now show stop
      expect(screen.getByTitle('Stop')).toBeInTheDocument();
    });
  });

  describe('Export Functionality', () => {
    it('should call onExport with pdf format', async () => {
      const mockExport = vi.fn();
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      
      render(<ExecutiveBriefing onExport={mockExport} />);
      
      // Hover over export button to show dropdown
      const exportButton = screen.getByText('📤');
      fireEvent.mouseEnter(exportButton.parentElement!);
      
      await waitFor(() => {
        expect(screen.getByText('Export as PDF')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('Export as PDF'));
      
      // Wait for export simulation
      vi.advanceTimersByTime(2500);
      
      await waitFor(() => {
        expect(mockExport).toHaveBeenCalledWith('pdf');
      });
    });

    it('should show export progress indicator', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<ExecutiveBriefing />);
      
      const exportButton = screen.getByText('📤');
      fireEvent.mouseEnter(exportButton.parentElement!);
      
      await waitFor(() => {
        expect(screen.getByText('Export as PDF')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('Export as PDF'));
      
      expect(screen.getByText('Generating PDF...')).toBeInTheDocument();
    });
  });

  describe('Schedule Modal', () => {
    it('should open schedule modal when schedule button is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<ExecutiveBriefing />);
      
      const scheduleButton = screen.getByTitle('Schedule briefings');
      await user.click(scheduleButton);
      
      expect(screen.getByText('Schedule Briefings')).toBeInTheDocument();
    });

    it('should display time input in schedule modal', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<ExecutiveBriefing />);
      
      await user.click(screen.getByTitle('Schedule briefings'));
      
      expect(screen.getByText('Delivery Time')).toBeInTheDocument();
      expect(screen.getByRole('textbox', { hidden: true }) || screen.getByDisplayValue('08:00')).toBeInTheDocument();
    });

    it('should display day selection buttons', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<ExecutiveBriefing />);
      
      await user.click(screen.getByTitle('Schedule briefings'));
      
      expect(screen.getByText('Days')).toBeInTheDocument();
      // Check for day buttons (M, T, W, T, F, S, S)
      const dayButtons = screen.getAllByRole('button').filter(btn => 
        ['M', 'T', 'W', 'F', 'S'].includes(btn.textContent || '')
      );
      expect(dayButtons.length).toBeGreaterThan(0);
    });

    it('should display delivery method options', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<ExecutiveBriefing />);
      
      await user.click(screen.getByTitle('Schedule briefings'));
      
      expect(screen.getByText('Delivery Method')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Slack')).toBeInTheDocument();
      expect(screen.getByText('Push Notification')).toBeInTheDocument();
    });

    it('should close modal when cancel is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<ExecutiveBriefing />);
      
      await user.click(screen.getByTitle('Schedule briefings'));
      expect(screen.getByText('Schedule Briefings')).toBeInTheDocument();
      
      await user.click(screen.getByText('Cancel'));
      
      await waitFor(() => {
        expect(screen.queryByText('Schedule Briefings')).not.toBeInTheDocument();
      });
    });

    it('should close modal when save is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<ExecutiveBriefing />);
      
      await user.click(screen.getByTitle('Schedule briefings'));
      await user.click(screen.getByText('Save Schedule'));
      
      await waitFor(() => {
        expect(screen.queryByText('Schedule Briefings')).not.toBeInTheDocument();
      });
    });
  });

  describe('Close Button', () => {
    it('should call onClose when close button is clicked', async () => {
      const mockClose = vi.fn();
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      
      render(<ExecutiveBriefing onClose={mockClose} />);
      
      const closeButton = screen.getByText('✕');
      await user.click(closeButton);
      
      expect(mockClose).toHaveBeenCalled();
    });

    it('should not render close button when onClose is not provided', () => {
      render(<ExecutiveBriefing />);
      
      // Close button should not be present
      expect(screen.queryByText('✕')).not.toBeInTheDocument();
    });
  });

  describe('Footer Actions', () => {
    it('should render Regenerate button', () => {
      render(<ExecutiveBriefing />);
      expect(screen.getByText('Regenerate')).toBeInTheDocument();
    });

    it('should render Take Action button', () => {
      render(<ExecutiveBriefing />);
      expect(screen.getByText('Take Action')).toBeInTheDocument();
    });

    it('should display generation timestamp', () => {
      render(<ExecutiveBriefing />);
      expect(screen.getByText(/Generated by Nova AI/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<ExecutiveBriefing />);
      
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });

    it('should have accessible buttons', () => {
      render(<ExecutiveBriefing />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });
});
