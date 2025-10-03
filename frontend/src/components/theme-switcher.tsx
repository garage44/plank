/**
 * Theme switcher component
 * Toggles between light and dark themes
 */
import {$s} from '@/lib/store'
import {Icon} from '@/components/ui/icon'

export function ThemeSwitcher() {
    const toggleTheme = () => {
        const newTheme = $s.theme === 'light' ? 'dark' : 'light'
        $s.theme = newTheme

        // Update document attribute
        document.documentElement.setAttribute('data-theme', newTheme)

        // Persist to localStorage
        localStorage.setItem('theme', newTheme)
    }

    return (
        <button
            class="theme-switcher"
            onClick={toggleTheme}
            aria-label={`Switch to ${$s.theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${$s.theme === 'light' ? 'dark' : 'light'} mode`}
        >
            {$s.theme === 'light' ? (
                <Icon name="moon" size={20} />
            ) : (
                <Icon name="sun" size={20} />
            )}
        </button>
    )
}
