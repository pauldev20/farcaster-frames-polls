import { Metadata } from "next";

const createFarcasterData = () => {
	return {
		openGraph: {
			title: "VotelikPollerin - 1",
			images: [`/api/frame?id=1`]
		},
		other: {
			"fc:frame": "vNext",
			"fc:frame:post_url": `${process.env['HOST']}/api/frame?id=1`,
			"fc:frame:image": `${process.env['HOST']}/api/frame?id=1`,
			"fc:frame:button:1": "Vote"
		}
	}
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
	console.log(params.id);

	return {
		title: "VotelikPollerin - " + params.id,
		description: "Decentralized anonymous voting on farcaster",
		...createFarcasterData(),
		metadataBase: new URL(process.env['HOST'] || '')
	}
}

const Page: React.FC<{params: {id: string}}> = ({params}) => {
	return (
		<div>{params.id}</div>
	)
}
export default Page;
