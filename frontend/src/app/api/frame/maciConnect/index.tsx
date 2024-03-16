import { Keypair, PCommand, PrivKey, PubKey } from "maci-domainobjs";
import { walletClientToSmartAccountSigner } from "permissionless";
import { createAccount, getAccount } from "../safeAccount";
import maciFactory from "./maciFactory.json";
import pollFactory from "./pollFactory.json";
import { genRandomSalt } from "maci-crypto";
import { ethers } from "ethers";

const MACI_ADDRESS = "0x10c60c92b24b6bB1Cd620935cc4627C8Fe8cfC3B";
const RPC_PROVIDER = "https://base-sepolia.g.alchemy.com/v2/xC7gy-WyxYdV48GlxEyP4n6xuVfYRTK3";

const createKeypair = (seed: bigint) => {
	const SNARK_FIELD_SIZE = BigInt('21888242871839275222246405745257275088548364400416034343698204186575808495617');
	return new Keypair(seed ? new PrivKey(seed % SNARK_FIELD_SIZE) : undefined);
}

const checkIfRegistered = async (publicKey: PubKey) => {
	const pubKey = publicKey.asContractParam();
	const provider = new ethers.JsonRpcProvider(RPC_PROVIDER);
	const maciContract = new ethers.Contract(MACI_ADDRESS, maciFactory, provider);
	const events = await maciContract.queryFilter(maciContract.filters.SignUp(undefined, pubKey.x, pubKey.y));
	const stateIndex = (events[0] as any).args[0].toString() as string | undefined;
  	// const voiceCredits = (events[0] as any).args[3].toString() as string | undefined;
	return stateIndex !== undefined;
}

const encodeWldData = (signal: string, merkleRoot: string, nullifierHash: string, proof: string): string => {
	return new ethers.AbiCoder().encode(["address", "uint256", "uint256", "uint256[8]"], [
		signal,
		merkleRoot,
		nullifierHash,
		new ethers.AbiCoder().decode(["uint256[8]"], proof)[0]
	]);
}

const signup = async (seed: number) => {
	const keypair = createKeypair(BigInt(seed));
	let account;
	const { deployed, accountClient } = await getAccount(seed);
	if (!deployed) {
		account = await createAccount(seed);
	} else {
		account = accountClient;
	}
	const DEFAULT_IVCP_DATA = "0x0000000000000000000000000000000000000000000000000000000000000000"; 
	const tx = await accountClient.writeContract({
		address: MACI_ADDRESS,
		abi: maciFactory,
		functionName: "signUp",
		args: [keypair.pubKey.asContractParam(), encodeWldData(), DEFAULT_IVCP_DATA]
	});
}

const publishVote = async (maciAddress: string, pollId: number, voteOptionIndex: number, seed: number) => {
	const keypair = createKeypair(BigInt(seed));
	const userSalt = genRandomSalt();
	// const account = await createAccount(seed);

	const provider = new ethers.JsonRpcProvider(RPC_PROVIDER);
	const maciContract = new ethers.Contract(maciAddress, maciFactory, provider);
	const pollAddress = await maciContract.getPoll(pollId);
	const pollContract = new ethers.Contract(pollAddress, pollFactory, provider);
	const maxValues = await pollContract.maxValues();
	const coordinatorPubKeyResult = await pollContract.coordinatorPubKey();
	console.log(ethers.toNumber(maxValues.maxVoteOptions), coordinatorPubKeyResult);

	const coordinatorPubKey = new PubKey([
		BigInt(coordinatorPubKeyResult.x.toString()),
		BigInt(coordinatorPubKeyResult.y.toString()),
	]);

	const encKeypair = new Keypair();
	const command: PCommand = new PCommand(
		BigInt(1),
		keypair.pubKey,
		BigInt(voteOptionIndex),
		BigInt(9),
		BigInt(1),
		BigInt(pollId),
		userSalt
	);
	const signature = command.sign(keypair.privKey);
	const message = command.encrypt(signature, Keypair.genEcdhSharedKey(encKeypair.privKey, coordinatorPubKey));

	let account;
	const { deployed, accountClient } = await getAccount(seed);
	if (!deployed) {
		account = await createAccount(seed);
	} else {
		account = accountClient;
	}
	const tx = await accountClient.writeContract({
		address: pollAddress,
		abi: pollFactory,
		functionName: "publishMessage",
		args: [message.asContractParam(), encKeypair.pubKey.asContractParam()]
	});
	console.log(tx);
}

export const test = async () => {
	/* ---------------------------- Generate Key Pair --------------------------- */
	const keypair = createKeypair(BigInt(299123))
	console.log(keypair.privKey.serialize());
	console.log(keypair.pubKey.serialize());

	// /* ----------------------------- Encode WLD Data ---------------------------- */
	// console.log(encodeWldData(
	// 	"0x4B4ddb5A02b0B6b14274013d6ba13A3fBd65D5d3",
	// 	"0x1e28120c18d4a1025fbcbc2401462cfce8406fc87b7c8a0468c474649687df70",
	// 	"0x21ea8bf989c364c27b5baf90516fe582b8870c166db90b6a17840a46add5b1e3",
	// 	"0x056d319a4cafcce6e18df70fe7304dfd96dc4d98fbcca3738651aea79d317c53270b895a890a196bc0aa7435845e0d476f1a528623381b7c8cdd36f42e791f2b1b879e88ff6f1cee7116d71a80e52e0d77b90113b2dd0ddd02a859ddc7cc383a021d81ffb22658f6ca33ca4f5e838f3982e10ee6c86d7876bd8d508247b3c7310674120b44b050db94b3889e896d969baab96730793eada911442d735c04e562124c9b446194b76a66b3509141c0d871200ad3424f8772218a95b396bd5c6ab905712406a76fd420b14909687ac7a5279ffbb96d7bbb5ec62a3d2734d57e39e8227337049e00603d9817f3b7831da58864eb126ae909db2c63275b772958799c"
	// ));

	/* -------------------------------- Register -------------------------------- */


	// /* ------------------------ Check if User Registered ------------------------ */
	// console.log(await checkIfRegistered(keypair.pubKey));

	// /* ------------------------------ Publish Vote ------------------------------ */
	// await publishVote(MACI_ADDRESS, 0, 0, 299123);

	// const provider = new ethers.JsonRpcProvider("http://168.119.232.46:8545/");
	// console.log(await provider.getBlockNumber());
}
