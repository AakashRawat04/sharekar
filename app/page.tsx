"use client";

import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { useRef, useState } from "react";
import { uploadImage } from "./actions";

export default function SocialMediaPage() {
	const [dragActive, setDragActive] = useState(false);
	const [uploading, setUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { toast } = useToast();

	const handleDrag = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === "dragenter" || e.type === "dragover") {
			setDragActive(true);
		} else if (e.type === "dragleave") {
			setDragActive(false);
		}
	};

	const handleDrop = async (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(false);
		if (e.dataTransfer.files && e.dataTransfer.files[0]) {
			await handleFiles(e.dataTransfer.files);
		}
	};

	const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		e.preventDefault();
		if (e.target.files && e.target.files[0]) {
			await handleFiles(e.target.files);
		}
	};

	// const handleFiles = async (files: FileList) => {
	// 	setUploading(true);
	// 	const formData = new FormData();
	// 	formData.append("image", files[0]);
	// 	try {
	// 		await uploadImage(formData);
	// 		// Handle successful upload (e.g., show a success message)
	// 	} catch (error) {
	// 		console.error("Upload failed:", error);
	// 		// Handle error (e.g., show an error message)
	// 	}
	// 	setUploading(false);
	// };
	const handleFiles = async (files: FileList) => {
		setUploading(true);
		toast({
			title: "Uploading image",
			description: "Please wait while we process your image.",
		});

		const formData = new FormData();
		formData.append("image", files[0]);
		try {
			const result = await uploadImage(formData);
			if (!result) {
				throw new Error("Failed to upload image");
			}
			toast({
				title: "Success",
				description: result.toString(),
				variant: "default",
			});
		} catch (error) {
			console.error("Upload failed:", error);
			toast({
				title: "Error",
				description: "Failed to upload image. Please try again.",
				variant: "destructive",
			});
		}
		setUploading(false);
	};

	const onButtonClick = () => {
		fileInputRef.current?.click();
	};

	return (
		<div className="min-h-screen bg-black text-white p-4">
			<div className="max-w-4xl mx-auto">
				<h2 className="text-xl mb-4 text-center">Last days upvote pictures</h2>
				<div className="grid grid-cols-3 gap-4 mb-8">
					{[1, 2].map((i) => (
						<div
							key={i}
							className="aspect-square border border-white/20 rounded"
						></div>
					))}
					{/* display an image with the same configuration */}
					<div className="aspect-square border border-white/20 rounded">
						<Image
							src="https://drive.google.com/uc?id=1OuhjiHH2BYSlLimJs96Byp3cNrG0j6M8&export=download"
							alt="image"
							width={400}
							height={400}
							className="object-cover"
						/>
					</div>
				</div>

				<h2 className="text-xl mb-4 text-center">
					Got any balls? drop a pic then
				</h2>
				<div
					className={`border-2 border-dashed border-white/20 rounded p-4 mb-8 text-center cursor-pointer
            ${dragActive ? "bg-white/10" : ""} ${
						uploading ? "opacity-50" : ""
					}`}
					onDragEnter={handleDrag}
					onDragLeave={handleDrag}
					onDragOver={handleDrag}
					onDrop={handleDrop}
					onClick={onButtonClick}
				>
					<input
						ref={fileInputRef}
						type="file"
						className="hidden"
						onChange={handleChange}
						accept="image/*"
						disabled={uploading}
						name="image"
					/>
					{uploading
						? "Uploading..."
						: "Click or drag and drop to upload an image"}
				</div>

				<h2 className="text-xl mb-4 text-center">Trending Bullshits</h2>
				<div className="grid grid-cols-3 gap-4 mb-8">
					{[1, 2, 3].map((i) => (
						<div
							key={i}
							className="aspect-square border border-white/20 rounded relative"
						>
							<div className="absolute bottom-2 left-2 flex space-x-2">
								<div className="w-6 h-6 bg-white/20 rounded"></div>
								<div className="w-6 h-6 bg-white/20 rounded"></div>
							</div>
						</div>
					))}
				</div>

				<h2 className="text-xl mb-4 text-center">Latest</h2>
				<div className="grid grid-cols-3 gap-4">
					{[1, 2, 3].map((i) => (
						<div
							key={i}
							className="aspect-square border border-white/20 rounded relative"
						>
							<div className="absolute bottom-2 left-2 flex space-x-2">
								<div className="w-6 h-6 bg-white/20 rounded"></div>
								<div className="w-6 h-6 bg-white/20 rounded"></div>
							</div>
						</div>
					))}
				</div>
			</div>
			<Toaster />
		</div>
	);
}
