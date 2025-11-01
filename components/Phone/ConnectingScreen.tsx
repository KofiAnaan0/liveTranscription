import { motion } from "framer-motion";
import Dail from "./helper/Dail";

// Progress Bar Component
export const ConnectingScreen = () => {
	return (
		<motion.div
			key="connecting"
			initial={{ opacity: 0, scale: 0.9 }}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, scale: 0.9 }}
			transition={{ duration: 0.3, ease: [0.09, 1.04, 0.245, 1.055] }}
			className="fixed inset-0 z-30 flex flex-col items-center justify-center bg-background"
		>
			{/* Background with blur effect similar to Welcome screen */}
			<div className="absolute inset-0 bg-black/20"></div>

			<Dail/>
		</motion.div>
	);
};
