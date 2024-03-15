import { ImageResponse } from "next/og";
import Image from "next/image";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url)
	const id = searchParams.get('id')

	return new ImageResponse((<>
		<h1>HUHU - {id}</h1>
		{/* <Image src="https://ichef.bbci.co.uk/news/976/cpsprodpb/16620/production/_91408619_55df76d5-2245-41c1-8031-07a4da3f313f.jpg" alt="ads" style={{height: "100px", width: "100px"}}/> */}
	</>), {width: 1200, height: 630})
}
