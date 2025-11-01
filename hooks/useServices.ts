"use client";

import { servicesData } from "@/constants/constant";
import { ServiceProps } from "@/types/serviceType";
import React, { useCallback, useState } from "react";

interface UseServicesReturn {
	loading: boolean;
	error: string | null;
	bookDemo: (serviceId: string) => Promise<void>;
	services: ServiceProps[];
}

const useServices = (): UseServicesReturn => {
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const bookDemo = useCallback(async (serviceId: string): Promise<void> => {
		setLoading(true);
		setError(null);

		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Replace with the correct api call
			// const response = await fetch('/api/book-demo', {
			//     method: "POST",
			//     headers: {'Content-Type': 'application/json'},
			//     body: JSON.stringify(serviceId)

			// })

			// if(!response.ok) throw Error(`Failed to book demo for ${serviceId}`);

			console.log(`Demo booked for ${serviceId}`);
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Failed to book demo";
			setError(errorMessage);

			console.log("Failed to book demo", error);
		} finally {
			setLoading(false);
		}
	}, []);

	return {
		loading,
		error,
		bookDemo,
		services: servicesData,
	};
};

export default useServices;
