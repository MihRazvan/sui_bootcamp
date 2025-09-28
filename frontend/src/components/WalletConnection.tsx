import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit'
import { Wallet, LogOut } from 'lucide-react'

export function WalletConnection() {
    const currentAccount = useCurrentAccount()

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
                    className="ml-2"
                />
            </div>
        )
    }

    return (
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-slate-600">
                <Wallet className="w-5 h-5" />
                <span className="text-sm">Connect your Sui wallet to post messages</span>
            </div>
            <ConnectButton
                connectText="Connect Wallet"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            />
        </div>
    )
}