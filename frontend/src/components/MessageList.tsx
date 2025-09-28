import { useEffect } from 'react'
import { BookOpen, RefreshCw, MessageCircle, User } from 'lucide-react'
import { useGuestbook, type Message } from '../hooks/useGuestbook'

function MessageCard({ message, index }: { message: Message; index: number }) {
    return (
        <div className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
                <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
                    <User className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-slate-600">
                            {message.author.slice(0, 6)}...{message.author.slice(-4)}
                        </span>
                        <span className="text-xs text-slate-400">#{index + 1}</span>
                    </div>
                    <p className="text-slate-800 leading-relaxed break-words">
                        {message.content}
                    </p>
                </div>
            </div>
        </div>
    )
}

export function MessageList() {
    const { guestbookData, isLoading, error, fetchGuestbook } = useGuestbook()

    useEffect(() => {
        fetchGuestbook()
    }, [])

    return (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200">
            <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                        <h2 className="text-xl font-semibold text-slate-800">Guestbook Messages</h2>
                        {guestbookData && (
                            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded-full">
                                {guestbookData.no_of_messages} messages
                            </span>
                        )}
                    </div>
                    <button
                        onClick={fetchGuestbook}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            <div className="p-6">
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span className="text-red-800 font-medium">Error</span>
                        </div>
                        <p className="text-red-700 mt-1">{error}</p>
                    </div>
                )}

                {isLoading && !guestbookData && (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
                        <span className="ml-3 text-slate-600">Loading messages...</span>
                    </div>
                )}

                {guestbookData && guestbookData.messages.length === 0 && (
                    <div className="text-center py-12">
                        <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-600 mb-2">No messages yet</h3>
                        <p className="text-slate-500">Be the first to leave a message in this guestbook!</p>
                    </div>
                )}

                {guestbookData && guestbookData.messages.length > 0 && (
                    <div className="space-y-4">
                        {guestbookData.messages.map((message, index) => (
                            <MessageCard
                                key={index}
                                message={message}
                                index={guestbookData.messages.length - 1 - index} // Reverse order to show newest first
                            />
                        )).reverse()}
                    </div>
                )}
            </div>
        </div>
    )
}