import { useState } from "react";

export interface TreeNode {
    id: number;
    pid: number;
    name: string;
    children?: TreeNode[];
}

interface Props {
    node: TreeNode;
    onNodeClick: (node: TreeNode) => void;
}

export default function TreeItem({ node, onNodeClick }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const hasChildren = !!node.children?.length;

    const toggle = () => {
        if (hasChildren) {
            setIsOpen((v) => !v);
        }
        onNodeClick(node);
    };

    return (
        <div style={{ listStyle: "none", textAlign: "left" }}>
            <div
                onClick={toggle}
                style={{
                    padding: "5px",
                    cursor: "pointer",
                    userSelect: "none",
                }}
            >
                <span style={{ display: "inline-block", width: 14 }}>
                    {hasChildren ? (isOpen ? "▼" : "▶") : ""}
                </span>
                {node.name}
            </div>
            {isOpen && hasChildren && (
                <ul style={{ marginLeft: 20, paddingLeft: 10, borderLeft: "1px dashed #bbb" }}>
                    {node.children!.map((child) => (
                        <li key={child.id}>
                            <TreeItem node={child} onNodeClick={onNodeClick} />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}