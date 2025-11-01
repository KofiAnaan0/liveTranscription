export interface ReviewsProps {
	id: string;
	icon: string;
	title: string;
	description: string;
	name: string;
	designation: string;
	profileUrl: string;
}

export interface ReviewCardProps {
	review: ReviewsProps;
}
