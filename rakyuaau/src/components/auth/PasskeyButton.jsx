import { useState } from 'react';
import { motion } from 'framer-motion';
import { Fingerprint, Loader2 } from 'lucide-react';

// WebAuthn helpers
async function bufferToBase64(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}
async function base64ToBuffer(base64) {
  const bin = atob(base64);
  return Uint8Array.from(bin, c => c.charCodeAt(0)).buffer;
}

export async function registerPasskey(rakyuaid, accountId) {
  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const credential = await navigator.credentials.create({
    publicKey: {
      challenge,
      rp: { name: 'Rakyua', id: window.location.hostname },
      user: {
        id: new TextEncoder().encode(accountId),
        name: rakyuaid,
        displayName: rakyuaid,
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 },
        { type: 'public-key', alg: -257 },
      ],
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
      },
      timeout: 60000,
    },
  });
  return {
    id: credential.id,
    rawId: await bufferToBase64(credential.rawId),
    type: credential.type,
  };
}

export async function authenticatePasskey(credentialIds) {
  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const allowCredentials = credentialIds.map(id => ({
    type: 'public-key',
    id: Uint8Array.from(atob(id.rawId), c => c.charCodeAt(0)).buffer,
  }));
  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge,
      allowCredentials,
      userVerification: 'preferred',
      timeout: 60000,
    },
  });
  return assertion;
}

export default function PasskeyButton({ label = 'パスキーでログイン', onSuccess, onError, className = '', iconOnly = false }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          userVerification: 'preferred',
          timeout: 60000,
        },
      });
      onSuccess(assertion);
    } catch (e) {
      onError?.(e);
    } finally {
      setLoading(false);
    }
  };

  if (!window.PublicKeyCredential) return null;

  if (iconOnly) {
    return (
      <motion.button
        type="button"
        whileTap={{ scale: 0.9 }}
        onClick={handleClick}
        disabled={loading}
        className="p-1.5 text-muted-foreground hover:text-pink-500 transition-colors touch-none disabled:opacity-50"
        title="パスキーで認証"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Fingerprint className="w-5 h-5" />}
      </motion.button>
    );
  }

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.01 }}
      onClick={handleClick}
      disabled={loading}
      className={`w-full py-3 rounded-full border-2 border-pink-200 text-pink-600 font-semibold flex items-center justify-center gap-2 hover:bg-pink-50 transition-all disabled:opacity-50 ${className}`}
    >
      {loading
        ? <Loader2 className="w-4 h-4 animate-spin" />
        : <Fingerprint className="w-4 h-4" />}
      {label}
    </motion.button>
  );
}