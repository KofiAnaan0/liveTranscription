import { IconType } from "react-icons";

export interface SocialLink {
	id: number;
	icon: IconType;
	href: string;
	label: string;
}

export interface FooterProps {
	id: number;
	label: string;
	links: string;
}
