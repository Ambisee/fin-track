import { Entry } from "@/types/supabase"
import { User } from "@supabase/supabase-js"
import { SetStateAction } from "react"
import { create, type StateCreator } from "zustand"

type StoreProps = {}

const useGlobalStore = create<StoreProps>((...a) => ({
}))

export { useGlobalStore }
