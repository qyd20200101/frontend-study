import re

path = r"D:\qyd20200101\study\my-sass-project\apps\vue-app\src\components\BuilderNode.vue"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Step 1: Replace all handleXxx with actions.onXxx in template
content = content.replace('handleSelect', 'actions.onSelect')
content = content.replace('handleDelete', 'actions.onDelete')
content = content.replace('handleDragStart', 'actions.onDragStart')
content = content.replace('handleDropEvent', 'actions.onDrop')

# Step 2: Remove defineEmits block
content = re.sub(
    r'const emit = defineEmits<\{[^}]+\}>\s*;',
    '',
    content,
    flags=re.DOTALL
)

# Step 3: Remove the 4 forwarding functions
content = re.sub(
    r'const handleSelect = [^\n]+\nconst handleDelete = [^\n]+\nconst handleDragStart = [^\n]+\nconst handleDropEvent = [^\n]+\n',
    '',
    content
)

# Step 4: Add useBuilderActions import and const
old_import = "import type { FormComponent } from '../types/lowcode';"
new_import = old_import + "\nimport { useBuilderActions } from '../hooks/useBuilderActions';\n\nconst actions = useBuilderActions();"
content = content.replace(old_import, new_import)

# Step 5: Remove @select/@delete/@dragstart/@drop from child BuilderNode tags
content = re.sub(
    r'(\s+)@select="actions\.onSelect"\s+@delete="actions\.onDelete"\s+@dragstart="actions\.onDragStart"\s+@drop="actions\.onDrop"',
    '',
    content
)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("BuilderNode done")