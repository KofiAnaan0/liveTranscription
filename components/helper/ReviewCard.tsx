import { ReviewCardProps } from "@/types/reviewType";
import React from "react";
import Image from "next/image";
import P from "../ui/P";

const ReviewCard = ({ review }: ReviewCardProps) => {
	return (
		<div
			data-aos="fade-up"
			className="flex flex-col p-4 space-y-4 items-start justify-center shadow-md hover:shadow-lg bg-[#BAD7E9] hover:bg-[#AFD3E2] transition duration-200"
		>
			{/* Icon */}
			<Image
				src={review.icon}
				alt={`${review.id} image`}
				height={24}
				width={96}
			/>

			{/* title */}
			<P className="text-start font-bold ">{review.title}</P>

			{/* description */}
			<P className="text-start text-xs md:text-sm">{review.description}</P>

			{/* Profile */}
			<div className="flex items-center justify-center space-x-4">
				{/* Profile Image */}
				<Image
					src={review.profileUrl}
					alt={`${review.name} profile`}
					height={48}
					width={48}
					className="rounded-full"
				/>

				{/* Name and Designation */}
				<div className="flex flex-col items-center justify-center space-y-0">
					<span className="font-semibold text-start w-full text-sm text-[#10316B]">
						{review.name}
					</span>
					<span className="text-xs text-[#10316B] text-start w-full">
						{review.designation}
					</span>
				</div>
			</div>
		</div>
	);
};

export default ReviewCard;
