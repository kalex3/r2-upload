import { PAGE } from "./page";

export interface Env {
  BUCKET: R2Bucket;
  UPLOAD_PATH: string;
  WORKER_NAME?: string;
  QUOTA_BYTES?: string;
  ACCOUNT_QUOTA_BYTES?: string;
  CLAIM_UNOWNED?: string;
  CLAIM_EXCLUDE?: string;
  PAGE_TITLE?: string;
  PAGE_DESCRIPTION?: string;
  RANDOM_NAME_LENGTH?: string;
  KEEP_ORIGINAL_NAMES?: string;
  KEEP_EXTENSION?: string;
  FILES: KVNamespace;
}

const DEFAULT_QUOTA_BYTES = 1_000_000_000;
const DEFAULT_ACCOUNT_QUOTA_BYTES = 10_000_000_000;
const QUOTA_MESSAGE = "Quota reached. Please delete some of your files.";

const DEFAULT_RANDOM_NAME_LENGTH = 8;
const MAX_RANDOM_NAME_LENGTH = 64;

const DEFAULT_PAGE_TITLE = "Upload";
const DEFAULT_PAGE_DESCRIPTION =
  "Paste an image or choose a file, edit the name, then use its Upload button. If that name is already taken, choose another one. Your files are under My files. The zone upload limit applies (100 MB on Free and Pro).";

const PLACEHOLDER_PATH = "/paste-a-long-random-path";
const MAX_BYTES = 5 * 1024 * 1024 * 1024;

const PAGE_HEADERS = {
  "content-type": "text/html; charset=utf-8",
  "cache-control": "no-store",
  "referrer-policy": "no-referrer",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "x-robots-tag": "noindex, nofollow",
  "content-security-policy":
    "default-src 'none'; img-src data:; connect-src 'self'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const secret = configuredPath(env);
    if (!secret) return notFound();

    const path = requestPath(new URL(request.url).pathname);
    if (path !== secret) return notFound();

    if (request.method === "GET") {
      if (request.headers.get("x-list") === "1") return listCreated(request, env);
      return new Response(renderPage(env), { headers: PAGE_HEADERS });
    }
    if (request.method === "HEAD") {
      return new Response(null, { headers: PAGE_HEADERS });
    }
    if (request.method === "POST") {
      if (request.headers.get("x-rename") !== null) return renameObject(request, env, secret);
      if (request.headers.get("x-claim") === "1") return claimUnowned(env);
      if (!hasUploadBody(request)) return probe(request, env, secret);
      return upload(request, env, secret);
    }
    if (request.method === "PUT") return upload(request, env, secret);
    if (request.method === "DELETE") return removeCreated(request, env, secret);

    return new Response("Method not allowed", {
      status: 405,
      headers: { allow: "GET, HEAD, POST, PUT, DELETE", "cache-control": "no-store" },
    });
  },
};

function configuredPath(env: Env): string | null {
  const raw = typeof env.UPLOAD_PATH === "string" ? env.UPLOAD_PATH.trim() : "";
  if (raw === PLACEHOLDER_PATH) {
    console.error("Set UPLOAD_PATH in wrangler.toml before using the uploader.");
    return null;
  }
  const parts = raw.split("/").slice(1);
  if (!raw.startsWith("/") || raw.endsWith("/") || parts.length === 0) {
    console.error("UPLOAD_PATH must look like /a-long-random-string");
    return null;
  }
  const safe = parts.every(
    (part) => part !== "." && part !== ".." && /^[A-Za-z0-9._~-]+$/.test(part),
  );
  if (!safe) {
    console.error("UPLOAD_PATH may contain letters, numbers, and . _ ~ -");
    return null;
  }
  return raw;
}

function requestPath(pathname: string): string | null {
  let path: string;
  try {
    path = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  if (path.length > 1) path = path.replace(/\/+$/, "");
  return path;
}

async function probe(request: Request, env: Env, secret: string): Promise<Response> {
  const key = objectKey(request.headers.get("x-key"), secret);
  if (key instanceof Response) return key;
  try {
    const existing = await env.BUCKET.head(key);
    if (!existing) {
      return Response.json({ exists: false, key }, { headers: { "cache-control": "no-store" } });
    }
    return Response.json(await describe(request, env, existing), {
      headers: { "cache-control": "no-store" },
    });
  } catch (err) {
    console.error(err);
    return text("Could not check the name", 500);
  }
}

async function upload(request: Request, env: Env, secret: string): Promise<Response> {
  const keep = keepOriginal(request, env);
  if (keep instanceof Response) return keep;
  const named = keep && request.headers.get("x-key") !== null;
  const key = named
    ? objectKey(request.headers.get("x-key"), secret)
    : await autoKey(request, env, secret);
  if (key instanceof Response) return key;
  const name = workerName(env);
  if (name && !indexKey(name, key)) return text("Bad key", 400);

  if (named) {
    try {
      const existing = await env.BUCKET.head(key);
      if (existing) return conflict(request, env, existing);
    } catch (err) {
      console.error(err);
      return text("Could not check the name", 500);
    }
  }

  const declared = contentLength(request);
  if (declared !== null && declared > MAX_BYTES) return text("File too large", 413);

  let length = declared;
  let body: ReadableStream | Uint8Array | null = declared === 0 ? new Uint8Array() : request.body;
  if (declared === null) {
    const buffered = await readBody(request, MAX_BYTES);
    if (buffered instanceof Response) return buffered;
    body = buffered;
    length = buffered.byteLength;
  }
  if (length === null || !body) return text("Missing body", 400);

  const blocked = await overQuota(env, length);
  if (blocked) return blocked;

  try {
    const object = await env.BUCKET.put(key, body, {
      onlyIf: { etagDoesNotMatch: "*" },
      httpMetadata: {
        contentType: contentType(request),
        cacheControl: "public, max-age=60",
      },
    });
    if (!object) {
      try {
        const existing = await env.BUCKET.head(key);
        if (existing) return conflict(request, env, existing);
      } catch (err) {
        console.error(err);
        return text("Could not check the name", 500);
      }
      return text("Upload failed", 500);
    }
    try {
      await recordCreated(env, object);
    } catch (err) {
      console.error(err);
    }
    console.log(`put ${object.key} ${object.size}`);
    return Response.json(
      { key: object.key, size: object.size, url: publicUrl(request, object.key) },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (err) {
    console.error(err);
    if (isStorageLimit(err)) return quotaReached();
    return text("Upload failed", 500);
  }
}

async function autoKey(request: Request, env: Env, secret: string): Promise<string | Response> {
  const prefix = folderPrefix(request.headers.get("x-prefix"));
  if (prefix instanceof Response) return prefix;
  const secretKey = secret.slice(1);
  if (prefix === secretKey || prefix.startsWith(`${secretKey}/`)) return text("Bad folder", 400);

  const keepExt = keepExtension(request, env);
  if (keepExt instanceof Response) return keepExt;
  const ext = keepExt ? extensionFor(contentType(request)) : "";
  try {
    for (let attempt = 0; attempt < 5; attempt++) {
      const base = randomId(randomNameLength(env)) + ext;
      const key = prefix ? `${prefix}/${base}` : base;
      const existing = await env.BUCKET.head(key);
      if (!existing) return key;
    }
  } catch (err) {
    console.error(err);
    return text("Could not pick a name", 500);
  }
  return text("Could not pick a name", 409);
}

function keepExtension(request: Request, env: Env): boolean | Response {
  const header = request.headers.get("x-keep-extension");
  if (header === null) return env.KEEP_EXTENSION === "true";
  const value = header.trim().toLowerCase();
  if (value === "true") return true;
  if (value === "false") return false;
  return text("Bad x-keep-extension", 400);
}

function keepOriginal(request: Request, env: Env): boolean | Response {
  const header = request.headers.get("x-keep-original");
  if (header === null) return env.KEEP_ORIGINAL_NAMES !== "false";
  const value = header.trim().toLowerCase();
  if (value === "true") return true;
  if (value === "false") return false;
  return text("Bad x-keep-original", 400);
}

function folderPrefix(header: string | null): string | Response {
  if (!header) return "";
  let prefix: string;
  try {
    prefix = decodeURIComponent(header.trim());
  } catch {
    return text("Bad folder", 400);
  }
  prefix = prefix.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
  if (!prefix) return "";
  if (new TextEncoder().encode(prefix).byteLength > 900) return text("Bad folder", 400);
  const parts = prefix.split("/");
  if (
    parts.some(
      (part) => part === "" || part === "." || part === ".." || /[\u0000-\u001f\u007f?#]/.test(part),
    )
  ) {
    return text("Bad folder", 400);
  }
  return prefix;
}

function randomNameLength(env: Env): number {
  const raw = typeof env.RANDOM_NAME_LENGTH === "string" ? env.RANDOM_NAME_LENGTH.trim() : "";
  if (!raw) return DEFAULT_RANDOM_NAME_LENGTH;
  if (!/^\d+$/.test(raw)) {
    console.error("RANDOM_NAME_LENGTH must be a whole number");
    return DEFAULT_RANDOM_NAME_LENGTH;
  }
  const parsed = Number(raw);
  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > MAX_RANDOM_NAME_LENGTH) {
    console.error("RANDOM_NAME_LENGTH must be from 1 to 64");
    return DEFAULT_RANDOM_NAME_LENGTH;
  }
  return parsed;
}

const NAME_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

function randomId(length: number): string {
  let name = "";
  while (name.length < length) {
    const bytes = new Uint8Array(length - name.length);
    crypto.getRandomValues(bytes);
    for (const byte of bytes) {
      // 248 is the largest multiple of 62 below 256, so the remainder is uniform.
      if (byte >= 248) continue;
      name += NAME_ALPHABET[byte % 62];
      if (name.length === length) break;
    }
  }
  return name;
}

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/apng": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/bmp": "bmp",
  "image/x-ms-bmp": "bmp",
  "image/svg+xml": "svg",
  "image/tiff": "tif",
  "image/heic": "heic",
  "image/heif": "heif",
  "image/x-icon": "ico",
  "image/vnd.microsoft.icon": "ico",
};

function extensionFor(mime: string): string {
  if (mime.startsWith("text/")) return "";
  const known = EXTENSIONS[mime];
  if (known) return `.${known}`;
  const subtype = (mime.split("/")[1] ?? "").split("+")[0].replace(/^x-/, "");
  if (/^[a-z0-9]{1,8}$/.test(subtype) && mime !== "application/octet-stream") return `.${subtype}`;
  return "";
}

async function describe(
  request: Request,
  env: Env,
  object: R2Object,
): Promise<{ exists: true; key: string; size: number; url: string; owned: boolean }> {
  return {
    exists: true,
    key: object.key,
    size: object.size,
    url: publicUrl(request, object.key),
    owned: await owns(env, object.key),
  };
}

function conflict(request: Request, env: Env, object: R2Object): Promise<Response> {
  return describe(request, env, object).then((body) =>
    Response.json(body, {
      status: 409,
      headers: { "cache-control": "no-store" },
    }),
  );
}

function quotaBytes(env: Env, raw: string | undefined, fallback: number): number {
  const value = typeof raw === "string" ? raw.trim() : "";
  if (!value) return fallback;
  if (!/^\d+$/.test(value)) {
    console.error("Quota must be a whole number of bytes");
    return fallback;
  }
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : fallback;
}

async function overQuota(env: Env, length: number): Promise<Response | null> {
  try {
    const totals = await usage(env);
    const workerBytes = quotaBytes(env, env.QUOTA_BYTES, DEFAULT_QUOTA_BYTES);
    const accountBytes = quotaBytes(env, env.ACCOUNT_QUOTA_BYTES, DEFAULT_ACCOUNT_QUOTA_BYTES);
    const overWorker = totals.worker + length > workerBytes;
    const overAccount = totals.bucket + length > accountBytes;
    if (!overWorker && !overAccount) return null;
    console.error(overWorker ? "worker quota" : "account quota");
    return quotaReached();
  } catch (err) {
    console.error(err);
    return text("Upload failed", 500);
  }
}

async function usage(env: Env): Promise<{ worker: number; bucket: number }> {
  let bucket = 0;
  let cursor: string | undefined;
  do {
    const listed = await env.BUCKET.list({ cursor, limit: 1000 });
    for (const object of listed.objects) bucket += object.size;
    cursor = listed.truncated ? listed.cursor : undefined;
  } while (cursor);

  const name = workerName(env);
  let worker = 0;
  if (name) {
    for (const file of await listWorkerFiles(env, name)) worker += file.size;
  }
  return { worker, bucket };
}

function quotaReached(): Response {
  return text(QUOTA_MESSAGE, 507);
}

function isStorageLimit(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return /storage (limit|quota)|quota exceeded|insufficient storage|account has reached/i.test(message);
}

async function removeCreated(request: Request, env: Env, secret: string): Promise<Response> {
  const key = objectKey(request.headers.get("x-key"), secret);
  if (key instanceof Response) return key;
  const name = workerName(env);
  if (!name) return notFound();
  try {
    if (!(await owns(env, key))) return notFound();
    await env.BUCKET.delete(key);
    await deleteIndex(env, name, key);
  } catch (err) {
    console.error(err);
    return text("Could not delete", 500);
  }
  return new Response(null, { status: 204, headers: { "cache-control": "no-store" } });
}

function workerName(env: Env): string {
  const name = typeof env.WORKER_NAME === "string" ? env.WORKER_NAME.trim() : "";
  if (!/^[a-z0-9][a-z0-9-]{0,62}$/.test(name)) return "";
  return name;
}

type FileMeta = { size?: number; uploaded?: string };

type IndexedFile = { key: string; size: number; uploaded: string };

function markerPrefix(name: string): string {
  return `.uploader/${name}/`;
}

function markerKey(name: string, key: string): string {
  return markerPrefix(name) + key;
}

function isBookkeeping(key: string): boolean {
  return key === ".uploader" || key.startsWith(".uploader/");
}

function indexKey(name: string, key: string): string | null {
  const index = `${name}/${key}`;
  if (new TextEncoder().encode(index).byteLength > 512) return null;
  return index;
}

function recordedSize(size: unknown, fallback = 0): number {
  return typeof size === "number" && Number.isSafeInteger(size) && size >= 0 ? size : fallback;
}

async function owns(env: Env, key: string): Promise<boolean> {
  const name = workerName(env);
  if (!name) return false;
  const index = indexKey(name, key);
  if (index && (await env.FILES.get(index)) !== null) return true;
  return (await env.BUCKET.head(markerKey(name, key))) !== null;
}

async function ownedKeys(env: Env): Promise<Set<string>> {
  const owned = new Set<string>();
  let cursor: string | undefined;
  do {
    const listed = await env.FILES.list({ cursor, limit: 1000 });
    for (const entry of listed.keys) {
      const slash = entry.name.indexOf("/");
      if (slash <= 0) continue;
      const key = entry.name.slice(slash + 1);
      if (key) owned.add(key);
    }
    cursor = listed.list_complete ? undefined : listed.cursor;
  } while (cursor);

  for (const marker of await legacyMarkers(env)) owned.add(marker.key);
  return owned;
}

async function recordCreated(env: Env, object: R2Object): Promise<void> {
  const name = workerName(env);
  if (!name) return;
  const index = indexKey(name, object.key);
  if (!index) {
    console.error(`not indexed, key too long: ${object.key}`);
    return;
  }
  await env.FILES.put(index, "", {
    metadata: { size: object.size, uploaded: object.uploaded.toISOString() } satisfies FileMeta,
  });
}

async function deleteIndex(env: Env, name: string, key: string): Promise<void> {
  const index = indexKey(name, key);
  if (index) await env.FILES.delete(index);
  await env.BUCKET.delete(markerKey(name, key));
}

async function listWorkerFiles(env: Env, name: string): Promise<IndexedFile[]> {
  const byKey = new Map<string, IndexedFile>();
  let cursor: string | undefined;
  do {
    const listed = await env.FILES.list<FileMeta>({ prefix: `${name}/`, cursor, limit: 1000 });
    for (const entry of listed.keys) {
      const key = entry.name.slice(name.length + 1);
      if (!key) continue;
      byKey.set(key, {
        key,
        size: recordedSize(entry.metadata?.size),
        uploaded: entry.metadata?.uploaded ?? "",
      });
    }
    cursor = listed.list_complete ? undefined : listed.cursor;
  } while (cursor);

  for (const marker of await legacyMarkers(env, name)) {
    if (byKey.has(marker.key)) continue;
    byKey.set(marker.key, { key: marker.key, size: marker.size, uploaded: marker.uploaded });
  }
  return [...byKey.values()];
}

type LegacyMarker = { owner: string; key: string; size: number; uploaded: string; marker: string };

async function legacyMarkers(env: Env, owner?: string): Promise<LegacyMarker[]> {
  const found: LegacyMarker[] = [];
  const prefix = owner ? markerPrefix(owner) : ".uploader/";
  let cursor: string | undefined;
  do {
    const listed = await env.BUCKET.list({
      prefix,
      cursor,
      limit: 1000,
      include: ["customMetadata"],
    });
    for (const object of listed.objects) {
      const parsed = parseMarker(object.key);
      if (!parsed || (owner && parsed.owner !== owner)) continue;
      const recorded = Number(object.customMetadata?.size);
      found.push({
        owner: parsed.owner,
        key: parsed.key,
        size: Number.isSafeInteger(recorded) && recorded >= 0 ? recorded : 0,
        uploaded: object.uploaded.toISOString(),
        marker: object.key,
      });
    }
    cursor = listed.truncated ? listed.cursor : undefined;
  } while (cursor);
  return found;
}

function parseMarker(marker: string): { owner: string; key: string } | null {
  if (!marker.startsWith(".uploader/")) return null;
  const rest = marker.slice(".uploader/".length);
  const slash = rest.indexOf("/");
  if (slash <= 0) return null;
  const owner = rest.slice(0, slash);
  const key = rest.slice(slash + 1);
  if (!key || !/^[a-z0-9][a-z0-9-]{0,62}$/.test(owner)) return null;
  return { owner, key };
}

async function listCreated(request: Request, env: Env): Promise<Response> {
  const name = workerName(env);
  if (!name) return text("Could not list files", 500);
  try {
    const files = (await listWorkerFiles(env, name)).map((file) => ({
      ...file,
      url: publicUrl(request, file.key),
    }));
    files.sort((a, b) => (a.uploaded < b.uploaded ? 1 : a.uploaded > b.uploaded ? -1 : 0));
    return Response.json({ files }, { headers: { "cache-control": "no-store" } });
  } catch (err) {
    console.error(err);
    return text("Could not list files", 500);
  }
}

function renderPage(env: Env): string {
  const config = JSON.stringify({
    claim: env.CLAIM_UNOWNED === "true",
    keepOriginal: env.KEEP_ORIGINAL_NAMES !== "false",
    keepExtension: env.KEEP_EXTENSION === "true",
    nameLength: randomNameLength(env),
  }).replaceAll("<", "\\u003c");
  const title = escapeHtml(pageText(env.PAGE_TITLE, DEFAULT_PAGE_TITLE));
  const description = escapeHtml(pageText(env.PAGE_DESCRIPTION, DEFAULT_PAGE_DESCRIPTION));
  const lead = description ? `<p class="lead">${description}</p>` : "";
  return PAGE.replaceAll("__CONFIG__", config)
    .replaceAll("__TITLE__", title)
    .replaceAll("__LEAD__", lead);
}

function pageText(raw: string | undefined, fallback: string): string {
  if (typeof raw !== "string") return fallback;
  return raw.trim();
}

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

async function renameObject(request: Request, env: Env, secret: string): Promise<Response> {
  const from = objectKey(request.headers.get("x-key"), secret);
  if (from instanceof Response) return from;
  const to = objectKey(request.headers.get("x-rename"), secret);
  if (to instanceof Response) return to;
  const name = workerName(env);
  if (!name) return text("Could not rename", 500);
  if (!indexKey(name, from) || !indexKey(name, to)) return text("Bad key", 400);
  if (from === to) {
    return Response.json(
      { key: to, size: 0, url: publicUrl(request, to) },
      { headers: { "cache-control": "no-store" } },
    );
  }

  try {
    if (!(await owns(env, from))) return notFound();
    const taken = await ownedKeys(env);
    if (taken.has(to) || (await env.BUCKET.head(to))) {
      return text("A file with this name is already in the bucket.", 409);
    }
    const source = await env.BUCKET.get(from);
    if (!source) return notFound();
    const copied = await copyObject(env, source, to);
    await env.BUCKET.delete(from);
    await deleteIndex(env, name, from);
    await recordCreated(env, copied);
    return Response.json(
      { key: copied.key, size: copied.size, url: publicUrl(request, copied.key) },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (err) {
    console.error(err);
    if (isStorageLimit(err)) return quotaReached();
    return text("Could not rename", 500);
  }
}

async function copyObject(env: Env, source: R2ObjectBody, to: string): Promise<R2Object> {
  const customMetadata = { ...(source.customMetadata ?? {}) };
  delete customMetadata.uploader;
  const options = {
    httpMetadata: source.httpMetadata,
    customMetadata,
  };
  if (!source.body || source.size === 0) return env.BUCKET.put(to, new Uint8Array(), options);
  const stream = new FixedLengthStream(source.size);
  const pipe = source.body.pipeTo(stream.writable);
  const stored = await env.BUCKET.put(to, stream.readable, options);
  await pipe;
  return stored;
}

function excludedFromClaim(env: Env, key: string): boolean {
  const raw = typeof env.CLAIM_EXCLUDE === "string" ? env.CLAIM_EXCLUDE : "";
  for (const part of raw.split(",")) {
    let prefix = part.trim().replace(/^\/+/, "");
    if (!prefix) continue;
    if (!prefix.endsWith("/")) prefix += "/";
    if (key.startsWith(prefix)) return true;
  }
  return false;
}

async function claimUnowned(env: Env): Promise<Response> {
  if (env.CLAIM_UNOWNED !== "true") return notFound();
  const name = workerName(env);
  if (!name) return text("Could not claim files", 500);
  try {
    for (const marker of await legacyMarkers(env)) {
      const index = indexKey(marker.owner, marker.key);
      if (!index) {
        console.error(`not imported, key too long: ${marker.key}`);
        continue;
      }
      await env.FILES.put(index, "", {
        metadata: { size: marker.size, uploaded: marker.uploaded } satisfies FileMeta,
      });
      await env.BUCKET.delete(marker.marker);
    }

    const owned = await ownedKeys(env);
    let claimed = 0;
    let cursor: string | undefined;
    do {
      const listed = await env.BUCKET.list({ cursor, limit: 1000 });
      for (const object of listed.objects) {
        if (isBookkeeping(object.key) || owned.has(object.key) || excludedFromClaim(env, object.key)) continue;
        const index = indexKey(name, object.key);
        if (!index) {
          console.error(`not claimed, key too long: ${object.key}`);
          continue;
        }
        await env.FILES.put(index, "", {
          metadata: { size: object.size, uploaded: object.uploaded.toISOString() } satisfies FileMeta,
        });
        owned.add(object.key);
        claimed++;
      }
      cursor = listed.truncated ? listed.cursor : undefined;
    } while (cursor);
    return Response.json({ claimed }, { headers: { "cache-control": "no-store" } });
  } catch (err) {
    console.error(err);
    return text("Could not claim files", 500);
  }
}

function objectKey(header: string | null, secret: string): string | Response {
  if (!header) return text("Missing x-key", 400);
  const raw = header.trim();
  let key = raw;
  try {
    key = decodeURIComponent(raw);
  } catch {
    key = raw;
  }
  key = key.replace(/^\/+/, "");
  if (!key || new TextEncoder().encode(key).byteLength > 1024) return text("Bad key", 400);
  if (/[\u0000-\u001f\u007f\\?#]/.test(key)) return text("Bad key", 400);

  const parts = key.split("/");
  if (parts.some((part) => part === "" || part === "." || part === "..")) {
    return text("Bad key", 400);
  }

  const path = `/${key}`;
  if (path === secret || path.startsWith(`${secret}/`)) return text("Bad key", 400);
  if (isBookkeeping(key)) return text("Bad key", 400);
  return key;
}

async function readBody(request: Request, max: number): Promise<Uint8Array | Response> {
  const reader = request.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value?.byteLength) continue;
    total += value.byteLength;
    if (total > max) {
      await reader.cancel();
      return text("File too large", 413);
    }
    chunks.push(value);
  }
  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}

function hasUploadBody(request: Request): boolean {
  const length = contentLength(request);
  if (length !== null) return length > 0;
  return /chunked/i.test(request.headers.get("transfer-encoding") ?? "");
}

function contentLength(request: Request): number | null {
  const raw = request.headers.get("content-length");
  if (raw === null || !/^\d+$/.test(raw)) return null;
  const length = Number(raw);
  return Number.isSafeInteger(length) ? length : null;
}

function contentType(request: Request): string {
  const mime = (request.headers.get("content-type") ?? "").split(";", 1)[0].trim().toLowerCase();
  if (mime === "application/x-www-form-urlencoded") return "text/plain";
  if (/^[\w!#$&^_.+-]+\/[\w!#$&^_.+-]+$/.test(mime)) return mime;
  return "application/octet-stream";
}

function publicUrl(request: Request, key: string): string {
  const url = new URL(request.url);
  url.pathname = "/" + key.split("/").map(encodeURIComponent).join("/");
  url.search = "";
  url.hash = "";
  return url.toString();
}

function text(message: string, status: number): Response {
  return new Response(message, {
    status,
    headers: { "cache-control": "no-store", "content-type": "text/plain; charset=utf-8" },
  });
}

function notFound(): Response {
  return text("Not found", 404);
}
