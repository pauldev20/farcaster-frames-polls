import { Keypair, PCommand, PrivKey, PubKey } from "maci-domainobjs";
import { createAccount, getAccount } from "../safeAccount";
import maciFactory from "./maciFactory.json";
import pollFactory from "./pollFactory.json";
import { genRandomSalt } from "maci-crypto";
import { ethers } from "ethers";

const MACI_ADDRESS = "0x587E495af03FE6C3ec56a98394807c753B827a75";
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
		address: MACI_ADDRESS,
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
		BigInt(9),
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
	console.log(tx);
}

const getPoll = async (pollId: number) => {
	const resp = fetch("http://168.119.232.46:3000/polls");
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

export const test = async () => {
	// /* -------------------------------- Register -------------------------------- */
	// console.log(await signUp(299123, "0x4B4ddb5A02b0B6b14274013d6ba13A3fBd65D5d3", "0x1e28120c18d4a1025fbcbc2401462cfce8406fc87b7c8a0468c474649687df70", "0x03236ce6408f6b6b2c233f27ce7f82e0298522e07d839aba71025d77c936df71", "0x1372a2d4ced984879df1f82e701dd18a8345478b6e45551f0f12b1e8e8cfa8e213e016a53def05176936405396ca2f8e910f5fef23ed1303228b057b4ae8656005b8aa35534d506d8886f17d1cdde1d84e08ac3cfa691221a2bc944e7f7a2bc01fcf1cc6429b67da1b23762023b2c06a5012860748e91940e8f849718a1e19de2ad3475545d00f086cfba70ef18f402c0a4f53b144ac0a74303e536569317fcb20840d37cb1431b9ef76ca7170577ce49374f84a0f80ffedb3cd8bb54bc028400a365fcfc6308c1e8b782cfb9064d56a673acd9849d6ceda7907ffd826a43d8529c64acc8f1a16801eaf6b2bb7b4d5effd1939a5e18ca2bd0395d1a9f9ecb6a4"));

	// /* ------------------------ Check if User Registered ------------------------ */
	// console.log(await checkIfRegistered(299123));

	// /* ------------------------------ Publish Vote ------------------------------ */
	// await publishVote(2, 0, 299123);

	// /* -------------------------------- Get Poll -------------------------------- */
	// console.log(await getPoll(1));

	// /* ------------------------------- Is Running ------------------------------- */
	// console.log(await isPollRunning(2));
}
