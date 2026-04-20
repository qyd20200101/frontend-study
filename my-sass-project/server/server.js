import express from "express";
import cors from "cors";
const app = express();
const port = 3000;

//运行跨域
app.use(cors());
app.use(express.json());

// 模拟数据库数据
let projects = [];
const categories = ['IoT', 'Software', 'Visual', 'Security'];
const statuses = ['active', 'archived','repair'];
// 模拟组织架构数据（扁平结构）
const departments = [
    { id: 1, pid: 0, name: '西安某集团总部' },
    { id: 2, pid: 1, name: '行政管理中心' },
    { id: 3, pid: 1, name: '研发技术中心' },
    { id: 4, pid: 1, name: '西北市场部' },
    { id: 5, pid: 3, name: '前端开发部' },
    { id: 6, pid: 3, name: '后端开发部' },
    { id: 7, pid: 3, name: '测试自动化组' },
    { id: 8, pid: 5, name: 'Vue项目组' },
    { id: 9, pid: 5, name: 'React项目组' },
    { id: 10, pid: 4, name: '西安分部' },
    { id: 11, pid: 4, name: '兰州办事处' },
    { id: 12, pid: 10, name: '高新区分队' }
];
const sysDictDataBase = {
    //项目分类字典
    'project_category': [
        { label: '物联网(IoT)', value: 'IoT' },
        { label: '软件研发(Software)', value: 'Software' },
        { label: '数据大屏(Visual)', value: 'Visual' },
        { label: '安全防护(Security)', value: 'Security' },
    ],
    //项目状态字典
    'project_status': [
        { label: '进行中', value: 'active' },
        { label: '已归档', value: 'archived' }
    ],
    //用户角色字典
    'sys_role_list': [
        { label: '超级管理员', value: 'admin' },
        { label: '普通编辑', value: 'editor' },
        { label: '访客', value: 'viewer' },
    ],
    //用户状态字典
    'sys_user_status': [
        { label: '正常', value: 'active' },
        { label: '禁用', value: 'disabled' }
    ]
};
for (let i = 1; i < 120; i++) {
    projects.push({
        id: i,
        name: i <= 4 ? ['西安高新区智慧路灯项目', '软新园区物业管理系统', '秦岭生态监测大屏', '城墙数字化巡检'][i-1] : `压测资产项目 —— 编号 ${i}`,
        budget: Math.floor(Math.random() * 1000000) + 100000,
        status: statuses[i % 3],
        category: categories[i % 4],
        deptId: (i % 5) + 1, // 模拟部门 1~5
        history: [{ time: new Date().toLocaleString(), operator: 'System', action: '初始化' }]
    });
    
}
//优化ID生成器（）不在使用Date.now()
const generateId = () => `u_${Math.random().toString(36).slice(2, 11)}`;
const generateProjectId = () => `p_${Math.random().toString(36).slice(2, 11)}`;

// 1. 模拟数据库增加初始头像
let systemUsers = [
    {
        id: generateId(),
        username: 'admin',
        password: '123456',
        role: '超级管理员',
        roles: ['admin'], // 增加权限数组对应前端
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
        status: 'active',
        lastLogin: '2023-10-24 10:00'
    },
    {
        id: generateId(),
        username: 'editor_zhang',
        password: '112233',
        role: '普通编辑',
        roles: ['editor'],
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zhang',
        status: 'active',
        lastLogin: '2023-10-23 15:30'
    }
];

// 【✅ 正确的登录接口】
app.post('/api/login', (req, res) => {
    // 1. 从请求体中解构出用户名和密码
    const { username, password } = req.body;
    
    console.log(`[Auth] 收到登录请求: user=${username}, pass=${password}`);
    
    // 2. 在模拟数据库中查找匹配的用户（用户名和密码都得对）
    const user = systemUsers.find(u => u.username === username && u.password === password);

    // 3. 根据查找结果返回不同响应
    if (user) {
        // 如果找到了，返回 200 和一个模拟的 Token
        console.log(`[Auth] ✅ 用户 ${username} 验证成功`);
        res.json({
            code: 200,
            data: { token: `token_${user.username}_${Date.now()}` },
            message: '登录成功'
        });
    } else {
        // 如果没找到，返回 401
        console.log(`[Auth] ❌ 用户 ${username} 验证失败`);
        res.status(401).json({ code: 401, message: '用户名或密码错误' });
    }
});

//获取用户列表接口
app.get('/api/users', (req, res) => {
    res.json({
        code: 200,
        data: systemUsers,
        message: 'success'
    });
});
// 新增用户接口:增加校验功能
app.post('/api/users', (req, res) => {
    try {
        const { username,password,role,roles } = req.body;

        // 字段规范校验
        if (!username || username.length < 3) {
            return res.status(400).json({ code: 400, message: '用户名至少需要3位' });
        }
        if (!password || password.length < 6) {
            return res.status(400).json({ code: 400, message: '密码至少需要6位' });
        }
        if (systemUsers.some(u => u.username === username)) {
            return res.status(400).json({ code: 400, message: '用户名已存在' });
        }
        // 创建新对象 (修正 Date.now 拼写)
        const newUser = {
            id: generateId(),
            username,
            password,
            role: role || '访客',
            roles: roles || ['viewer'],
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
            status: 'active',
            lastLogin: '-'
        };

        //因为使用unshift导致第一个用户占领第一个位置，因为新用户没有设置权限
        //前端路由守卫就判定权限不足，强制重新登录
        systemUsers.push(newUser);
        res.json({
            code: 200,
            data: newUser,
            message: '用户创建成功'
        });
    } catch (error) {
        // 如果这里报错，前端才会收到 500
        res.status(500).json({ code: 500, message: '服务器内部错误' });
    }
});


app.get('/api/user/info', (req, res) => {
    const authHeader = req.headers.authorization;
    console.log('--- 收到 /api/user/info 请求 ---');
    console.log('[Step 1] 收到的 Authorization Header:', authHeader);

    let currentUser;

   if (authHeader && authHeader.startsWith('Bearer ')) {
        const tokenValue = authHeader.replace('Bearer ', '');
        const tokenParts = tokenValue.split('_');
        // 【核心修正】：不再只取第二段，而是把中间的所有段拼接起来
        if (tokenParts.length >= 3) { // 至少包含 "token"、用户名、时间戳
            // 提取从第二个元素到倒数第二个元素的所有部分
            // 例如: 'editor_zhang' -> 提取 'editor', 'zhang' -> 拼接成 'editor_zhang'
            const usernameParts = tokenParts.slice(1, -1);
            const reqUsername = usernameParts.join('_');
            
            console.log('[Step 4] 从 Token 中解析出的用户名:', reqUsername);
            
            currentUser = systemUsers.find(u => u.username === reqUsername);
            console.log('[Step 5] 在数据库中查找结果:', currentUser ? `找到用户 ${currentUser.username}` : '❌ 未找到用户');
        }
    }

    if (currentUser) {
        console.log('[结果] ✅ 验证成功，返回用户信息');
        res.json({ code: 200, data: { ...currentUser, roles: currentUser.roles || ['viewer'] } });
    } else {
        console.log('[结果] ❌ 验证失败，返回 401');
        res.status(401).json({ code: 401, message: 'Token失效，请重新登录' });
    }
    console.log('--- /api/user/info 请求处理完毕 ---\n');
});

//修改用户权限/信息
app.post('/api/user/update', (req, res) => {
    const { id, role, username } = req.body;
    const index = systemUsers.findIndex(u => u.id === id);
    if (index !== -1) {
        systemUsers[index] = { ...systemUsers[index], role, username };
        res.json({ code: 200, data: true, message: '更新成功' });
    } else {
        res.status(404).json({ code: 404, message: '用户不存在' });
    }
})

//删除用户接口
app.delete('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const initialLength = systemUsers.length;

    //过滤掉匹配ID的用户
    systemUsers = systemUsers.filter(u => String(u.id) !== parseInt(id));

    if (systemUsers.length < initialLength) {
        res.json({
            code: 200,
            message: '用户已成功从系统中移除'
        })
    } else {
        res.status(404).json({
            code: 404, message: '未找到该用户'
        })
    }
});

// 模拟上传接口
app.post('/api/user/upload', (req, res) => {
    const randomSeed = Math.random().toString(36).substring(7);
    const newAvatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}`;
    res.json({})
});

//获取项目列表
app.get('/api/projects', (req, res) => {
    setTimeout(() => {
        res.json({
            code: 200,
            data: projects,
            message: 'success'
        })
    }, 800);//模拟网络延迟
});
//项目分页查询
app.get('/api/projects/page',(req,res) =>{
    //获取分页和过滤参数
    let page = parseInt(req.query.page) || 1;
    let pageSize = parseInt(req.query.pageSize) || 50;
    let {keyword,category,deptId} = req.query;

    //内存查询过滤（模拟SQL的WHERE）
    let filteredList = projects.filter(item =>{
        let match = true;
        //模糊匹配名称
        if (keyword) {
            match = match&& item.name.includes(keyword);
        }
        //精确匹配分类
        if (category) {
            match = match && item.category === category;
        }
        //精确匹配部门
        if (deptId && deptId !== 'null' && deptId !=='undefined') {
            match = match && String(item.deptId) === String(deptId);
        }
        return match;  
    });

    //计算总数
    const total = filteredList.length;

    //内存分页截取（模拟SQL的LIMIT&OFFSET）
    const startIndex = (page -1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pagedList = filteredList.slice(startIndex,endIndex);

    //模拟网络延迟后返回标准格式
    setTimeout(() =>{
        res.json({
            code:200,
            data: {
                list: pagedList,
                total: total,
            },
            message: 'success'
        });
    },300); //300ms延迟
});

//资产批量删除
app.delete('/api/projects/batch',(req,res) =>{
    const {ids} = req.body;

    if (!ids || !Array.isArray(ids)) {
        return res.json({code:400,message:'参数错误，必须通过ID数组'});
    }

    //从内存数据库中过滤这些被删除的ID
    const initialLength = projects.length;
    projects = projects.filter(item => !ids.includes(item.id));

    res.json({
        code:200,
        data: null,
        message: `成功删除${initialLength - projects.length}条数据`
    });
});
//新增/更新项目接口
app.post('/api/projects/update', (req, res) => {
    try {
        const updateData = req.body;
        const { id } = updateData;

        // 如果传了 ID，说明是【修改】
        if (id) {
            const index = projects.findIndex(p => String(p.id) === String(id));
            if (index !== -1) {
                projects[index] = { ...projects[index], ...updateData };
                // 必须要有 return！
                return res.json({ code: 200, data: projects[index], message: '更新成功' });
            } else {
                return res.status(404).json({ code: 404, message: '未找到项目' });
            }
        } 
        
        // 如果没传 ID，说明是【新增】
        const newProject = {
            id: generateProjectId(), 
            ...updateData
        };
        projects.unshift(newProject); // 加到最前面
        
        // 必须要有 return！
        return res.json({
            code: 200,
            data: newProject,
            message: '项目新增成功'
        });

    } catch (error) {
        console.error('【严重错误】', error);
        return res.status(500).json({ code: 500, message: '服务器崩溃了' });
    }
});

//通用字典查询接口
app.get('/api/dict/:dictCode', (req, res) => {
    const { dictCode } = req.params;

    //从字典库中获取数据,如果不存在就返回空数组
    const dictData = sysDictDataBase[dictCode] || [];

    //加延迟，模拟真实查库过程
    setTimeout(() => {
        res.json({
            code: 200,
            data: dictData,
            message: 'success'
        })
    }, 300);
})

//批量字典查询接口
app.get('/api/dict/batch', (req, res) => {
    const { codes } = req.query;
    if (!codes) {
        return res.json({ code: 200, data: {} })
    }
    const codeList = codes.split(',');
    const result = {};

    codeList.forEach(code => {
        result[code] = sysDictDataBase[code] || [];
    });

    res.json({
        code: 200,
        data: result,
        message: 'success'
    })
})

//获取统计数据
app.get('/api/status', (req, res) => {
    const activeBudget = projects
        .filter(p => p.status === 'active')
        .reduce((sum, p) => sum + p.budget, 0);
    res.json({
        code: 200,
        data: {
            totalProjects: projects.length,
            activeBudget: activeBudget
        },
        message: 'success'
    });
});

// 获取组织架构
app.get('/api/departments', (req, res) => {
    res.json({
        code: 200,
        data: departments,
        message: 'success'
    });
});

app.listen(port, () => {
    console.log(`模拟后端服务器已启动:http://localhost:${port}`);
})