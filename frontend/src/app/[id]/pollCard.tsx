"use client";

import { Card, CardBody, CardFooter, CardHeader, Snippet, Spinner } from "@nextui-org/react";
import { getPoll } from "../api/frame/maciConnect";
import { useEffect, useState } from "react";

const PollCard: React.FC<{id: string}> = ({id}) => {
	const [pollData, setPollData] = useState<any>(null);
	useEffect(() => {
		getPoll(Number(id)).then((pollData) => {
			setPollData(pollData);
		});
	}, [id]);

	if (pollData == null) {
		return (<div>
			<Spinner label="Loading..."/>
		</div>)
	}

	return (<Card className="w-1/2 max-w-[800px]">
		<CardHeader className="flex justify-center">
			<h1 className="font-bold text-3xl">{pollData.heading}</h1>
		</CardHeader>
		<CardBody className="flex justify-center items-center">
			{!('tally' in pollData) && <p className="font-bold">Voting Currently Running...</p>}
			{('tally' in pollData) && <>
				<p className="font-bold">{pollData.options[0]}: {pollData.tally.results.tally[0]}</p>
				<p className="font-bold">{pollData.options[1]}: {pollData.tally.results.tally[1]}</p>
			</>}
		</CardBody>
		<CardFooter className="flex justify-center items-center">
			<Snippet>{`${process.env["NEXT_PUBLIC_URL"]}/${id}`}</Snippet>
		</CardFooter>
	</Card>)
}
export default PollCard;
