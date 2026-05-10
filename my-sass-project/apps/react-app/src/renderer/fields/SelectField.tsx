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

export default function SelectField(props: Props) {
    return (
        <div style={{ marginBottom: 16 }}>
            {props.label && <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, color: '#444' }}>{props.label}</label>}
            <select
                style={{ 
                    padding: '10px 12px', 
                    width: '100%', 
                    borderRadius: 8, 
                    border: '1px solid #ddd',
                    outline: 'none',
                    background: '#fff'
                }}
                value={props.value ?? ''}
                onChange={(e) => {
                    const val = e.target.value;
                    // 尝试转为数字，如果是数字字符串则转为数字
                    const numericVal = Number(val);
                    props.onChange?.(isNaN(numericVal) || val === '' ? val : numericVal);
                }}
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
