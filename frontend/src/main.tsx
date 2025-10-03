/**
 * Application entry point
 */
import {render} from 'preact'
import {App} from '@/components/app'

// Render the application
const root = document.getElementById('root')
if (root) {
  render(<App />, root)
} else {
  console.error('Root element not found')
}
