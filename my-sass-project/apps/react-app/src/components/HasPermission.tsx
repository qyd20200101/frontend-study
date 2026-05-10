// apps/react-app/src/components/HasPermission.tsx
import { useAuthStore } from '../store/useAuthStore';

interface Props {
    children: React.ReactNode;
    roles?: string[];
    fallback?: React.ReactNode;
}

export default function HasPermission({ children, roles, fallback = null }: Props) {
    const { user } = useAuthStore();

    if (!roles || roles.length === 0) {
        return <>{children}</>;
    }

    const hasRole = user?.roles?.some(role => roles.includes(role));

    if (!hasRole) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
