// apps/react-app/src/components/AuthGuard.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

interface Props {
    children: React.ReactNode;
    requiredRoles?: string[];
}

export default function AuthGuard({ children, requiredRoles }: Props) {
    const { token, user } = useAuthStore();
    const location = useLocation();

    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requiredRoles && requiredRoles.length > 0) {
        const hasRole = user?.roles?.some(role => requiredRoles.includes(role));
        if (!hasRole) {
            // 已登录但无权限，可以跳转到 403 页面或首页
            return <Navigate to="/" replace />;
        }
    }

    return <>{children}</>;
}
