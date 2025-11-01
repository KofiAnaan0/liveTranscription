import { cn } from "@/lib/utils";
import React, { HTMLProps } from "react";

const H1 = (props: HTMLProps<HTMLHeadingElement>) => {
	return (
		<h1
			{...props}
			className={cn(
				"text-3xl sm:text-6xl font-bold tracking-tight leading-tight text-white max-w-4xl mx-auto text-center",
				props.className
			)}
		/>
	);
};

export default H1;
