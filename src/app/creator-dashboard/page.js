"use client";
import { ethers } from "ethers";
import { useState, useEffect } from "react";
import axios from "axios";
import Web3Modal from "web3modal";
require("dotenv").config();

import { nftaddress, nftmarketaddress } from "../../../config";

import NFT from "../../../constants/artifacts/contracts/NFT.sol/NFT.json";
import Market from "../../../constants/artifacts/contracts/NFTMarket.sol/NFTMarket.json";

export default function Home() {
	const [nfts, setNfts] = useState([]);
	const [sold, setSold] = useState([]);
	const [loadingState, setLoadingState] = useState("not-loaded");

	useEffect(() => {
		loadNFTs();
	}, []);

	async function loadNFTs() {
		const web3Modal = new Web3Modal();
		const connection = await web3Modal.connect();
		const provider = new ethers.providers.Web3Provider(connection);
		const signer = provider.getSigner();

		const marketContract = new ethers.Contract(
			nftmarketaddress,
			Market.abi,
			signer
		);
		const tokenContract = new ethers.Contract(nftaddress, NFT.abi, signer);
		const data = await marketContract.fetchItemsCreated();

		const items = await Promise.all(
			data.map(async (i) => {
				const tokenUri = await tokenContract.tokenURI(i.tokenId);
				const meta = await axios.get(tokenUri);
				let price = ethers.utils.formatUnits(
					i.price.toString(),
					"ether"
				);
				let item = {
					price,
					tokenId: i.tokenId.toNumber(),
					seller: i.seller,
					owner: i.owner,
					image: meta.data.image,
					name: meta.data.name,
					description: meta.data.description,
					sold: i.sold,
				};
				return item;
			})
		);

		const soldItems = items.filter((i) => {
			return i.sold === true;
		});
		console.log(soldItems);

		setSold(soldItems);
		setNfts(items);
		setLoadingState("loaded");
	}

	return (
		<div>
			<div className="p-4">
				<h2 className="text-2xl py-2">Items Created</h2>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
					{nfts.map((nft, index) => (
						<div
							key={index}
							className="border shadow rounded-xl overflow-hidden"
						>
							<img src={nft.image} className="rounded" />
							<div className="p-4 border-t">
								<p className="text-2xl font-bold">
									Price - {nft.price} Matic
								</p>
							</div>
						</div>
					))}
				</div>
			</div>

			<div className="p-4">
				{Boolean(sold.length) && (
					<div>
						<h2 className="text-2xl py-2">Items Sold</h2>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
							{sold.map((nft, index) => (
								<div
									key={index}
									className="border shadow rounded-xl overflow-hidden"
								>
									<img src={nft.image} className="rounded" />
									<div className="p-4 border-t">
										<p className="text-2xl font-bold">
											Price - {nft.price} Matic
										</p>
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
