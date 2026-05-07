import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import DataManagerPage from "./features/asset/pages/DataManagerPage";

import DesignerPage from "./pages/DesignerPage";
import PreviewPage from "./pages/PreviewPage";
import { Link } from "react-router-dom";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <nav style={{ padding: '12px 24px', background: '#fff', borderBottom: '1px solid #ddd', display: 'flex', gap: '16px' }}>
        <Link to="/asset">资产管理</Link>
        <Link to="/designer">表单设计器</Link>
        <Link to="/preview">表单预览</Link>
      </nav>
      {children}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/asset" replace />} />
          <Route path="/asset" element={<DataManagerPage />} />
          <Route path="/designer" element={<DesignerPage />} />
          <Route path="/preview" element={<PreviewPage />} />
          <Route path="*" element={<div style={{ padding: 24 }}>404 Not Found</div>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
