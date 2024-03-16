import { FrameRequest, getFrameHtmlResponse, getFrameMessage } from '@coinbase/onchainkit';
import { NextResponse } from 'next/server';
import { ImageResponse } from "next/og";
import Image from "next/image";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const screen = searchParams.get('screen');
	const id = searchParams.get('id');

	/* ---------------------- Registration and Verification --------------------- */
	if (screen === "register") {
		return new ImageResponse((<div style={{backgroundColor: "black", display: "flex", width: "100%", height: "100%", color: "white", justifyContent: "flex-start", alignItems: "center", flexDirection: "column"}}>
			<h1 style={{fontSize: "50px"}}>Scan QR</h1>
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

	/* ----------------------------- Register Action ---------------------------- */
	if (action === "register") {
		if (searchParams.get("post") == "true") {
			// check if validation was successfull - redirect, else show again
			const body: FrameRequest = await request.json();
			return NextResponse.redirect(new URL(`/api/frame?id=${id}&action=vote`, request.url));
		}
		return new NextResponse(getFrameHtmlResponse({
			buttons: [
				{
					label: `Refresh`,
					action: "post"
				},
			],
			image: `${process.env['HOST']}/api/frame?id=${id}&screen=register`,
			post_url: `${process.env['HOST']}/api/frame?id=${id}&action=register&post=true`
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
	// check if registered
	// check if already voted
	return NextResponse.redirect(new URL(`/api/frame?id=${id}&action=register`, request.url));

	// return new NextResponse(getFrameHtmlResponse({
	// 	buttons: [
	// 		{
	// 			label: `View Smart Account`,
	// 			action: "post_redirect" // @todo post_redirect not working??
	// 		},
	// 	],
	// 	image: `${process.env['HOST']}/api/frame?id=1234&action=vote`,
	// 	post_url: `${process.env['HOST']}/api/frame?id=${id}`,
	// }));
}
