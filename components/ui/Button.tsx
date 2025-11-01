import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import React, { ButtonHTMLAttributes, forwardRef } from "react";

const buttonVariant = cva(
	"inline-flex justify-center items-center font-medium rounded-sm shadow-lg shadow-black/30 text-sm px-8 py-4 text-white hover:shadow-xl hover:shadow-black/60 hover:rotate-1 hover:scale-110 transform transition-all duration-150 disabled:pointer-events-none cursor-pointer w-full md:w-fit",
	{
		variants: {
			variant: {
				default: "bg-[#7AE2CF] text-black focus:outline-none ",
				outline:
					" text-[#7AE2CF] border border-[#7AE2CF] bg-transparent focus:outline-none",
				loading: "bg-gray-400 text-gray-600 cursor-not-allowed shadow-none",
			},
			size: {
				default: "h-10 py-2 px-4",
				sm: "h-9 p-2",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	}
);

interface ButtonProps
	extends ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariant> {
	loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{ variant, size, loading = false, disabled, children, className, ...props },
		ref
	) => {
		const buttonVariantToUse = loading ? "loading" : variant;
		const isDisabled = disabled || loading;

		return (
			<button
				ref={ref}
				disabled={isDisabled}
				className={cn(
					buttonVariant({ variant: buttonVariantToUse, size }),
					className
				)}
				{...props}
			>
				{loading && (
					<svg
						className="animate-spin -ml-1 mr-3 h-4 w-4"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle
							className="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							strokeWidth="4"
						></circle>
						<path
							className="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
				)}
				{children}
			</button>
		);
	}
);

Button.displayName = "Button";

export { Button, buttonVariant };
