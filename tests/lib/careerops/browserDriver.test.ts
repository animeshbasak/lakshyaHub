import { describe, it, expect, vi } from 'vitest'

vi.mock('@sparticuz/chromium', () => ({
  default: {
    args: ['--fake-arg'],
    executablePath: async () => '/fake/chromium',
  },
}))

const launchMock = vi.fn()
const closeMock = vi.fn()
const setDefaultTimeoutMock = vi.fn()

vi.mock('playwright-core', () => ({
  chromium: {
    launch: (...args: unknown[]) => {
      launchMock(...args)
      return Promise.resolve({
        newContext: async () => ({
          newPage: async () => ({ setDefaultTimeout: setDefaultTimeoutMock }),
        }),
        close: closeMock,
      })
    },
  },
}))

describe('withBrowser', () => {
  it('launches chromium, invokes fn, closes browser', async () => {
    const { withBrowser } = await import('@/lib/careerops/browserDriver')
    const result = await withBrowser(async () => 'ok')
    expect(result).toBe('ok')
    expect(launchMock).toHaveBeenCalledOnce()
    expect(closeMock).toHaveBeenCalledOnce()
  })

  it('closes browser even if fn throws', async () => {
    closeMock.mockClear()
    const { withBrowser } = await import('@/lib/careerops/browserDriver')
    await expect(withBrowser(async () => { throw new Error('boom') })).rejects.toThrow('boom')
    expect(closeMock).toHaveBeenCalledOnce()
  })

  it('passes custom timeout to page', async () => {
    setDefaultTimeoutMock.mockClear()
    const { withBrowser } = await import('@/lib/careerops/browserDriver')
    await withBrowser(async () => null, { timeoutMs: 25_000 })
    expect(setDefaultTimeoutMock).toHaveBeenCalledWith(25_000)
  })
})
