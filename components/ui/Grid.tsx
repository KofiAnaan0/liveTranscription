import { cn } from "@/lib/utils";
import React, { HTMLProps } from "react";

const Grid = (props: HTMLProps<HTMLDivElement>) => {
	return (
		<div
			{...props}
			className={cn(
				"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8",
				props.className
			)}
		/>
	);
};

export default Grid;
