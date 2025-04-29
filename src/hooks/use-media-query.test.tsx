import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useMediaQuery } from './use-media-query'

describe('useMediaQuery', () => {
  const originalMatchMedia = window.matchMedia

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    // Restore original matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: originalMatchMedia,
    })
  })

  it('should return true when media query matches', () => {
    // Mock matchMedia to return true
    const matchMediaMock = vi.fn().mockImplementation(query => ({
      matches: true,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    })

    const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'))

    expect(result.current).toBe(true)
    expect(matchMediaMock).toHaveBeenCalledWith('(max-width: 768px)')
  })

  it('should return false when media query does not match', () => {
    // Mock matchMedia to return false
    const matchMediaMock = vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    })

    const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)'))

    expect(result.current).toBe(false)
    expect(matchMediaMock).toHaveBeenCalledWith('(min-width: 1024px)')
  })

  it('should update when media query match changes', () => {
    // Create a mock for matchMedia with a change event
    let mediaQueryList: any = {
      matches: false,
      media: '(max-width: 768px)',
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }

    const matchMediaMock = vi.fn().mockImplementation(() => mediaQueryList)

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    })

    const { result, rerender } = renderHook(() => useMediaQuery('(max-width: 768px)'))

    // Initially, should be false
    expect(result.current).toBe(false)

    // Update the mock to return true
    mediaQueryList.matches = true

    // Find the event listener that was registered
    const addEventListener = mediaQueryList.addEventListener
    const eventListenerCalls = addEventListener.mock.calls
    const changeListener = eventListenerCalls.find(call => call[0] === 'change')?.[1]

    // Trigger the change event
    act(() => {
      if (changeListener) {
        changeListener()
      }
    })

    // After the change, should be true
    expect(result.current).toBe(true)
  })

  it('should clean up event listener on unmount', () => {
    // Mock matchMedia with spy functions
    const addEventListenerSpy = vi.fn()
    const removeEventListenerSpy = vi.fn()

    const matchMediaMock = vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: addEventListenerSpy,
      removeEventListener: removeEventListenerSpy,
      dispatchEvent: vi.fn(),
    }))

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    })

    const { unmount } = renderHook(() => useMediaQuery('(max-width: 768px)'))

    // Check that addEventListener was called
    expect(addEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function))

    // Unmount the hook
    unmount()

    // Check that removeEventListener was called
    expect(removeEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function))
  })

  it('should handle different media queries', () => {
    // Mock matchMedia to return different values for different queries
    const matchMediaMock = vi.fn().mockImplementation(query => {
      if (query === '(max-width: 768px)') {
        return {
          matches: true,
          media: query,
          onchange: null,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }
      } else {
        return {
          matches: false,
          media: query,
          onchange: null,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }
      }
    })

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    })

    const { result: mobileResult } = renderHook(() => useMediaQuery('(max-width: 768px)'))
    const { result: desktopResult } = renderHook(() => useMediaQuery('(min-width: 1024px)'))

    expect(mobileResult.current).toBe(true)
    expect(desktopResult.current).toBe(false)
  })
})
