"use client";

import useServices from "@/hooks/useServices";
import React from "react";
import ServiceCard from "../helper/ServiceCard";
import H2 from "../ui/H2";
import P from "../ui/P";
import Grid from "../ui/Grid";

const Services = () => {
	// custom hook to fetch services
	const { services, loading, bookDemo, error } = useServices();

	return (
		<div className="pt-16 pb-4">
			<div className="w-[90%] md:w-[80%] mx-auto space-y-8" data-aos="fade-up">
				{/* title */}
				<H2>Our Process</H2>

				{/* description */}
				<P className="text-center max-w-4xl mx-auto">
					From idea to execution, our customer-first process ensures your IT
					infrastructure is not only deployed seamlessly but also optimized,
					secured, and continuously improved. Every step is designed to cut
					costs, reduce risks, and align technology with your business goals.
				</P>

				{/* Error display */}
				{error && (
					<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-center">
						{error}
					</div>
				)}

				{/* Grid Services */}
				<Grid>
					{services.map((service, index) => (
						<ServiceCard
							key={service.id}
							services={service}
							loading={loading}
							onBookDemo={bookDemo}
							data-aos="fade-up"
							data-aos-delay={index * 100}
							data-aos-anchor-placement="top-center"
						/>
					))}
				</Grid>
			</div>
		</div>
	);
};

export default Services;
