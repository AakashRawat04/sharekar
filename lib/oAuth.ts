const PEM_HEADER: string = "-----BEGIN PRIVATE KEY-----";
const PEM_FOOTER: string = "-----END PRIVATE KEY-----";

export interface GoogleKey {
	type: string;
	project_id: string;
	private_key_id: string;
	private_key: string;
	client_email: string;
	client_id: string;
	auth_uri: string;
	token_uri: string;
	auth_provider_x509_cert_url: string;
	client_x509_cert_url: string;
}

export async function getAccessToken(
	googleKey: GoogleKey,
	scopes: string[]
): Promise<string | undefined> {
	const { client_email: user, private_key: key } = googleKey;
	const scope = scopes.join(" ");
	const jwtHeader = objectToBase64url({ alg: "RS256", typ: "JWT" });
	const assertiontime = Math.round(Date.now() / 1000);
	const expirytime = assertiontime + 3600;
	const claimset = objectToBase64url({
		iss: user,
		scope,
		aud: "https://oauth2.googleapis.com/token",
		exp: expirytime,
		iat: assertiontime,
	});

	const jwtUnsigned = `${jwtHeader}.${claimset}`;
	const signedJwt = `${jwtUnsigned}.${await sign(jwtUnsigned, key)}`;
	const body = `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${signedJwt}`;

	try {
		const response = await fetch(googleKey.token_uri, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				"Cache-Control": "no-cache",
				Host: "oauth2.googleapis.com",
			},
			body,
		});

		const resp = (await response.json()) as {
			access_token: string;
			expires_in: number;
			token_type: string;
		};
		console.log(resp);
		return resp.access_token;
	} catch (err) {
		console.error(err);
		return undefined;
	}
}

function objectToBase64url(object: object): string {
	return arrayBufferToBase64Url(
		new TextEncoder().encode(JSON.stringify(object))
	);
}

function arrayBufferToBase64Url(buffer: Uint8Array): string {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-expect-error
	return btoa(String.fromCharCode(...buffer))
		.replace(/=/g, "")
		.replace(/\+/g, "-")
		.replace(/\//g, "_");
}

function str2ab(str: string): ArrayBuffer {
	const buf = new ArrayBuffer(str.length);
	const bufView = new Uint8Array(buf);
	for (let i = 0, strLen = str.length; i < strLen; i += 1) {
		bufView[i] = str.charCodeAt(i);
	}
	return buf;
}

async function sign(content: string, signingKey: string): Promise<string> {
	const buf = str2ab(content);
	const plainKey = signingKey
		.replace(/(\r\n|\n|\r)/gm, "")
		.replace(/\\n/g, "")
		.replace(PEM_HEADER, "")
		.replace(PEM_FOOTER, "")
		.trim();

	const binaryKey = str2ab(atob(plainKey));
	const signer = await crypto.subtle.importKey(
		"pkcs8",
		binaryKey,
		{
			name: "RSASSA-PKCS1-V1_5",
			hash: { name: "SHA-256" },
		},
		false,
		["sign"]
	);
	const binarySignature = await crypto.subtle.sign(
		{ name: "RSASSA-PKCS1-V1_5" },
		signer,
		buf
	);
	return arrayBufferToBase64Url(new Uint8Array(binarySignature));
}
