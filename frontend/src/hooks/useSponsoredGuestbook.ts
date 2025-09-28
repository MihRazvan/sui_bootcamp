// Fetch guestbook data (same as before)import React, { useState } from 'react'
import { useSuiClient, useCurrentAccount, useSignTransaction, useSignAndExecuteTransaction } from '@mysten/dapp-kit'
import { Transaction } from '@mysten/sui/transactions'
import { toBase64, fromBase64 } from '@mysten/sui/utils'
import { GUESTBOOK_PACKAGE_ID, GUESTBOOK_OBJECT_ID, FUNCTIONS } from '../utils/constants'
import { useState } from 'react'


export interface Message {
    content: string
    author: string
}

export interface GuestbookData {
    messages: Message[]
    no_of_messages: number
}

export function useSponsoredGuestbook() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [guestbookData, setGuestbookData] = useState<GuestbookData | null>(null)

    const suiClient = useSuiClient()
    const currentAccount = useCurrentAccount()
    const { mutateAsync: signTransaction } = useSignTransaction()
    const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction()

    // Let's first inspect the contract to see available functions
    const inspectContract = async () => {
        try {
            console.log('Inspecting contract at package:', GUESTBOOK_PACKAGE_ID)

            // Get the package object to see its modules and functions
            const packageObj = await suiClient.getObject({
                id: GUESTBOOK_PACKAGE_ID,
                options: {
                    showContent: true,
                    showPreviousTransaction: true,
                },
            })

            console.log('Package object:', JSON.stringify(packageObj, null, 2))

            // Also try to get normalized move modules
            try {
                const modules = await suiClient.getNormalizedMoveModulesByPackage({
                    package: GUESTBOOK_PACKAGE_ID,
                })
                console.log('Available modules and functions:', JSON.stringify(modules, null, 2))
            } catch (moduleError) {
                console.log('Could not get normalized modules:', moduleError)
            }

        } catch (error) {
            console.error('Error inspecting contract:', error)
        }
    }
    const fetchGuestbook = async () => {
        if (!GUESTBOOK_OBJECT_ID) {
            setError('Guestbook object ID not configured')
            return
        }

        try {
            setIsLoading(true)
            setError(null)

            console.log('Fetching guestbook with ID:', GUESTBOOK_OBJECT_ID)

            const object = await suiClient.getObject({
                id: GUESTBOOK_OBJECT_ID,
                options: {
                    showContent: true,
                    showDisplay: true,
                },
            })

            console.log('Raw guestbook object:', JSON.stringify(object, null, 2))

            if (object.data?.content && 'fields' in object.data.content) {
                const fields = object.data.content.fields as any
                console.log('Guestbook fields:', fields)

                // Try different possible field names based on your contract
                const messages = fields.messages || fields.entries || []
                const messageCount = fields.no_of_messages || fields.message_count || fields.count || '0'

                console.log('Extracted messages:', messages)
                console.log('Message count:', messageCount)

                setGuestbookData({
                    messages: Array.isArray(messages) ? messages.map((msg: any) => {
                        // Handle different possible message structures
                        if (msg.fields) {
                            return {
                                content: msg.fields.content || msg.fields.message || '',
                                author: msg.fields.author || msg.fields.sender || msg.fields.user || ''
                            }
                        } else {
                            return {
                                content: msg.content || msg.message || '',
                                author: msg.author || msg.sender || msg.user || ''
                            }
                        }
                    }) : [],
                    no_of_messages: parseInt(String(messageCount)),
                })
            } else {
                console.error('Unexpected object structure:', object)
                setError('Failed to parse guestbook data structure')
            }
        } catch (err) {
            console.error('Error fetching guestbook:', err)
            setError('Failed to fetch guestbook data')
        } finally {
            setIsLoading(false)
        }
    }

    // Create a backend API route for sponsored transactions
    const createSponsoredTransaction = async (txBytes: string, userAddress: string) => {
        const response = await fetch('http://localhost:3001/api/sponsor-transaction', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'create',
                txBytes,
                userAddress,
            }),
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || errorData.error || 'Failed to create sponsored transaction')
        }

        return response.json()
    }

    const executeSponsoredTransaction = async (digest: string, signature: string) => {
        const response = await fetch('http://localhost:3001/api/sponsor-transaction', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'execute',
                digest,
                signature,
            }),
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || errorData.error || 'Failed to execute sponsored transaction')
        }

        return response.json()
    }

    // Execute regular transaction as fallback
    const executeRegularTransaction = (transaction: Transaction, onSuccess: (result: any) => void, onError: (error: any) => void) => {
        signAndExecuteTransaction(
            {
                transaction,
                chain: 'sui:testnet',
            },
            {
                onSuccess,
                onError,
            }
        )
    }

    // Sponsored transaction for posting messages
    const postSponsoredMessage = async (content: string) => {
        console.log('=== Starting sponsored transaction ===')
        console.log('Current account:', currentAccount)
        console.log('Content:', content)

        if (!currentAccount) {
            setError('Please connect your wallet first')
            return
        }

        if (!GUESTBOOK_OBJECT_ID) {
            setError('Guestbook object ID not configured')
            return
        }

        const apiKey = import.meta.env.VITE_ENOKI_API_KEY
        if (!apiKey) {
            setError('Enoki API key not configured. Using regular transaction.')
            console.warn('Falling back to regular transaction')

            // Fallback to regular transaction
            try {
                const tx = new Transaction()

                const [message] = tx.moveCall({
                    target: `${GUESTBOOK_PACKAGE_ID}::guestbook::${FUNCTIONS.CREATE_MESSAGE}`,
                    arguments: [
                        tx.pure.vector('u8', Array.from(new TextEncoder().encode(content))),
                    ],
                })

                tx.moveCall({
                    target: `${GUESTBOOK_PACKAGE_ID}::guestbook::${FUNCTIONS.POST_MESSAGE}`,
                    arguments: [
                        message,
                        tx.object(GUESTBOOK_OBJECT_ID),
                    ],
                })

                executeRegularTransaction(
                    tx,
                    (result) => {
                        console.log('Regular transaction successful:', result)
                        alert('Message posted successfully! (Regular transaction)')
                        fetchGuestbook()
                    },
                    (error) => {
                        console.error('Error with regular transaction:', error)
                        setError(`Failed to post message: ${error instanceof Error ? error.message : 'Unknown error'}`)
                    }
                )
            } catch (err) {
                console.error('Error creating regular transaction:', err)
                setError('Failed to create transaction')
            }
            return
        }

        try {
            setIsLoading(true)
            setError(null)

            const tx = new Transaction()

            console.log('Building transaction with:')
            console.log('Package ID:', GUESTBOOK_PACKAGE_ID)
            console.log('Object ID:', GUESTBOOK_OBJECT_ID)
            console.log('Content:', content)

            // Try the simple approach first - just post the message directly
            try {
                console.log('Trying direct post_message approach...')
                tx.moveCall({
                    target: `${GUESTBOOK_PACKAGE_ID}::guestbook::post_message`,
                    arguments: [
                        tx.object(GUESTBOOK_OBJECT_ID),
                        tx.pure.vector('u8', Array.from(new TextEncoder().encode(content))),
                    ],
                })
                console.log('Added direct post_message call')
            } catch (directError) {
                console.log('Direct approach failed, trying two-step approach...')

                // Fallback to two-step approach
                const [message] = tx.moveCall({
                    target: `${GUESTBOOK_PACKAGE_ID}::guestbook::${FUNCTIONS.CREATE_MESSAGE}`,
                    arguments: [
                        tx.pure.vector('u8', Array.from(new TextEncoder().encode(content))),
                    ],
                })

                console.log('Created message call with target:', `${GUESTBOOK_PACKAGE_ID}::guestbook::${FUNCTIONS.CREATE_MESSAGE}`)

                // Then post the message to the guestbook
                tx.moveCall({
                    target: `${GUESTBOOK_PACKAGE_ID}::guestbook::${FUNCTIONS.POST_MESSAGE}`,
                    arguments: [
                        message,
                        tx.object(GUESTBOOK_OBJECT_ID),
                    ],
                })

                console.log('Added post message call with target:', `${GUESTBOOK_PACKAGE_ID}::guestbook::${FUNCTIONS.POST_MESSAGE}`)
            }

            console.log('Transaction built:', tx)
            console.log('Transaction summary:', tx.getData())
            console.log('Attempting sponsored transaction...')

            // Try sponsored transaction first
            try {
                // Build transaction bytes (transaction kind only)
                const txBytes = await tx.build({
                    client: suiClient,
                    onlyTransactionKind: true
                })
                const txBytesBase64 = toBase64(txBytes)

                console.log('Calling backend API for sponsored transaction...')
                const createResult = await createSponsoredTransaction(txBytesBase64, currentAccount.address)

                if (createResult.sponsoredTransaction) {
                    const sponsoredTxBytes = fromBase64(createResult.sponsoredTransaction.bytes)
                    const signatureResult = await signTransaction({
                        transaction: Transaction.from(sponsoredTxBytes),
                    })

                    const executeResult = await executeSponsoredTransaction(
                        createResult.sponsoredTransaction.digest,
                        signatureResult.signature
                    )

                    console.log('Sponsored transaction successful:', executeResult.result)
                    alert('Message posted successfully! (Gas-free transaction)')
                    await fetchGuestbook()
                    return executeResult.result
                }
            } catch (sponsorError) {
                console.warn('Sponsored transaction failed, falling back to regular transaction:', sponsorError)

                // Fallback to regular transaction
                executeRegularTransaction(
                    tx,
                    async (result) => {
                        console.log('Regular transaction successful:', result)
                        alert('Message posted successfully! (Regular transaction)')
                        await fetchGuestbook()
                    },
                    (error) => {
                        console.error('Error with regular transaction:', error)
                        setError(`Failed to post message: ${error instanceof Error ? error.message : 'Unknown error'}`)
                    }
                )
            }

        } catch (err) {
            console.error('Error with transaction:', err)
            setError(`Failed to post message: ${err instanceof Error ? err.message : 'Unknown error'}`)
        } finally {
            setIsLoading(false)
        }
    }

    return {
        guestbookData,
        isLoading,
        error,
        fetchGuestbook,
        postSponsoredMessage,
        inspectContract, // Add this temporarily
        isEnokiEnabled: !!import.meta.env.VITE_ENOKI_API_KEY,
    }
}