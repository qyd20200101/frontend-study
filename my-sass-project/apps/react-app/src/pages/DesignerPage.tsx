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
  const {
    addNode,
    selectedId,
    getSelectedNode,
    setNodes,
    nodes,
  } = useDesignerStore();

  const [forceTopLevel, setForceTopLevel] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // 版本控制状态
  const [versionModalVisible, setVersionModalVisible] = useState(false);
  const [versionList, setVersionList] = useState<any[]>([]);
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
    } catch (err) {
      message.error("加载配置失败");
    } finally {
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
    } catch (err) {
      message.error("保存失败");
    }
  };

  const handleOpenVersions = async () => {
    setVersionModalVisible(true);
    setVersionLoading(true);
    try {
      const data = await getSchemaVersionsApi('asset_form');
      setVersionList(data);
    } catch (err) {
      message.error("获取版本历史失败");
    } finally {
      setVersionLoading(false);
    }
  };

  const handleRollback = async (versionId: number) => {
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
        } catch (err) {
          message.error("回滚失败");
        }
      }
    });
  };

  const selectedNode = getSelectedNode();

  const targetInfo = useMemo(() => {
    if (forceTopLevel) return { parentId: null, text: "添加到：顶层" };
    if (selectedNode?.type === "group") return { parentId: selectedNode.id, text: `添加到：${selectedNode.label}` };
    return { parentId: null, text: "添加到：顶层" };
  }, [forceTopLevel, selectedNode]);

  const versionColumns = [
    { title: '版本号', dataIndex: 'version', render: (v: number) => `v${v}` },
    { title: '创建人', dataIndex: 'createdBy' },
    { title: '发布时间', dataIndex: 'createdAt', render: (t: string) => dayjs(t).format('YYYY-MM-DD HH:mm:ss') },
    { 
      title: '操作', 
      render: (_: any, record: any) => (
        <Button size="small" danger onClick={() => handleRollback(record.id)}>回滚至此版本</Button>
      ) 
    }
  ];

  return (
    <Layout style={{ height: 'calc(100vh - 110px)', background: 'transparent' }}>
      <Sider width={280} style={{ background: '#fff', padding: 20, borderRight: '1px solid #f0f0f0' }}>
        <Title level={5}>物料库</Title>
        <Card size="small" style={{ marginBottom: 20, background: '#f9f9f9' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text type="secondary" style={{fontSize: 12}}>当前选中: {selectedId || '无'}</Text>
            <Space align="center">
              <Switch size="small" checked={forceTopLevel} onChange={setForceTopLevel} />
              <Text style={{fontSize: 12}}>强制添加到顶层</Text>
            </Space>
          </Space>
        </Card>

        <Space direction="vertical" style={{ width: '100%' }}>
          <Button block onClick={() => addNode({ id: `f${Date.now()}`, type: 'input', label: '新输入框', props: { modelKey: `key_${Date.now()}` } }, targetInfo.parentId)}>+ 文本输入</Button>
          <Button block onClick={() => addNode({ id: `f${Date.now()}`, type: 'select', label: '新选择框', props: { modelKey: `key_${Date.now()}`, options: [] } }, targetInfo.parentId)}>+ 下拉选择</Button>
          <Button block onClick={() => addNode({ id: `g${Date.now()}`, type: 'group', label: '新分组', children: [] }, targetInfo.parentId)}>+ 分组容器</Button>
        </Space>
        
        <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Button type="primary" block size="large" onClick={handleSave} loading={loading}>发布设计</Button>
          <Button block onClick={handleOpenVersions}>版本历史</Button>
          <Button block type="dashed" onClick={fetchSchema}>重置修改</Button>
        </div>
      </Sider>

      <Content style={{ padding: 20, overflow: 'auto', background: '#f0f2f5' }}>
        <div className="glass-card" style={{ minHeight: '100%', padding: 40, background: '#fff' }}>
          <Canvas />
        </div>
      </Content>

      <Sider width={340} style={{ background: '#fff', padding: 20, borderLeft: '1px solid #f0f0f0' }}>
        <Title level={5}>属性编辑</Title>
        <PropsPanel />
      </Sider>

      <Modal
        title="表单版本历史"
        open={versionModalVisible}
        onCancel={() => setVersionModalVisible(false)}
        footer={null}
        width={700}
      >
        <Table 
          dataSource={versionList} 
          columns={versionColumns} 
          rowKey="id" 
          loading={versionLoading}
          pagination={{ pageSize: 5 }}
        />
      </Modal>
    </Layout>
  );
}

