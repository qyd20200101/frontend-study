// apps/react-app/src/features/asset/pages/DashboardPage.tsx
import { useEffect, useState } from "react";
import { getDashboardAnalyticsApi } from "@my-sass/shared";
import { Typography, Row, Col, Card, Statistic, Spin } from "antd";
import AssetChart from "../components/AssetChart";

const { Title } = Typography;

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getDashboardAnalyticsApi();
        setData(res);
      } catch (err) {
        console.error("加载面板数据失败", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px 0' }}><Spin size="large" /></div>;
  }

  if (!data) return <div>加载失败</div>;

  // 格式化图表数据
  const categoryData = data.categoryDist.map((item: any) => ({
    name: item.category,
    value: item.count
  }));

  const categoryBudgetData = data.categoryDist.map((item: any) => ({
    name: item.category,
    value: item.budget
  }));

  const deptBudgetData = data.deptDist.map((item: any) => ({
    name: item.deptName,
    value: item.budget
  }));

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      <Title level={2} style={{ marginBottom: 24 }}>数据分析仪表盘</Title>

      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card className="glass-card" bordered={false}>
            <Statistic title="资产总数 (件)" value={data.totalCount} valueStyle={{ color: '#1677ff', fontWeight: 600 }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="glass-card" bordered={false}>
            <Statistic title="预算总额 (元)" value={data.totalBudget} precision={2} prefix="¥" valueStyle={{ color: '#52c41a', fontWeight: 600 }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="glass-card" bordered={false}>
            <Statistic 
              title="在用资产" 
              value={data.statusDist.find((s: any) => s.status === 'active')?.count || 0} 
              valueStyle={{ color: '#1890ff', fontWeight: 600 }} 
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="glass-card" bordered={false}>
            <Statistic 
              title="报修资产" 
              value={data.statusDist.find((s: any) => s.status === 'repair')?.count || 0} 
              valueStyle={{ color: '#faad14', fontWeight: 600 }} 
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col span={12}>
          <div className="glass-card" style={{ padding: 20 }}>
            <AssetChart title="按分类分布 (数量)" data={categoryData} />
          </div>
        </Col>
        <Col span={12}>
          <div className="glass-card" style={{ padding: 20 }}>
            <AssetChart title="按分类分布 (预算 ¥)" data={categoryBudgetData} />
          </div>
        </Col>
        <Col span={24}>
          <div className="glass-card" style={{ padding: 20 }}>
            <AssetChart title="各部门预算占用情况 (¥)" data={deptBudgetData} />
          </div>
        </Col>
      </Row>
    </div>
  );
}
