import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DesignerPage from './pages/DesignerPage';
import PreviewPage from './pages/PreviewPage';
export default function App() {
    return (_jsx(BrowserRouter, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Navigate, { to: "/designer", replace: true }) }), _jsx(Route, { path: "/designer", element: _jsx(DesignerPage, {}) }), _jsx(Route, { path: "/preview", element: _jsx(PreviewPage, {}) })] }) }));
}
