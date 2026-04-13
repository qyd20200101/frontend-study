/*
场景三：工具类型应用
业务痛点：新增资产需要所有字段，修改资产可能只穿几个字段，
或展示列表时不需要显示某些字段
TS工具类型报错：
1.溯源检查：检查底层接口
2.契约一致性：检查属性名称拼写
3.工具选型：使用合适工具,比如pick用于多字段剔除
4.工程化差异：利用vscode的f12转到定义查找，不应依赖any绕过报错
*/ 

interface FullUser{
    id: number;
    username: string;
    password: string;
    email: string;
    phone: string;
}

//1.omit创建一个脱敏后的优化学习类型用于列表展示
type UserPreview = Omit<FullUser,'password'>;

//2.Partial:创建一个可选后的类型用于编辑表单
type UserUpdateForm = Partial<FullUser>;

//测试
const userList: UserPreview[] =[
    {
        id: 1,
        username: 'admin',
        email: '...',
        phone: '...'
    }
]
const updatePayload: UserUpdateForm = {
    email: 'new-email@xi-an.com' // ✅ 只传一个字段也不会报错
};