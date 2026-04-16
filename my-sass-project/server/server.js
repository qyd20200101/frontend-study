import express from "express";
import cors from "cors";
const app = express();
const port = 3000;

//运行跨域
app.use(cors());
app.use(express.json());

// 模拟数据库数据
let projects = [
    { id: 1, name: '西安高新区智慧路灯项目', budget: 1200000, status: 'active', category: 'IoT' },
    { id: 2, name: '软新园区物业管理系统', budget: 450000, status: 'active', category: 'Software' },
    { id: 3, name: '秦岭生态监测大屏', budget: 800000, status: 'archived', category: 'Visual' },
    { id: 4, name: '城墙数字化巡检', budget: 300000, status: 'active', category: 'Software' }
];

// 模拟组织架构数据（扁平结构）
const departments =[
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
const categories = ['IoT','Software','Visual','Security'];
// server.js 

// 1. 模拟数据库增加初始头像
let systemUsers = [
    { 
        id: 1, 
        username: 'admin', 
        role: '超级管理员', 
        roles: ['admin'], // 增加权限数组对应前端
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
        status: 'active', 
        lastLogin: '2023-10-24 10:00' 
    },
    { 
        id: 2, 
        username: 'editor_zhang', 
        role: '普通编辑', 
        roles: ['editor'],
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zhang',
        status: 'active', 
        lastLogin: '2023-10-23 15:30' 
    }
];



// 路由定义（匹配前端request.ts的逻辑）
//模拟登录
app.post('/api/login',(req,res) =>{
    res.json({
        code:200,
        data:{token:'super_admin_token'},
        message:'success'
    })
});

//获取用户列表接口
app.get('/api/users',(req,res) =>{
    res.json({
        code:200,
        data:systemUsers,
        message: 'success'
    });
});
// 新增用户接口
app.post('/api/users', (req, res) => {
    try {
        const { username } = req.body;

        // 1. 简单校验
        if (!username) {
            return res.status(400).json({ code: 400, message: '用户名不能为空' });
        }
        // 用户名唯一性校验
        const isExist = systemUsers.some(user => user.username === username);
        if (isExist) {
            return res.status(400).json({ code: 400, message: '用户名已存在' });
        }
        // 2. 创建新对象 (修正 Date.now 拼写)
        const newUser = {
            id: Date.now(), // ✅ 确保是 Date.now()
            ...req.body,
            status: 'active',
            lastLogin: '-'
        };

        // 3. 【必须】存入模拟数据库
        systemUsers.unshift(newUser);

        // 4. 【必须】返回响应给前端
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


//获取用户信息（包含角色）
app.get('/api/user/info',(req,res) =>{
    const currentUser = systemUsers[0];
    res.json({
        code:200,
        data:currentUser,
        message: 'success'
    })
});

//修改用户权限/信息
app.post('/api/user/update',(req,res) =>{
    const {id,role,username} = req.body;
    const index = systemUsers.findIndex(u => u.id ===id);
    if (index !== -1) {
        systemUsers[index] = {...systemUsers[index],role,username};
        res.json({code:200, data: true,message: '更新成功'});
    } else {
        res.status(404).json({code: 404,message: '用户不存在'});
    }
})

//删除用户接口
app.delete('/api/users/:id',(req,res) =>{
    const {id} = req.params;
    const initialLength = systemUsers.length;

    //过滤掉匹配ID的用户
    systemUsers = systemUsers.filter(u => u.id !== parseInt(id));

    if (systemUsers.length < initialLength) {
        res.json({
            code: 200,
            message: '用户已成功从系统中移除'
        })
    }else{
        res.status(404).json({
            code:404,message: '未找到该用户'
        })
    }
});

// 模拟上传接口
app.post('/api/user/upload', (req, res) => {
    const randomSeed = Math.random().toString(36).substring(7);
    const newAvatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}`;
});

//获取项目列表
app.get ('/api/projects',(req,res) =>{
    setTimeout(() => {
        res.json({
            code: 200,
            data: projects,
            message: 'success'
        })
    }, 800);//模拟网络延迟
});
//新增/更新项目接口
app.post('/api/projects/update', (req,res) =>{
    const updateData = req.body;
    const {id} = updateData;

    // 在模拟数据库里找到对应项
    const index = projects.findIndex(p => p.id === id);

    if (index !== -1) {
        // 更新数据
        projects[index] = {...projects[index], ...updateData};

        //返回重构响应（必须执行res.json，否则前端会一直pending）
        res.json({
            code:200,
            data: projects[index],
            message: '更新成功'
        });
        console.log(`项目[ID:${id}已更新]`);
    }else{
        //如果没找到（比如新增情况，或者ID传错了）
        res.status(404).json({
            code:404,
            message: '未找到该项目'
        });
    }
})
const sysDictDataBase = {
    //项目分类字典
    'project_category':[
        {label: '物联网(IoT)',value: 'IoT'},
        {label: '软件研发(Software)',value: 'Software'},
        {label: '数据大屏(Visual)',value: 'Visual'},
        {label: '安全防护(Security)',value: 'Security'},
    ],
    //项目状态字典
    'project_status':[
        {label: '进行中',value:'active'},
        {label: '已归档',value:'archived'}
    ],
    //用户角色字典
    'sys_role_list' :[
        {label: '超级管理员',value: 'admin'},
        {label: '普通编辑',value: 'editor'},
        {label: '访客',value: 'viewer'},
    ],
    //用户状态字典
    'sys_user_status': [
        {label: '正常',value: 'active'},
        {label: '禁用',value: 'disabled'}
    ]
};
//通用字典查询接口
app.get('/api/dict/:dictCode', (req,res) =>{
    const { dictCode} = req.params;

    //从字典库中获取数据,如果不存在就返回空数组
    const dictData = sysDictDataBase[dictCode] || [];

    //加延迟，模拟真实查库过程
    setTimeout(() => {
        res.json({
            code:200,
            data: dictData,
            message: 'success'
        })
    }, 300);
})

//批量字典查询接口
app.get('/api/dict/batch', (req,res) =>{
    const { codes } = req.query;
    if (!codes) {
        return res.json({code: 200,data: {}})
    }
    const codeList = code.split(',');
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
app.get('/api/status',(req,res) =>{
    const activeBudget = projects
    .filter(p =>p.status === 'active')
    .reduce((sum,p) =>sum + p.budget,0);
    res.json({
        code:200,
        data:{
            totalProjects: projects.length,
            activeBudget: activeBudget
        },
        message: 'success'
    });
});

// 获取组织架构
app.get('/api/departments',(req,res) =>{
    res.json({
        code:200,
        data: departments,
        message: 'success'
    });
});

app.listen(port,() =>{
    console.log(`模拟后端服务器已启动:http://localhost:${port}`);  
})