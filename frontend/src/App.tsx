import { Book, Github, ExternalLink } from 'lucide-react'
import { WalletConnection } from './components/WalletConnection'
import { GuestbookForm } from './components/GuestbookForm'
import { MessageList } from './components/MessageList'
import { GUESTBOOK_PACKAGE_ID } from './utils/constants'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 rounded-lg p-2">
                <Book className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Sui Guestbook</h1>
                <p className="text-sm text-slate-600">Powered by Sui blockchain</p>
              </div>
            </div>
            <WalletConnection />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center py-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              Welcome to the Decentralized Guestbook
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Leave your mark on the Sui blockchain! Share your thoughts, experiences,
              or just say hello. All messages are permanently stored on-chain.
            </p>
          </div>

          {/* Form Section */}
          <GuestbookForm />

          {/* Messages Section */}
          <MessageList />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-16">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <span>Built with ❤️ on Sui</span>
              <a
                href={`https://suiscan.xyz/testnet/object/${GUESTBOOK_PACKAGE_ID}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-blue-600 transition-colors"
              >
                View Contract
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 transition-colors">
                <Github className="w-4 h-4" />
                Source Code
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App