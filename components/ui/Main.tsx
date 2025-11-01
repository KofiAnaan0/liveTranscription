import { cn } from "@/lib/utils";
import React, { HTMLProps } from "react";

const Main = (props: HTMLProps<HTMLDivElement>) => {
	return (
		<div
			{...props}
			className={cn("w-[90%] md:w-[80%] mx-auto space-y-8 px-2", props.className)}
		/>
	);
};

export default Main;
