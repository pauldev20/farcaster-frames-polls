import { FrameRequest, getFrameHtmlResponse, getFrameMessage } from '@coinbase/onchainkit';
import { createVerification, checkVerification, createURI } from './wldConnect';
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
				<h1 style={{maxWidth: "500px", overflowWrap: "break-word", textAlign: "center"}}>Please scan with your World ID App to verify. Then press the Refresh Button</h1>
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

	/* ------------------------- Load And Parse Message ------------------------- */
	console.log(await request.json());
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

				return NextResponse.redirect(new URL(`/api/frame?id=${id}&action=vote`, request.url));
			}
			return new NextResponse();
		}
		const verification = await createVerification({
			app_id: "app_ccc994b5ef2d751551e1a0552d30e8e4",
			action: "anonymous-vote",
			verification_level: VerificationLevel.Orb,
			signal: message.interactor.fid.toString()
		});
		return new NextResponse(getFrameHtmlResponse({
			buttons: [
				{
					label: `Refresh`,
					action: "post"
				}
			],
			image: `${process.env['HOST']}/api/frame?id=${id}&screen=register&qr=${encodeURIComponent(verification.connectionURI)}`,
			post_url: `${process.env['HOST']}/api/frame?id=${id}&action=register&post=true&key=${encodeURIComponent(verification.key)}&request_id=${encodeURIComponent(verification.request_id)}`
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
	if (!deployed) {
		return NextResponse.redirect(new URL(`/api/frame?id=${id}&action=register`, request.url));
	}
	return NextResponse.redirect(new URL(`/api/frame?id=${id}&action=vote`, request.url));
}
