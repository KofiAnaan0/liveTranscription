import { ServiceCardProps } from "@/types/serviceType";
import React from "react";
import H3 from "../ui/H3";
import P from "../ui/P";

const ServiceCard = ({
	services,
	loading = false,
	onBookDemo,
}: ServiceCardProps) => {
	// handle demo booking
	const handleBookDemo = () => {
		if (!loading) {
			onBookDemo(services.id);
		}
	};

	return (
		<div className="flex flex-col items-center justify-center space-y-3 p-4 h-full rounded-sm shadow-md hover:shadow-xl cursor-pointer bg-[#AFD3E2] transition duration-200">
			{/* Steps */}
			<H3>{services.id}</H3>

			{/* Title */}
			<H3 className="text-center">{services.title}</H3>

			{/* Description */}
			<P className="text-center">{services.description}</P>

			{/* CTA */}
			{/* <div className="flex items-center justify-between lg:flex-col lg:space-y-4  w-full">
				
				<Button
					variant="default"
					size="sm"
					onClick={handleBookDemo}
					loading={loading}
				>
					Book a Demo
				</Button>

				
				<Link href={services.learnMoreUrl}>Learn More</Link>
			</div> */}
		</div>
	);
};

export default ServiceCard;
