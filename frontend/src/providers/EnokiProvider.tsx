import React, { createContext, useContext, ReactNode } from 'react'
import { EnokiFlow } from '@mysten/enoki'

interface EnokiContextType {
    enokiFlow: EnokiFlow | null
}

const EnokiContext = createContext<EnokiContextType>({ enokiFlow: null })

interface EnokiProviderProps {
    children: ReactNode
}

export function EnokiProvider({ children }: EnokiProviderProps) {
    const apiKey = import.meta.env.VITE_ENOKI_API_KEY

    console.log('Enoki API Key loaded:', apiKey ? 'Yes' : 'No')
    console.log('Enoki API Key value:', apiKey)

    if (!apiKey) {
        console.warn('VITE_ENOKI_API_KEY not found in environment variables')
        return <>{children}</>
    }

    let enokiFlow: EnokiFlow | null = null

    try {
        enokiFlow = new EnokiFlow({
            apiKey,
        })
        console.log('Enoki Flow initialized successfully:', enokiFlow)
    } catch (error) {
        console.error('Failed to initialize Enoki Flow:', error)
    }

    return (
        <EnokiContext.Provider value={{ enokiFlow }}>
            {children}
        </EnokiContext.Provider>
    )
}

export function useEnoki() {
    const context = useContext(EnokiContext)
    if (!context) {
        throw new Error('useEnoki must be used within an EnokiProvider')
    }
    return context
}