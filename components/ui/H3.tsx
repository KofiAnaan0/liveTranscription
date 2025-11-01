import { cn } from "@/lib/utils";
import React, { HTMLProps } from "react";

const H3 = (props: HTMLProps<HTMLHeadingElement>) => {
	return (
		<h3
			{...props}
			className={cn(
				"text-lg sm:text-xl font-medium tracking-normal leading-relaxed text-[#10316B] max-w-2xl",
				props.className
			)}
		/>
	);
};

export default H3;
