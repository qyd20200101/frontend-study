import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// apps/react-app/src/features/asset/pages/DashboardPage.tsx
import { useEffect, useState } from "react";
import { getDashboardAnalyticsApi } from "@my-sass/shared";
import { Typography, Row, Col, Card, Statistic, Spin } from "antd";
import AssetChart from "../components/AssetChart";
const { Title } = Typography;
export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getDashboardAnalyticsApi();
                setData(res);
            }
            catch (err) {
                console.error("加载面板数据失败", err);
            }
            finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);
    if (loading) {
        return _jsx("div", { style: { textAlign: 'center', padding: '100px 0' }, children: _jsx(Spin, { size: "large" }) });
    }
    if (!data)
        return _jsx("div", { children: "\u52A0\u8F7D\u5931\u8D25" });
    // 格式化图表数据
    const categoryData = data.categoryDist.map((item) => ({
        name: item.category,
        value: item.count
    }));
    const categoryBudgetData = data.categoryDist.map((item) => ({
        name: item.category,
        value: item.budget
    }));
    const deptBudgetData = data.deptDist.map((item) => ({
        name: item.deptName,
        value: item.budget
    }));
    return (_jsxs("div", { style: { maxWidth: 1400, margin: '0 auto' }, children: [_jsx(Title, { level: 2, style: { marginBottom: 24 }, children: "\u6570\u636E\u5206\u6790\u4EEA\u8868\u76D8" }), _jsxs(Row, { gutter: [24, 24], style: { marginBottom: 24 }, children: [_jsx(Col, { span: 6, children: _jsx(Card, { className: "glass-card", bordered: false, children: _jsx(Statistic, { title: "\u8D44\u4EA7\u603B\u6570 (\u4EF6)", value: data.totalCount, valueStyle: { color: '#1677ff', fontWeight: 600 } }) }) }), _jsx(Col, { span: 6, children: _jsx(Card, { className: "glass-card", bordered: false, children: _jsx(Statistic, { title: "\u9884\u7B97\u603B\u989D (\u5143)", value: data.totalBudget, precision: 2, prefix: "\u00A5", valueStyle: { color: '#52c41a', fontWeight: 600 } }) }) }), _jsx(Col, { span: 6, children: _jsx(Card, { className: "glass-card", bordered: false, children: _jsx(Statistic, { title: "\u5728\u7528\u8D44\u4EA7", value: data.statusDist.find((s) => s.status === 'active')?.count || 0, valueStyle: { color: '#1890ff', fontWeight: 600 } }) }) }), _jsx(Col, { span: 6, children: _jsx(Card, { className: "glass-card", bordered: false, children: _jsx(Statistic, { title: "\u62A5\u4FEE\u8D44\u4EA7", value: data.statusDist.find((s) => s.status === 'repair')?.count || 0, valueStyle: { color: '#faad14', fontWeight: 600 } }) }) })] }), _jsxs(Row, { gutter: [24, 24], children: [_jsx(Col, { span: 12, children: _jsx("div", { className: "glass-card", style: { padding: 20 }, children: _jsx(AssetChart, { title: "\u6309\u5206\u7C7B\u5206\u5E03 (\u6570\u91CF)", data: categoryData }) }) }), _jsx(Col, { span: 12, children: _jsx("div", { className: "glass-card", style: { padding: 20 }, children: _jsx(AssetChart, { title: "\u6309\u5206\u7C7B\u5206\u5E03 (\u9884\u7B97 \u00A5)", data: categoryBudgetData }) }) }), _jsx(Col, { span: 24, children: _jsx("div", { className: "glass-card", style: { padding: 20 }, children: _jsx(AssetChart, { title: "\u5404\u90E8\u95E8\u9884\u7B97\u5360\u7528\u60C5\u51B5 (\u00A5)", data: deptBudgetData }) }) })] })] }));
}
