import { Entry } from "@/types/supabase"
import { User } from "@supabase/supabase-js"
import { SetStateAction } from "react"
import { create, type StateCreator } from "zustand"

interface RegistrationSlice {
    email?: string
    username?: string
    password?: string
    setEmail: (value?: string) => void
    setUsername: (value?: string) => void
    setPassword: (value?: string) => void
    clearRegistrationInfo: () => void
}

type StoreProps = RegistrationSlice

const createRegistrationSlice: StateCreator<StoreProps, [], [], RegistrationSlice> = (set) => ({
    email: undefined,
    username: undefined,
    password: undefined,
    setEmail: (value) => set((state) => ({email: value})),
    setUsername: (value) => set((state) => ({username: value})),
    setPassword: (value) => set((state) => ({password: value})),
    clearRegistrationInfo: () => set((state) => ({email: undefined, username: undefined, password: undefined})),
})

const useGlobalStore = create<StoreProps>((...a) => ({
    ...createRegistrationSlice(...a),
}))

export { useGlobalStore }
