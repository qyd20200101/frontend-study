interface Option {
    label: string;
    value: string | number;
}

interface Props {
    value?: string | number;
    label?: string;
    options?: Option[];
    onChange?: (value: string | number) => void;
}

export default function RadioField(props: Props) {
    return (
        <div style={{ marginBottom: 16 }}>
            {props.label && <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, color: '#444' }}>{props.label}</label>}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {props.options?.map((option) => (
                    <label key={option.value} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                        <input
                            type="radio"
                            name={props.label}
                            value={option.value}
                            checked={props.value === option.value}
                            onChange={() => props.onChange?.(option.value)}
                            style={{ cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: 14 }}>{option.label}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}
