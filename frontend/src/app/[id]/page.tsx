import { Metadata } from "next";

const createFarcasterData = (id: string) => {
	return {
		openGraph: {
			title: `VotelikPollerin - ${id}`,
			images: [`/api/frame?id=${id}`]
		},
		other: {
			"fc:frame": "vNext",
			"fc:frame:post_url": `${process.env['HOST']}/api/frame?id=${id}`,
			"fc:frame:image": `${process.env['HOST']}/api/frame?id=${id}`,
			"fc:frame:button:1": "Vote"
		}
	}
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
	console.log(params.id);

	return {
		title: `VotelikPollerin - ${params.id}`,
		description: "Decentralized anonymous voting on farcaster",
		...createFarcasterData(params.id),
		metadataBase: new URL(process.env['HOST'] || '')
	}
}

const Page: React.FC<{params: {id: string}}> = ({params}) => {
	return (
		<div>{params.id}</div>
	)
}
export default Page;
