import { cn } from "@/lib/utils";
import React, { HTMLProps } from "react";

const H2 = (props: HTMLProps<HTMLHeadingElement>) => {
	return (
		<h2
			{...props}
			className={cn(
				"text-2xl sm:text-3xl font-bold tracking-tight leading-snug text-white max-w-3xl mx-auto text-center",
				props.className
			)}
		/>
	);
};

export default H2;
