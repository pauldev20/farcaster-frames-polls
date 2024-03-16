import crypto from "crypto";

const encoder = new TextEncoder()
const decoder = new TextDecoder()

const buffer_encode = (buffer: ArrayBuffer): string => {
	return Buffer.from(buffer).toString('base64')
}

export const buffer_decode = (encoded: string): ArrayBuffer => {
	return Buffer.from(encoded, 'base64')
}

export const generateKey = async (): Promise<{ key: CryptoKey; iv: Uint8Array }> => {
	return {
		iv: crypto.webcrypto.getRandomValues(new Uint8Array(12)),
		key: await crypto.webcrypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']),
	}
}

export const exportKey = async (key: CryptoKey): Promise<string> => {
	return buffer_encode(await crypto.webcrypto.subtle.exportKey('raw', key))
}

export const loadKey = async (encoded: string): Promise<CryptoKey> => {
	return crypto.webcrypto.subtle.importKey('raw', buffer_decode(encoded), { name: 'AES-GCM' }, true, ['encrypt', 'decrypt'])
}

export const encryptRequest = async (
	key: CryptoKey,
	iv: ArrayBuffer,
	request: string
): Promise<{ payload: string; iv: string }> => {
	return {
		iv: buffer_encode(iv),
		payload: buffer_encode(
			await crypto.webcrypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(request))
		),
	}
}

export const decryptResponse = async (key: CryptoKey, iv: ArrayBuffer, payload: string): Promise<string> => {
	return decoder.decode(await crypto.webcrypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, buffer_decode(payload)))
}
