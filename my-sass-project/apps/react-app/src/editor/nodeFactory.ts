import type { BaseNode } from "@my-sass/core";

const uid = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
export function createInputNode(): BaseNode {
  const key = uid("field");
  return {
    id: uid("input"),
    type: "input",
    label: "输入框",
    props: {
      modelKey: key,
      placeholder: "请输入",
    },
  };
}

export function createSelectNode(): BaseNode {
  const key = uid("field");
  return {
    id: uid("select"),
    type: "select",
    label: "下拉框",
    props: {
      modelKey: key,
      options: [
        { label: "选项1", value: "1" },
        { label: "选项2", value: "2" },
      ],
    },
  };
}
export function createGroupNode(): BaseNode {
  return {
    id: uid("group"),
    type: "group",
    label: "分组",
    children: [],
  };
}
