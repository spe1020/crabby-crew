import { generateSecretKey, getPublicKey, finalizeEvent } from 'nostr-tools/pure';
import { bytesToHex, hexToBytes } from 'nostr-tools/utils';
import { Relay } from 'nostr-tools/relay';

const DEFAULT_RELAY = process.env.NOSTR_RELAY_URL || 'wss://relay.damus.io';

export function generateKeypair(): { privkeyHex: string; pubkeyHex: string } {
  const sk = generateSecretKey();
  return { privkeyHex: bytesToHex(sk), pubkeyHex: getPublicKey(sk) };
}

export function buildProfileEvent(
  privkeyHex: string,
  profile: { name: string; display_name?: string; about?: string; picture?: string },
) {
  const sk = hexToBytes(privkeyHex);
  return finalizeEvent(
    {
      kind: 0,
      created_at: Math.floor(Date.now() / 1000),
      tags: [],
      content: JSON.stringify(profile),
    },
    sk,
  );
}

export async function publishToRelay(
  event: ReturnType<typeof finalizeEvent>,
  relayUrl: string = DEFAULT_RELAY,
): Promise<boolean> {
  try {
    const relay = await Relay.connect(relayUrl);
    await relay.publish(event);
    relay.close();
    return true;
  } catch (err) {
    console.error('Nostr relay publish failed:', err);
    return false;
  }
}

/** Strip private key from a user object before sending to the client. */
export function stripPrivkey<T extends Record<string, unknown>>(user: T): Omit<T, 'nostrPrivkey'> {
  const { nostrPrivkey, ...safe } = user;
  return safe;
}
