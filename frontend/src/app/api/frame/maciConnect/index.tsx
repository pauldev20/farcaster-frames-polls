import { Keypair, PCommand, PrivKey, PubKey } from "maci-domainobjs";
import { createAccount, getAccount } from "../safeAccount";
import maciFactory from "./maciFactory.json";
import pollFactory from "./pollFactory.json";
import { genRandomSalt } from "maci-crypto";
import { ethers } from "ethers";

const MACI_ADDRESS = process.env["MACI_ADDRESS"] as string;
const RPC_PROVIDER = "https://base-sepolia.g.alchemy.com/v2/xC7gy-WyxYdV48GlxEyP4n6xuVfYRTK3";

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */
const createKeypair = (seed: bigint) => {
	const SNARK_FIELD_SIZE = BigInt('21888242871839275222246405745257275088548364400416034343698204186575808495617');
	return new Keypair(seed ? new PrivKey(seed % SNARK_FIELD_SIZE) : undefined);
}

const encodeWldData = (signal: string, merkleRoot: string, nullifierHash: string, proof: string): string => {
	return new ethers.AbiCoder().encode(["address", "uint256", "uint256", "uint256[8]"], [
		signal,
		merkleRoot,
		nullifierHash,
		new ethers.AbiCoder().decode(["uint256[8]"], proof)[0]
	]);
}

/* -------------------------------------------------------------------------- */
/*                                 MACI Calls                                 */
/* -------------------------------------------------------------------------- */
const checkIfRegistered = async (fid: number) => {
	const keypair = createKeypair(BigInt(fid));
	const pubKey = keypair.pubKey.asContractParam();
	const provider = new ethers.JsonRpcProvider(RPC_PROVIDER);
	const maciContract = new ethers.Contract(MACI_ADDRESS, maciFactory, provider);
	const events = await maciContract.queryFilter(maciContract.filters.SignUp(undefined, pubKey.x, pubKey.y));
	if (events.length === 0) {
		return false;
	}
	const stateIndex = (events[0] as any).args[0].toString() as string | undefined;
  	// const voiceCredits = (events[0] as any).args[3].toString() as string | undefined;
	return stateIndex !== undefined;
}

const signUp = async (fid: number, merkleRoot: string, nullifierHash: string, proof: string) => {
	const keypair = createKeypair(BigInt(fid));
	let account;
	const { deployed, accountClient } = await getAccount(fid);
	if (!deployed) {
		account = await createAccount(fid);
	} else {
		account = accountClient;
	}
	const DEFAULT_IVCP_DATA = "0x0000000000000000000000000000000000000000000000000000000000000000";
	const tx = await account.writeContract({
		address: MACI_ADDRESS as `0x${string}`,
		abi: maciFactory,
		functionName: "signUp",
		args: [keypair.pubKey.asContractParam(), encodeWldData(account.account.address, merkleRoot, nullifierHash, proof), DEFAULT_IVCP_DATA]
	});
	console.log(tx);
}

const publishVote = async (fid: number, pollId: number, voteOptionIndex: number) => {
	const keypair = createKeypair(BigInt(fid));
	const userSalt = genRandomSalt();

	const provider = new ethers.JsonRpcProvider(RPC_PROVIDER);
	const maciContract = new ethers.Contract(MACI_ADDRESS, maciFactory, provider);
	const pollAddress = await maciContract.getPoll(pollId);
	const pollContract = new ethers.Contract(pollAddress, pollFactory, provider);
	const coordinatorPubKeyResult = await pollContract.coordinatorPubKey();
	// const maxValues = await pollContract.maxValues();
	// console.log(ethers.toNumber(maxValues.maxVoteOptions), coordinatorPubKeyResult);

	const coordinatorPubKey = new PubKey([
		BigInt(coordinatorPubKeyResult.x.toString()),
		BigInt(coordinatorPubKeyResult.y.toString()),
	]);

	const encKeypair = new Keypair();
	const command: PCommand = new PCommand(
		BigInt(1),
		keypair.pubKey,
		BigInt(voteOptionIndex),
		BigInt(1),
		BigInt(1),
		BigInt(pollId),
		userSalt
	);
	const signature = command.sign(keypair.privKey);
	const message = command.encrypt(signature, Keypair.genEcdhSharedKey(encKeypair.privKey, coordinatorPubKey));

	let account;
	const { deployed, accountClient } = await getAccount(fid);
	if (!deployed) {
		account = await createAccount(fid);
	} else {
		account = accountClient;
	}
	const tx = await accountClient.writeContract({
		address: pollAddress,
		abi: pollFactory,
		functionName: "publishMessage",
		args: [message.asContractParam(), encKeypair.pubKey.asContractParam()]
	});
	// console.log("Sent vote to contract");
	console.log(tx);
}

const getPoll = async (pollId: number) => {
	const resp = fetch("http://168.119.232.46:3000/polls", {cache: "no-store"});
	const data = await (await resp).json();
	const filtered = data.filter((poll: any) => poll.id === pollId.toString());
	if (filtered.length === 0) {
		return undefined;
	}
	return filtered[0];
}

const isPollRunning = async (pollId: number) => {
	const poll = await getPoll(pollId);
	if (!poll) {
		return undefined;
	}
	if ('tally' in poll) {
		return false;
	}
	return true;
}

export { signUp, checkIfRegistered, publishVote, getPoll, isPollRunning };
