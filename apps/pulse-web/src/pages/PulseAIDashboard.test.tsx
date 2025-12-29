import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import PulseAIDashboard from './PulseAIDashboard';

// Wrapper component for routing
const renderWithRouter = (component: React.ReactNode) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('PulseAIDashboard Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render the Nova Pulse header', () => {
      renderWithRouter(<PulseAIDashboard />);
      expect(screen.getByText('Nova Pulse')).toBeInTheDocument();
    });

    it('should render the tagline', () => {
      renderWithRouter(<PulseAIDashboard />);
      expect(screen.getByText('Real-time Business Heartbeat')).toBeInTheDocument();
    });

    it('should render time range selector', () => {
      renderWithRouter(<PulseAIDashboard />);
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });

    it('should render Generate Briefing button', () => {
      renderWithRouter(<PulseAIDashboard />);
      expect(screen.getByText('Generate Briefing')).toBeInTheDocument();
    });
  });

  describe('KPI Cards', () => {
    it('should render all KPI cards', () => {
      renderWithRouter(<PulseAIDashboard />);
      
      expect(screen.getByText('Revenue')).toBeInTheDocument();
      expect(screen.getByText('Active Users')).toBeInTheDocument();
      expect(screen.getByText('OEE Score')).toBeInTheDocument();
      expect(screen.getByText('NPS Score')).toBeInTheDocument();
    });

    it('should display KPI values', () => {
      renderWithRouter(<PulseAIDashboard />);
      
      expect(screen.getByText('$2.4M')).toBeInTheDocument();
      expect(screen.getByText('12,847')).toBeInTheDocument();
      expect(screen.getByText('87.2%')).toBeInTheDocument();
      expect(screen.getByText('72')).toBeInTheDocument();
    });

    it('should display KPI change percentages', () => {
      renderWithRouter(<PulseAIDashboard />);
      
      expect(screen.getByText('+12.5%')).toBeInTheDocument();
      expect(screen.getByText('+8.3%')).toBeInTheDocument();
    });

    it('should display sparkline charts', () => {
      renderWithRouter(<PulseAIDashboard />);
      
      // Check for SVG elements (sparklines)
      const svgs = document.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThan(0);
    });
  });

  describe('Tab Navigation', () => {
    it('should render all navigation tabs', () => {
      renderWithRouter(<PulseAIDashboard />);
      
      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('AI Chat')).toBeInTheDocument();
      expect(screen.getByText('Insights')).toBeInTheDocument();
      expect(screen.getByText('Charts')).toBeInTheDocument();
      expect(screen.getByText('Data Sources')).toBeInTheDocument();
    });

    it('should switch to AI Chat tab when clicked', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderWithRouter(<PulseAIDashboard />);
      
      await user.click(screen.getByText('AI Chat'));
      
      // Should show AI chat interface
      expect(screen.getByPlaceholderText(/Ask Nova AI/)).toBeInTheDocument();
    });

    it('should switch to Insights tab when clicked', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderWithRouter(<PulseAIDashboard />);
      
      await user.click(screen.getByText('Insights'));
      
      // Should show AI Insights component
      await waitFor(() => {
        expect(screen.getByText('AI Insights')).toBeInTheDocument();
      });
    });

    it('should switch to Charts tab when clicked', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderWithRouter(<PulseAIDashboard />);
      
      await user.click(screen.getByText('Charts'));
      
      // Should show Interactive Charts component
      expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
    });

    it('should switch to Data Sources tab when clicked', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderWithRouter(<PulseAIDashboard />);
      
      await user.click(screen.getByText('Data Sources'));
      
      // Should show data sources panel
      expect(screen.getByText('Connected Data Sources')).toBeInTheDocument();
    });
  });

  describe('Overview Tab', () => {
    it('should display quick insights section', () => {
      renderWithRouter(<PulseAIDashboard />);
      
      expect(screen.getByText('Quick Insights')).toBeInTheDocument();
    });

    it('should display recent activity section', () => {
      renderWithRouter(<PulseAIDashboard />);
      
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    });

    it('should display quick actions section', () => {
      renderWithRouter(<PulseAIDashboard />);
      
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    });
  });

  describe('AI Chat', () => {
    it('should have chat input field', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderWithRouter(<PulseAIDashboard />);
      
      await user.click(screen.getByText('AI Chat'));
      
      const input = screen.getByPlaceholderText(/Ask Nova AI/);
      expect(input).toBeInTheDocument();
    });

    it('should have suggested questions', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderWithRouter(<PulseAIDashboard />);
      
      await user.click(screen.getByText('AI Chat'));
      
      expect(screen.getByText('Suggested Questions')).toBeInTheDocument();
    });

    it('should send message when form is submitted', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderWithRouter(<PulseAIDashboard />);
      
      await user.click(screen.getByText('AI Chat'));
      
      const input = screen.getByPlaceholderText(/Ask Nova AI/);
      await user.type(input, 'What is my revenue?');
      
      const sendButton = screen.getByRole('button', { name: /send/i }) || 
                         document.querySelector('button[type="submit"]');
      
      if (sendButton) {
        await user.click(sendButton);
        
        // Message should appear in chat
        await waitFor(() => {
          expect(screen.getByText('What is my revenue?')).toBeInTheDocument();
        });
      }
    });
  });

  describe('Data Sources', () => {
    it('should display connected data sources', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderWithRouter(<PulseAIDashboard />);
      
      await user.click(screen.getByText('Data Sources'));
      
      expect(screen.getByText('Salesforce')).toBeInTheDocument();
      expect(screen.getByText('QuickBooks')).toBeInTheDocument();
      expect(screen.getByText('HubSpot')).toBeInTheDocument();
    });

    it('should display connection status', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderWithRouter(<PulseAIDashboard />);
      
      await user.click(screen.getByText('Data Sources'));
      
      const connectedBadges = screen.getAllByText('Connected');
      expect(connectedBadges.length).toBeGreaterThan(0);
    });

    it('should display last sync time', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderWithRouter(<PulseAIDashboard />);
      
      await user.click(screen.getByText('Data Sources'));
      
      const syncTimes = screen.getAllByText(/Last sync:/);
      expect(syncTimes.length).toBeGreaterThan(0);
    });
  });

  describe('Generate Briefing', () => {
    it('should open briefing modal when button is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderWithRouter(<PulseAIDashboard />);
      
      await user.click(screen.getByText('Generate Briefing'));
      
      // Should show Executive Briefing component
      await waitFor(() => {
        expect(screen.getByText('Executive Briefing')).toBeInTheDocument();
      });
    });

    it('should close briefing modal when close button is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderWithRouter(<PulseAIDashboard />);
      
      await user.click(screen.getByText('Generate Briefing'));
      
      await waitFor(() => {
        expect(screen.getByText('Executive Briefing')).toBeInTheDocument();
      });
      
      // Find and click close button
      const closeButton = screen.getByText('✕');
      await user.click(closeButton);
      
      await waitFor(() => {
        expect(screen.queryByText('Executive Summary')).not.toBeInTheDocument();
      });
    });
  });

  describe('Time Range Selection', () => {
    it('should change time range when selected', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderWithRouter(<PulseAIDashboard />);
      
      const select = screen.getByRole('combobox');
      await user.selectOptions(select, '7d');
      
      expect(select).toHaveValue('7d');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      renderWithRouter(<PulseAIDashboard />);
      
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });

    it('should have accessible tab buttons', () => {
      renderWithRouter(<PulseAIDashboard />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should have accessible form elements', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderWithRouter(<PulseAIDashboard />);
      
      await user.click(screen.getByText('AI Chat'));
      
      const input = screen.getByPlaceholderText(/Ask Nova AI/);
      expect(input).toHaveAttribute('type', 'text');
    });
  });

  describe('Error Handling', () => {
    it('should render without crashing', () => {
      expect(() => renderWithRouter(<PulseAIDashboard />)).not.toThrow();
    });
  });
});
