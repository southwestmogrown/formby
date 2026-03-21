const STORAGE_KEY = 'formby_demo_v1'

export const DEMO_LIMIT = 3

interface DemoState {
  generationsUsed: number
  apiKey: string | null
}

function getState(): DemoState {
  if (typeof window === 'undefined') return { generationsUsed: 0, apiKey: null }
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? (JSON.parse(stored) as DemoState) : { generationsUsed: 0, apiKey: null }
  } catch {
    return { generationsUsed: 0, apiKey: null }
  }
}

function setState(state: DemoState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function getDemoGenerationsUsed(): number {
  return getState().generationsUsed
}

export function getDemoApiKey(): string | null {
  return getState().apiKey
}

export function incrementDemoUsage(): void {
  const state = getState()
  setState({ ...state, generationsUsed: state.generationsUsed + 1 })
}

export function setDemoApiKey(key: string | null): void {
  const state = getState()
  setState({ ...state, apiKey: key })
}

export function canGenerate(): boolean {
  const state = getState()
  return state.apiKey !== null || state.generationsUsed < DEMO_LIMIT
}

export function generationsRemaining(): number {
  const state = getState()
  if (state.apiKey !== null) return Infinity
  return Math.max(0, DEMO_LIMIT - state.generationsUsed)
}
