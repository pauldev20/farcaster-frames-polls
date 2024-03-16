import { IDKitConfig, VerificationLevel, verification_level_to_credential_types } from "@worldcoin/idkit-core";
import { encodeAction, generateSignal } from "@worldcoin/idkit-core/hashing";
import { encryptRequest, exportKey, generateKey } from "./crypto";

const DEFAULT_BRIDGE_URL = "https://bridge.worldcoin.org";

const createConnectURI = async ({
	app_id,
	action_description,
	action,
	signal,
	verification_level,
	bridge_url,
}: {
	app_id: IDKitConfig['app_id'];
	action_description?: IDKitConfig['action_description'];
	action: IDKitConfig['action'];
	signal: IDKitConfig['signal'];
	verification_level: VerificationLevel;
	bridge_url?: IDKitConfig['bridge_url'];
}) => {
	const { key, iv } = await generateKey();

	const res = await fetch(new URL('/request', bridge_url ?? DEFAULT_BRIDGE_URL), {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(
			await encryptRequest(
				key,
				iv,
				JSON.stringify({
					app_id,
					action_description,
					action: encodeAction(action),
					signal: generateSignal(signal).digest,
					credential_types: verification_level_to_credential_types(
						verification_level
					),
					verification_level: verification_level,
				})
			)
		),
	});
	if (!res.ok) {
		throw new Error('Failed to create client');
	}
	const { request_id } = (await res.json()) as { request_id: string };
	return `https://worldcoin.org/verify?t=wld&i=${request_id}&k=${encodeURIComponent(
		await exportKey(key)
	)}${bridge_url && bridge_url !== DEFAULT_BRIDGE_URL ? `&b=${encodeURIComponent(bridge_url)}` : ''}`;
}
export { createConnectURI };
