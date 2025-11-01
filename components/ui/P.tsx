import { cn } from "@/lib/utils";
import React, { HTMLProps } from "react";

const P = (props: HTMLProps<HTMLParagraphElement>) => {
	return (
		<p
			{...props}
			className={cn(
				"text-sm md:text-base text-white text-center",
				props.className
			)}
		/>
	);
};

export default P;
