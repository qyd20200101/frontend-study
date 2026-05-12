// apps/react-app/src/App.tsx
import { BrowserRouter, Navigate, Route, Routes, Link, useLocation } from "react-router-dom";
import { Button, Layout, Menu, Space, Typography } from "antd";
import DashboardPage from "./features/asset/pages/DashboardPage";
import DataManagerPage from "./features/asset/pages/DataManagerPage";
import Designer from './designer/Designer';
import PreviewPage from "./pages/PreviewPage";
import UserManagementPage from "./features/system/pages/UserManagementPage";
import AuditLogPage from "./features/system/pages/AuditLogPage";
import LoginPage from "./features/auth/pages/LoginPage";
import AuthGuard from "./components/AuthGuard";
import { useAuthStore } from "./store/useAuthStore";

const { Header, Content } = Layout;
const { Title } = Typography;

function AppLayout({ children }: { children: React.ReactNode }) {
  const clearAuth = useAuthStore(state => state.clearAuth);
  const location = useLocation();

  const menuItems = [
    { key: '/dashboard', label: <Link to="/dashboard">数据看板</Link> },
    { key: '/asset', label: <Link to="/asset">资产管理</Link> },
    { key: '/designer', label: <Link to="/designer">表单设计</Link> },
    { key: '/preview', label: <Link to="/preview">表单预览</Link> },
    { key: '/audit', label: <Link to="/audit">审计日志</Link> },
    { key: '/system', label: <Link to="/system">用户管理</Link> },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: 'transparent' }}>
      <Header className="nav-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 50px' }}>
        <Space size="large">
          <Title level={4} style={{ margin: 0, color: '#1677ff', fontWeight: 800 }}>SaaS Admin</Title>
          <Menu 
            theme="dark"
            mode="horizontal" 
            selectedKeys={[location.pathname]} 
            items={menuItems} 
            style={{ border: 'none', background: 'transparent', minWidth: 600 }}
          />
        </Space>
        <Button type="primary" danger ghost onClick={() => clearAuth()} style={{ borderRadius: 8 }}>
          退出登录
        </Button>
      </Header>
      <Content style={{ padding: '24px 50px' }}>
        <div className="fade-in">
          {children}
        </div>
      </Content>
    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/*" element={
          <AuthGuard>
            <AppLayout>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/asset" element={<DataManagerPage />} />
                <Route path="/designer" element={<Designer />} />
                <Route path="/preview" element={<PreviewPage />} />
                <Route path="/audit" element={<AuthGuard requiredRoles={['admin']}><AuditLogPage /></AuthGuard>} />
                <Route path="/system" element={<UserManagementPage />} />
                <Route path="*" element={<div style={{ padding: 24 }}>404 Not Found</div>} />
              </Routes>
            </AppLayout>
          </AuthGuard>
        } />
      </Routes>
    </BrowserRouter>
  );
}
