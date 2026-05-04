interface Option {
    label: string;
    value: string;
}

interface Props {
    value?: string;
    label?: string;
    options?: Option[];
    onChange?: (value: string) => void;
}

export default function SelectField(props: Props) {
    return (
        <div style={{ marginBottom: 16 }}>
            {props.label && <label style={{ display: 'block', marginBottom: 4 }}>{props.label}</label>}
            <select
                style={{ padding: '8px 12px', width: '100%' }}
                value={props.value || ''}
                onChange={(e) => props.onChange?.(e.target.value)}
            >
                <option value="">请选择</option>
                {props.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
