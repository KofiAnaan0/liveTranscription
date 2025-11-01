import { cn } from "@/lib/utils";
import React, { HTMLProps } from "react";

const Input = (props: HTMLProps<HTMLInputElement>) => {
	return (
		<input
			{...props}
			className={cn(
				"w-full bg-gray-400 rounded-md py-2 px-4 mb-4 hover:bg-gray-500 transition-all duration-150 ",
				props.className
			)}
		/>
	);
};

export default Input;
