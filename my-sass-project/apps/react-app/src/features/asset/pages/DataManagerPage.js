import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// apps/react-app/src/features/asset/pages/DataManagerPage.tsx
import { useEffect, useMemo, useState } from "react";
import { filterAssets, sortAssets, chartSummaryData, summaryInfo, arrToTree, exportCsv, } from "@my-sass/core";
import { getProjectsApi, batchDeleteProjectApi, getDepartmentsApi, updateProjectApi, addProjectApi, workflowTransitionApi, getSchemaApi, } from "@my-sass/shared";
import { Button, Space, Typography, message } from "antd";
import AssetChart from "../components/AssetChart";
import TreeItem from "../components/TreeItem";
import VirtualTable from "../components/VirtualTable";
import BaseModal from "../components/BaseModal";
import FormRenderer from "../../../renderer/FormRenderer";
import HasPermission from "../../../components/HasPermission";
import { useAuthStore } from "../../../store/useAuthStore";
const { Title } = Typography;
export default function DataManagerPage() {
    const { user } = useAuthStore();
    const [editingItem, setEditingItem] = useState(null);
    const [originalSnapshot, setOriginalSnapshot] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [schema, setSchema] = useState([]);
    // 加载表单配置
    const fetchSchema = async () => {
        try {
            const data = await getSchemaApi('asset_form');
            if (data && data.content)
                setSchema(data.content);
        }
        catch (err) {
            console.error("加载 Schema 失败", err);
        }
    };
    const openEdit = (row) => {
        const copy = row
            ? JSON.parse(JSON.stringify(row))
            : { name: "", budget: 0, category: "", status: "active" };
        setOriginalSnapshot(copy);
        setEditingItem(copy);
    };
    const isDirty = useMemo(() => {
        if (!editingItem || !originalSnapshot)
            return false;
        return JSON.stringify(editingItem) !== JSON.stringify(originalSnapshot);
    }, [editingItem, originalSnapshot]);
    const closeEdit = () => {
        setEditingItem(null);
        setOriginalSnapshot(null);
    };
    const handleCancelEdit = () => {
        if (isDirty) {
            if (!window.confirm("内容已修改，确定放弃吗？"))
                return;
        }
        closeEdit();
    };
    const handleSaveEdit = async () => {
        if (!editingItem || isSaving)
            return;
        setIsSaving(true);
        try {
            const payload = { ...editingItem, username: user?.username };
            if (editingItem.id) {
                await updateProjectApi(payload);
            }
            else {
                await addProjectApi(payload);
            }
            message.success("保存成功");
            await fetchData();
            closeEdit();
        }
        catch (err) {
            message.error("保存失败");
        }
        finally {
            setIsSaving(false);
        }
    };
    // 原始数据
    const [apiData, setApiData] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    // 筛选条件
    const [searchInput, setSearchInput] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedDeptId, setSelectedDeptId] = useState(null);
    // 排序
    const [sortKey, setSortKey] = useState("id");
    const [sortOrder, setSortOrder] = useState(null);
    // 分页
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(50);
    // 批量选择
    const [selectedIds, setSelectedIds] = useState(new Set());
    // 组织树
    const [treeData, setTreeData] = useState([]);
    // 报修弹窗
    const [repairVisible, setRepairVisible] = useState(false);
    const [repairTargetId, setRepairTargetId] = useState(null);
    const [repairReason, setRepairReason] = useState("");
    // 将部门树打平，用于下拉选择
    const deptOptions = useMemo(() => {
        const flatten = (nodes) => {
            let res = [];
            nodes.forEach(n => {
                res.push({ label: n.name, value: n.id });
                if (n.children)
                    res = res.concat(flatten(n.children));
            });
            return res;
        };
        return flatten(treeData);
    }, [treeData]);
    // 动态构建 Schema
    const dynamicSchema = useMemo(() => {
        const processNodes = (nodes) => {
            return nodes.map(node => {
                let newNode = { ...node };
                if (newNode.props?.modelKey === 'deptId') {
                    newNode.props = { ...newNode.props, options: deptOptions };
                }
                if (newNode.props?.modelKey === 'budget') {
                    newNode.props = { ...newNode.props, type: 'number' };
                }
                if (newNode.children) {
                    newNode.children = processNodes(newNode.children);
                }
                return newNode;
            });
        };
        return processNodes(schema);
    }, [deptOptions, schema]);
    // 拉数据
    const fetchData = async () => {
        setLoading(true);
        try {
            const params = {
                page,
                pageSize,
                keyword: searchInput || undefined,
                category: selectedCategory || undefined,
                deptId: selectedDeptId,
            };
            const res = await getProjectsApi(params);
            setApiData(res.list || []);
            setTotal(res.total || 0);
        }
        finally {
            setLoading(false);
        }
    };
    // 初始化
    const init = async () => {
        const list = await getDepartmentsApi();
        setTreeData(arrToTree(list || []));
        await fetchSchema();
    };
    useEffect(() => {
        init();
    }, []);
    useEffect(() => {
        fetchData();
    }, [page, pageSize, searchInput, selectedCategory, selectedDeptId]);
    const filtered = useMemo(() => filterAssets(apiData, {
        selectedCategory,
        selectedDeptId,
        searchQuery: searchInput,
        sortKey: "id",
        sortOrder: null,
    }), [apiData, selectedCategory, selectedDeptId, searchInput]);
    const finalData = useMemo(() => sortAssets(filtered, sortKey, sortOrder), [filtered, sortKey, sortOrder]);
    const summary = useMemo(() => summaryInfo(finalData), [finalData]);
    const chartData = useMemo(() => chartSummaryData(apiData), [apiData]);
    const isAllSelected = finalData.length > 0 && selectedIds.size === finalData.length;
    const isIndeterminate = selectedIds.size > 0 && selectedIds.size < finalData.length;
    const toggleSelection = (id) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id))
                next.delete(id);
            else
                next.add(id);
            return next;
        });
    };
    const selectAll = (checked) => {
        if (!checked)
            return setSelectedIds(new Set());
        setSelectedIds(new Set(finalData.map((i) => i.id)));
    };
    const onSort = (key) => {
        if (sortKey === key) {
            setSortOrder((prev) => prev === "asc" ? "desc" : prev === "desc" ? null : "asc");
        }
        else {
            setSortKey(key);
            setSortOrder("asc");
        }
    };
    const onBatchDelete = async () => {
        if (!selectedIds.size)
            return;
        if (!window.confirm(`确定要批量删除这 ${selectedIds.size} 项资产吗？`))
            return;
        await batchDeleteProjectApi(Array.from(selectedIds), user?.username || 'system');
        setSelectedIds(new Set());
        message.success("批量删除成功");
        fetchData();
    };
    const onExport = () => {
        if (!finalData.length)
            return;
        const csv = exportCsv(finalData);
        const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
        const a = document.createElement("a");
        a.href = url;
        a.download = `资产清单_${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };
    const onRepairOpen = (id) => {
        setRepairTargetId(id);
        setRepairReason("");
        setRepairVisible(true);
    };
    const onRepairConfirm = async () => {
        if (!repairTargetId || !repairReason.trim())
            return;
        try {
            await workflowTransitionApi(repairTargetId, 'report_repair', repairReason, user?.username || 'system');
            message.success("报修申请已提交");
            setRepairVisible(false);
            fetchData();
        }
        catch (err) {
            message.error("操作失败");
        }
    };
    const onStatusTransition = async (id, transitionName, label) => {
        try {
            await workflowTransitionApi(id, transitionName, `执行操作: ${label}`, user?.username || 'system');
            message.success(`已执行: ${label}`);
            fetchData();
        }
        catch (err) {
            message.error("操作失败");
        }
    };
    return (_jsxs("div", { style: { maxWidth: 1400, margin: '0 auto' }, children: [_jsxs("div", { style: { marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx(Title, { level: 2, style: { margin: 0 }, children: "\u8D44\u4EA7\u7BA1\u7406\u63A7\u5236\u53F0" }), _jsxs(Space, { children: [_jsx(HasPermission, { roles: ['admin', 'editor'], children: _jsx(Button, { type: "primary", icon: _jsx("span", { children: "+" }), onClick: () => openEdit(), style: { height: 40, borderRadius: 8, fontWeight: 600 }, children: "\u65B0\u589E\u8D44\u4EA7" }) }), _jsx(Button, { onClick: onExport, style: { height: 40, borderRadius: 8 }, children: "\u5BFC\u51FA CSV" })] })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24, alignItems: 'start' }, children: [_jsxs("div", { style: { display: 'grid', gap: 24 }, children: [_jsxs("div", { className: "glass-card", style: { padding: 20 }, children: [_jsx(Title, { level: 5, style: { marginTop: 0, marginBottom: 16 }, children: "\u7EC4\u7EC7\u67B6\u6784" }), _jsx("div", { style: { maxHeight: 400, overflowY: 'auto' }, children: treeData.length ? (treeData.map((n) => (_jsx(TreeItem, { node: n, onNodeClick: (node) => {
                                                setSelectedDeptId(node.id);
                                                setPage(1);
                                            } }, n.id)))) : (_jsx("div", { style: { color: "#999", textAlign: 'center', padding: '20px 0' }, children: "\u6682\u65E0\u7EC4\u7EC7\u6570\u636E" })) }), selectedDeptId && (_jsx(Button, { type: "link", size: "small", onClick: () => setSelectedDeptId(null), style: { marginTop: 8, padding: 0 }, children: "\u6E05\u7A7A\u90E8\u95E8\u7B5B\u9009" }))] }), _jsxs("div", { className: "glass-card", style: { padding: 20 }, children: [_jsx(Title, { level: 5, style: { marginTop: 0, marginBottom: 16 }, children: "\u6570\u636E\u6982\u89C8" }), _jsxs("div", { style: { display: 'grid', gap: 12 }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between' }, children: [_jsx("span", { style: { color: '#666' }, children: "\u8D44\u4EA7\u603B\u6570" }), _jsx("span", { style: { fontWeight: 600 }, children: summary.count })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between' }, children: [_jsx("span", { style: { color: '#666' }, children: "\u9884\u7B97\u603B\u989D" }), _jsxs("span", { style: { fontWeight: 600, color: '#1677ff' }, children: ["\u00A5", summary.totalBudget.toLocaleString()] })] })] })] })] }), _jsxs("div", { style: { display: 'grid', gap: 24 }, children: [_jsx(AssetChart, { title: "\u8D44\u4EA7\u9884\u7B97\u5206\u5E03\uFF08\u6309\u5206\u7C7B\uFF09", data: chartData, onBarClick: (name) => { setSelectedCategory(name); setPage(1); } }), _jsxs("div", { className: "glass-card", style: { padding: 0, overflow: 'hidden' }, children: [_jsxs("div", { style: { padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.05)' }, children: [_jsx("input", { className: "search-input", placeholder: "\uD83D\uDD0D \u641C\u7D22\u8D44\u4EA7\u540D\u79F0...", value: searchInput, onChange: (e) => { setPage(1); setSearchInput(e.target.value); }, style: { border: '1px solid #ddd', borderRadius: 8, padding: '8px 12px', width: 300, outline: 'none' } }), _jsx(Space, { children: _jsx(HasPermission, { roles: ['admin'], children: _jsxs(Button, { danger: true, disabled: !selectedIds.size, onClick: onBatchDelete, children: ["\u6279\u91CF\u5220\u9664 (", selectedIds.size, ")"] }) }) })] }), loading ? (_jsx("div", { style: { padding: 40, textAlign: 'center', color: '#999' }, children: "\u52A0\u8F7D\u4E2D..." })) : (_jsxs("div", { style: { overflow: "hidden" }, children: [_jsxs("div", { style: { display: "flex", alignItems: "center", height: 45, background: "#fafafa", borderBottom: "1px solid #f0f2f5", fontWeight: 600, padding: "0 12px", minWidth: 900 }, children: [_jsx("div", { style: { width: 45, textAlign: "center" }, children: _jsx("input", { type: "checkbox", checked: isAllSelected, ref: (el) => { if (el)
                                                                el.indeterminate = isIndeterminate; }, onChange: (e) => selectAll(e.target.checked) }) }), _jsx("div", { style: { flex: 3, minWidth: 180, cursor: "pointer" }, onClick: () => onSort("name"), children: "\u8D44\u4EA7\u540D\u79F0" }), _jsx("div", { style: { width: 100, textAlign: "center" }, children: "\u5206\u7C7B" }), _jsx("div", { style: { width: 120, textAlign: "right", paddingRight: 12, cursor: "pointer" }, onClick: () => onSort("budget"), children: "\u9884\u7B97" }), _jsx("div", { style: { width: 100, textAlign: "center" }, children: "\u72B6\u6001" }), _jsx("div", { style: { width: 220, textAlign: "right", paddingRight: 8 }, children: "\u64CD\u4F5C" })] }), _jsx(VirtualTable, { data: finalData, itemHeight: 60, viewHeight: 420, onRowClick: (row) => openEdit(row), renderRow: (row) => (_jsxs("div", { style: { display: "flex", alignItems: "center", height: "100%", borderBottom: "1px solid #f2f6fc", padding: "0 12px", background: selectedIds.has(row.id) ? "#ecf5ff" : "#fff", minWidth: 900 }, children: [_jsx("div", { style: { width: 45, textAlign: "center" }, children: _jsx("input", { type: "checkbox", checked: selectedIds.has(row.id), onChange: () => toggleSelection(row.id), onClick: (e) => e.stopPropagation() }) }), _jsx("div", { style: { flex: 3, minWidth: 180, fontWeight: 500 }, children: row.name }), _jsx("div", { style: { width: 100, textAlign: "center" }, children: row.category }), _jsxs("div", { style: { width: 120, textAlign: "right", paddingRight: 12 }, children: ["\u00A5", row.budget.toLocaleString()] }), _jsx("div", { style: { width: 100, textAlign: "center" }, children: _jsx("span", { style: {
                                                                    padding: '2px 8px',
                                                                    borderRadius: 4,
                                                                    fontSize: '12px',
                                                                    background: row.status === 'active' ? '#e6f7ff' : row.status === 'repair' ? '#fff7e6' : '#f5f5f5',
                                                                    color: row.status === 'active' ? '#1890ff' : row.status === 'repair' ? '#faad14' : '#8c8c8c'
                                                                }, children: row.status }) }), _jsx("div", { style: { width: 220, textAlign: "right", paddingRight: 8 }, children: _jsx(HasPermission, { roles: ['admin', 'editor'], children: _jsxs(Space, { size: "small", children: [row.status === "active" && (_jsxs(_Fragment, { children: [_jsx(Button, { size: "small", onClick: (e) => { e.stopPropagation(); onRepairOpen(row.id); }, children: "\u62A5\u4FEE" }), _jsx(Button, { size: "small", danger: true, onClick: (e) => { e.stopPropagation(); onStatusTransition(row.id, 'scrap_asset', '资产报废'); }, children: "\u62A5\u5E9F" })] })), row.status === "repair" && (_jsxs(_Fragment, { children: [_jsx(Button, { size: "small", type: "primary", onClick: (e) => { e.stopPropagation(); onStatusTransition(row.id, 'finish_repair', '修复完成'); }, children: "\u4FEE\u590D" }), _jsx(Button, { size: "small", danger: true, onClick: (e) => { e.stopPropagation(); onStatusTransition(row.id, 'scrap_asset', '资产报废'); }, children: "\u62A5\u5E9F" })] })), row.status === "scrapped" && (_jsx(Button, { size: "small", onClick: (e) => { e.stopPropagation(); onStatusTransition(row.id, 'reactivate', '重新启用'); }, children: "\u542F\u7528" }))] }) }) })] })) })] })), _jsxs("div", { style: { padding: '16px 20px', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsxs("span", { style: { color: '#999' }, children: ["\u5171 ", total, " \u9879"] }), _jsxs(Space, { children: [_jsx(Button, { disabled: page <= 1, onClick: () => setPage(p => p - 1), children: "\u4E0A\u4E00\u9875" }), _jsxs("span", { children: [page, " / ", Math.ceil(total / pageSize)] }), _jsx(Button, { disabled: page >= Math.ceil(total / pageSize), onClick: () => setPage(p => p + 1), children: "\u4E0B\u4E00\u9875" })] })] })] }), _jsx(BaseModal, { open: !!editingItem, title: editingItem?.id ? "资产详情" : "新增资产", onCancel: handleCancelEdit, onConfirm: handleSaveEdit, children: editingItem && (_jsx(FormRenderer, { nodes: dynamicSchema, value: editingItem, onChange: (key, val) => setEditingItem({ ...editingItem, [key]: val }) })) }), _jsx(BaseModal, { open: repairVisible, title: "\u8D44\u4EA7\u62A5\u4FEE\u7533\u8BF7", onCancel: () => setRepairVisible(false), onConfirm: onRepairConfirm, children: _jsxs("div", { style: { display: "grid", gap: 12 }, children: [_jsx("label", { style: { fontWeight: 500 }, children: "\u62A5\u4FEE\u539F\u56E0" }), _jsx("textarea", { rows: 4, value: repairReason, onChange: (e) => setRepairReason(e.target.value), placeholder: "\u8BF7\u8F93\u5165\u8BE6\u7EC6\u539F\u56E0...", style: { width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd', outline: 'none' } })] }) })] })] })] }));
}
