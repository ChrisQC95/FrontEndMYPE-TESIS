import { create } from 'zustand'
import React from 'react'

interface ConfirmState {
    isOpen: boolean
    title: React.ReactNode
    description: React.JSX.Element | string
    onConfirm: () => void
    openConfirm: (params: { title: React.ReactNode; description: React.JSX.Element | string; onConfirm: () => void }) => void
    closeConfirm: () => void
}

export const useConfirmStore = create<ConfirmState>((set) => ({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => { },
    openConfirm: ({ title, description, onConfirm }) =>
        set({ isOpen: true, title, description, onConfirm }),
    closeConfirm: () => set({ isOpen: false }),
}))