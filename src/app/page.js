"use client";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
import Web3Modal from "web3modal";

import { nftaddress, nftmarketaddress } from "../../config";

import NFT from "../../constants/artifacts/contracts/NFT.sol/NFT.json";
import Market from "../../constants/artifacts/contracts/NFTMarket.sol/NFTMarket.json";

export default function Home() {
	const [nfts, setNfts] = useState([]);
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
		const provider = new ethers.providers.JsonRpcProvider(
			`https://polygon-mumbai.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID}`
		);
		const tokenContract = new ethers.Contract(
			nftaddress,
			NFT.abi,
			provider
		);
		const marketContract = new ethers.Contract(
			nftmarketaddress,
			Market.abi,
			provider
		);
		const data = await marketContract.fetchMarketItems();

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
				};
				return item;
			})
		);
		setNfts(items);
		setLoadingState("loaded");
	}

	async function buyNft(nft) {
		const web3Modal = new Web3Modal();
		const connection = await web3Modal.connect();
		const provider = new ethers.providers.Web3Provider(connection);

		const signer = provider.getSigner();
		const contract = new ethers.Contract(
			nftmarketaddress,
			Market.abi,
			signer
		);

		const price = ethers.utils.parseUnits(nft.price.toString(), "ether");

		const transaction = await contract.createMarketSale(
			nftaddress,
			nft.tokenId,
			{ value: price }
		);
		await transaction.wait();
		loadNFTs();
	}

	if (loadingState === "loaded" && !nfts.length)
		return (
			<h1 className="px-20 py-10 text-3xl text-red-500 font-semibold bg-gray-100">
				No items in Marketplace yet!
			</h1>
		);

	return (
		<div className="flex justify-center">
			<div className="px-20 py-10 max-w-[1600px]">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
					{nfts.map((nft, index) => (
						<div
							key={index}
							className="border border-black rounded-xl overflow-hidden hover:-translate-y-1 hover:shadow-xl duration-300"
						>
							<img
								src={nft.image}
								className="h-60 w-96 border-b border-black"
							/>
							<div className="p-4">
								<div>
									<p className="text-md text-gray-400 font-semibold">
										Seller: {shortAddress(nft.seller)}
									</p>
								</div>
								<p className="text-4xl text-pink-500 font-semibold">
									{nft.name}
								</p>
								<div className="overflow-hidden h-[70px]">
									<p className="text-lg text-gray-700">
										{nft.description}
									</p>
								</div>
							</div>
							<div className="p-4 border-t border-black bg-pink-50">
								<p className="text-2xl mb-4 font-bold text-gray-700">
									{nft.price} MATIC
								</p>
								<button
									className="w-full bg-pink-500 hover:bg-pink-800 text-white rounded-lg font-bold py-2 px-12 duration-300"
									onClick={() => buyNft(nft)}
								>
									Buy
								</button>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
