import { useParams } from "react-router-dom";
import { Page, Spinner } from "../components";
import { useEffect, useRef, useState } from "react";
import { readFromIPFS } from "../utils/ipfs";
import * as OBC from "openbim-components";
import * as THREE from "three";
import { FragmentsGroup } from "bim-fragment";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IfcProperty = any | null;

const CONTAINER_ID = "ifc-viewer";

export const InspectorPage: React.FC = () => {
	const isInitialMount = useRef(true);
	const [model, setModel] = useState<FragmentsGroup | null>(null);
	const [properties, setProperties] = useState<IfcProperty[] | null>(null);
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

			const fragments = new OBC.FragmentManager(components);
			const fragmentIfcLoader = new OBC.FragmentIfcLoader(components);

			fragmentIfcLoader.settings.wasm = {
				path: "https://unpkg.com/web-ifc@0.0.46/",
				absolute: true,
			};

			const scene = components.scene.get();

			new OBC.SimpleGrid(components, new THREE.Color("#000"));

			const buffer = await readFromIPFS(cid);

			const model = await fragmentIfcLoader.load(buffer, "model");
			scene.add(model);

			const toolbar = new OBC.Toolbar(components);
			components.ui.addToolbar(toolbar);

			// >>> Highlighter >>>

			(components.renderer as OBC.PostproductionRenderer).postproduction.enabled = true;
			const highlighter = new OBC.FragmentHighlighter(components);
			highlighter.setup();

			highlighter.events.select.onHighlight.add((data) => {
				const ids = new Set(
					Object.values(data)
						.map((s) => [...s.values()])
						.flat()
				);
				const ps: IfcProperty[] = [];
				for (const id of ids)
					propsProcessor
						.getProperties(model, id)
						?.forEach(
							(p: IfcProperty) => !ps.find((q: IfcProperty) => q.expressID === p.expressID) && ps.push(p)
						);

				console.log(ps);
				console.log(propertiesToObject(ps));
				setProperties(ps);
			});

			highlighter.events.select.onClear.add(() => setProperties(null));

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

			// >>> Bounding Box >>>

			// const fragmentBbox = new OBC.FragmentBoundingBox(components);
			// fragmentBbox.add(model);

			// const bbox = fragmentBbox.getMesh();
			// fragmentBbox.reset();

			// const button = new OBC.Button(components);
			// button.materialIcon = "zoom_in_map";
			// button.tooltip = "Zoom to building";
			// toolbar.addChild(button);

			// const controls = (components.camera as OBC.SimpleCamera).controls;
			// (button.onClick as OBC.Event<void>).add(() => {
			// 	controls.fitToSphere(bbox, true);
			// });

			// <<<<<<<<<<<<<<<<<<

			// >>> Material Inspector >>>

			const propsProcessor = new OBC.IfcPropertiesProcessor(components);
			propsProcessor.process(model);

			const highlighterEvents = highlighter.events;
			highlighterEvents.select.onClear.add(() => {
				propsProcessor.cleanPropertiesList();
			});
			highlighterEvents.select.onHighlight.add((selection) => {
				const fragmentID = Object.keys(selection)[0];
				const expressID = Number([...selection[fragmentID]][0]);
				let model;
				for (const group of fragments.groups) {
					const fragmentFound = Object.values(group.keyFragments).find((id) => id === fragmentID);
					if (fragmentFound) model = group;
				}
				propsProcessor.renderProperties(model ?? new FragmentsGroup(), expressID);
			});

			toolbar.addChild(propsProcessor.uiElement.get("main"));

			// <<<<<<<<<<<<<<<<<<

			// (components.scene as OBC.SimpleScene).setup();
			(components.scene as OBC.SimpleScene).setup();

			(components.renderer as OBC.PostproductionRenderer).postproduction.setPasses({
				custom: true,
			});

			(components.renderer as OBC.PostproductionRenderer).postproduction.customEffects.glossEnabled = false;
			(components.renderer as OBC.PostproductionRenderer).postproduction.customEffects.lineColor = 0x000000;
			(components.renderer as OBC.PostproductionRenderer).postproduction.customEffects.opacity = 0.2;

			// for some reason we have to pretend to resize the window
			// .resize(), .setSize(), .update() wont work
			window.dispatchEvent(new Event("resize"));

			console.log(model);

			setModel(model);
		})();
	}, [cid]);

	if (!cid) return <Page>No cid supplied!</Page>;

	return (
		<Page>
			<div className={`w-full mockup-window bg-base-300 my-[10vh] ${model == null ? "invisible" : ""}`}>
				<p className="mt-[-1.75rem] mb-4 h-3 leading-3 font-mono opacity-30 text-white">{cid}</p>
				<div id={CONTAINER_ID} />
			</div>
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
					{properties !== null && (
						<div className="w-3/4 mx-auto overflow-x-auto mb-[10vh] rounded-lg">
							{objectToTable(propertiesToObject(properties))}
						</div>
					)}
				</div>
			)}
		</Page>
	);
};

function propertiesToObject(properties: IfcProperty[]): { r: object; n: number } {
	let sum = 0;
	const res = Object.fromEntries(
		properties
			.map((p) => {
				if (p["HasPropertySets"] !== undefined && p["HasPropertySets"] !== null) {
					const { r, n } = propertiesToObject(p.HasPropertySets.map((q: { value: IfcProperty }) => q.value));
					sum += n;
					return [p.Name.value, { r, n }];
				} else if (p["HasProperties"] !== undefined && p["HasProperties"] !== null) {
					const { r, n } = propertiesToObject(p.HasProperties.map((q: { value: IfcProperty }) => q.value));
					sum += n;
					return [p.Name.value, { r, n }];
				} else if (p["NominalValue"] !== undefined && p["NominalValue"] !== undefined) {
					sum += 1;
					return [p["expressID"], [p.Name.value, p.NominalValue.value]];
				}
				return null;
			})
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			.filter((o) => o !== null) as [string, any][]
	);
	return { r: res, n: sum };
}

function objectToTable(object: { r: object; n: number }): React.ReactNode {
	// TODO use in-order traversal to obtain a list of table nodes

	const rows: React.ReactNode[][] = [];
	let i = 0;

	for (const node of traverse(object)) {
		rows[i] ??= [];
		rows[i].push(node);
		if ((node as { type: string }).type == "td") i++;
	}

	return (
		<table className="table bg-base-200">
			<tbody>{...rows.map((r) => <tr className="border-neutral">{...r}</tr>)}</tbody>
		</table>
	);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function traverse(object: { r: object; n: number } | any[], list: React.ReactNode[] = []): React.ReactNode[] {
	if (Array.isArray(object)) {
		list.push(<th>{Object.values(object)[0].toString()}</th>);
		list.push(<td>{Object.values(object)[1].toString()}</td>);
	} else {
		Object.entries(object.r).forEach(([k, v]) => {
			if (v["n"] !== undefined) list.push(<th rowSpan={v.n}>{k}</th>);
			traverse(v, list);
		});
	}

	return list;
}

// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// function rec(object: { r: object; n: number } | any[]): React.ReactNode[] {
// 	if (Array.isArray(object))
// 		return [<th>{Object.values(object)[0].toString()}</th>, <td>{Object.values(object)[1].toString()}</td>];
// 	return Object.entries(object.r).map(([k, v]) => (
// 		<>
// 			<th rowSpan={object.n}>{k}</th>
// 			<>{...rec(v)}</>
// 		</>
// 	));
// }
