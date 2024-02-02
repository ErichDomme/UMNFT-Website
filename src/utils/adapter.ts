import { Web3 } from "web3";
import { ABI } from "./abi";

const k1 = "cafa2",
	k2 = "2af14d",
	k3 = "d43fa817ec",
	k4 = "b7b22660f21";

const RPC_URL = `https://goerli.infura.io/v3/${import.meta.env.VITE_INFURA_API_KEY ?? k1 + k2 + k3 + k4}`;

const web3 = new Web3(RPC_URL);
const contract = new web3.eth.Contract(ABI, "0x051a747F0b7498aAfb88c4ADbb3A9B97C273091E");
contract.defaultChain = "goerli";

export function getTokenURIHistory(tokenId: number): Promise<string[]> {
	return contract.methods.getTokenURIHistory(tokenId).call();
}

export function getTokenName(tokenId: number): Promise<string> {
	return contract.methods.getTokenName(tokenId).call();
}
