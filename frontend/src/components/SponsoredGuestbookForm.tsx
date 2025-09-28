import { useState } from 'react'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { Send, MessageSquare, Zap, Coins } from 'lucide-react'
import { MAX_MESSAGE_LENGTH } from '../utils/constants'
import { useSponsoredGuestbook } from '../hooks/useSponsoredGuestbook'
import { useGuestbook } from '../hooks/useGuestbook'

export function SponsoredGuestbookForm() {
    const [message, setMessage] = useState('')
    const [useSponsored, setUseSponsored] = useState(true)
    const currentAccount = useCurrentAccount()

    // Both hooks for comparison
    const { postSponsoredMessage, isLoading: sponsoredLoading, isEnokiEnabled } = useSponsoredGuestbook()
    const { postMessage: postRegularMessage, isLoading: regularLoading } = useGuestbook()

    const isLoading = sponsoredLoading || regularLoading

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!message.trim() || !currentAccount) return

        try {
            if (useSponsored && isEnokiEnabled) {
                await postSponsoredMessage(message.trim())
            } else {
                await postRegularMessage(message.trim())
            }
            setMessage('') // Clear form on success
        } catch (error) {
            console.error('Error posting message:', error)
        }
    }

    const isDisabled = !currentAccount || isLoading || !message.trim() || message.length > MAX_MESSAGE_LENGTH

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    <h2 className="text-xl font-semibold text-slate-800">Leave a Message</h2>
                </div>

                {/* Transaction type toggle */}
                {isEnokiEnabled && (
                    <div className="flex items-center gap-2 text-sm">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={useSponsored}
                                onChange={(e) => setUseSponsored(e.target.checked)}
                                className="rounded border-gray-300"
                            />
                            <Zap className="w-4 h-4 text-green-500" />
                            <span className="text-slate-600">Gas-free</span>
                        </label>
                    </div>
                )}
            </div>

            {/* Sponsored transaction info */}
            {useSponsored && isEnokiEnabled && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Gas-Free Transaction</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                        This transaction is sponsored by Enoki - no gas fees required!
                    </p>
                </div>
            )}

            {/* Regular transaction info */}
            {(!useSponsored || !isEnokiEnabled) && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Regular Transaction</span>
                    </div>
                    <p className="text-sm text-blue-700 mt-1">
                        This transaction will require gas fees from your wallet.
                    </p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={
                            currentAccount
                                ? "Share your thoughts with the world..."
                                : "Connect your wallet to leave a message"
                        }
                        disabled={!currentAccount || isLoading}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-slate-50 disabled:text-slate-500"
                        rows={4}
                        maxLength={MAX_MESSAGE_LENGTH}
                    />
                    <div className="flex justify-between items-center mt-2">
                        <span className={`text-sm ${message.length > MAX_MESSAGE_LENGTH * 0.9
                            ? 'text-red-500'
                            : 'text-slate-500'
                            }`}>
                            {message.length} / {MAX_MESSAGE_LENGTH}
                        </span>
                        {message.length > MAX_MESSAGE_LENGTH && (
                            <span className="text-sm text-red-500">Message too long!</span>
                        )}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isDisabled}
                    className={`w-full font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${useSponsored && isEnokiEnabled
                            ? 'bg-green-600 hover:bg-green-700 disabled:bg-slate-300'
                            : 'bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300'
                        } disabled:cursor-not-allowed text-white`}
                >
                    {isLoading ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            {useSponsored && isEnokiEnabled ? 'Posting (Gas-free)...' : 'Posting...'}
                        </>
                    ) : (
                        <>
                            {useSponsored && isEnokiEnabled ? (
                                <Zap className="w-4 h-4" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                            {useSponsored && isEnokiEnabled ? 'Post Message (Gas-free)' : 'Post Message'}
                        </>
                    )}
                </button>
            </form>

            {!currentAccount && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800">
                        💡 Connect your Sui wallet above to start posting messages!
                    </p>
                </div>
            )}

            {!isEnokiEnabled && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-800">
                        ⚠️ Enoki sponsorship not available. Using regular transactions.
                    </p>
                </div>
            )}
        </div>
    )
}