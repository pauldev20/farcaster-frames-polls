import { getPoll } from "../api/frame/maciConnect";
import PollCard from "./pollCard";
import { Metadata } from "next";

const createFarcasterData = (id: string, heading: string) => {
	return {
		openGraph: {
			title: `VotelikPollerin - ${heading}`,
			images: [`/api/frame?id=${id}`]
		},
		other: {
			"fc:frame": "vNext",
			"fc:frame:post_url": `${process.env['HOST']}/api/frame?id=${id}&action=start`,
			"fc:frame:image": `${process.env['HOST']}/api/frame?id=${id}`,
			"fc:frame:button:1": "Start Voting"
		}
	}
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
	const pollData = await getPoll(Number(params.id));

	return {
		title: `VotelikPollerin - ${pollData.heading}`,
		description: pollData.heading,
		...createFarcasterData(params.id, pollData.heading),
		metadataBase: new URL(process.env['HOST'] || '')
	}
}

const Page: React.FC<{params: {id: string}}> = ({params}) => {

	return (<div className="flex items-center justify-center w-screen h-screen">
		<PollCard id={params.id}/>
	</div>)
}
export default Page;
