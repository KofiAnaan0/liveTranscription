"use client";

import { createClient } from "@/lib/client";
import { useRouter } from "next/navigation";
import { Button } from "./ui/Button";

export function LogoutButton() {
	const router = useRouter();

	const logout = async () => {
		const supabase = createClient();
		await supabase.auth.signOut();
		router.push("/");
	};

	return <Button onClick={logout}>Logout</Button>;
}
