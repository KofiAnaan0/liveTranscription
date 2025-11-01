import H2 from "@/components/ui/H2";
import Main from "@/components/ui/Main";
import Link from "@/components/ui/NextLink";
import P from "@/components/ui/P";
import Section from "@/components/ui/Section";
import { socialLinks } from "@/data/footerData";
import React from "react";

const AboutPage = () => {
	return (
		<Section>
			<Main>
				{/* title */}
				<H2 className="pt-30 md:pt-10">About Africa DataEDGE</H2>

				<div className="flex flex-col gap-6 max-w-lg mx-auto">
					{/* description */}
					<P>
						Africa DataEdge specializes in providing enterprise-grade IT
						solutions that encompass IT service management, security management,
						and performance monitoring.
					</P>
					<P>
						Our services include Active Directory Management, IT Help Desk
						Management, and advanced analytics, catering to the needs of large,
						medium, and small enterprises.
					</P>
					<P>
						We focus on optimizing and safeguarding IT infrastructures while
						ensuring alignment with business objectives.
					</P>
					<P>
						With a customer-centric approach, Africa DataEdge aims to deliver
						comprehensive solutions that enhance operational efficiency and
						security.
					</P>
				</div>
			</Main>
		</Section>
	);
};

export default AboutPage;
