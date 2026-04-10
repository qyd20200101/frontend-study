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

const categories = ['IoT','Software','Visual','Security'];

// 路由定义（匹配前端request.ts的逻辑）

//1.获取项目列表
app.get ('/api/projects',(req,res) =>{
    setTimeout(() => {
        res.json({
            code: 200,
            data: projects,
            message: 'success'
        })
    }, 800);//模拟网络延迟
});

//2.获取分类字典
app.get('/api/categories',(req,res) =>{
    res.json({
        code:200,
        data:categories,
        message:'success'
    })
});


//3.获取统计数据
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

app.listen(port,() =>{
    console.log(`模拟后端服务器已启动:http://localhost:${port}`);  
})