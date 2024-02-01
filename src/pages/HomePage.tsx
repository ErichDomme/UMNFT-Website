import { useState } from "react";
import { Page } from "../components";
import { useNavigate } from "react-router-dom";

export const HomePage: React.FC = () => {
    const [tokenId, setTokenId] = useState("");
    const navigate = useNavigate();

    return (
        <Page>
            <div className="flex flex-col items-center">
                <img src={'/UMNFT-Website/icon_blue_nft.svg'} alt="Logo" className="mb-4" />
                <div className="flex gap-2 row">
                    <input
                        type="text"
                        placeholder="UMNFT token ID"
                        className="w-full max-w-xs input input-bordered input-primary"
                        onChange={(e) => setTokenId(e.target.value)}
                    />
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate(`/versions/${tokenId}`)}
                    >
                        {/* SVG für den Such-Button */}
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
                                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                            />
                        </svg>
                        Search
                    </button>
                </div>
            </div>
        </Page>
    );
};
