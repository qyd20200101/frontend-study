// apps/react-app/src/features/auth/pages/LoginPage.tsx
import { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { loginApi } from '@my-sass/shared';
import { useAuthStore } from '../../../store/useAuthStore';

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const setAuth = useAuthStore((state) => state.setAuth);
    const navigate = useNavigate();
    const location = useLocation();

    // 获取登录成功后需要跳转的路径（默认为首页）
    const from = location.state?.from?.pathname || '/';

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const res = await loginApi(values);
            setAuth(res.token, res.user);
            message.success('登录成功，欢迎回来！');
            navigate(from, { replace: true });
        } catch (err: any) {
            // 测试环境旁路：如果接口 404 或 500，且用户名为 admin，则允许进入系统
            if ((err.response?.status === 404 || err.code === 'ERR_NETWORK' || !err.response) && values.username === 'admin') {
                console.warn('后端接口未就绪，正在使用模拟账户进入系统...');
                setAuth('mock-token-123456', {
                    username: 'admin',
                    role: 'admin',
                    roles: ['admin'],
                    status: 'active'
                });
                message.success('本地模拟登录成功！');
                navigate(from, { replace: true });
                return;
            }
            message.error(err.response?.data?.message || '登录失败，请检查用户名或密码');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
        }}>
            <Card title={<h2 style={{ textAlign: 'center', margin: 0 }}>SaaS 资产管理系统</h2>} style={{ width: 400, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                <Form name="login" onFinish={onFinish} layout="vertical" size="large">
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: '请输入用户名' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="用户名" />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: '请输入密码' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="密码" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={loading}>
                            立即登录
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}
