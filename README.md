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

### 3.3 Website

The final third phase of the master's thesis focused on the development of the UMNFT website. This crucial phase marks the culmination of the project, integrating the previously developed technologies - the Revit plugin and the smart contract for UMNFTs - into a comprehensive, user-centered platform. The website acts as an interactive interface and allows users to interact with the UMNFTs by building a bridge between the complex blockchain technologies and the end users. It provides an accessible and intuitive platform for the inspection of UMNFTs while transparently providing important information to interested parties.
The website's user interface is characterized by clarity and responsiveness, specifically tailored to the needs of users. Seamless integration of blockchain functionalities, including interaction with the smart contract for UMNFT management, is crucial.
Prior to development, it was necessary to precisely define the website's target group and take appropriate measures. For this purpose, a use case scenario was developed that defines a customer and demonstrates the benefits of UMNFTs.
Municipalities, cities, regional administrations or city authorities have been identified as target customers who are looking for comprehensive documentation of all buildings in a district as part of urban mining projects and would like to obtain an overview of all materials used. The website should make it possible to visualize the underlying raw materials in combination with the 3D building model and serve as a central source of information.
The creation of UMNFTs currently takes place exclusively in the context of the integrated development environment (IDE) Remix, but could be integrated into the website in the future. The website is used to view all stored tokens (buildings), shows changes, visualizes them, provides material information and offers authorized users the option of updating the model with a new version. The core aspect of the website is therefore the ability to visualize UMNFTs using an IFC viewer, to offer users the opportunity to inspect them and view information based on the stored IFC files, and to enable further functions if the appropriate authorizations are available.

#### 3.3.1 Frontend and backend

The UMNFT website has a typical structure divided into frontend and backend. Basically, both areas can be divided into interface design and background processes. Both areas are structured as follows.<br>
**Frontend:**

-   **React Framework**<br>
    The website uses React, a widely used JavaScript library for building user interfaces to enable a dynamic and user-friendly experience.
-   **TypeScript**<br>
    TypeScript is used to ensure strong typing and object-oriented programming, which improves code quality and maintainability.
-   **Tailwind CSS and daisyUI**<br>
    Tailwind CSS, a utility-first CSS framework that simplifies the creation of custom, responsive designs, is used for styling. DaisyUI, a component library, is added to speed up development and reduce file size and number of class names.
-   **Vite**<br>
    Vite is used as a build tool for fast development and optimized builds.

**Backend:**

-   **Smart contracts and ABI**<br>
    The use of ABI (Application Binary Interface) to interact with smart contracts on the blockchain is essential for NFT transactions. It has a JSON-like structure and maps all smart contract functions.
-   **IPFS integration**<br>
    The InterPlanetary File System (IPFS) is used to store NFT data, providing a decentralized and secure solution for data storage.
-   **Metamask**<br>
    useMetamask React Hook is used to perform authorizations. Metamask makes it possible to verify using a wallet.

### 3.3.2 Website structure

The UMNFT website is divided into four main pages, which are referred to in the repository as HomePage.tsx, InspectorPage.tsx, UploadPage.tsx and VersionsPage.tsx. Each page fulfills a specific function in the context of interaction with UMNFTs.

-   **HomePage**<br>
    The homepage has a minimalist design and a search bar. Users are asked to enter an "NFT Token ID", which is generated and continuously expanded as part of the UMNFT minting process. In the future, this ID could be included in the land register and obtained from there.
-   **VersionPage**<br>
    This page provides information about the project name and retrieves the ipfsHashHistory function from the smart contract. The IPFS hashes are listed chronologically and each leads to the InspectorPage. An "Upload new Version" button at the bottom of the page redirects users to the UploadPage.
-   **InspectorPage**<br>
    At the heart of the website, the InspectorPage offers an IFC viewer that displays the IFC files referenced by the IPFS hash. Users can interactively explore the model and draw geometric conclusions. Below the viewer is a table that provides quantitative information about the materials contained in the IFC model in m³ and m². These and the aforementioned pages can be viewed transparently by everyone in line with the blockchain philosophy. Anyone interested in a specific building object can gain insight here.
-   **UploadPage**<br>
    When you enter the UploadPage, the login window for Metamask, a required crypto wallet extension for the browser, opens automatically. Metamask not only serves as a wallet for storing cryptocurrencies, but also as a verification tool. This is done via the wallet address, as this is unique. After verification, by checking whether the user's wallet address is on the UMNFT creator's whitelist, two interaction options are offered: "Upload via IPFS hash" and "Upload via file". Both options allow the UMNFT to be updated either by entering an existing IPFS hash or by uploading an IFC file to Pinata, whose IPFS hash is then used for the update. In both cases, the updateTokenURI function defined in the smart contract is called, which leads to an update of the latest IPFS hash and an addition to the IPFS hash history.

## Requirements

-   [npm](https://nodejs.org/en)
-   [web3](https://www.npmjs.com/package/web3?activeTab=readme)

## Project Status

<span style="color:green">**Version 1.0.0 published!**</span>

<!-- _complete_ / _no longer being worked on_. If you are no longer working on it, provide reasons why.-->

## Acknowledgements

I am deeply grateful to the [Aachen Blockchain Club](https://www.aachen-blockchain.de) for the fruitful collaboration during my research. Without your valuable insights and indispensable support, this work would not have reached the same quality and depth.

## Contact

Created by [Erich Domme](mailto:erich.domme@rwth-aachen.de) - feel free to contact me!
