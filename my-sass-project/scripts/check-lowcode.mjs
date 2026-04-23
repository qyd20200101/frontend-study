#!/usr/bin/env node

/**
 * 低代码表单系统 - 项目检查工具
 * 检查所有必要的文件和依赖是否已安装
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname);

const requiredFiles = [
    'src/views/lowcode/FormBuilder.vue',
    'src/views/lowcode/FormConsumer.vue',
    'src/components/FormPreview.vue',
    'src/components/ComponentConfig.vue',
    'src/api/form.ts',
    'src/types/lowcode.ts',
    'src/utils/lowcode.ts',
    'src/utils/validation.ts',
    'src/router/index.ts',
];

const requiredDependencies = [
    'vue',
    'element-plus',
    'vue-router',
    'pinia',
];

console.log('🔍 检查低代码表单系统...\n');

// 检查文件
console.log('📁 检查必要文件...');
let filesOk = true;

requiredFiles.forEach(file => {
    const filePath = path.join(projectRoot, file);
    const exists = fs.existsSync(filePath);
    const status = exists ? '✅' : '❌';
    console.log(`  ${status} ${file}`);
    if (!exists) filesOk = false;
});

console.log('');

// 检查依赖
console.log('📦 检查npm依赖...');
const packageJsonPath = path.join(projectRoot, 'package.json');

if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
    };

    let depsOk = true;
    requiredDependencies.forEach(dep => {
        const installed = !!allDeps[dep];
        const status = installed ? '✅' : '❌';
        console.log(`  ${status} ${dep}`);
        if (!installed) depsOk = false;
    });

    console.log('\n📊 检查结果:');
    if (filesOk && depsOk) {
        console.log('✅ 所有检查通过！');
        console.log('\n🚀 你可以开始使用低代码表单系统了');
        console.log('   访问: http://localhost:5173/form-builder');
        process.exit(0);
    } else {
        console.log('❌ 有些检查未通过');
        if (!filesOk) console.log('   - 请检查必要的文件是否存在');
        if (!depsOk) console.log('   - 请运行: npm install');
        process.exit(1);
    }
} else {
    console.log('❌ 找不到 package.json');
    process.exit(1);
}