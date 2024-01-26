import React from "react";

interface PageProps {
	children: React.ReactNode;
	className?: string;
}

export const Page: React.FC<PageProps> = ({ children, className }) => (
	<div
		className={`my-0 py-0 mx-auto p-8 flex gap-5 flex-col text-center place-items-center justify-center min-w-[320px] min-h-screen max-w-[1280px] ${
			className ?? ""
		}`}
	>
		{children}
	</div>
);
