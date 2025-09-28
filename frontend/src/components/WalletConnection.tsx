import { ConnectButton, useCurrentAccount, useWallets } from '@mysten/dapp-kit'
import { Wallet, LogOut, AlertCircle } from 'lucide-react'

export function WalletConnection() {
    const currentAccount = useCurrentAccount()
    const wallets = useWallets()

    // Debug logging
    console.log('Available wallets:', wallets)
    console.log('Current account:', currentAccount)

    if (currentAccount) {
        return (
            <div className="flex items-center gap-3 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                <Wallet className="w-5 h-5 text-green-600" />
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-green-800">Connected</span>
                    <span className="text-xs text-green-600 font-mono">
                        {currentAccount.address.slice(0, 6)}...{currentAccount.address.slice(-4)}
                    </span>
                </div>
                <ConnectButton
                    connectText="Switch Wallet"
                    connectedText="Disconnect"
                    className="ml-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                />
            </div>
        )
    }

    // Show available wallets info for debugging
    const hasWallets = wallets && wallets.length > 0

    return (
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-slate-600">
                <Wallet className="w-5 h-5" />
                <span className="text-sm">
                    {hasWallets
                        ? "Connect your Sui wallet to post messages"
                        : "No Sui wallets detected"
                    }
                </span>
                {!hasWallets && (
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                )}
            </div>

            <ConnectButton
                connectText="Connect Wallet"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                onClick={() => {
                    console.log('Connect button clicked')
                    console.log('Available wallets:', wallets)
                }}
            />

            {/* Debug info in development */}
            {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-slate-400 ml-2">
                    Wallets: {wallets?.length || 0}
                </div>
            )}
        </div>
    )
}