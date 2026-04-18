<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
//引入API
import { getUsersApi, addUserApi, updateUserApi, deleteUserApi, type SystemUser } from "../api/user";
//引入组件
import BaseModal from "../components/BaseModal.vue";
//引入核心Hook
import { useForm } from "../hooks/useForm";




//响应式状态
const userList = ref<SystemUser[]>([]);
const isLoading = ref(false);
const searchQuery = ref('');

//初始化加载
const fetchUsers = async () => {
    isLoading.value = true;
    try {
        const data = await getUsersApi();
        userList.value = data;
    } catch (error) {
        console.error('获取用户列表失败');
    } finally {
        isLoading.value = false;
    }
}

//前端过滤：根据用户名即时筛选
const filteredUsers = computed(() => {
    return userList.value.filter(u => u.username.toLocaleLowerCase().includes(searchQuery.value.toLocaleLowerCase()))
});

//增/改表单逻辑
const { formData: editingUser, isSaving, openForm, closeForm, submitForm } = useForm<SystemUser>(async (data) => {
    if (data.id) {
        await updateUserApi(data);
    }
    else {
        //简单判断查重
        if (userList.value.some(u => u.username === data.username)) {
            throw new Error('用户名已存在');
        }
        await addUserApi(data);
    }
})


//点击新增按钮
const onAdd = () => {
    openForm({
        username: '',
        password: '',
        role: 'viewer',
        roles: ['viewer'],
        status: 'active',
    } as SystemUser)
}
//点击配置权限/编辑按钮

//删除逻辑:二次确认
const handleDelete = (row: SystemUser) => {
    ElMessageBox.confirm(
        `确定要永久删除用户[${row.username}]吗？此操作不可撤销。`,
        '安全确认',
        {
            confirmButtonText: '确认删除', cancelButtonText: '取消', type: 'warning'
        }
    ).then(async () => {
        try {
            await deleteUserApi(row.id!);
            ElMessage.success('删除成功');
            fetchUsers();//刷新列表
        } catch (error) {
            ElMessage.error('删除失败');
        }
    }).catch(() => {
        console.log('取消删除');
    })
}
//保存回调
const handleSave = () => {
    const user = editingUser.value;
    if (!user) return;

    const targetName = user.username.trim();
    //基础规范校验
    if (targetName.length < 3) {
        return ElMessage.warning('用户名至少需要3位');
    }

    if (!user.id) {
        //校验密码
        if (!user.password || user.password.length <6) {
            return ElMessage.warning('新用户初始密码至少需要6位');
        }

        //全局查重
        const isDuplicate = userList.value.some(u => u.username === targetName);
        if (isDuplicate) {
            return ElMessage.error(`系统中已存在该用户${targetName}`);
        }
    }else{
        //查重时，必须排除当前正在编辑的ID
        const isDuplicate = userList.value.some(u => u.username === user.id);

        if (isDuplicate) {
            return ElMessage.error(`该用户已被其他账号占用`);
        }
    }   

    
    submitForm(() => {
        ElMessage.success(editingUser.value?.id ? '修改成功' : '新增成功');
        fetchUsers();//刷新视图
    })
}
onMounted(() => fetchUsers());
</script>
<template>
    <div class="system-container">
        <div class="page-header">
            <h3>👥 用户权限管理</h3>
            <div class="action">
                <!-- 查集成搜索框 -->
                 <el-input
                 v-model="searchQuery"
                 placeholder="输入用户名搜索..."
                 style="width: 200px; margin-right: 15px;
                 clearable"/>
                <el-button type="primary" @click="onAdd">+ 新增用户</el-button>
            </div>
        </div>


        <!-- 数据展示区 -->
        <el-table :data="filteredUsers" v-loading="isLoading" border>
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="username" label="用户名" />
            <el-table-column prop="role" label="角色" />
            <el-table-column label="状态">
                <template #default="{ row }">
                    <el-tag :type="row.status === 'active' ? 'success' : 'info'">{{ row.status }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
                <template #default="{ row }">
                    <el-button link type="primary" @click="openForm(row)">编辑</el-button>
                    <!-- 【删】危险操作标红 -->
                    <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <!-- 新增用户弹窗 -->
        <BaseModal 
    :model-value="!!editingUser" 
    :title="editingUser?.id ? '修改用户权限' : '新增系统用户'" 
    @confirm="handleSave"
    @update:model-value="closeForm"
>
    <div class="user-form" v-if="editingUser">
        <div class="form-item">
            <label>用户名</label>
            <el-input v-model="editingUser.username" placeholder="3-20位字符" :disabled="!!editingUser.id" />
        </div>
        
        <div class="form-item" v-if="!editingUser.id">
            <label>设置密码</label>
            <el-input v-model="editingUser.password" type="password" show-password placeholder="至少6位" />
        </div>

        <div class="form-item">
            <label>分配角色</label>
            <ProSelect v-model="editingUser.role" dictCode="sys_role_list" style="width 100%" />
        </div>
        <p v-if="isSaving" class="saving-txt">正在写入系统加密数据库...</p>
    </div>
</BaseModal>
    </div>
</template>
<style scoped>
.system-container {
    padding: 20px;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.table-card {
    background: #fff;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.user-form {
    padding: 10px 0;
}

.form-item {
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 15px;
    z-index: 9999;
}

.form-item label {
    width: 80px;
    text-align: right;
    color: #606266;
}

.saving-txt {
    color: #1890ff;
    font-size: 12px;
    text-align: center;
}
</style>