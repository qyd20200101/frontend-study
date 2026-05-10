import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    const onFinish = async (values) => {
        setLoading(true);
        try {
            const res = await loginApi(values);
            setAuth(res.token, res.user);
            message.success('登录成功，欢迎回来！');
            navigate(from, { replace: true });
        }
        catch (err) {
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
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { style: {
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
        }, children: _jsx(Card, { title: _jsx("h2", { style: { textAlign: 'center', margin: 0 }, children: "SaaS \u8D44\u4EA7\u7BA1\u7406\u7CFB\u7EDF" }), style: { width: 400, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }, children: _jsxs(Form, { name: "login", onFinish: onFinish, layout: "vertical", size: "large", children: [_jsx(Form.Item, { name: "username", rules: [{ required: true, message: '请输入用户名' }], children: _jsx(Input, { prefix: _jsx(UserOutlined, {}), placeholder: "\u7528\u6237\u540D" }) }), _jsx(Form.Item, { name: "password", rules: [{ required: true, message: '请输入密码' }], children: _jsx(Input.Password, { prefix: _jsx(LockOutlined, {}), placeholder: "\u5BC6\u7801" }) }), _jsx(Form.Item, { children: _jsx(Button, { type: "primary", htmlType: "submit", block: true, loading: loading, children: "\u7ACB\u5373\u767B\u5F55" }) })] }) }) }));
}
