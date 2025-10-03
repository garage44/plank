/**
 * TextArea field component with label and signal-based two-way binding
 */
import type {Signal} from '@preact/signals'
import '../field.css'

interface TextAreaFieldProps {
    disabled?: boolean
    id: string
    label: string
    model: Signal<string>
    placeholder?: string
    required?: boolean
    rows?: number
}

export function TextAreaField({
    disabled = false,
    id,
    label,
    model,
    placeholder = '',
    required = false,
    rows = 4,
}: TextAreaFieldProps) {
    return (
        <div class="form-group">
            <label for={id}>{label}</label>
            <textarea
                id={id}
                placeholder={placeholder}
                value={model.value}
                onInput={(e) => model.value = (e.target as HTMLTextAreaElement).value}
                required={required}
                disabled={disabled}
                rows={rows}
            />
        </div>
    )
}
