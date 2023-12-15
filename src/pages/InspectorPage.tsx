import { useParams } from "react-router-dom";
import { Page, Spinner } from "../components";
import { useEffect, useState } from "react";
import { readFromIPFS } from "../utils/ifps";
import { IFCViewer } from "../components/IFCViewer";

export const InspectorPage: React.FC = () => {
	const { cid } = useParams();

	const [buffer, setBuffer] = useState<Uint8Array | null>(null);

	useEffect(() => {
		if (!cid) return;
		readFromIPFS(cid).then((res) => setBuffer(res));
	}, [cid]);

	if (!cid) return <Page>No cid supplied!</Page>;

	return <Page>{buffer != null ? <IFCViewer buffer={buffer} /> : <Spinner />}</Page>;
};
