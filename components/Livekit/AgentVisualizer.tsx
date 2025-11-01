import {
	BarVisualizer,
	useVoiceAssistant,
	VideoTrack,
} from "@livekit/components-react";

const AgentVisualizer = () => {
	const { state: agentState, videoTrack, audioTrack } = useVoiceAssistant();

	console.log("AgentVisualizer - State:", agentState);
	console.log("AgentVisualizer - AudioTrack:", audioTrack);

	// Video track display
	if (videoTrack) {
		return (
			<div className="h-[512px] w-[512px] rounded-lg overflow-hidden bg-black/20 backdrop-blur-sm border border-white/20">
				<VideoTrack
					trackRef={videoTrack}
					className="w-full h-full object-cover"
				/>
			</div>
		);
	}

	// Try to use BarVisualizer if audioTrack exists
	if (audioTrack && (agentState === "listening" || agentState === "speaking")) {
		return (
			<div className="h-[300px] w-full flex items-center justify-center">
				<div className="w-full max-w-md">
					<BarVisualizer
						state={agentState}
						barCount={7}
						trackRef={audioTrack}
						className="agent-visualizer w-full"
						options={{
							minHeight: 24,
							maxHeight: 100,
						}}
					/>
				</div>
			</div>
		);
	}

	// Fallback: Animated bars based on state
	const getBarHeight = (index: number) => {
		const baseHeight = 20;
		const time = Date.now() / 1000;

		switch (agentState) {
			case "speaking":
				return (
					baseHeight +
					Math.sin(time * 3 + index * 0.5) * 30 +
					Math.random() * 20
				);
			case "listening":
				return (
					baseHeight +
					Math.sin(time * 2 + index * 0.8) * 15 +
					Math.random() * 10
				);
			default:
				return baseHeight;
		}
	};

	const getBarColor = () => {
		switch (agentState) {
			case "speaking":
				return "from-green-400 to-blue-500";
			case "listening":
				return "from-blue-400 to-purple-500";
			default:
				return "from-gray-300 to-gray-400";
		}
	};

	const getOpacity = () => {
		return agentState === "disconnected" ? 0.3 : 1;
	};

	return (
		<div className="h-[300px] w-full flex items-center justify-center">
			<div className="flex items-end space-x-3 h-32">
				{[...Array(7)].map((_, index) => (
					<div
						key={index}
						className={`w-4 bg-gradient-to-t ${getBarColor()} rounded-full transition-all duration-100 ease-out`}
						style={{
							height: `${Math.max(10, getBarHeight(index))}px`,
							opacity: getOpacity(),
						}}
					/>
				))}
			</div>

			{/* Status indicator */}
			{agentState !== "disconnected" && (
				<div className="absolute mt-40 text-xs text-fg1 capitalize font-medium">
					{agentState}
				</div>
			)}
		</div>
	);
};

export default AgentVisualizer;
