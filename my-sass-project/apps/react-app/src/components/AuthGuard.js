import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
// apps/react-app/src/components/AuthGuard.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
export default function AuthGuard({ children, requiredRoles }) {
    const { token, user } = useAuthStore();
    const location = useLocation();
    if (!token) {
        return _jsx(Navigate, { to: "/login", state: { from: location }, replace: true });
    }
    if (requiredRoles && requiredRoles.length > 0) {
        const hasRole = user?.roles?.some(role => requiredRoles.includes(role));
        if (!hasRole) {
            // 已登录但无权限，可以跳转到 403 页面或首页
            return _jsx(Navigate, { to: "/", replace: true });
        }
    }
    return _jsx(_Fragment, { children: children });
}
