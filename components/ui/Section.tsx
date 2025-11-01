import { cn } from "@/lib/utils";
import React, { HTMLProps } from "react";

const Section = (props: HTMLProps<HTMLDivElement>) => {
	return (
		<section
			{...props}
			className={cn(
				"py-10 md:py-18 flex flex-col justify-center items-center bg-transparent",
				props.className
			)}
		/>
	);
};

export default Section;
