const PINATA_GATEWAY = "amaranth-purring-primate-230.mypinata.cloud";

export async function readFromIPFS(cid: string): Promise<Uint8Array> {
	console.log(`https://${PINATA_GATEWAY}/ipfs/${cid}`, fetch);
	return await fetch(`https://${PINATA_GATEWAY}/ipfs/${cid}`)
		.then((res) => res.arrayBuffer())
		.then((res) => new Uint8Array(res));
}
