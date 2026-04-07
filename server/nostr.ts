import { generateSecretKey, getPublicKey, finalizeEvent } from 'nostr-tools/pure';
import { bytesToHex, hexToBytes } from 'nostr-tools/utils';
import WebSocket from 'ws';

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

/**
 * Publish a signed event to a Nostr relay using raw WebSocket.
 * nostr-tools' Relay class has compatibility issues with the ws library,
 * so we use a direct WebSocket connection instead.
 */
export function publishToRelay(
  event: ReturnType<typeof finalizeEvent>,
  relayUrl: string = DEFAULT_RELAY,
): Promise<boolean> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => { ws.close(); resolve(false); }, 8000);

    const ws = new WebSocket(relayUrl);

    ws.on('open', () => {
      ws.send(JSON.stringify(['EVENT', event]));
    });

    ws.on('message', (data: WebSocket.Data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg[0] === 'OK') {
          clearTimeout(timeout);
          ws.close();
          resolve(!!msg[2]);
        }
      } catch {}
    });

    ws.on('error', () => {
      clearTimeout(timeout);
      resolve(false);
    });
  });
}

/** Strip private key from a user object before sending to the client. */
export function stripPrivkey<T extends Record<string, unknown>>(user: T): Omit<T, 'nostrPrivkey'> {
  const { nostrPrivkey, ...safe } = user;
  return safe;
}
