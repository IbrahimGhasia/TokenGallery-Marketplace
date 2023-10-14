"use client";
require("dotenv").config();
import { useState } from "react";
import { ethers } from "ethers";
import { create as ipfsHttpClient } from "ipfs-http-client";
import { Web3Storage } from "web3.storage";
import { useRouter } from "next/navigation";
import Web3Modal from "web3modal";

// const projectId = process.env.NEXT_PUBLIC_INFURA_PROJECT_ID;
// const projectSecret = process.env.NEXT_PUBLIC_INFURA_PROJECT_SECRET;
const web3StorageApi = process.env.NEXT_PUBLIC_WEB3STORAGE_API;

const client = new Web3Storage({ token: web3StorageApi });

// const auth =
// 	"Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");

// const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");
// const client = ipfsHttpClient({
// 	host: "ipfs.infura.io",
// 	port: 5001,
// 	protocol: "https",
// 	headers: {
// 		authorization: auth,
// 	},
// });

import { nftaddress, nftmarketaddress } from "../../../config";

import NFT from "../../../constants/artifacts/contracts/NFT.sol/NFT.json";
import Market from "../../../constants/artifacts/contracts/NFTMarket.sol/NFTMarket.json";

export default function Home() {
	const [fileUrl, setFileUrl] = useState(null);
	const [formInput, updateFormInput] = useState({
		price: "",
		name: "",
		description: "",
	});
	const router = useRouter();

	async function onChange(e) {
		const file = e.target.files;
		console.log(file);

		if (file.size > 3000000) {
			console.log("Very large file");
			return;
		}

		console.log(file.name);

		try {
			const rootCid = await client.put(file);
			console.log(rootCid);
			let url = `https://${rootCid}.ipfs.w3s.link/${file[0].name}`;
			setFileUrl(url);
		} catch (e) {
			console.log(e);
		}
	}

	async function createItem() {
		const { name, description, price } = formInput;
		if (!name || !description || !price || !fileUrl) return;

		const data = {
			name,
			description,
			price,
			image: fileUrl,
		};

		try {
			const buffer = Buffer.from(JSON.stringify(data));
			const files = [new File([buffer], "data.json")];
			const cid = await client.put(files);
			const url = `https://${cid}.ipfs.w3s.link/data.json`;
			createSale(url);
		} catch (error) {
			console.log(error);
		}
	}

	async function createSale(url) {
		const web3Modal = new Web3Modal();
		const connection = await web3Modal.connect();
		const provider = new ethers.providers.Web3Provider(connection);
		const signer = provider.getSigner();

		let contract = new ethers.Contract(nftaddress, NFT.abi, signer);
		let transaction = await contract.createToken(url);
		const tx = await transaction.wait();

		let event = tx.events[0];
		let value = event.args[2];
		let tokenId = value.toNumber();

		const price = ethers.utils.parseUnits(formInput.price, "ether");

		contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);
		let listingPrice = await contract.getListingPrice();
		listingPrice = listingPrice.toString();

		transaction = await contract.createMarketItem(
			nftaddress,
			tokenId,
			price,
			{ value: listingPrice }
		);
		await transaction.wait();
		router.push("/");
	}

	return (
		<div className="flex justify-center">
			<div className="w-1/2 flex flex-col pb-12">
				<p className="text-gray-800 mt-20 text-lg font-semibold">
					Enter your Asset Name{" "}
					<span className="text-red-500">*</span>
				</p>
				<input
					placeholder="Asset Name"
					className="border rounded p-4 text-lg"
					onChange={(e) =>
						updateFormInput({ ...formInput, name: e.target.value })
					}
				/>

				<p className="text-gray-800 mt-5 text-lg font-semibold">
					Enter your Asset Description{" "}
					<span className="text-red-500">*</span>
				</p>
				<textarea
					placeholder="Asset Description"
					className="border rounded p-4 text-lg"
					onChange={(e) =>
						updateFormInput({
							...formInput,
							description: e.target.value,
						})
					}
				/>

				<p className="text-gray-800 mt-5 text-lg font-semibold">
					Enter your Asset Price in MATIC{" "}
					<span className="text-red-500">*</span>
				</p>
				<input
					type="number"
					min={0.1}
					step={0.1}
					placeholder="Asset Price"
					className="border rounded p-4 text-lg"
					onChange={(e) =>
						updateFormInput({ ...formInput, price: e.target.value })
					}
				/>

				<p className="text-gray-800 mt-5 text-lg font-semibold">
					Upload your Asset (NFT Image){" "}
					<span className="text-red-500">*</span>
				</p>
				<input
					type="file"
					name="Asset"
					className="my-4"
					onChange={onChange}
				/>
				{fileUrl && <img className="rounded mt-4 w-96" src={fileUrl} />}

				<button
					onClick={createItem}
					className="font-semibold text-xl mt-10 hover:bg-pink-500  duration-300 border text-pink-500 hover:text-white rounded-full p-4 hover:shadow-xl"
				>
					Create Digital Asset
				</button>
			</div>
		</div>
	);
}
