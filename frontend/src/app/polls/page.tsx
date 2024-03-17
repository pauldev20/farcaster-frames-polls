"use client";

import { Card, CardBody, Spinner } from "@nextui-org/react";
import { getPoll } from "../api/frame/maciConnect";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const Page: React.FC<{params: {id: string}}> = ({params}) => {
	const [pollData, setPollData] = useState<any[] | null>(null);
	const router = useRouter();
	useEffect(() => {
		fetch("http://168.119.232.46:3000/polls", {cache: "no-store"}).then(async (response) => {
			setPollData(await response.json());
		});
	}, [params.id]);

	if (pollData == null) {
		return (<div className="flex items-center justify-center w-screen h-screen">
			<Spinner label="Loading..."/>
		</div>)
	}

	return (<div className="flex flex-col gap-3 items-center justify-start w-screen h-screen p-10">
		{pollData ? pollData.map((poll) => {
			return (<Card key={poll.id} className="w-1/2" isPressable onPress={() => router.push(`/${poll.id}`)}>
				<CardBody className="flex flex-row justify-between w-full">
					<h1 className="font-bold">{poll.heading}</h1>
					{('tally' in poll) && <h1>Finished</h1>}
					{!('tally' in poll) && <h1>Running</h1>}
				</CardBody>
			</Card>)
		}) : <></>}
	</div>)
}
export default Page;
