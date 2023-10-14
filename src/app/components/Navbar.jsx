import Link from "next/link";

export default function Navbar() {
	return (
		<div className="border-b p-6">
			<p className="text-4xl font-bold text-gray-700">
				TokenGallery Marketplace
			</p>
			<div className="flex items-center justify-center gap-5 mt-4">
				<Link
					href={"/"}
					className="text-pink-500 text-lg font-semibold hover:text-white hover:bg-pink-500 px-4 py-1 rounded-3xl duration-300"
				>
					<p>Home</p>
				</Link>

				<Link
					href={"/create-item"}
					className="text-pink-500 text-lg font-semibold hover:text-white hover:bg-pink-500 px-4 py-1 rounded-3xl duration-300"
				>
					<p>Sell Digital Asset</p>
				</Link>

				<Link
					href={"/"}
					className="text-pink-500 text-lg font-semibold hover:text-white hover:bg-pink-500 px-4 py-1 rounded-3xl duration-300"
				>
					<p>My Digital Asset</p>
				</Link>

				<Link
					href={"/"}
					className="text-pink-500 text-lg font-semibold hover:text-white hover:bg-pink-500 px-4 py-1 rounded-3xl duration-300"
				>
					<p>Creator Dashboard</p>
				</Link>
			</div>
		</div>
	);
}