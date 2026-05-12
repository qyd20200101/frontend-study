path = r"D:\qyd20200101\study\my-sass-project\apps\vue-app\src\components\BuilderNode.vue"
with open(path, encoding="utf-8") as f:
    content = f.read()
content = content.replace("actions.onDragStart(\\, comp.id)", "actions.onDragStart($event, comp.id)")
content = content.replace("actions.onDrop(\\, parentList", "actions.onDrop($event, parentList")
content = content.replace("actions.onDrop(\\, comp.list!", "actions.onDrop($event, comp.list!")
content = content.replace("actions.onDrop(\\, col.list!", "actions.onDrop($event, col.list!")
lines = content.splitlines(True)
si = False
sc = False
result = []
for l in lines:
    if "import { useBuilderActions }" in l:
        if si:
            continue
        si = True
    if "const actions = useBuilderActions()" in l:
        if sc:
            continue
        sc = True
    result.append(l)
with open(path, "w", encoding="utf-8") as f:
    f.writelines(result)
print("OK")
