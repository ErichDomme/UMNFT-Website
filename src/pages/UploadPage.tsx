import { useEffect } from "react";
import { Page } from "../components";
import { useMetamask } from "use-metamask";
import Web3 from "web3";

export const UploadPage: React.FC = () => {
	const { connect, metaState } = useMetamask();

	useEffect(() => {
		if (!metaState.isConnected) {
			(async () => {
				try {
					await connect!(Web3);
				} catch (error) {
					console.log(error);
				}
			})();
		}
	});

	return (
		<Page>
			{metaState.isConnected ? (
				<div className="flex flex-row items-center w-full h-full">
					<form className="flex flex-col items-center flex-1 gap-4 flex-nowrap">
						<h1 className="w-full mb-5 text-2xl flex flex-row flex-nowrap gap-[1ch] items-center justify-center">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth={2}
								stroke="currentColor"
								className="w-6 h-6"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
								/>
							</svg>
							Upload via IPFS hash
						</h1>
						<div className="w-3/4 join">
							{/* <div className="label">
								<span className="label-text">IPFS hash to upload</span>
							</div> */}
							<input
								type="text"
								className="w-full input input-bordered input-primary join-item"
								placeholder="IPFS hash to upload"
							/>
							<button
								className="btn btn-primary join-item"
								type="submit"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth={1.5}
									stroke="currentColor"
									className="w-6 h-6"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="m15 11.25-3-3m0 0-3 3m3-3v7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
									/>
								</svg>
								Upload
							</button>
						</div>
					</form>
					<div className="divider divider-horizontal flex-0">OR</div>
					<form className="flex flex-col items-center flex-1 gap-4 flex-nowrap">
						<h1 className="w-full mb-5 text-2xl flex flex-row flex-nowrap gap-[1ch] items-center justify-center">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth={2}
								stroke="currentColor"
								className="w-6 h-6"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
								/>
							</svg>
							Upload via file
						</h1>
						<div className="w-3/4 join">
							<input
								type="file"
								className="w-full file-input file-input-ghost file-input-bordered border-primary join-item"
								accept=".ifc"
							/>
							<button
								className="btn btn-primary join-item"
								type="submit"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth={1.5}
									stroke="currentColor"
									className="w-6 h-6"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="m15 11.25-3-3m0 0-3 3m3-3v7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
									/>
								</svg>
								Upload
							</button>
						</div>
					</form>
				</div>
			) : (
				<div>Please log in to metamask to continue</div>
			)}
		</Page>
	);
};
