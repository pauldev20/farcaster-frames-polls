import { AppErrorCodes, CredentialType, IDKitConfig, ISuccessResult, VerificationLevel, verification_level_to_credential_types } from "@worldcoin/idkit-core";
import { encodeAction, generateSignal } from "@worldcoin/idkit-core/hashing";
import { buffer_decode, decryptResponse, encryptRequest, exportKey, generateKey, loadKey } from "./crypto";
import { credential_type_to_verification_level } from "./utils";

const DEFAULT_BRIDGE_URL = "https://bridge.worldcoin.org";

type BridgeResult =
	| ISuccessResult
	| (Omit<ISuccessResult, 'verification_level'> & { credential_type: CredentialType })
	| { error_code: AppErrorCodes };

const createVerification = async ({
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

	let res = await fetch(new URL('/request', bridge_url ?? DEFAULT_BRIDGE_URL), {
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
	res = await fetch(new URL(`/response/${request_id}`, bridge_url ?? DEFAULT_BRIDGE_URL))
	if (!res.ok) {
		throw new Error('Failed to create client');
	}

	return {
		connectionURI: `https://worldcoin.org/verify?t=wld&i=${request_id}&k=${encodeURIComponent(
			await exportKey(key)
		)}${bridge_url && bridge_url !== DEFAULT_BRIDGE_URL ? `&b=${encodeURIComponent(bridge_url)}` : ''}`,
		request_id: request_id,
		key: (await exportKey(key)).toString()
	};
}

const checkVerification = async ({
	key,
	request_id,
	bridge_url
}: {
	key: string,
	request_id: string,
	bridge_url?: IDKitConfig['bridge_url'];
}) => {
	const res = await fetch(new URL(`/response/${request_id}`, bridge_url ?? DEFAULT_BRIDGE_URL))
	if (!res.ok) {
		throw new Error('Failed to check verification');
	}
	const { response, status } = (await res.json());
	if (status !== "completed") {
		return {
			status: false,
			result: undefined
		};
	}
	let result = JSON.parse(
		await decryptResponse(await loadKey(key), buffer_decode(response.iv), response.payload)
	) as BridgeResult;
	if ('error_code' in result) {
		throw new Error(`Failed to check verification ${result.error_code}`);
	}
	if ('credential_type' in result) {
		result = {
			verification_level: credential_type_to_verification_level(result.credential_type),
			...result,
		} satisfies ISuccessResult
	}
	return {
		status: true,
		result
	};
}

export { createVerification, checkVerification };
