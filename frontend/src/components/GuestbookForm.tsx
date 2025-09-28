import { useState } from 'react'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { Send, MessageSquare } from 'lucide-react'
import { MAX_MESSAGE_LENGTH } from '../utils/constants'
import { useGuestbook } from '../hooks/useGuestbook'

export function GuestbookForm() {
    const [message, setMessage] = useState('')
    const currentAccount = useCurrentAccount()
    const { postMessage, isLoading } = useGuestbook()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!message.trim() || !currentAccount) return

        await postMessage(message.trim())
        setMessage('') // Clear form on success
    }

    const isDisabled = !currentAccount || isLoading || !message.trim() || message.length > MAX_MESSAGE_LENGTH

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-slate-800">Leave a Message</h2>
            </div>

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
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            Posting...
                        </>
                    ) : (
                        <>
                            <Send className="w-4 h-4" />
                            Post Message
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
        </div>
    )
}