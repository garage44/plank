/**
 * Button component with variants and loading state
 * Loosely based on expressio's button component
 */
import type {JSX} from 'preact'
import './button.css'

interface ButtonProps {
    children?: JSX.Element | JSX.Element[] | string
    class?: string
    disabled?: boolean
    isLoading?: boolean
    onClick?: JSX.MouseEventHandler<HTMLButtonElement>
    size?: 'small' | 'medium' | 'large'
    type?: 'button' | 'submit' | 'reset'
    variant?: 'primary' | 'secondary' | 'tertiary' | 'danger'
}

export function Button({
    children,
    class: className,
    disabled,
    isLoading = false,
    onClick,
    size = 'medium',
    type = 'button',
    variant = 'primary',
}: ButtonProps) {
    const classes = [
        'btn',
        `btn-${variant}`,
        `btn-${size}`,
        isLoading && 'btn-loading',
        className,
    ].filter(Boolean).join(' ')

    return (
        <button
            type={type}
            class={classes}
            disabled={disabled || isLoading}
            onClick={onClick}
        >
            {isLoading ? 'Loading...' : children}
        </button>
    )
}
