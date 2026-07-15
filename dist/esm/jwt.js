export function decodeJwt(token) {
    try {
        const [, payload] = token.split(".");
        if (!payload)
            return null;
        const json = Buffer.from(payload, "base64url").toString("utf8");
        return JSON.parse(json);
    }
    catch {
        return null;
    }
}
