import { ENTRYPOINT_ADDRESS_V06, createSmartAccountClient } from "permissionless";
import { bundlerClient, bundlerUrl, chain, entryPoint, paymasterClient, publicClient } from "./config";
import { privateKeyToSafeSmartAccount } from "permissionless/accounts";
import { Address } from 'viem';
import { http } from 'viem';

const getAccount = async (fid: number) => {
	const account = await privateKeyToSafeSmartAccount(publicClient, {
		privateKey: process.env["PRIVATE_KEY"] as Address,
		safeVersion: "1.4.1",
		saltNonce: BigInt(fid),
		entryPoint
	})
	const smartAccountClient = createSmartAccountClient({
		chain,
		account,
		entryPoint,
		bundlerTransport: http(bundlerUrl),
		middleware: { 
			// gasPrice: async () => { 
			// 	return (await bundlerClient.getUserOperationGasPrice()).fast 
			// }, 
			sponsorUserOperation: paymasterClient.sponsorUserOperation, 
		}, 
	})
	return {
		address: account.address,
		accountClient: smartAccountClient,
		deployed: await publicClient.getBytecode({
			address: account.address
		}) !== undefined
	}
}

const createAccount = async (fid: number) => {
	const account = await privateKeyToSafeSmartAccount(publicClient, {
		privateKey: process.env["PRIVATE_KEY"] as Address,
		safeVersion: "1.4.1",
		entryPoint: ENTRYPOINT_ADDRESS_V06,
		saltNonce: BigInt(fid)
	})
	const smartAccountClient = createSmartAccountClient({
		chain,
		account,
		entryPoint,
		bundlerTransport: http(bundlerUrl),
		middleware: { 
			// gasPrice: async () => { 
			// 	return (await bundlerClient.getUserOperationGasPrice()).fast 
			// }, 
			sponsorUserOperation: paymasterClient.sponsorUserOperation, 
		},
	})
	await smartAccountClient.sendTransaction({
		to: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
		value: BigInt(0),
		data: "0x1234",
	})
	return smartAccountClient;
}

export { getAccount, createAccount };
