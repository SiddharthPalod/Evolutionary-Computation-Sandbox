interface Props {
    label: string;
    value: string | number;
    min: number;
    max: number;
    step?: number;
    currentValue: number;
    onChange: (val: number) => void;
}

export function ControlSlider({ label, value, min, max, step = 1, currentValue, onChange }: Props) {
    return (
        <div className="mb-6">
            <div className="flex justify-between mb-2 text-sm">
                <span className="text-[#e8eefc]">{label}</span>
                <span className="text-[#65d9ff] font-mono">{value}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={currentValue}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full accent-[#65d9ff] cursor-pointer"
            />
        </div>
    );
}
