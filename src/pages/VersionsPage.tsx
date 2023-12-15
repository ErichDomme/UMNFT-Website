import { useEffect, useState } from "react";
import { Page, Spinner } from "../components";
import { useNavigate, useParams } from "react-router-dom";
import { getTokenURIHistory, getTokenName } from "../utils/adapter";
import { readFromIPFS } from "../utils/ifps";

export const VersionsPage: React.FC = () => {
	const { tokenId } = useParams();
	const navigate = useNavigate();

	const [URIHistory, setURIHistory] = useState<string[] | null>(null);
	const [tokenName, setTokenName] = useState<string | null>(null);

	useEffect(() => {
		if (!tokenId || isNaN(parseInt(tokenId!))) return;
		Promise.all([getTokenURIHistory(parseInt(tokenId!)), getTokenName(parseInt(tokenId!))]).then(([res1, res2]) => {
			!!res1 && setURIHistory(res1);
			!!res2 && setTokenName(res2);
		});
	}, [tokenId]);

	if (!tokenId || isNaN(parseInt(tokenId!))) return <Page>No token id supplied!</Page>;

	return (
		<Page>
			{URIHistory !== null ? (
				<>
					<h1 className="w-full mb-5 font-mono text-3xl">{tokenName}</h1>
					<ul className="timeline timeline-vertical">
						{URIHistory.map((uri, i) => (
							<li>
								{i !== 0 && <hr />}
								<div className="timeline-start">time</div>
								<div className="timeline-middle">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 20 20"
										fill="currentColor"
										className="w-5 h-5"
									>
										<path
											fillRule="evenodd"
											d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
											clipRule="evenodd"
										/>
									</svg>
								</div>
								<div className="timeline-end timeline-box">
									<button
										className="btn btn-link"
										onClick={() => navigate(`/inspector/${uri}`)}
									>
										{uri}
									</button>
								</div>
								{i !== URIHistory.length - 1 && <hr />}
							</li>
						))}
					</ul>
				</>
			) : (
				<Spinner />
			)}
		</Page>
	);
};
