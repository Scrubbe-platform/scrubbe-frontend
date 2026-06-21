import { create } from 'zustand'

export type PipelineStatusFilter = 'all' | 'error' | 'warning' | 'success'

type State = {
  search: string
  statusFilter: PipelineStatusFilter
}
type Action = {
  setSearch: (value: string) => void
  setStatusFilter: (value: PipelineStatusFilter) => void
}

export const usePipelineFilter = create<State & Action>((set) => ({
  search: '',
  statusFilter: 'all',
  setSearch: (value) => set({ search: value }),
  setStatusFilter: (value) => set({ statusFilter: value }),
}))
