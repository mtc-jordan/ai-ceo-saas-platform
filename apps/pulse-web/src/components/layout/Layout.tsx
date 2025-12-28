import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

interface LayoutProps {
  children?: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <main className="ml-64">
        {children || <Outlet />}
      </main>
    </div>
  );
}
