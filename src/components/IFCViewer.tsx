import * as OBC from "openbim-components";
import { SimpleScene } from "openbim-components";
import React from "react";
import { useEffect } from "react";

const components = new OBC.Components();

const CONTAINER_ID = "ifc-viewer";

interface IFCViewerProps {
	buffer: Uint8Array;
}

export const IFCViewer: React.FC<IFCViewerProps> = ({ buffer }) => {
	useEffect(() => {
		if (components.enabled) return;

		(async () => {
			const container = document.getElementById(CONTAINER_ID);

			container!.style.height = (container!.clientWidth! / 1.5).toString() + "px";

			components.scene = new OBC.SimpleScene(components);
			components.renderer = new OBC.SimpleRenderer(components, container!);
			components.camera = new OBC.SimpleCamera(components);

			await components.init();

			new OBC.FragmentManager(components);
			const fragmentIfcLoader = new OBC.FragmentIfcLoader(components);

			fragmentIfcLoader.settings.wasm = {
				path: "https://unpkg.com/web-ifc@0.0.46/",
				absolute: true,
			};

			const scene = components.scene.get();

			const grid = new OBC.SimpleGrid(components);
			scene.add(grid);

			const model = await fragmentIfcLoader.load(buffer, "model");
			scene.add(model);

			(components.scene as SimpleScene).setup();
		})();
	});

	return (
		<div
			id={CONTAINER_ID}
			className="w-full"
		/>
	);
};
