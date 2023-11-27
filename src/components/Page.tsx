import React from "react";

interface PageProps {
	children: React.ReactNode;
}

export const Page: React.FC<PageProps> = ({ children }) => (
	<div className="my-0 mx-auto p-8 flex gap-5 flex-col text-center place-items-center justify-center min-w-[320px] min-h-screen max-w-[1280px]">
		{children}
	</div>
);
