import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// React Testing Library's automatic cleanup requires afterEach to be a global.
// Since vitest globals are not enabled, we register cleanup explicitly here.
afterEach(cleanup)
