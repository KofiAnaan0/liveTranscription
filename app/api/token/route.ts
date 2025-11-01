import {
	AccessToken,
	AccessTokenOptions,
	VideoGrant,
} from "livekit-server-sdk";
import { NextResponse } from "next/server";

// NOTE: you are expected to define the following environment variables in `.env.local`:
const API_KEY = process.env.NEXT_PUBLIC_LIVEKIT_API_KEY;
const API_SECRET = process.env.NEXT_PUBLIC_LIVEKIT_API_SECRET;
const LIVEKIT_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL;

// don't cache the results
export const revalidate = 0;

export type ConnectionDetails = {
	serverUrl: string;
	roomName: string;
	participantName: string;
	participantToken: string;
};

export async function GET() {
	console.log("========== DEBUG START ==========");
	
	try {
		// Debug environment variables
		console.log("Environment Variables Check:");
		console.log("LIVEKIT_URL:", LIVEKIT_URL ? "✓ Set" : "✗ NOT SET");
		console.log("API_KEY:", API_KEY ? "✓ Set" : "✗ NOT SET");
		console.log("API_SECRET:", API_SECRET ? "✓ Set (hidden)" : "✗ NOT SET");
		
		// Show actual values (remove in production!)
		console.log("\nActual Values (DEBUG ONLY):");
		console.log("LIVEKIT_URL:", LIVEKIT_URL);
		console.log("API_KEY:", API_KEY);
		console.log("API_SECRET:", API_SECRET ? `${API_SECRET.substring(0, 10)}...` : "undefined");

		if (LIVEKIT_URL === undefined) {
			throw new Error("LIVEKIT_URL is not defined");
		}
		if (API_KEY === undefined) {
			throw new Error("LIVEKIT_API_KEY is not defined");
		}
		if (API_SECRET === undefined) {
			throw new Error("LIVEKIT_API_SECRET is not defined");
		}

		console.log("\nEnvironment variables validated ✓");

		// Generate participant token
		const participantIdentity = `voice_assistant_user_${Math.floor(
			Math.random() * 10_000
		)}`;
		console.log("\nGenerated participant identity:", participantIdentity);

		const roomName = `voice_assistant_room_${Math.floor(
			Math.random() * 10_000
		)}`;
		console.log("Generated room name:", roomName);

		console.log("\nCalling createParticipantToken...");
		const participantToken = await createParticipantToken(
			{ identity: participantIdentity },
			roomName
		);
		console.log("Token created successfully ✓");
		console.log("Token (first 20 chars):", participantToken.substring(0, 20) + "...");

		// Return connection details
		const data: ConnectionDetails = {
			serverUrl: LIVEKIT_URL,
			roomName,
			participantToken: participantToken,
			participantName: participantIdentity,
		};
		
		console.log("\nConnection Details:");
		console.log("- Server URL:", data.serverUrl);
		console.log("- Room Name:", data.roomName);
		console.log("- Participant Name:", data.participantName);
		console.log("- Token Length:", data.participantToken.length);

		const headers = new Headers({
			"Cache-Control": "no-store",
		});
		
		console.log("\nReturning successful response ✓");
		console.log("========== DEBUG END ==========\n");
		
		return NextResponse.json(data, { headers });
	} catch (error) {
		console.error("\n========== ERROR OCCURRED ==========");
		console.error("Error type:", error?.constructor?.name);
		
		if (error instanceof Error) {
			console.error("Error message:", error.message);
			console.error("Error stack:", error.stack);
			return new NextResponse(error.message, { status: 500 });
		}
		
		console.error("Unknown error:", error);
		console.error("========== ERROR END ==========\n");
		return new NextResponse("An unknown error occurred", { status: 500 });
	}
}

function createParticipantToken(
	userInfo: AccessTokenOptions,
	roomName: string
) {
	console.log("\n--- createParticipantToken called ---");
	console.log("User info:", userInfo);
	console.log("Room name:", roomName);
	
	try {
		console.log("Creating AccessToken instance...");
		const at = new AccessToken(API_KEY, API_SECRET, {
			...userInfo,
			ttl: "15m",
		});
		console.log("AccessToken instance created ✓");

		const grant: VideoGrant = {
			room: roomName,
			roomJoin: true,
			canPublish: true,
			canPublishData: true,
			canSubscribe: true,
		};
		console.log("VideoGrant created:", grant);
		
		console.log("Adding grant to token...");
		at.addGrant(grant);
		console.log("Grant added ✓");
		
		console.log("Converting to JWT...");
		const jwt = at.toJwt();
		console.log("JWT created ✓");
		console.log("--- createParticipantToken end ---\n");
		
		return jwt;
	} catch (error) {
		console.error("Error in createParticipantToken:");
		console.error(error);
		throw error;
	}
}