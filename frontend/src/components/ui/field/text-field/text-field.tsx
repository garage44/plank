/**
 * Text field component with label and signal-based two-way binding
 */
import type {Signal} from '@preact/signals'
import '../field.css'

interface TextFieldProps {
    disabled?: boolean
    id: string
    label: string
    model: Signal<string>
    placeholder?: string
    required?: boolean
    type?: 'text' | 'email' | 'password' | 'url' | 'tel'
}

export function TextField({
    disabled = false,
    id,
    label,
    model,
    placeholder = '',
    required = false,
    type = 'text',
}: TextFieldProps) {
    return (
        <div class="form-group">
            <label for={id}>{label}</label>
            <input
                type={type}
                id={id}
                placeholder={placeholder}
                value={model.value}
                onInput={(e) => model.value = (e.target as HTMLInputElement).value}
                required={required}
                disabled={disabled}
            />
        </div>
    )
}
