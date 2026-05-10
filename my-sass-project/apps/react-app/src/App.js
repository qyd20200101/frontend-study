import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// apps/react-app/src/App.tsx
import { BrowserRouter, Navigate, Route, Routes, Link, useLocation } from "react-router-dom";
import { Button, Layout, Menu, Space, Typography } from "antd";
import DashboardPage from "./features/asset/pages/DashboardPage";
import DataManagerPage from "./features/asset/pages/DataManagerPage";
import DesignerPage from "./pages/DesignerPage";
import PreviewPage from "./pages/PreviewPage";
import UserManagementPage from "./features/system/pages/UserManagementPage";
import AuditLogPage from "./features/system/pages/AuditLogPage";
import LoginPage from "./features/auth/pages/LoginPage";
import AuthGuard from "./components/AuthGuard";
import { useAuthStore } from "./store/useAuthStore";
const { Header, Content } = Layout;
const { Title } = Typography;
function AppLayout({ children }) {
    const clearAuth = useAuthStore(state => state.clearAuth);
    const location = useLocation();
    const menuItems = [
        { key: '/dashboard', label: _jsx(Link, { to: "/dashboard", children: "\u6570\u636E\u770B\u677F" }) },
        { key: '/asset', label: _jsx(Link, { to: "/asset", children: "\u8D44\u4EA7\u7BA1\u7406" }) },
        { key: '/designer', label: _jsx(Link, { to: "/designer", children: "\u8868\u5355\u8BBE\u8BA1\u5668" }) },
        { key: '/preview', label: _jsx(Link, { to: "/preview", children: "\u8868\u5355\u9884\u89C8" }) },
        { key: '/audit', label: _jsx(Link, { to: "/audit", children: "\u5BA1\u8BA1\u65E5\u5FD7" }) },
        { key: '/system', label: _jsx(Link, { to: "/system", children: "\u7528\u6237\u7BA1\u7406" }) },
    ];
    return (_jsxs(Layout, { style: { minHeight: '100vh', background: 'transparent' }, children: [_jsxs(Header, { className: "nav-header", style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 50px' }, children: [_jsxs(Space, { size: "large", children: [_jsx(Title, { level: 4, style: { margin: 0, color: '#1677ff', fontWeight: 800 }, children: "SaaS Admin" }), _jsx(Menu, { mode: "horizontal", selectedKeys: [location.pathname], items: menuItems, style: { border: 'none', background: 'transparent', minWidth: 600 } })] }), _jsx(Button, { type: "primary", danger: true, ghost: true, onClick: () => clearAuth(), style: { borderRadius: 8 }, children: "\u9000\u51FA\u767B\u5F55" })] }), _jsx(Content, { style: { padding: '24px 50px' }, children: _jsx("div", { className: "fade-in", children: children }) })] }));
}
export default function App() {
    return (_jsx(BrowserRouter, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/*", element: _jsx(AuthGuard, { children: _jsx(AppLayout, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Navigate, { to: "/dashboard", replace: true }) }), _jsx(Route, { path: "/dashboard", element: _jsx(DashboardPage, {}) }), _jsx(Route, { path: "/asset", element: _jsx(DataManagerPage, {}) }), _jsx(Route, { path: "/designer", element: _jsx(DesignerPage, {}) }), _jsx(Route, { path: "/preview", element: _jsx(PreviewPage, {}) }), _jsx(Route, { path: "/audit", element: _jsx(AuthGuard, { requiredRoles: ['admin'], children: _jsx(AuditLogPage, {}) }) }), _jsx(Route, { path: "/system", element: _jsx(UserManagementPage, {}) }), _jsx(Route, { path: "*", element: _jsx("div", { style: { padding: 24 }, children: "404 Not Found" }) })] }) }) }) })] }) }));
}
