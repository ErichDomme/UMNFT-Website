import { useParams } from "react-router-dom";
import { Page, Spinner } from "../components";
import { useEffect, useRef, useState } from "react";
import { readFromIPFS } from "../utils/ifps";
import * as OBC from "openbim-components";
import * as THREE from "three";
import { FragmentsGroup } from "bim-fragment";

const CONTAINER_ID = "ifc-viewer";

export const InspectorPage: React.FC = () => {
	const isInitialMount = useRef(true);
	const [model, setModel] = useState<FragmentsGroup | null>(null);
	const { cid } = useParams();

	useEffect(() => {
		if (isInitialMount.current) {
			isInitialMount.current = false;
			return;
		}

		if (!cid) return;

		(async () => {
			const container = document.getElementById(CONTAINER_ID);

			container!.style.height = (container!.clientWidth! * (3 / 4)).toString() + "px";
			// container!.style.margin = ((window.innerHeight - container!.clientHeight) / 2).toString() + "px 0";

			const components = new OBC.Components();

			components.scene = new OBC.SimpleScene(components);
			components.renderer = new OBC.PostproductionRenderer(components, container!);
			components.camera = new OBC.SimpleCamera(components);
			components.raycaster = new OBC.SimpleRaycaster(components);

			await components.init();

			new OBC.FragmentManager(components);
			const fragmentIfcLoader = new OBC.FragmentIfcLoader(components);

			fragmentIfcLoader.settings.wasm = {
				path: "https://unpkg.com/web-ifc@0.0.46/",
				absolute: true,
			};

			const scene = components.scene.get();

			new OBC.SimpleGrid(components, new THREE.Color("#555"));

			const buffer = await readFromIPFS(cid);

			const model = await fragmentIfcLoader.load(buffer, "model");
			scene.add(model);

			const toolbar = new OBC.Toolbar(components);
			components.ui.addToolbar(toolbar);

			// >>> Highlighter >>>

			(components.renderer as OBC.PostproductionRenderer).postproduction.enabled = true;
			const highlighter = new OBC.FragmentHighlighter(components);
			highlighter.setup();

			// <<<<<<<<<<<<<<<<<<

			// >>> Model Tree >>>

			const classifier = new OBC.FragmentClassifier(components);
			classifier.byStorey(model);
			classifier.byEntity(model);

			const modelTree = new OBC.FragmentTree(components);
			await modelTree.init();
			modelTree.update(["storeys", "entities"]);

			modelTree.onSelected.add((filter) => {
				highlighter.highlightByID("select", filter, true, true);
			});
			modelTree.onHovered.add((filter) => {
				highlighter.highlightByID("hover", filter);
			});

			toolbar.addChild(modelTree.uiElement.get("main"));

			// <<<<<<<<<<<<<<<<<<

			(components.scene as OBC.SimpleScene).setup({
				directionalLight: {
					intensity: 0,
					color: new THREE.Color(),
					position: new THREE.Vector3(0, 0, 0),
				},
				ambientLight: {
					intensity: 1.5,
					color: new THREE.Color(),
				},
			});

			// for some reason we have to pretend to resize the window
			// .resize(), .setSize(), .update() wont work
			window.dispatchEvent(new Event("resize"));

			setModel(model);
		})();
	}, [cid]);

	if (!cid) return <Page>No cid supplied!</Page>;

	return (
		<Page>
			<div
				id={CONTAINER_ID}
				className={`w-full mockup-window bg-base-300 my-[10vh] ${model == null ? "invisible" : ""}`}
			/>
			{model == null ? (
				<Spinner className="absolute" />
			) : (
				<div className="flex flex-col w-full text-left">
					<div className="w-3/4 mx-auto overflow-x-auto mb-[10vh] rounded-lg">
						<table className="table">
							<tbody>
								{Object.entries(model.ifcMetadata).map(([k, v]) => (
									<tr className="bg-base-200">
										<th>{k}</th>
										<td>{v}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}
		</Page>
	);
};
