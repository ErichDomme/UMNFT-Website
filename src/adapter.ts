import { Web3 } from "web3";
import { ABI } from "./abi";

const RPC_URL = `https://goerli.infura.io/v3/${import.meta.env.VITE_INFURA_API_KEY}`;

const web3 = new Web3(RPC_URL);
const contract = new web3.eth.Contract(ABI, "0x6d9826E73A65277cf5C24B623De7fc5E935D3009");
contract.defaultChain = "goerli";

export function getTokenURIHistory(tokenId: number): Promise<string[]> {
	return contract.methods.getTokenURIHistory(tokenId).call();
}
