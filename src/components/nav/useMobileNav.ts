import { create } from 'zustand'

interface MobileNavState {
  open: boolean
  setOpen: (v: boolean) => void
  toggle: () => void
  close: () => void
}

export const useMobileNav = create<MobileNavState>((set, get) => ({
  open: false,
  setOpen: (open) => set({ open }),
  toggle: () => set({ open: !get().open }),
  close: () => set({ open: false }),
}))
