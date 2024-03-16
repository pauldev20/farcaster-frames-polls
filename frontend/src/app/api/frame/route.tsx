import { FrameRequest, getFrameHtmlResponse, getFrameMessage } from '@coinbase/onchainkit';
import { ImageResponse } from "next/og";
import Image from "next/image";
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url)
	const id = searchParams.get('id')

	return new ImageResponse((<div style={{backgroundColor: "black", display: "flex", width: "100%", height: "100%", color: "white", justifyContent: "flex-start", alignItems: "center", flexDirection: "column"}}>
		<h1 style={{fontSize: "50px"}}>Farcaster Voting</h1>
		<div style={{display: "flex"}}>
			<h1 style={{fontSize: "50px"}}>HUHU - {id}</h1>
		</div>
		{/* <Image src="https://ichef.bbci.co.uk/news/976/cpsprodpb/16620/production/_91408619_55df76d5-2245-41c1-8031-07a4da3f313f.jpg" alt="ads" style={{height: "100px", width: "100px"}}/> */}
	</div>), {width: 1200, height: 630});
}

export async function POST(request: Request) {
	const { searchParams } = new URL(request.url)
	const id = searchParams.get('id');

	return new NextResponse(getFrameHtmlResponse({
		buttons: [
			{
				label: `View Smart Account`,
				action: "post_redirect"
			},
		],
		image: `${process.env['HOST']}/api/frame?id=1234&action=vote`,
		post_url: `${process.env['HOST']}/api/frame?id=${id}`,
	}));
}
