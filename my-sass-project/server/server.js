import express from "express";
import cors from "cors";
const app = express();
const port = 3000;

//运行跨域
app.use(cors());
app.use(express.json());

// 模拟数据库数据
const projects = [
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

//模拟数据库
const systemUsers = [
    { id: 1, username: 'admin', role: '超级管理员', status: 'active', lastLogin: '2023-10-24 10:00' },
    { id: 2, username: 'editor_zhang', role: '普通编辑', status: 'active', lastLogin: '2023-10-23 15:30' }
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
    const newUser = {
        id: systemUsers.length + 1,
        ...req.body,
        status: 'active',
        lastLogin: '-'
    };
    systemUsers.unshift(newUser);
    res.json({
        code: 200,
        data: newUser,
        message: '用户创建成功'
    });
});

//获取用户信息（包含角色）
app.get('/api/user/info',(req,res) =>{
    res.json({
        code:200,
        data:{
            username:'张三',
            avatar: 'http://xxx.jpg',
            roles: ['admin']//关键：返回角色
        },
        message: 'success'
    })
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

//获取分类字典
app.get('/api/categories',(req,res) =>{
    res.json({
        code:200,
        data:categories,
        message:'success'
    })
});


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