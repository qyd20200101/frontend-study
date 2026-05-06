import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import MaterialPanel from './MaterialPanel';
import CanvasPanel from './CanvasPanel';
import SettingsPanel from './SettingsPanel';
export default function Designer() {
    return (_jsxs("div", { style: { display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }, children: [_jsx(MaterialPanel, {}), _jsx(CanvasPanel, {}), _jsx(SettingsPanel, {})] }));
}
