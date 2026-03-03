import React from 'react'
import { create } from 'zustand'
import { ActivityItem } from '../type'

type State = {
    activity?: ActivityItem
}
type Action = {
    setActivity: (item: ActivityItem|undefined) => void
}
export const useActivitySelector = create<State & Action>((set) => ({
    activity: undefined,
    setActivity(item) {
        set({activity:item})
    },
}))