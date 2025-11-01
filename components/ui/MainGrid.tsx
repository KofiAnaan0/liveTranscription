import { cn } from "@/lib/utils";
import React, { HTMLProps } from "react";

const MainGrid = (props: HTMLProps<HTMLDivElement>) => {
	return (
		<div
			{...props}
			className={cn(
				"w-[90%] md:w-[80%] lg:w-[60%] grid grid-cols-1 md:grid-cols-2 gap-10 mx-auto",
				props.className
			)}
		/>
	);
};

export default MainGrid;
