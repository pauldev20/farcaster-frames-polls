import { FrameRequest, getFrameHtmlResponse, getFrameMessage } from '@coinbase/onchainkit';
import { createVerification, checkVerification } from './wldConnect';
import { createAccount, getAccount } from './safeAccount';
import { VerificationLevel } from '@worldcoin/idkit-core';
import { NextResponse } from 'next/server';
import { ImageResponse } from "next/og";
import qrcode from "qrcode";

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const screen = searchParams.get('screen');
	const id = searchParams.get('id');

	/* ---------------------- Registration and Verification --------------------- */
	if (screen === "register") {
		const qrCode = await qrcode.toDataURL(decodeURIComponent(searchParams.get("qr")|| ""), {
			width: 500,
			margin: 1,
			color: {
				dark: "#ffffff",
				light: "#00000000"
			}
		});

		return new ImageResponse((<div style={{backgroundColor: "black", display: "flex", width: "100%", height: "100%", color: "white", justifyContent: "center", alignItems: "center", gap: "15px"}}>
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img src={qrCode} alt="QRCode" style={{height: "400px", width: "400px"}}/>
			<div style={{display: "flex", justifyContent: "center", alignItems: "center", textWrap: "wrap"}}>
				<h1 style={{maxWidth: "500px", overflowWrap: "break-word", textAlign: "center"}}>Please scan with your World ID App to verify. Then press the Submit Button</h1>
			</div>
		</div>), {width: 1200, height: 630});
	}

	/* ------------------------------ Actuall Vote ------------------------------ */
	if (screen === "vote") {
		return new ImageResponse((<div style={{backgroundColor: "black", display: "flex", width: "100%", height: "100%", color: "white", justifyContent: "flex-start", alignItems: "center", flexDirection: "column"}}>
			<h1 style={{fontSize: "50px"}}>Question</h1>
		</div>), {width: 1200, height: 630});
	}

	/* ---------------------------- Thanks for Voting --------------------------- */
	if (screen === "thanks") {
		return new ImageResponse((<div style={{backgroundColor: "black", display: "flex", width: "100%", height: "100%", color: "white", justifyContent: "flex-start", alignItems: "center", flexDirection: "column"}}>
			<h1 style={{fontSize: "50px"}}>Thanks for Voting</h1>
		</div>), {width: 1200, height: 630});
	}

	/* ----------------------------- Results Screen ----------------------------- */
	if (screen === "results") {
		return new ImageResponse((<div style={{backgroundColor: "black", display: "flex", width: "100%", height: "100%", color: "white", justifyContent: "flex-start", alignItems: "center", flexDirection: "column"}}>
			<h1 style={{fontSize: "50px"}}>Results</h1>
		</div>), {width: 1200, height: 630});
	}

	/* ----------------------------- Default Screen ----------------------------- */
	return new ImageResponse((<div style={{backgroundColor: "black", display: "flex", width: "100%", height: "100%", color: "white", justifyContent: "flex-start", alignItems: "center", flexDirection: "column"}}>
		<h1 style={{fontSize: "50px"}}>Farcaster Voting</h1>
		<div style={{display: "flex"}}>
			<h1 style={{fontSize: "50px"}}>Question? - {id}</h1>
		</div>
		{/* <Image src="https://ichef.bbci.co.uk/news/976/cpsprodpb/16620/production/_91408619_55df76d5-2245-41c1-8031-07a4da3f313f.jpg" alt="ads" style={{height: "100px", width: "100px"}}/> */}
	</div>), {width: 1200, height: 630});
}

export async function POST(request: Request) {
	const { searchParams } = new URL(request.url);
	const action = searchParams.get('action');
	const id = searchParams.get('id');

	const body: FrameRequest = await request.json();
	const { isValid, message } = await getFrameMessage(body);
	if (!isValid || !message) {
		throw new Error("Invalid Frame Request");
	}

	/* ----------------------------- Register Action ---------------------------- */
	if (action === "register") {
		if (searchParams.get("post") == "true" && message.button == 2) {
			// check if validation was successfull - redirect, else show again

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

				return NextResponse.redirect(new URL(`/api/frame?id=${id}&action=vote`, request.url));
			}
		}
		let connURI, request_id, key;
		if (searchParams.get("post") == "true" && message.button == 1) {
			request_id = decodeURIComponent(searchParams.get("request_id") || "");
			connURI = decodeURIComponent(searchParams.get("qr") || "");
			key = decodeURIComponent(searchParams.get("key") || "");
		} else {
			const verification = await createVerification({
				app_id: "app_ccc994b5ef2d751551e1a0552d30e8e4",
				action: "anonymous-vote",
				verification_level: VerificationLevel.Orb,
				signal: message.interactor.fid.toString()
			});
			request_id = verification.request_id;
			connURI = verification.connectionURI;
			key = verification.key;
		}
		return new NextResponse(getFrameHtmlResponse({
			buttons: [
				{
					label: `Refresh`,
					action: "post"
				},
				{
					label: `Submit`,
					action: "post"
				}
			],
			image: `${process.env['HOST']}/api/frame?id=${id}&screen=register&qr=${encodeURIComponent(connURI)}`,
			post_url: `${process.env['HOST']}/api/frame?id=${id}&action=register&post=true&key=${encodeURIComponent(key)}&request_id=${encodeURIComponent(request_id)}&qr=${encodeURIComponent(connURI)}`
		}));
	}

	/* ------------------------------- Vote Action ------------------------------ */
	if (action === "vote") {
		if (searchParams.get("post") == "true") {
			// submit vote to the server and redirect to thanks
			const body: FrameRequest = await request.json();
			console.log(body.untrustedData.fid);
			return NextResponse.redirect(new URL(`/api/frame?id=${id}&action=thanks`, request.url));
		}
		return new NextResponse(getFrameHtmlResponse({
			buttons: [
				{
					label: `Vote 1`,
					action: "post"
				},
				{
					label: `Vote 2`,
					action: "post"
				},
			],
			image: `${process.env['HOST']}/api/frame?id=${id}&screen=vote`,
			post_url: `${process.env['HOST']}/api/frame?id=${id}&action=vote&post=true`
		}));
	}

	/* ----------------------------- Results Action ----------------------------- */
	if (action === "results") {
		return new NextResponse(getFrameHtmlResponse({
			buttons: [
				{
					label: `Go to our Website`,
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
					label: `Go to our Website`,
					action: "link",
					target: `${process.env['HOST']}/`
				},
			],
			image: `${process.env['HOST']}/api/frame?id=${id}&screen=thanks`
		}));
	}

	/* ----------------------------- Default Action ----------------------------- */
	// check if poll ended
	const { deployed } = await getAccount(message.interactor.fid);
	if (!deployed) {
		return NextResponse.redirect(new URL(`/api/frame?id=${id}&action=register`, request.url));
	}
	return NextResponse.redirect(new URL(`/api/frame?id=${id}&action=vote`, request.url));
}
