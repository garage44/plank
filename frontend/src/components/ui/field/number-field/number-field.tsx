/**
 * Number field component with label and signal-based two-way binding
 */
import type {Signal} from '@preact/signals'
import '../field.css'

interface NumberFieldProps {
    disabled?: boolean
    id: string
    label: string
    max?: number
    min?: number
    model: Signal<string | number>
    placeholder?: string
    required?: boolean
    step?: number
}

export function NumberField({
    disabled = false,
    id,
    label,
    max,
    min,
    model,
    placeholder = '',
    required = false,
    step,
}: NumberFieldProps) {
    return (
        <div class="form-group">
            <label for={id}>{label}</label>
            <input
                type="number"
                id={id}
                placeholder={placeholder}
                value={model.value}
                onInput={(e) => model.value = (e.target as HTMLInputElement).value}
                required={required}
                disabled={disabled}
                min={min}
                max={max}
                step={step}
            />
        </div>
    )
}
