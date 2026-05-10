import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
// apps/react-app/src/components/HasPermission.tsx
import { useAuthStore } from '../store/useAuthStore';
export default function HasPermission({ children, roles, fallback = null }) {
    const { user } = useAuthStore();
    if (!roles || roles.length === 0) {
        return _jsx(_Fragment, { children: children });
    }
    const hasRole = user?.roles?.some(role => roles.includes(role));
    if (!hasRole) {
        return _jsx(_Fragment, { children: fallback });
    }
    return _jsx(_Fragment, { children: children });
}
