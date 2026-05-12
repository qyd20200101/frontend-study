interface Props {
    value?: string;
    label?: string;
    onChange?: (value: string) => void;
}

export default function DateField(props: Props) {
    return (
        <div style={{ marginBottom: 16 }}>
            {props.label && <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, color: '#444' }}>{props.label}</label>}
            <input
                type="date"
                style={{ 
                    padding: '10px 12px', 
                    width: '100%', 
                    borderRadius: 8, 
                    border: '1px solid #ddd',
                    outline: 'none',
                    background: '#fff',
                    fontFamily: 'inherit'
                }}
                value={props.value ?? ''}
                onChange={(e) => props.onChange?.(e.target.value)}
            />
        </div>
    );
}
