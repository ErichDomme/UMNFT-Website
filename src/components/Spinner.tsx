import React from "react";

export const Spinner: React.FC<{ className?: string }> = ({ className }) => (
	<div
		className={`w-20 h-20 border-8 rounded-full border-base-300 border-r-neutral animate-spin ${className ?? ""}`}
	/>
);
