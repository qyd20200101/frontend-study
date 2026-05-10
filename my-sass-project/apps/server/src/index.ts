// apps/server/src/index.ts
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import type { LoginParams } from '@my-sass/shared';
import db, { initDB, logAudit } from './db.js';
import { WorkflowEngine } from '@my-sass/core';

const app = express();
const PORT = 3001; 
const JWT_SECRET = 'your-secret-key-2026';

// 初始化数据库
initDB();

app.use(cors());
app.use(express.json());

// --- 接口实现 ---

// 1. 登录接口
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body as LoginParams;
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;

    if (user && password === '123456') {
        const roles = JSON.parse(user.roles);
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
        return res.json({
            token,
            user: { ...user, roles }
        });
    }
    res.status(401).json({ message: '用户名或密码错误' });
});

// 2. 获取用户列表
app.get('/api/users', (req, res) => {
    const users = db.prepare('SELECT * FROM users').all() as any[];
    const result = users.map(u => ({ ...u, roles: JSON.parse(u.roles) }));
    res.json(result);
});

// 3. 获取部门树
app.get('/api/departments', (req, res) => {
    const departments = db.prepare('SELECT * FROM departments').all();
    res.json(departments);
});

// 4. 资产列表接口
app.get('/api/projects', (req, res) => {
    const { keyword, category, deptId } = req.query;
    let query = 'SELECT * FROM projects WHERE 1=1';
    const params: any[] = [];
    if (keyword) { query += ' AND name LIKE ?'; params.push(`%${keyword}%`); }
    if (category) { query += ' AND category = ?'; params.push(category); }
    if (deptId) { query += ' AND deptId = ?'; params.push(Number(deptId)); }

    const list = db.prepare(query).all(...params);
    res.json({ total: list.length, list: list });
});

// 4.1 资产流转接口 (Workflow)
app.post('/api/projects/:id/workflow', (req, res) => {
    const { id } = req.params;
    const { transitionName, remark, username } = req.body;

    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as any;
    if (!project) return res.status(404).json({ message: '资产不存在' });

    if (!WorkflowEngine.canTransition(project.status, transitionName)) {
        return res.status(400).json({ message: '非法状态流转' });
    }

    const transition = WorkflowEngine.getTransition(transitionName)!;
    db.prepare('UPDATE projects SET status = ? WHERE id = ?').run(transition.to, id);

    logAudit(username || 'system', `资产流转: ${transition.label}`, Number(id), remark);

    res.json({ success: true, status: transition.to });
});

// 5. 新增资产项目
app.post('/api/projects', (req, res) => {
    const { name, budget, category, deptId, username } = req.body;
    const info = db.prepare('INSERT INTO projects (name, budget, category, status, deptId) VALUES (?, ?, ?, ?, ?)').run(
        name, budget, category, 'active', deptId
    );
    
    logAudit(username || 'system', '新增资产', Number(info.lastInsertRowid), `名称: ${name}`);
    const newProject = db.prepare('SELECT * FROM projects WHERE id = ?').get(info.lastInsertRowid);
    res.json(newProject);
});

// 6. 更新资产项目
app.put('/api/projects/:id', (req, res) => {
    const { id } = req.params;
    const { name, budget, category, status, deptId, username } = req.body;
    
    const updateFields: string[] = [];
    const params: any[] = [];
    if (name !== undefined) { updateFields.push('name = ?'); params.push(name); }
    if (budget !== undefined) { updateFields.push('budget = ?'); params.push(budget); }
    if (category !== undefined) { updateFields.push('category = ?'); params.push(category); }
    if (status !== undefined) { updateFields.push('status = ?'); params.push(status); }
    if (deptId !== undefined) { updateFields.push('deptId = ?'); params.push(deptId); }

    if (updateFields.length === 0) return res.status(400).json({ message: '没有要更新的字段' });

    params.push(Number(id));
    const result = db.prepare(`UPDATE projects SET ${updateFields.join(', ')} WHERE id = ?`).run(...params);

    if (result.changes > 0) {
        logAudit(username || 'system', '更新资产', Number(id), JSON.stringify(req.body));
        const updatedProject = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
        return res.json(updatedProject);
    }
    res.status(404).json({ message: '资产不存在' });
});

// 7. 批量删除资产
app.post('/api/projects/batch-delete', (req, res) => {
    const { ids, username } = req.body as { ids: number[], username: string };
    if (!ids || ids.length === 0) return res.json({ success: true, deletedCount: 0 });
    
    const placeholders = ids.map(() => '?').join(',');
    const result = db.prepare(`DELETE FROM projects WHERE id IN (${placeholders})`).run(...ids);

    logAudit(username || 'system', '批量删除资产', undefined, `IDS: ${ids.join(',')}`);
    res.json({ success: true, deletedCount: result.changes });
});

// 8. 审计日志查询
app.get('/api/audit-logs', (req, res) => {
    const { username, action } = req.query;
    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    const params: any[] = [];

    if (username) {
        query += ' AND username = ?';
        params.push(username);
    }
    if (action) {
        query += ' AND action LIKE ?';
        params.push(`%${action}%`);
    }

    query += ' ORDER BY timestamp DESC LIMIT 100';
    const logs = db.prepare(query).all(...params);
    res.json(logs);
});

// 8.1 Schema 管理
app.get('/api/schemas/:id', (req, res) => {
    const { id } = req.params;
    const schema = db.prepare('SELECT * FROM schemas WHERE id = ?').get(id) as any;
    if (schema) {
        return res.json({ ...schema, content: JSON.parse(schema.content) });
    }
    res.status(404).json({ message: 'Schema 不存在' });
});

app.post('/api/schemas/:id', (req, res) => {
    const { id } = req.params;
    const { name, content, username } = req.body;
    
    // 获取当前最新版本号
    const versionRecord = db.prepare('SELECT MAX(version) as v FROM schema_versions WHERE schemaId = ?').get(id) as { v: number | null };
    const nextVersion = (versionRecord.v || 0) + 1;

    const existing = db.prepare('SELECT id FROM schemas WHERE id = ?').get(id);
    if (existing) {
        db.prepare('UPDATE schemas SET name = ?, content = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?').run(
            name, JSON.stringify(content), id
        );
    } else {
        db.prepare('INSERT INTO schemas (id, name, content) VALUES (?, ?, ?)').run(
            id, name, JSON.stringify(content)
        );
    }

    // 记录版本
    db.prepare('INSERT INTO schema_versions (schemaId, content, version, createdBy) VALUES (?, ?, ?, ?)').run(
        id, JSON.stringify(content), nextVersion, username || 'system'
    );

    logAudit(username || 'system', `更新表单设计: ${name} (v${nextVersion})`, undefined, id);
    res.json({ success: true, version: nextVersion });
});

// 8.2 Schema 版本查询
app.get('/api/schemas/:id/versions', (req, res) => {
    const { id } = req.params;
    const versions = db.prepare('SELECT id, version, createdBy, createdAt FROM schema_versions WHERE schemaId = ? ORDER BY version DESC').all(id);
    res.json(versions);
});

// 8.3 Schema 回滚
app.post('/api/schemas/:id/rollback', (req, res) => {
    const { id } = req.params;
    const { versionId, username } = req.body;

    const versionRecord = db.prepare('SELECT * FROM schema_versions WHERE id = ?').get(versionId) as any;
    if (!versionRecord) return res.status(404).json({ message: '版本不存在' });

    db.prepare('UPDATE schemas SET content = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?').run(
        versionRecord.content, id
    );

    // 回滚也可以视为产生一个新版本，或者只是简单覆盖。为了简单，直接覆盖 content，不产生新版本号。但更好的做法是把回滚作为一次新发布。
    // 我们这里采用直接覆盖。
    
    logAudit(username || 'system', `回滚表单设计至 v${versionRecord.version}`, undefined, id);
    res.json({ success: true, content: JSON.parse(versionRecord.content) });
});

// 9. 数据看板分析
app.get('/api/analytics/dashboard', (req, res) => {
    const totalCountRes = db.prepare('SELECT COUNT(*) as count FROM projects').get() as { count: number };
    const totalBudgetRes = db.prepare('SELECT SUM(budget) as total FROM projects').get() as { total: number };
    
    const statusDist = db.prepare('SELECT status, COUNT(*) as count FROM projects GROUP BY status').all();
    const categoryDist = db.prepare('SELECT category, COUNT(*) as count, SUM(budget) as budget FROM projects GROUP BY category').all();
    
    // 关联 departments 表获取部门名称
    const deptDist = db.prepare(`
        SELECT d.name as deptName, COUNT(p.id) as count, SUM(p.budget) as budget 
        FROM projects p 
        JOIN departments d ON p.deptId = d.id 
        GROUP BY p.deptId
    `).all();

    res.json({
        totalCount: totalCountRes.count,
        totalBudget: totalBudgetRes.total || 0,
        statusDist,
        categoryDist,
        deptDist
    });
});

// 10. 退出登录
app.post('/api/auth/logout', (req, res) => {
    res.json({ message: '登出成功' });
});

// 全局异常处理，提升健壮性
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[Global Error Handler]', err);
    res.status(500).json({ message: '服务器内部错误', details: err.message });
});

app.listen(PORT, () => {
    console.log(`✅ SaaS 后端服务运行在: http://localhost:${PORT} (SQLite + Workflow + Audit)`);
});
