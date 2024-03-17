import { createPimlicoBundlerClient, createPimlicoPaymasterClient } from 'permissionless/clients/pimlico';
import { Address, createPublicClient, http } from 'viem';
import { ENTRYPOINT_ADDRESS_V06 } from 'permissionless';
import { baseSepolia } from 'viem/chains';

const chain = baseSepolia;
const rpcUrl = 'https://base-sepolia-rpc.publicnode.com';
const entryPoint = ENTRYPOINT_ADDRESS_V06;

const paymasterUrl = process.env["PAYMASTER_URL"];
const bundlerUrl = process.env["BUNDLER_URL"];
const publicClient = createPublicClient({
	transport: http(rpcUrl),
});
const paymasterClient = createPimlicoPaymasterClient({
	transport: http(paymasterUrl),
	chain: chain,
	entryPoint
})
const bundlerClient = createPimlicoBundlerClient({
	transport: http(bundlerUrl),
	chain: chain,
	entryPoint
})

export { publicClient, paymasterClient, bundlerClient, chain, entryPoint, bundlerUrl };
