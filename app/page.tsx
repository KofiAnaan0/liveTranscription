"use client";

import Home from "@/components/Home";
import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import Transcription from "@/components/Transcription";
import TranscriptionApp from "@/components/Test";
import ChatInterface from "@/components/ChatInterface";
import SummarizationInterface from "@/components/Summary";

export default function HomePage() {
	useEffect(() => {
		const initAOS = async () => {
			await import("aos");
			AOS.init({
				duration: 1000,

				easing: "ease-in-out",
				once: true,
				anchorPlacement: "top-bottom",
			});
		};

		initAOS();
	}, []);

	// if (loading) {
	// 	return <div>Loading...</div>; // Or your loading component
	// }

	return (
		<>
			<TranscriptionApp />
		</>
	);
}
