import {Database} from "./supabase-auto"

type Entry = Database["public"]["Tables"]["entry"]["Row"]
type UserSettings = Database["public"]["Tables"]["user_settings"]["Row"]

export {
    type Database,
    type Entry,
    type UserSettings,
}