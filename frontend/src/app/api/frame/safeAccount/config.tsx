import { createPimlicoBundlerClient, createPimlicoPaymasterClient } from 'permissionless/clients/pimlico';
import { Address, createPublicClient, http } from 'viem';
import { ENTRYPOINT_ADDRESS_V06 } from 'permissionless';
import { baseSepolia } from 'viem/chains';

const chain = baseSepolia;
const rpcUrl = 'https://base-sepolia-rpc.publicnode.com';
const entryPoint = ENTRYPOINT_ADDRESS_V06;

const paymasterUrl = `https://api.developer.coinbase.com/rpc/v1/${chain.network}/${process.env['BASE_API_KEY']}`
const bundlerUrl = `https://api.pimlico.io/v1/${chain.network}/rpc?apikey=${process.env['PIMLICO_API_KEY']}`
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
