// apps/react-app/src/components/AuthGuard.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const token = useAuthStore((state) => state.token);
    const location = useLocation();

    if (!token) {
        // 未登录，跳转到登录页，并记录当前尝试访问的路径以便登录后跳回
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
}
