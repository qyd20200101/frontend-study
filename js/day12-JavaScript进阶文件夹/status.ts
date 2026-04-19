/*
场景二：复杂状态的联合类型与字面量（业务逻辑严密性）
业务痛点：资产有多种状态（待审，运行中，报废），
不同状态允许的操作不同
特点：
1.类型安全：防止代码中出现Running首字母大写，或者拼写错误
2.领域驱动：利用字面量联合类型定义业务状态机，将运行时的逻辑判断，提取到编译阶段，
保证系统状态流转的可靠
*/

//1.定义窗体字面量（比Eum更清亮，更灵活）
type AssetStatus = 'pending'| 'running'| 'scrapped';

interface Project{
    name: string;
    status: AssetStatus;
    deptId?: number
}
//2.类型守卫函数(Type Guard)
function canEdit(project:Project): boolean {
    // 只有在“待审”状态下才允许编辑
    return project.status === 'pending';
}

//测试
const p1: Project= {name: '项目A',status: 'running'};
console.log('是否可编辑:',canEdit(p1));
