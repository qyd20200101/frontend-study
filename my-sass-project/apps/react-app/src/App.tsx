import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DesignerPage from './pages/DesignerPage';
import PreviewPage from './pages/PreviewPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/designer" replace />} />
        <Route path="/designer" element={<DesignerPage />} />
        <Route path="/preview" element={<PreviewPage />} />
      </Routes>
    </BrowserRouter>
  );
}
