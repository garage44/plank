/**
 * Select field component with label and signal-based two-way binding
 */
import type {Signal} from '@preact/signals'
import '../field.css'

export interface SelectOption {
    label: string
    value: string | number
}

interface SelectFieldProps {
    disabled?: boolean
    id: string
    label: string
    model: Signal<string | number>
    options: SelectOption[]
    placeholder?: string
    required?: boolean
}

export function SelectField({
    disabled = false,
    id,
    label,
    model,
    options,
    placeholder = 'Select an option',
    required = false,
}: SelectFieldProps) {
    return (
        <div class="form-group">
            <label for={id}>{label}</label>
            <select
                id={id}
                value={model.value}
                onChange={(e) => model.value = (e.target as HTMLSelectElement).value}
                required={required}
                disabled={disabled}
            >
                {placeholder && (
                    <option value="" disabled>
                        {placeholder}
                    </option>
                )}
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    )
}
