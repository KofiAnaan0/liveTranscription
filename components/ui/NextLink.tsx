import { cn } from "@/lib/utils";
import NextLink, { LinkProps as NextLinkProps } from "next/link";
import React, { AnchorHTMLAttributes } from "react";

// Combine Next.js LinkProps with anchor attributes, avoiding conflicts
interface LinkProps
	extends Omit<NextLinkProps, "href">,
		Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "onClick"> {
	href: string;
}

const Link: React.FC<LinkProps> = ({ href, ...props }) => {
	return (
		<NextLink
			href={href}
			className={cn(
				"text-blue-600 hover:text-blue-800 underline text-xs md:text-sm transition-colors",
				props.className
			)}
			{...props}
		/>
	);
};

export default Link;
