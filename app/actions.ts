"use server";

import { revalidatePath } from "next/cache";

export async function uploadImage(formData: FormData) {
	const file = formData.get("image") as File;
	if (!file) {
		throw new Error("No file uploaded");
	}

	// Here you would typically upload the file to your backend or cloud storage
	// For this example, we'll just simulate a successful upload
	console.log(`Uploading file: ${file.name}`);

	// Simulate API request delay
	await new Promise((resolve) => setTimeout(resolve, 2000));

	// After successful upload, revalidate the page to show the new image
	revalidatePath("/");

	// Return success message
	return { message: "Image uploaded successfully" };
}
