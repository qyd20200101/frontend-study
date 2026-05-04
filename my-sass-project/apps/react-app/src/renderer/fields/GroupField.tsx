import type { ReactNode } from 'react';

interface Props {
    label?: string;
    children?: ReactNode;
}

export default function GroupField(props: Props) {
    return (
        <div style={{ border: '1px solid #2a2a2a', padding: 16, marginBottom: 16 }}>
            {props.label && <h3 style={{ marginBottom: 12 }}>{props.label}</h3>}
            {props.children}
        </div>
    );
}
