import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './layout/Sidebar';
import Header from './layout/Header';

const Layout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        marginLeft: collapsed ? '72px' : '240px',
        transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        height: '100vh',
        overflow: 'hidden'
      }}>
        <Header />
        <main style={{
          flex: 1,
          overflow: 'auto',
          padding: '24px',
          height: 0
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
