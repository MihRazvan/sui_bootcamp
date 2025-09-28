import { useState } from 'react'
import { useSuiClient, useCurrentAccount } from '@mysten/dapp-kit'
import { Transaction } from '@mysten/sui/transactions'
import { useEnoki } from '../providers/EnokiProvider'
import { GUESTBOOK_PACKAGE_ID, GUESTBOOK_OBJECT_ID, FUNCTIONS } from '../utils/constants'
import type { GuestbookData, Message } from './useGuestbook'

export function useSponsoredGuestbook() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [guestbookData, setGuestbookData] = useState<GuestbookData | null>(null)

    const suiClient = useSuiClient()
    const currentAccount = useCurrentAccount()
    const { enokiFlow } = useEnoki()

    // Fetch guestbook data (same as before)
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

    // Sponsored transaction for posting messages
    const postSponsoredMessage = async (content: string) => {
        if (!currentAccount) {
            setError('Please connect your wallet first')
            return
        }

        if (!GUESTBOOK_OBJECT_ID) {
            setError('Guestbook object ID not configured')
            return
        }

        if (!enokiFlow) {
            setError('Enoki not configured. Falling back to regular transaction.')
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

            // Set the sender
            tx.setSender(currentAccount.address)

            console.log('Executing sponsored transaction...')

            // Execute the sponsored transaction
            const result = await enokiFlow.sponsorAndExecuteTransaction({
                transaction: tx,
                client: suiClient,
            })

            console.log('Sponsored transaction successful:', result)

            // Refresh the guestbook data
            await fetchGuestbook()

            return result

        } catch (err) {
            console.error('Error with sponsored transaction:', err)
            setError(`Failed to post sponsored message: ${err instanceof Error ? err.message : 'Unknown error'}`)
            throw err
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
        isEnokiEnabled: !!enokiFlow,
    }
}