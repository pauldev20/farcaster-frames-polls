import { FrameRequest, getFrameHtmlResponse, getFrameMessage } from '@coinbase/onchainkit';
import { createVerification, checkVerification, createURI } from './wldConnect';
import { getPoll, isPollRunning, publishVote, signUp } from './maciConnect';
import { createAccount, getAccount } from './safeAccount';
import { VerificationLevel } from '@worldcoin/idkit-core';
import { NextResponse } from 'next/server';
import { ImageResponse } from "next/og";
import qrcode from "qrcode";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const screen = searchParams.get('screen');
	const id = searchParams.get('id');

	/* ---------------------- Registration and Verification --------------------- */
	if (screen === "register") {
		const key = decodeURIComponent(searchParams.get("key") || "");
		const request_id = decodeURIComponent(searchParams.get("request_id") || "");
		const qrCode = await qrcode.toDataURL(createURI(request_id, key), {
			width: 500,
			margin: 2,
			errorCorrectionLevel: "H"
		});

		return new ImageResponse((<div style={{backgroundColor: "black", display: "flex", width: "100%", height: "100%", color: "white", justifyContent: "center", alignItems: "center", gap: "15px"}}>
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img src={qrCode} alt="QRCode" style={{height: "500px", width: "500px"}}/>
			<div style={{display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textWrap: "wrap"}}>
				<h1 style={{maxWidth: "500px", overflowWrap: "break-word", textAlign: "center"}}>1. Scan QR with your World App</h1>
				<h1 style={{maxWidth: "500px", overflowWrap: "break-word", textAlign: "center"}}>2. Refresh this frame by clicking the `Refresh` button</h1>
			</div>
		</div>), {width: 1200, height: 630});
	}

	/* ------------------------------ Actuall Vote ------------------------------ */
	if (screen === "vote") {
		const pollData = await getPoll(Number(id));
		return new ImageResponse((<div style={{backgroundColor: "black", display: "flex", width: "100%", height: "100%", color: "white", justifyContent: "center", alignItems: "center", flexDirection: "column"}}>
			<h1 style={{fontSize: "50px"}}>{pollData.heading}</h1>
		</div>), {width: 1200, height: 630});
	}

	/* ---------------------------- Thanks for Voting --------------------------- */
	if (screen === "thanks") {
		return new ImageResponse((<div style={{backgroundColor: "black", display: "flex", width: "100%", height: "100%", color: "white", justifyContent: "center", alignItems: "center", flexDirection: "column"}}>
			<h1 style={{fontSize: "50px"}}>Thanks for Voting! 🎉</h1>
		</div>), {width: 1200, height: 630});
	}

	/* ----------------------------- Results Screen ----------------------------- */
	if (screen === "results") {
		const pollData = await getPoll(Number(id));
		return new ImageResponse((<div style={{backgroundColor: "black", display: "flex", width: "100%", height: "100%", color: "white", justifyContent: "flex-start", alignItems: "center", flexDirection: "column"}}>
			<h1 style={{fontSize: "50px"}}>Results 🗳️</h1>
			<h1>{pollData.options[0]}: {pollData.tally.results.tally[0]}</h1>
			<h1>{pollData.options[1]}: {pollData.tally.results.tally[1]}</h1>
		</div>), {width: 1200, height: 630});
	}

	/* ----------------------------- Default Screen ----------------------------- */
	const pollData = await getPoll(Number(id));
	return new ImageResponse((<div style={{backgroundColor: "black", display: "flex", width: "100%", height: "100%", color: "white", justifyContent: "center", alignItems: "center", flexDirection: "column"}}>
		<h1 style={{fontSize: "50px"}}>{pollData.heading}</h1>
	</div>), {width: 1200, height: 630});
}

export async function POST(request: Request) {
	const { searchParams } = new URL(request.url);
	const action = searchParams.get('action');
	const id = searchParams.get('id');

	/* ------------------------- Load And Parse Message ------------------------- */
	const body: FrameRequest = await request.json();
	const { isValid, message } = await getFrameMessage(body);
	if (!isValid || !message) {
		throw new Error("Invalid Frame Request");
	}
	const { deployed, address } = await getAccount(message.interactor.fid);

	/* ----------------------------- Register Action ---------------------------- */
	if (action === "register") {
		if (searchParams.get("post") == "true") {
			// check if validation was successfull - redirect, else show again
			if (deployed) {
				return NextResponse.redirect(new URL(`/api/frame?id=${id}&action=vote`, request.url));
			}

			/* ------------------------------ Check WorldID ----------------------------- */
			const key = decodeURIComponent(searchParams.get("key") || "");
			const request_id = decodeURIComponent(searchParams.get("request_id") || "");
			const { status, result } = await checkVerification({
				request_id: request_id,
				key: key
			});
			if (status == true) {
				/* ------------------------------- Deploy Safe ------------------------------ */
				await createAccount(message.interactor.fid);
				await signUp(message.interactor.fid, result?.merkle_root || "", result?.nullifier_hash || "", result?.proof || "");

				return NextResponse.redirect(new URL(`/api/frame?id=${id}&action=vote`, request.url));
			}
			return new NextResponse();
		}
		const verification = await createVerification({
			app_id: "app_staging_e5f6479bc07964d51a5d30595a99a2d5",
			action: "anonymous-vote",
			verification_level: VerificationLevel.Orb,
			signal: address
		});
		return new NextResponse(getFrameHtmlResponse({
			buttons: [
				{
					label: `Refresh`,
					action: "post"
				}
			],
			image: `${process.env['HOST']}/api/frame?id=${id}&screen=register&key=${encodeURIComponent(verification.key)}&request_id=${encodeURIComponent(verification.request_id)}`,
			post_url: `${process.env['HOST']}/api/frame?id=${id}&action=register&post=true&key=${encodeURIComponent(verification.key)}&request_id=${encodeURIComponent(verification.request_id)}`
		}));
	}

	/* ------------------------------- Vote Action ------------------------------ */
	if (action === "vote") {
		if (searchParams.get("post") == "true") {
			await publishVote(message.interactor.fid, Number(id), message.button - 1);
			return NextResponse.redirect(new URL(`/api/frame?id=${id}&action=thanks`, request.url));
		}
		const pollData = await getPoll(Number(id));
		return new NextResponse(getFrameHtmlResponse({
			buttons: pollData.options.map((option: any) => {
				return {
					label: option,
					action: "post"
				}
			}),
			image: `${process.env['HOST']}/api/frame?id=${id}&screen=vote`,
			post_url: `${process.env['HOST']}/api/frame?id=${id}&action=vote&post=true`
		}));
	}

	/* ----------------------------- Results Action ----------------------------- */
	if (action === "results") {
		return new NextResponse(getFrameHtmlResponse({
			buttons: [
				{
					label: `Go To Our Website`,
					action: "link",
					target: `${process.env['HOST']}/`
				},
			],
			image: `${process.env['HOST']}/api/frame?id=${id}&screen=results`
		}));
	}

	/* ------------------------------ Thanks Action ----------------------------- */
	if (action === "thanks") {
		return new NextResponse(getFrameHtmlResponse({
			buttons: [
				{
					label: `Go To Our Website`,
					action: "link",
					target: `${process.env['HOST']}/`
				},
			],
			image: `${process.env['HOST']}/api/frame?id=${id}&screen=thanks`
		}));
	}

	/* ----------------------------- Default Action ----------------------------- */
	if (await isPollRunning(Number(id)) === false) {
		return NextResponse.redirect(new URL(`/api/frame?id=${id}&action=results`, request.url));
	}
	if (!deployed) {
		return NextResponse.redirect(new URL(`/api/frame?id=${id}&action=register`, request.url));
	}
	return NextResponse.redirect(new URL(`/api/frame?id=${id}&action=vote`, request.url));
}
