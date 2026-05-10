// apps/react-app/src/features/system/pages/AuditLogPage.tsx
import { useEffect, useState } from "react";
import { getAuditLogsApi } from "@my-sass/shared";
import { Table, Typography, Tag, Card, Space, Input } from "antd";
import dayjs from "dayjs";

const { Title } = Typography;

export default function AuditLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({ username: '', action: '' });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await getAuditLogsApi(filter);
      setLogs(data);
    } finally {
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
      render: (t: string) => dayjs(t).format("YYYY-MM-DD HH:mm:ss"),
      width: 180,
    },
    {
      title: "操作人",
      dataIndex: "username",
      key: "username",
      render: (u: string) => <Tag color="blue">{u}</Tag>,
      width: 120,
    },
    {
      title: "动作",
      dataIndex: "action",
      key: "action",
      render: (a: string) => {
        let color = 'default';
        if (a.includes('流转')) color = 'orange';
        if (a.includes('删除')) color = 'red';
        if (a.includes('新增')) color = 'green';
        return <Tag color={color}>{a}</Tag>;
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

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 0' }}>
      <Title level={2}>系统审计日志</Title>
      
      <Card style={{ marginBottom: 24 }} className="glass-card">
        <Space size="large">
          <Input 
            placeholder="搜索操作人" 
            value={filter.username} 
            onChange={e => setFilter({ ...filter, username: e.target.value })} 
            style={{ width: 200 }}
          />
          <Input 
            placeholder="搜索动作" 
            value={filter.action} 
            onChange={e => setFilter({ ...filter, action: e.target.value })} 
            style={{ width: 200 }}
          />
        </Space>
      </Card>

      <Table 
        dataSource={logs} 
        columns={columns} 
        rowKey="id" 
        loading={loading}
        className="glass-card"
        pagination={{ pageSize: 15 }}
      />
    </div>
  );
}
