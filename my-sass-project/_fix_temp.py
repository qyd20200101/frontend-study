import re
path = r"D:\qyd20200101\study\my-sass-project\apps\vue-app\src\views\lowcode\FormBuilder.vue"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()
content = content.replace("formId: \\form_", 'formId: `form_${Date.now()}`')
content = content.replace("id: ${type}_", 'id: `${type}_${Date.now().toString().slice(-6)}`')
content = content.replace("label: 新建,", "label: `新建${materialList.value.find(m => m.type === type)?.label || '组件'}`,")
content = content.replace("field: \\field_", 'field: `field_${Date.now().toString().slice(-6)}`')
with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Done")