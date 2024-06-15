import { create, StateCreator } from "zustand"

interface BackdropSlice {
    isBackdropVisible: boolean,
    closeBackdropCallbacks: (() => void)[]
    
    toggleBackdrop: (value: boolean) => void
    addBackdropCallback: (value: () => void) => void
    clearBackdropCallback: () => void
    closeBackdrop: () => void
}

interface LayoutSlice {

    isDropdownToggled: boolean,
    toggleDropdown: (value: boolean) => void,
    
    isNavToggled: boolean,
    toggleNav: (value: boolean) => void,
    
    isEntryFormToggled: boolean,
    toggleEntryForm: (value: boolean) => void,
}

const createBackdropSlice: StateCreator<LayoutSlice & BackdropSlice, [], [], BackdropSlice> = (set, get) => ({
    isBackdropVisible: false,
    closeBackdropCallbacks: [],
    toggleBackdrop: (value) => set((state) => ({isBackdropVisible: value})),
    
    addBackdropCallback: (value) => set((state) => ({closeBackdropCallbacks: [...state.closeBackdropCallbacks, value]})),
    clearBackdropCallback: () => set((state) => ({closeBackdropCallbacks: []})),
    closeBackdrop: () => {
        get().toggleBackdrop(false)
        get().closeBackdropCallbacks.map(fn => fn())
        get().clearBackdropCallback()
    }
})

const createLayoutSlice: StateCreator<LayoutSlice & BackdropSlice, [], [], LayoutSlice> = (set, get) => ({
    isDropdownToggled: false,
    toggleDropdown: (value) => set((state) => ({isDropdownToggled: value})),
    
    isNavToggled: false,
    toggleNav: (value) => set((state) => ({isNavToggled: value})),
    
    isEntryFormToggled: false,
    toggleEntryForm: (value) => set((state) => ({isEntryFormToggled: value})),
})

const useGlobalStore = create<LayoutSlice & BackdropSlice>((...a) => ({
    ...createLayoutSlice(...a),
    ...createBackdropSlice(...a)
}))

export default useGlobalStore