import airrwanda from "@/public/Brand_logos/airrwanda.png";
import dfcu from "@/public/Brand_logos/dfcu.png";
import BoU from "@/public/Brand_logos/BoU.png";
import mtn from "@/public/Brand_logos/mtn.jpeg";
import uedcl from "@/public/Brand_logos/uedcl.png";
import ura from "@/public/Brand_logos/ura.png";

// Nav Links
export const navLinks = [
	{
		id: 1,
		label: "Home",
		url: "/",
	},
	{
		id: 2,
		label: "Our Services",
		url: "/product",
	},
	{
		id: 3,
		label: "Get to Know Us",
		url: "/about",
	},
];

// Brand logos
export const brandLogo = [
	{
		id: 1,
		url: "#",
		href: airrwanda,
		height: 35,
	},
	{
		id: 2,
		url: "#",
		href: BoU,
		height: 55,
	},
	{
		id: 3,
		url: "#",
		href: dfcu,
		height: 45,
	},
	{
		id: 4,
		url: "#",
		href: mtn,
		height: 55,
	},
	{
		id: 5,
		url: "#",
		href: uedcl,
		height: 55,
	},
	{
		id: 6,
		url: "#",
		href: ura,
		height: 80,
	},
];

// service data
export const servicesData = [
	{
		id: "1",
		title: "GATHER REQUIREMENTS",
		description:
			"Our business processes are constantly re-engineered to deliver on solutions, focus on cost reduction, and promote alignment between your business and Information Technology.",
		icon: "/service/government.svg",
		learnMoreUrl: "/",
	},
	{
		id: "2",
		title: "DESIGN & CONCEPT",
		description:
			"Our capability and experience in delivering end-to-end security solutions, covering the breadth and depth of industry leading best practices and guidelines will be a great asset.",
		icon: "/service/insurance.svg",
		learnMoreUrl: "/",
	},
	{
		id: "3",
		title: "DEPLOY & MAINTAIN",
		description:
			"At this stage we deploy the solution into your production environment and support the ongoing use of that solution.",
		icon: "/service/school.svg",
		learnMoreUrl: "/",
	},
	{
		id: "4",
		title: "REVIEW",
		description:
			"We believe quality assurance is valuable and a proactive means of communicating with our client management and project team members at key points in the life of engagements.",
		icon: "/service/finance.svg",
		learnMoreUrl: "/",
	},
];
