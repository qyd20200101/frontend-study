import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// apps/react-app/src/features/system/pages/AuditLogPage.tsx
import { useEffect, useState } from "react";
import { getAuditLogsApi } from "@my-sass/shared";
import { Table, Typography, Tag, Card, Space, Input } from "antd";
import dayjs from "dayjs";
const { Title } = Typography;
export default function AuditLogPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState({ username: '', action: '' });
    const fetchLogs = async () => {
        setLoading(true);
        try {
            const data = await getAuditLogsApi(filter);
            setLogs(data);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchLogs();
    }, [filter]);
    const columns = [
        {
            title: "操作时间",
            dataIndex: "timestamp",
            key: "timestamp",
            render: (t) => dayjs(t).format("YYYY-MM-DD HH:mm:ss"),
            width: 180,
        },
        {
            title: "操作人",
            dataIndex: "username",
            key: "username",
            render: (u) => _jsx(Tag, { color: "blue", children: u }),
            width: 120,
        },
        {
            title: "动作",
            dataIndex: "action",
            key: "action",
            render: (a) => {
                let color = 'default';
                if (a.includes('流转'))
                    color = 'orange';
                if (a.includes('删除'))
                    color = 'red';
                if (a.includes('新增'))
                    color = 'green';
                return _jsx(Tag, { color: color, children: a });
            },
            width: 150,
        },
        {
            title: "目标 ID",
            dataIndex: "targetId",
            key: "targetId",
            width: 100,
        },
        {
            title: "详细信息",
            dataIndex: "details",
            key: "details",
            ellipsis: true,
        },
    ];
    return (_jsxs("div", { style: { maxWidth: 1200, margin: '0 auto', padding: '24px 0' }, children: [_jsx(Title, { level: 2, children: "\u7CFB\u7EDF\u5BA1\u8BA1\u65E5\u5FD7" }), _jsx(Card, { style: { marginBottom: 24 }, className: "glass-card", children: _jsxs(Space, { size: "large", children: [_jsx(Input, { placeholder: "\u641C\u7D22\u64CD\u4F5C\u4EBA", value: filter.username, onChange: e => setFilter({ ...filter, username: e.target.value }), style: { width: 200 } }), _jsx(Input, { placeholder: "\u641C\u7D22\u52A8\u4F5C", value: filter.action, onChange: e => setFilter({ ...filter, action: e.target.value }), style: { width: 200 } })] }) }), _jsx(Table, { dataSource: logs, columns: columns, rowKey: "id", loading: loading, className: "glass-card", pagination: { pageSize: 15 } })] }));
}
