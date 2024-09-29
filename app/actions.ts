"use server";

import { google } from "googleapis";
import { Readable } from "stream";

// Create a readable stream from a buffer
const bufferToStream = (buffer: Buffer) => {
	const stream = new Readable();
	stream.push(buffer);
	stream.push(null); // Signal the end of the stream
	return stream;
};

const getDriveService = () => {
	const oauth2Client = new google.auth.OAuth2({
		clientId: process.env.CLIENT_ID,
		clientSecret: process.env.CLIENT_SECRET,
		redirectUri: process.env.REDIRECT_URI,
	});

	oauth2Client.setCredentials({
		refresh_token: process.env.REFRESH_TOKEN,
	});

	const drive = google.drive({
		version: "v3",
		auth: oauth2Client,
	});

	return drive;
};

async function generatePublicUrl(fileId: string) {
	const drive = getDriveService();

	const response = await drive.permissions.create({
		fileId: fileId,
		requestBody: {
			role: "reader",
			type: "anyone",
		},
	});

	if (!response) {
		throw new Error("Failed to generate public URL");
	}

	/* 
    webViewLink: View the file in browser
    webContentLink: Direct download link 
    */
	const result = await drive.files.get({
		fileId: fileId,
		fields: "webViewLink, webContentLink",
	});

	return result.data.webContentLink;
}

export async function uploadImage(formData: FormData) {
	const file = formData.get("image") as File;
	console.log(formData);
	console.log(file);
	if (!file) {
		throw new Error("No file uploaded");
	}

	// Convert the file into a buffer
	const arrayBuffer = await file.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);

	// Convert buffer to readable stream
	const fileStream = bufferToStream(buffer);

	const drive = getDriveService();

	// Upload file to Google Drive
	const response = await drive.files.create({
		requestBody: {
			name: `projectlittlefinger/${file.name}`,
			mimeType: file.type,
		},
		media: {
			mimeType: file.type,
			body: fileStream,
		},
	});

	if (!response.data.id) {
		throw new Error("Failed to upload image");
	}

	console.log(response.data);

	// Generate public URL
	const publicUrl = await generatePublicUrl(response.data.id);
	console.log(publicUrl);
	return publicUrl;
}
