import { Dispatch, ReactNode, useReducer } from 'react';

import { HomeContext } from '../context'
import { reducer, defaultValues } from '../dispatcher';
import { HomeStateCollection, HomeDispatcherArgs } from '../types';

export default function HomeLayout(props: {children: ReactNode}) : JSX.Element {
    const [state, dispatch]: [
        HomeStateCollection, 
        Dispatch<HomeDispatcherArgs>
    ] = useReducer(reducer, defaultValues)
    
    return (
        <HomeContext.Provider value={{state, dispatch}}>
            {props.children}
        </HomeContext.Provider>
    )
}