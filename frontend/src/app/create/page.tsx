"use client";

import { Button, Card, CardBody, CardFooter, CardHeader, Input, Spinner } from "@nextui-org/react";
import { getPoll } from "../api/frame/maciConnect";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";

const Page: React.FC<{params: {id: string}}> = ({params}) => {
	const [loading, setLoading] = useState(false);
	const [question, setQuestion] = useState("");
	const [answer1, setAnswer1] = useState("");
	const [answer2, setAnswer2] = useState("");
	const router = useRouter();

	const onBtnClick = () => {
		if (question === "" || answer1 === "" || answer2 === "") {
			return;
		}
		setLoading(true);
		const data = new URLSearchParams();
		data.append("heading", question);
		data.append("options[]", answer1);
		data.append("options[]", answer2);
		fetch("http://168.119.232.46:3000/create", {
			method: "POST",
			body: data
		}).then(async (response) => {
			if (response.ok) {
				const pollData = await response.json();
				router.push(`/${pollData.pollId}`);
			}
		});
	}

	return (<div className="flex flex-col gap-3 items-center justify-center w-screen h-screen p-10">
		<Card className="w-1/2 max-w-[800px]">
			{loading && <div className=" absolute flex justify-center items-center h-full w-full">
				<Spinner size="lg"/>
			</div>}
			<CardHeader className={clsx("flex justify-center", {"opacity-0": loading})}>
				<h1 className="font-bold text-3xl">Create New Poll</h1>
			</CardHeader>
			<CardBody className={clsx("flex gap-3 justify-center items-center", {"opacity-0": loading})}>
				<Input size={"md"} type="question" label="Question" placeholder="Enter your question" value={question} onValueChange={setQuestion}/>
				<Input size={"md"} type="answer1" label="Answer Option 1" placeholder="Enter answer one" value={answer1} onValueChange={setAnswer1}/>
				<Input size={"md"} type="answer2" label="Answer Option 2" placeholder="Enter answer two" value={answer2} onValueChange={setAnswer2}/>
			</CardBody>
			<CardFooter className={clsx("flex justify-center items-center", {"opacity-0": loading})}>
				<Button color="primary" fullWidth onClick={onBtnClick}>
					Create Poll
				</Button>
			</CardFooter>
		</Card>
	</div>)
}
export default Page;
