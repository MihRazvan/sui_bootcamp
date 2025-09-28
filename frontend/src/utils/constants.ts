// Contract constants
export const GUESTBOOK_PACKAGE_ID = import.meta.env.VITE_GUESTBOOK_PACKAGE_ID || '0x5ef32aa23fe7465e61bf7822b937689431ec6cb7c63477ebca4f3359671d9e79'

// You'll need to update this with the actual guestbook object ID after deployment
export const GUESTBOOK_OBJECT_ID = import.meta.env.VITE_GUESTBOOK_OBJECT_ID || '0x866b568487216413f201d1c1ecb2074b61aef1c943e0fb313d8184cb234239e4'

// Function names from your Move contract - try both variations
export const FUNCTIONS = {
    CREATE_MESSAGE: 'create_message',
    POST_MESSAGE: 'post_message',
} as const

// Alternative function names to try if the above don't work
export const ALT_FUNCTIONS = {
    CREATE_MESSAGE: 'create_message',
    POST_MESSAGE: 'add_message', // sometimes it might be add_message instead
} as const

// Error codes
export const ERROR_CODES = {
    MESSAGE_TOO_LONG: 1,
} as const

// UI Constants
export const MAX_MESSAGE_LENGTH = 300