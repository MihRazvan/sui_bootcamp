const express = require('express');
const cors = require('cors');
const { EnokiClient } = require('@mysten/enoki');

const app = express();
const PORT = 3001;

// CORS configuration for React frontend
app.use(cors({
    origin: 'http://localhost:5173', // Vite React dev server
    credentials: true
}));

app.use(express.json());

// Initialize Enoki client
const enoki = new EnokiClient({
    apiKey: process.env.ENOKI_SECRET_KEY || 'enoki_private_1895ed7bffa5b4589fb244b99fe1247a',
});

// Sponsored transaction endpoint
app.post('/api/sponsor-transaction', async (req, res) => {
    try {
        const { action, txBytes, userAddress, signature, digest } = req.body;

        if (action === 'create') {
            if (!txBytes || !userAddress) {
                return res.status(400).json({
                    error: 'Missing required fields: txBytes, userAddress'
                });
            }

            const sponsoredTx = await enoki.createSponsoredTransaction({
                network: 'testnet',
                transactionKindBytes: txBytes,
                sender: userAddress,
                allowedMoveCallTargets: [
                    `${process.env.GUESTBOOK_PACKAGE_ID || '0x5ef32aa23fe7465e61bf7822b937689431ec6cb7c63477ebca4f3359671d9e79'}::guestbook::create_message`,
                    `${process.env.GUESTBOOK_PACKAGE_ID || '0x5ef32aa23fe7465e61bf7822b937689431ec6cb7c63477ebca4f3359671d9e79'}::guestbook::post_message`,
                    // Also allow alternative function names in case they're different
                    `${process.env.GUESTBOOK_PACKAGE_ID || '0x5ef32aa23fe7465e61bf7822b937689431ec6cb7c63477ebca4f3359671d9e79'}::guestbook::add_message`,
                    `${process.env.GUESTBOOK_PACKAGE_ID || '0x5ef32aa23fe7465e61bf7822b937689431ec6cb7c63477ebca4f3359671d9e79'}::guestbook::sign_guestbook`,
                ],
                allowedAddresses: [userAddress],
            });

            return res.json({
                sponsoredTransaction: sponsoredTx,
                success: true
            });

        } else if (action === 'execute') {
            if (!signature || !digest) {
                return res.status(400).json({
                    error: 'Missing required fields: signature, digest'
                });
            }

            const result = await enoki.executeSponsoredTransaction({
                digest,
                signature,
            });

            return res.json({
                result,
                success: true
            });
        } else {
            return res.status(400).json({
                error: 'Invalid action. Use "create" or "execute"'
            });
        }

    } catch (error) {
        console.error('Error with sponsored transaction:', error);

        return res.status(500).json({
            error: 'Failed to process sponsored transaction',
            details: error instanceof Error ? error.message : 'Unknown error',
            message: 'Transaction sponsorship failed. The transaction may not be whitelisted or there may be a configuration issue.'
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});