/**
 * Reusable Icon component for rendering SVG icons
 * Icons store only path data, styling is handled by the component
 */
import type {JSX} from 'preact'

interface IconProps {
    class?: string
    color?: string
    name: string
    size?: number
}

// Icon definitions - only path data, no styling
const icons: Record<string, JSX.Element | JSX.Element[]> = {
    box: [
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />,
        <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />,
    ],
    check: (
        <path d="M20 6L9 17l-5-5" />
    ),
    clipboard: [
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />,
        <path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z" />,
    ],
    close: (
        <path d="M18 6L6 18M6 6l12 12" />
    ),
    edit: (
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    ),
    error: [
        <circle cx="12" cy="12" r="10" />,
        <path d="M15 9l-6 6M9 9l6 6" />,
    ],
    info: [
        <circle cx="12" cy="12" r="10" />,
        <path d="M12 16v-4M12 8h.01" />,
    ],
    layers: [
        <path d="M12 2L2 7l10 5 10-5-10-5z" />,
        <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />,
    ],
    minus: (
        <path d="M5 12h14" />
    ),
    moon: (
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    ),
    plus: (
        <path d="M12 5v14M5 12h14" />
    ),
    radio: [
        <circle cx="12" cy="12" r="2" />,
        <path d="M16.24 7.76a6 6 0 0 1 0 8.49M7.76 16.24a6 6 0 0 1 0-8.49M19.07 4.93a10 10 0 0 1 0 14.14M4.93 19.07a10 10 0 0 1 0-14.14" />,
    ],
    sun: [
        <circle cx="12" cy="12" r="5" />,
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />,
    ],
    trash: (
        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
    ),
    warning: [
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />,
        <path d="M12 9v4M12 17h.01" />,
    ],
}

export function Icon({class: className, color = 'currentColor', name, size = 24}: IconProps) {
    const iconPaths = icons[name]

    if (!iconPaths) {
        console.warn(`Icon "${name}" not found`)
        return null
    }

    return (
        <svg
            class={`icon icon-${name} ${className || ''}`}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <g
                stroke={color}
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                {iconPaths}
            </g>
        </svg>
    )
}
