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

	function shortAddress(address) {
		const shortenedAddress = `${address.substring(
			0,
			6
		)}...${address.substring(address.length - 4)}`;
		return shortenedAddress;
	}

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
			<div className="px-20 py-10 max-w-[1600px]">
				{Boolean(nfts.length) == true ? (
					<div>
						<h2 className="text-2xl font-semibold py-2">
							Items Created
						</h2>
						<hr />
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-4">
							{nfts.map((nft, index) => (
								<div
									key={index}
									className="border border-black rounded-xl overflow-hidden hover:-translate-y-1 hover:shadow-xl duration-300 mt-5"
								>
									<img
										src={nft.image}
										className="h-60 w-96 border-b border-black"
									/>
									<div className="p-4">
										<div>
											<p className="text-md text-gray-400 font-semibold">
												Owner: {shortAddress(nft.owner)}
											</p>
										</div>

										<div>
											<p className="text-4xl text-pink-500 font-semibold">
												{nft.name}
											</p>
										</div>
									</div>
									<div className="p-4 bg-pink-50">
										<p className="text-2xl font-bold text-gray-700">
											{nft.price} Matic
										</p>
									</div>
								</div>
							))}
						</div>
					</div>
				) : (
					<h1 className="text-3xl text-red-500 font-semibold">
						You have not created any assets !
					</h1>
				)}
			</div>

			<div className="px-20 py-10 max-w-[1600px]">
				{Boolean(sold.length) == true ? (
					<div>
						<h2 className="text-2xl font-semibold py-2">
							Items Sold
						</h2>
						<hr />
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-4">
							{sold.map((nft, index) => (
								<div
									key={index}
									className="border border-black rounded-xl overflow-hidden hover:-translate-y-1 hover:shadow-xl duration-300 mt-5"
								>
									<img
										src={nft.image}
										className="h-60 w-96 border-b border-black"
									/>
									<div className="p-4">
										<div>
											<p className="text-md text-gray-400 font-semibold">
												Owner: {shortAddress(nft.owner)}
											</p>
										</div>

										<div>
											<p className="text-4xl text-pink-500 font-semibold">
												{nft.name}
											</p>
										</div>
									</div>
									<div className="p-4 bg-pink-50">
										<p className="text-2xl font-bold text-gray-700">
											{nft.price} Matic
										</p>
									</div>
								</div>
							))}
						</div>
					</div>
				) : (
					<h1 className="text-3xl -mt-10 text-red-500 font-semibold">
						You have not sold any assets yet !
					</h1>
				)}
			</div>
		</div>
	);
}
