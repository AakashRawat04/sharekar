"use server";

import { google } from "googleapis";
import { Readable } from "node:stream";

export async function uploadImage(formData: FormData) {
	const file = formData.get("image") as File;

	if (!file) {
		throw new Error("No file uploaded");
	}

	const { GCP_SERVICE_ACCOUNT } = process.env;
	const GCP_SERVICE_ACCOUNT_STRINGIFIED = atob(GCP_SERVICE_ACCOUNT as string);
	const GCP_SERVICE_ACCOUNT_PARSED = JSON.parse(
		GCP_SERVICE_ACCOUNT_STRINGIFIED
	);

	const jwtKey = new google.auth.JWT({
		email: GCP_SERVICE_ACCOUNT_PARSED.client_email,
		key: GCP_SERVICE_ACCOUNT_PARSED.private_key,
		scopes: [
			"https://www.googleapis.com/auth/drive.file",
			"https://www.googleapis.com/auth/drive",
		],
	});

	const drive = google.drive({ version: "v3", auth: jwtKey });

	const folderId = "1Lw6AKs5ZUfOZfHxNwV1d6LfUNr0D8Jhz";

	const fileMetadata = {
		name: file.name,
		mimeType: file.type,
		parents: [folderId],
	};

	const fileBuffer = file.stream();

	// Convert ReadableStream to AsyncIterable
	const streamToAsyncIterable = (
		stream: ReadableStream<Uint8Array<ArrayBufferLike>>
	) => {
		const reader = stream.getReader();
		return {
			[Symbol.asyncIterator]() {
				return {
					async next() {
						const { done, value } = await reader.read();
						if (done) {
							return { done: true, value: undefined };
						}
						return { done: false, value };
					},
				};
			},
		};
	};

	const media = {
		mimeType: file.type,
		body: Readable.from(streamToAsyncIterable(fileBuffer)),
	};

	// Upload the file
	const response = await drive.files.create({
		requestBody: fileMetadata,
		media: media,
		fields: "id",
	});

	const fileId = response.data.id;

	// Set permissions to allow anyone to view the file
	await drive.permissions.create({
		fileId: fileId as string,
		requestBody: {
			role: "reader",
			type: "anyone",
		},
	});

	// Construct the file link
	const fileLink = `https://drive.google.com/file/d/${fileId}/view`;

	return { id: fileId, link: fileLink };
}
