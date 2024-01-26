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
let propsProcessor: OBC.IfcPropertiesProcessor;

// TODO use expressIDs for any kind of paths, currently only done for the leaf nodes
// TODO hash paths instead of joining them with "", could lead to some ambiguities

export const InspectorPage: React.FC = () => {
	const isInitialMount = useRef(true);
	const [model, setModel] = useState<FragmentsGroup | null>(null);
	const [properties, setProperties] = useState<IfcProperty[] | null>(null);
	const tableRef = useRef<HTMLTableElement>(null);
	const [tableHeight, setTableHeight] = useState<number>(0);
	const [groupBy, setGroupBy] = useState<string[] | null>(null);
	const [group, setGroup] = useState<number[] | null>(null);
	const [sums, setSums] = useState<Record<string, Record<string, number>>>({});
	const { cid } = useParams();

	function handleGroupBy(path: string[]): void {
		setGroupBy(path);

		console.log("GROUP_BY:", path);

		let PEIDs: number[] = Object.values(model!.properties!)
			.filter(
				(p) =>
					p.Name?.value == path[path.length - 2] && p.NominalValue?.value.toString() == path[path.length - 1]
			)
			.map((p) => parseInt(p.expressID));

		console.log("VALUE SHARED BETWEEN:", PEIDs, path, path[path.length - 2], path[path.length - 1]);

		const entities: Set<number> = new Set();

		const indexMap = Object.values(propsProcessor.get())[0];

		for (let i = 0; i < path.length - 2; i++) {
			const nextPEIDs: number[] = [];
			for (const peid of PEIDs) {
				Object.values(model!.properties!)
					.filter(
						(p) =>
							p?.HasProperties?.map((q: { value: number }) => q.value).includes(peid) ||
							p?.HasPropertySets?.map((q: { value: number }) => q.value).includes(peid)
					)
					.forEach((p) => {
						nextPEIDs.push(p.expressID as number);
						Object.entries(indexMap)
							// eslint-disable-next-line @typescript-eslint/no-unused-vars
							.filter(([k, v]) => v.has(p.expressID as number))
							// eslint-disable-next-line @typescript-eslint/no-unused-vars
							.forEach(([k, v]) => entities.add(parseInt(k)));
					});
			}
			console.log(PEIDs, "->", nextPEIDs);
			PEIDs = nextPEIDs;
		}

		console.log("PEIDs:", PEIDs);
		console.log("ENTITIES:", entities);
		setGroup([...entities]);
	}

	function handleSum(path: string[]): number {
		if (!group) return 0;

		const joinedPath = path.join("");
		path.splice(-3, 1);
		console.log("SPLICED PATH:", path);

		const ps: IfcProperty[] = [];
		for (const id of group)
			propsProcessor.getProperties(model!, id.toString())?.forEach((p: IfcProperty) => ps.push(p));

		console.log("RELATED_PROPERTIES:", ps);

		let sum = 0;
		for (const p of ps) {
			let q: IfcProperty = { HasProperties: [{ value: p }] }; // mock ifcProperty for first iteration
			for (const s of path.slice(0, -1)) {
				q = (q["HasProperties"] || q["HasPropertySets"])
					?.map((r: { value: IfcProperty }) => r.value)
					.find((r: IfcProperty) => r.Name?.value === s);
				if (q == undefined) break;
			}
			if (q !== undefined) {
				sum += Number.parseFloat(q.NominalValue.value);
			}
		}

		console.log("SUM:", sum);
		setSums({
			...sums,
			[groupBy!.join("")]: { [joinedPath]: sum, ...(sums?.[groupBy!.join("")] ?? []) },
		});
		return sum;
	}

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
				console.log(ids);
				const ps: IfcProperty[] = [];
				for (const id of ids)
					propsProcessor
						.getProperties(model, id)
						?.forEach(
							(p: IfcProperty) => !ps.find((q: IfcProperty) => q.expressID === p.expressID) && ps.push(p)
						);

				console.log(ps);
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

			propsProcessor = new OBC.IfcPropertiesProcessor(components);
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

			console.log("MODEL:", model);

			const indexMap = Object.values(propsProcessor.get())[0];
			console.log("INDEX_MAP:", indexMap);

			setModel(model);
		})();
	}, [cid]);

	useEffect(() => {
		setTableHeight(tableRef.current?.clientHeight ?? 0);
	}, [properties]);

	if (!cid) return <Page>No cid supplied!</Page>;

	return (
		<Page className={`${model !== null && "!justify-start"} !gap-0`}>
			<div className={`w-full mt-[10vh] mockup-window bg-base-300 z-10 ${model == null ? "invisible" : ""}`}>
				<p className="mt-[-1.75rem] mb-4 h-3 leading-3 font-mono opacity-30 text-white">{cid}</p>
				<div id={CONTAINER_ID} />
			</div>
			{model == null ? (
				<Spinner className="absolute" />
			) : (
				<div className="flex flex-col w-full text-left overflow-hidden mt-[-1rem] pt-[1.5rem]">
					<div
						className={"mb-[10vh] z-0 w-full transition-all ease-in-out duration-700 relative"}
						style={{
							height: `${tableHeight}px`,
						}}
					>
						{properties !== null && (
							<div className="absolute bottom-0 w-full pt-[100vh] mt-auto rounded-b-[1rem] bg-base-200 overflow-x-scroll">
								<table
									className="table"
									ref={tableRef}
								>
									{objectToTable(propertiesToObject(properties), {
										groupBy,
										sums,
										handleGroupBy,
										handleSum,
									})}
								</table>
							</div>
						)}
					</div>
					<div className="w-3/4 mx-auto overflow-x-auto mb-[10vh] rounded-[1rem]">
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
				} else if (p["NominalValue"] !== undefined) {
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function objectToTable(object: { r: object; n: number }, handlers: Record<string, any>): JSX.Element {
	const rows: React.ReactNode[][] = [];
	let i = 0;

	for (const node of traverse(object, handlers)) {
		rows[i] ??= [];
		rows[i].push(node);
		if ((node as { type: string }).type == "td") i++;
	}

	return <tbody className="min-w-full">{...rows.map((r) => <tr className="border-neutral">{...r}</tr>)}</tbody>;
}

function traverse(
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	object: { r: object; n: number } | any[],
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	handlers: Record<string, any>,
	path: string[] = [],
	list: React.ReactNode[] = []
): React.ReactNode[] {
	if (Array.isArray(object)) {
		path = [...path, Object.values(object)[0].toString(), Object.values(object)[1].toString()];

		let groupyByButtonStyle = "";
		if (handlers.groupBy !== null && handlers.groupBy.join("") !== path.join(""))
			groupyByButtonStyle = "btn-neutral hover:btn-secondary";
		else if (handlers.groupBy == null) groupyByButtonStyle = "btn-outline";

		let sumButtonStyle = "";
		const sumValue = handlers.sums[handlers.groupBy?.join("")]?.[path.join("")];
		if (handlers.groupBy == null) sumButtonStyle = "btn-disabled";
		else if (sumValue !== undefined) sumButtonStyle = "hidden";

		list.push(<th>{Object.values(object)[0].toString()}</th>);
		list.push(
			<td className="flex flex-row flex-nowrap whitespace-nowrap">
				{Object.values(object)[1].toString()}
				<div
					className="tooltip before:max-w-none"
					data-tip={`Group by ${Object.values(object)[0].toString()} = ${Object.values(
						object
					)[1].toString()}`}
				>
					<button
						className={`btn btn-secondary btn-xs btn-circle w-[1.25rem] h-[1.25rem] p-[0.125rem] ml-[1ch] min-h-0 ${groupyByButtonStyle}`}
						onClick={() => {
							handlers.handleGroupBy(path);
						}}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="w-[1em] h-[1em]"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="3"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
							<path d="m6.08 9.5-3.5 1.6a1 1 0 0 0 0 1.81l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9a1 1 0 0 0 0-1.83l-3.5-1.59" />
							<path d="m6.08 14.5-3.5 1.6a1 1 0 0 0 0 1.81l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9a1 1 0 0 0 0-1.83l-3.5-1.59" />
						</svg>
					</button>
				</div>
				{!Number.isNaN(Number(Object.values(object)[1].toString())) && (
					<div
						className="tooltip before:max-w-none"
						data-tip={`Calculate total ${Object.values(object)[0].toString()} for group`}
					>
						<button
							className={`btn btn-accent btn-outline btn-xs btn-circle w-[1.25rem] h-[1.25rem] p-[0.125rem] ml-[1ch] min-h-0 ${sumButtonStyle}`}
							onClick={() => {
								handlers.handleSum(path);
							}}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="w-[1em] h-[1em]"
								viewBox="0 0 24 24"
								stroke-width="3"
								stroke="currentColor"
								fill="none"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path
									stroke="none"
									d="M0 0h24v24H0z"
									fill="none"
								/>
								<path d="M18 16v2a1 1 0 0 1 -1 1h-11l6 -7l-6 -7h11a1 1 0 0 1 1 1v2" />
							</svg>
						</button>
					</div>
				)}
				{sumValue !== undefined && (
					<div className="badge badge-accent badge-xs h-[1.25rem] py-[0.125rem] px-[0.5rem] ml-[1ch] min-h-0">
						sum: {sumValue}
					</div>
				)}
			</td>
		);
	} else {
		Object.entries(object.r).forEach(([k, v]) => {
			if (v["n"] !== undefined) list.push(<th rowSpan={v.n}>{k}</th>);
			path.push(k);
			traverse(v, handlers, path, list);
			path.pop();
		});
	}

	return list;
}
