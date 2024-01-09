<h1 align="center">
  <a name="logo"><img src="public\icon_blue_nft.svg" alt="UMNFT" width="300"></a>
  <br>
  Urban Mining NFT <br>
  - UMNFT - <br>
  PART 03 <br>
  Website
</h1>

<div align="center"></div>

<p align="center"><font size="3">
This project was developed during my Master Thesis<br>
at RWTH Aachen University, winter semester 2023/24, Faculty of Architecture<br>
First examiner:<br>
Univ.-Prof. Dr. Jakob Beetz, Design Computation | CAAD<br>
Second examiner:<br>
Jun.Prof. Dr.-Ing. Linda Hildebrand, Cycle-Oriented Construction<br>
This Website is part 3 of 3. </p>

## Excerpt from the Master's thesis
### 3.2 Smart Contract
The second phase of this work focuses on the smart contract, which can be seen as the core and most significant part of the entire work, but which functions as an invisible, back-end-based mechanism in the final product - comparable to a black box. A smart contract is a self-executing contract whose conditions are defined in program code. As soon as these conditions are met, the corresponding actions are executed automatically.
In this phase, it is decided which functions the smart contract should have and how these should be used. It is important to take into account the requirements for the next section, the website, as this is where the user interaction with the smart contract will take place. A central aspect is the non-fungible token itself. In addition to the typical queries such as the NFT name, the abbreviation and the IPFS referencing, the NFT will be equipped with additional functions. This should ensure that it serves as a reliable and unique source for certain information in the future.
The UMNFT smart contract is written in Solidity, a language for Ethereum smart contracts, and uses the ERC721 standard implementation of OpenZeppelin, which makes it an NFT smart contract. The contract includes several functions and structures, which are explained below.

#### 3.2.1 Constructor and basic properties
- **Constructor**<br>
The constructor is called when the smart contract is deployed. Here, the name of the NFT is defined as "UrbanMiningNFT" and the symbol as "UMNFT". The contract owner is defined as the person who creates (deploys) the contract.
- **Version**<br>
The smart contract has a fixed version, defined here as "1.0.0".
- **Base token URI**<br>
The base URL for the tokens, here set to "ipfs://", which indicates that the NFT metadata is stored on the InterPlanetary File System.

#### 3.2.2 Mappings and variables
- **_tokenIds**<br>
A counter for the token IDs to uniquely identify each NFT.
- **_tokenNames**<br>
A mapping from the token ID to the name of the token.
- **_tokenURIs**<br>
A mapping from the token ID to its IPFS URL.
- **_ipfsHashHistory**<br>
Saves the history of IPFS hashes for each token.
- **_updateWhitelist**<br>
A two-level mapping structure that determines which addresses are authorized to update the token URI.
- **_whitelistedAddresses**<br>
A list of addresses that have been added to the update whitelist for each token.

#### 3.2.3 Functions
- **mintNFT**<br>
This function allows the contract owner to create (mint) a new NFT. A new token ID is generated, the token is minted, its URI is set, and the NFT owner and the contract owner are automatically added to the whitelist for this token.
- **_setTokenURI**<br>
An internal function that sets the URI of a token.
- getTokenName, getTokenURI
Public functions to query the name or URI of a token.
- **updateTokenURI**<br>
Allows the token owner or an authorized address to update the URI of a token.
- **getTokenURIHistory**<br>
Returns the history of IPFS hashes for a specific token.
- **addToWhitelist, removeFromWhitelist**<br>
Allow the contract owner to add addresses to or remove addresses from the whitelist.
- **getAllWhitelisted**<br>
Returns all addresses that have been added to the whitelist for a specific token.

3.2.4 Internal processes and queries
- **Checks**<br>
Many functions contain security checks to ensure that only authorized users can perform certain actions.
- **Automated whitelist update**<br>
When a new token is minted, the owner and contract owner are automatically added to the whitelist for this token.
- **IPFS hash history**<br>
Each update of the token URI is stored in the IPFS hash history, ensuring transparency and traceability.
In summary, this smart contract enables the creation, management and tracking of NFTs based on the Ethereum blockchain and whose metadata is stored on IPFS. It provides functions for minting NFTs, updating their information, managing access rights and tracking their history.

In summary, this smart contract enables the creation, management and tracking of NFTs that are based on the Ethereum blockchain and whose metadata is stored on IPFS. It provides functions for minting NFTs, updating their information, managing access rights and tracking their history.


## Requirements
.

## Project Status
<span style="color:green">**Version 0.0.1 published!**</span>
<!-- _complete_ / _no longer being worked on_. If you are no longer working on it, provide reasons why.-->

## Acknowledgements
I am deeply grateful to the [Aachen Blockchain Club](https://www.aachen-blockchain.de) for the fruitful collaboration during my research. Without your valuable insights and indispensable support, this work would not have reached the same quality and depth.

## Contact
Created by [Erich Domme](mailto:erich.domme@rwth-aachen.de) - feel free to contact me!