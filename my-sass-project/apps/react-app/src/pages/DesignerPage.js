import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// apps/react-app/src/pages/DesignerPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useDesignerStore } from "../store/designerStore";
import Canvas from "../editor/Canvas";
import PropsPanel from "../editor/PropsPanel";
import { getSchemaApi, saveSchemaApi, getSchemaVersionsApi, rollbackSchemaApi } from "@my-sass/shared";
import { Button, Layout, Space, Typography, message, Card, Switch, Modal, Table } from "antd";
import dayjs from "dayjs";
import { useAuthStore } from "../store/useAuthStore";
const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;
export default function DesignerPage() {
    const { user } = useAuthStore();
    const { addNode, selectedId, getSelectedNode, setNodes, nodes, } = useDesignerStore();
    const [forceTopLevel, setForceTopLevel] = useState(false);
    const [loading, setLoading] = useState(false);
    // 版本控制状态
    const [versionModalVisible, setVersionModalVisible] = useState(false);
    const [versionList, setVersionList] = useState([]);
    const [versionLoading, setVersionLoading] = useState(false);
    // 加载线上 Schema
    const fetchSchema = async () => {
        setLoading(true);
        try {
            const data = await getSchemaApi('asset_form');
            if (data && data.content) {
                setNodes(data.content);
                message.success("已加载最新的资产表单配置");
            }
        }
        catch (err) {
            message.error("加载配置失败");
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchSchema();
    }, []);
    const handleSave = async () => {
        try {
            const res = await saveSchemaApi('asset_form', {
                name: '资产表单',
                content: nodes,
                username: user?.username
            });
            message.success("表单设计已发布到生产环境");
        }
        catch (err) {
            message.error("保存失败");
        }
    };
    const handleOpenVersions = async () => {
        setVersionModalVisible(true);
        setVersionLoading(true);
        try {
            const data = await getSchemaVersionsApi('asset_form');
            setVersionList(data);
        }
        catch (err) {
            message.error("获取版本历史失败");
        }
        finally {
            setVersionLoading(false);
        }
    };
    const handleRollback = async (versionId) => {
        Modal.confirm({
            title: '确认回滚',
            content: '回滚后，当前线上的表单配置将被覆盖，确定执行吗？',
            onOk: async () => {
                try {
                    const res = await rollbackSchemaApi('asset_form', versionId, user?.username);
                    if (res && res.content) {
                        setNodes(typeof res.content === 'string' ? JSON.parse(res.content) : res.content);
                        message.success("回滚成功，已覆盖当前设计并发布线上");
                        setVersionModalVisible(false);
                    }
                }
                catch (err) {
                    message.error("回滚失败");
                }
            }
        });
    };
    const selectedNode = getSelectedNode();
    const targetInfo = useMemo(() => {
        if (forceTopLevel)
            return { parentId: null, text: "添加到：顶层" };
        if (selectedNode?.type === "group")
            return { parentId: selectedNode.id, text: `添加到：${selectedNode.label}` };
        return { parentId: null, text: "添加到：顶层" };
    }, [forceTopLevel, selectedNode]);
    const versionColumns = [
        { title: '版本号', dataIndex: 'version', render: (v) => `v${v}` },
        { title: '创建人', dataIndex: 'createdBy' },
        { title: '发布时间', dataIndex: 'createdAt', render: (t) => dayjs(t).format('YYYY-MM-DD HH:mm:ss') },
        {
            title: '操作',
            render: (_, record) => (_jsx(Button, { size: "small", danger: true, onClick: () => handleRollback(record.id), children: "\u56DE\u6EDA\u81F3\u6B64\u7248\u672C" }))
        }
    ];
    return (_jsxs(Layout, { style: { height: 'calc(100vh - 110px)', background: 'transparent' }, children: [_jsxs(Sider, { width: 280, style: { background: '#fff', padding: 20, borderRight: '1px solid #f0f0f0' }, children: [_jsx(Title, { level: 5, children: "\u7269\u6599\u5E93" }), _jsx(Card, { size: "small", style: { marginBottom: 20, background: '#f9f9f9' }, children: _jsxs(Space, { direction: "vertical", style: { width: '100%' }, children: [_jsxs(Text, { type: "secondary", style: { fontSize: 12 }, children: ["\u5F53\u524D\u9009\u4E2D: ", selectedId || '无'] }), _jsxs(Space, { align: "center", children: [_jsx(Switch, { size: "small", checked: forceTopLevel, onChange: setForceTopLevel }), _jsx(Text, { style: { fontSize: 12 }, children: "\u5F3A\u5236\u6DFB\u52A0\u5230\u9876\u5C42" })] })] }) }), _jsxs(Space, { direction: "vertical", style: { width: '100%' }, children: [_jsx(Button, { block: true, onClick: () => addNode({ id: `f${Date.now()}`, type: 'input', label: '新输入框', props: { modelKey: `key_${Date.now()}` } }, targetInfo.parentId), children: "+ \u6587\u672C\u8F93\u5165" }), _jsx(Button, { block: true, onClick: () => addNode({ id: `f${Date.now()}`, type: 'select', label: '新选择框', props: { modelKey: `key_${Date.now()}`, options: [] } }, targetInfo.parentId), children: "+ \u4E0B\u62C9\u9009\u62E9" }), _jsx(Button, { block: true, onClick: () => addNode({ id: `g${Date.now()}`, type: 'group', label: '新分组', children: [] }, targetInfo.parentId), children: "+ \u5206\u7EC4\u5BB9\u5668" })] }), _jsxs("div", { style: { marginTop: 40, display: 'flex', flexDirection: 'column', gap: 10 }, children: [_jsx(Button, { type: "primary", block: true, size: "large", onClick: handleSave, loading: loading, children: "\u53D1\u5E03\u8BBE\u8BA1" }), _jsx(Button, { block: true, onClick: handleOpenVersions, children: "\u7248\u672C\u5386\u53F2" }), _jsx(Button, { block: true, type: "dashed", onClick: fetchSchema, children: "\u91CD\u7F6E\u4FEE\u6539" })] })] }), _jsx(Content, { style: { padding: 20, overflow: 'auto', background: '#f0f2f5' }, children: _jsx("div", { className: "glass-card", style: { minHeight: '100%', padding: 40, background: '#fff' }, children: _jsx(Canvas, {}) }) }), _jsxs(Sider, { width: 340, style: { background: '#fff', padding: 20, borderLeft: '1px solid #f0f0f0' }, children: [_jsx(Title, { level: 5, children: "\u5C5E\u6027\u7F16\u8F91" }), _jsx(PropsPanel, {})] }), _jsx(Modal, { title: "\u8868\u5355\u7248\u672C\u5386\u53F2", open: versionModalVisible, onCancel: () => setVersionModalVisible(false), footer: null, width: 700, children: _jsx(Table, { dataSource: versionList, columns: versionColumns, rowKey: "id", loading: versionLoading, pagination: { pageSize: 5 } }) })] }));
}
