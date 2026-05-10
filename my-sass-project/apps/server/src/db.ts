// apps/server/src/db.ts
import Database from 'better-sqlite3';
import { MOCK_USERS, MOCK_PROJECTS, MOCK_DEPARTMENTS } from './mockData.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../database.sqlite');
const db = new Database(dbPath);

// 初始化数据库
export function initDB() {
    // 1. 用户表
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            role TEXT NOT NULL,
            roles TEXT NOT NULL,
            status TEXT NOT NULL
        )
    `);

    // 2. 部门表
    db.exec(`
        CREATE TABLE IF NOT EXISTS departments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            pid INTEGER NOT NULL
        )
    `);

    // 3. 资产项目表
    db.exec(`
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            budget REAL NOT NULL,
            category TEXT NOT NULL,
            status TEXT NOT NULL,
            deptId INTEGER NOT NULL,
            FOREIGN KEY (deptId) REFERENCES departments(id)
        )
    `);

    // 4. 审计日志表
    db.exec(`
        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            action TEXT NOT NULL,
            targetId INTEGER,
            details TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 5. 表单 Schema 表
    db.exec(`
        CREATE TABLE IF NOT EXISTS schemas (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            content TEXT NOT NULL,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 6. 表单 Schema 版本快照表
    db.exec(`
        CREATE TABLE IF NOT EXISTS schema_versions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            schemaId TEXT NOT NULL,
            content TEXT NOT NULL,
            version INTEGER NOT NULL,
            createdBy TEXT NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (schemaId) REFERENCES schemas(id)
        )
    `);

    // 种子数据 (Seed)
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    if (userCount.count === 0) {
        console.log('🌱 Seeding users...');
        const insertUser = db.prepare('INSERT INTO users (id, username, role, roles, status) VALUES (?, ?, ?, ?, ?)');
        MOCK_USERS.forEach(user => {
            insertUser.run(user.id, user.username, user.role, JSON.stringify(user.roles), user.status);
        });
    }

    const deptCount = db.prepare('SELECT COUNT(*) as count FROM departments').get() as { count: number };
    if (deptCount.count === 0) {
        console.log('🌱 Seeding departments...');
        const insertDept = db.prepare('INSERT INTO departments (id, name, pid) VALUES (?, ?, ?)');
        MOCK_DEPARTMENTS.forEach(dept => {
            insertDept.run(dept.id, dept.name, dept.pid);
        });
    }

    const projectCount = db.prepare('SELECT COUNT(*) as count FROM projects').get() as { count: number };
    if (projectCount.count === 0) {
        console.log('🌱 Seeding projects...');
        const insertProject = db.prepare('INSERT INTO projects (id, name, budget, category, status, deptId) VALUES (?, ?, ?, ?, ?, ?)');
        MOCK_PROJECTS.forEach(project => {
            insertProject.run(project.id, project.name, project.budget, project.category, project.status, project.deptId);
        });
    }

    const schemaCount = db.prepare('SELECT COUNT(*) as count FROM schemas').get() as { count: number };
    if (schemaCount.count === 0) {
        console.log('🌱 Seeding schemas...');
        const initialAssetSchema = [
            { id: "g1", type: "group", label: "基本信息", children: [
                { id: "f1", type: "input", label: "资产名称", props: { modelKey: "name", placeholder: "请输入资产名称" }, rules: [{ required: true, message: "名称必填" }] },
                { id: "f2", type: "select", label: "分类", props: { modelKey: "category", options: [{ label: "办公用品", value: "办公用品" }, { label: "电子设备", value: "电子设备" }, { label: "办公家具", value: "办公家具" }] } },
                { id: "f3", type: "select", label: "所属部门", props: { modelKey: "deptId", options: [] } },
            ]},
            { id: "g2", type: "group", label: "财务信息", children: [
                { id: "f4", type: "input", label: "预算 (元)", props: { modelKey: "budget", type: "number" } }
            ]}
        ];
        db.prepare('INSERT INTO schemas (id, name, content) VALUES (?, ?, ?)').run(
            'asset_form', '资产表单', JSON.stringify(initialAssetSchema)
        );
    }
}

export function logAudit(username: string, action: string, targetId?: number, details?: string) {
    db.prepare('INSERT INTO audit_logs (username, action, targetId, details) VALUES (?, ?, ?, ?)').run(
        username, action, targetId, details
    );
}

export default db;
