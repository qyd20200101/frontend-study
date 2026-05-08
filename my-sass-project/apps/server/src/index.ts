// apps/server/src/index.ts
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import type { LoginParams } from '@my-sass/shared';
import { MOCK_USERS, MOCK_PROJECTS, MOCK_DEPARTMENTS } from './mockData.js';

const app = express();
const PORT = 3001; 
const JWT_SECRET = 'your-secret-key-2026';

app.use(cors());
app.use(express.json());

// --- 接口实现 ---

// 1. 登录接口
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body as LoginParams;

    const user = MOCK_USERS.find(u => u.username === username);

    if (user && password === '123456') {
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
        return res.json({
            token,
            user
        });
    }

    res.status(401).json({ message: '用户名或密码错误' });
});

// 2. 获取用户列表
app.get('/api/users', (req, res) => {
    res.json(MOCK_USERS);
});

// 3. 获取部门树
app.get('/api/departments', (req, res) => {
    res.json(MOCK_DEPARTMENTS);
});

// 4. 资产列表接口（带过滤功能）
app.get('/api/projects', (req, res) => {
    const { keyword, category, deptId } = req.query;
    
    let list = [...MOCK_PROJECTS];

    if (keyword) {
        list = list.filter(p => p.name.toLowerCase().includes((keyword as string).toLowerCase()));
    }
    if (category) {
        list = list.filter(p => p.category === category);
    }
    if (deptId) {
        list = list.filter(p => p.deptId === Number(deptId));
    }

    res.json({
        total: list.length,
        list: list
    });
});

// 5. 新增资产项目
app.post('/api/projects', (req, res) => {
    const newProject = {
        ...req.body,
        id: Date.now(),
        status: 'active'
    };
    MOCK_PROJECTS.unshift(newProject);
    res.json(newProject);
});

// 6. 更新资产项目
app.put('/api/projects/:id', (req, res) => {
    const { id } = req.params;
    const index = MOCK_PROJECTS.findIndex(p => p.id === Number(id));
    if (index > -1) {
        MOCK_PROJECTS[index] = { ...MOCK_PROJECTS[index], ...req.body };
        return res.json(MOCK_PROJECTS[index]);
    }
    res.status(404).json({ message: '资产不存在' });
});

// 7. 批量删除资产
app.post('/api/projects/batch-delete', (req, res) => {
    const { ids } = req.body as { ids: number[] };
    const idSet = new Set(ids);
    const initialLength = MOCK_PROJECTS.length;
    
    // 注意：实际开发中应该修改原数组或操作数据库
    // 这里简单处理：过滤掉在 idSet 中的项
    const newList = MOCK_PROJECTS.filter(p => !idSet.has(p.id));
    MOCK_PROJECTS.length = 0;
    MOCK_PROJECTS.push(...newList);

    res.json({ success: true, deletedCount: initialLength - newList.length });
});

// 8. 退出登录 (空操作)
app.post('/api/auth/logout', (req, res) => {
    res.json({ message: '登出成功' });
});

app.listen(PORT, () => {
    console.log(`✅ SaaS 后端服务运行在: http://localhost:${PORT}`);
});
