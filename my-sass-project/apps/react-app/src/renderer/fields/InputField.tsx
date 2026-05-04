interface Props {
    value?: string;
    label?: string;
    placeholder?: string;
    onChange?: (value: string) => void;
}

export default function InputField(props: Props) {
    return (
        <div style={{ marginBottom: 16 }}>
            {props.label && <label style={{ display: 'block', marginBottom: 4 }}>{props.label}</label>}
            <input
                style={{ padding: '8px 12px', width: '100%' }}
                value={props.value || ''}
                placeholder={props.placeholder}
                onChange={(e) => props.onChange?.(e.target.value)}
            />
        </div>
    );
}
