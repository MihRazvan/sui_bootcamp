import { useState } from 'react'
import { useSignAndExecuteTransaction, useSuiClient, useCurrentAccount } from '@mysten/dapp-kit'
import { Transaction } from '@mysten/sui/transactions'
import { GUESTBOOK_PACKAGE_ID, GUESTBOOK_OBJECT_ID, FUNCTIONS } from '../utils/constants'

export interface Message {
    content: string
    author: string
}

export interface GuestbookData {
    messages: Message[]
    no_of_messages: number
}

export function useGuestbook() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [guestbookData, setGuestbookData] = useState<GuestbookData | null>(null)

    const suiClient = useSuiClient()
    const currentAccount = useCurrentAccount()
    const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction()

    // Fetch guestbook data
    const fetchGuestbook = async () => {
        if (!GUESTBOOK_OBJECT_ID) {
            setError('Guestbook object ID not configured')
            return
        }

        try {
            setIsLoading(true)
            setError(null)

            const object = await suiClient.getObject({
                id: GUESTBOOK_OBJECT_ID,
                options: {
                    showContent: true,
                },
            })

            if (object.data?.content && 'fields' in object.data.content) {
                const fields = object.data.content.fields as any
                setGuestbookData({
                    messages: fields.messages || [],
                    no_of_messages: parseInt(fields.no_of_messages || '0'),
                })
            }
        } catch (err) {
            console.error('Error fetching guestbook:', err)
            setError('Failed to fetch guestbook data')
        } finally {
            setIsLoading(false)
        }
    }

    // Post a new message
    const postMessage = async (content: string) => {
        if (!currentAccount) {
            setError('Please connect your wallet first')
            return
        }

        if (!GUESTBOOK_OBJECT_ID) {
            setError('Guestbook object ID not configured')
            return
        }

        try {
            setIsLoading(true)
            setError(null)

            const tx = new Transaction()

            // First create the message
            const [message] = tx.moveCall({
                target: `${GUESTBOOK_PACKAGE_ID}::guestbook::${FUNCTIONS.CREATE_MESSAGE}`,
                arguments: [
                    tx.pure.vector('u8', Array.from(new TextEncoder().encode(content))),
                ],
            })

            // Then post the message to the guestbook
            tx.moveCall({
                target: `${GUESTBOOK_PACKAGE_ID}::guestbook::${FUNCTIONS.POST_MESSAGE}`,
                arguments: [
                    message,
                    tx.object(GUESTBOOK_OBJECT_ID),
                ],
            })

            signAndExecuteTransaction(
                {
                    transaction: tx,
                    chain: 'sui:testnet',
                },
                {
                    onSuccess: (result) => {
                        console.log('Message posted successfully:', result)
                        // Refresh the guestbook data
                        fetchGuestbook()
                    },
                    onError: (err) => {
                        console.error('Error posting message:', err)
                        setError('Failed to post message. Please try again.')
                    },
                }
            )
        } catch (err) {
            console.error('Error creating transaction:', err)
            setError('Failed to create transaction')
        } finally {
            setIsLoading(false)
        }
    }

    return {
        guestbookData,
        isLoading,
        error,
        fetchGuestbook,
        postMessage,
    }
}