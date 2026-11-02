/** Tunables, kept in a pure module so workflow code can import them without pulling in Node-only code. */

/** Users started per burst. Gmail SMTP tolerates only a few concurrent senders, so this is deliberately small. */
export const USER_START_CHUNK_SIZE = 10
/** Pause between bursts. */
export const USER_START_CHUNK_DELAY = "30s"
/** How long a user's delivery claim blocks duplicate runs; a crashed run becomes reclaimable after this. */
export const DELIVERY_LEASE_SECONDS = 30 * 60
/**
 * Raw attachment budget per email. Gmail's limit is 25 MB for the encoded message and base64 inflates
 * by about a third, so 15 MB raw keeps a safe margin.
 */
export const MAX_ATTACHMENT_BYTES = 15 * 1024 * 1024
