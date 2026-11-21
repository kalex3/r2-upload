export const PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#fafafa" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#121212" media="(prefers-color-scheme: dark)">
<meta name="robots" content="noindex, nofollow">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%230053a3'/%3E%3Cpath fill='%23fff' transform='translate(4 4)' d='M9 16h6v-6h4l-7-7-7 7h4v6zm-4 4h14v2H5z'/%3E%3C/svg%3E" type="image/svg+xml" media="(prefers-color-scheme: light)">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%2395c4ff'/%3E%3Cpath fill='%23000' transform='translate(4 4)' d='M9 16h6v-6h4l-7-7-7 7h4v6zm-4 4h14v2H5z'/%3E%3C/svg%3E" type="image/svg+xml" media="(prefers-color-scheme: dark)">
<title>__TITLE__</title>
<style>
  :root {
    color-scheme: light dark;
    --bg: #fafafa;
    --ink: rgb(0 0 0 / 87%);
    --muted: #616161;
    --line: #74777f;
    --paper: #e6e6e6;
    --field: #fff;
    --accent: #0053a3;
    --accent-ink: #fff;
    --accent-hover: #1863ad;
    --accent-focus: #2f73b4;
    --link: #1565c0;
    --visited: #6a1b9a;
    --bad: #b00020;
    --warn: #6f3a01;
    --disabled-bg: rgb(26 27 30 / 12%);
    --disabled-ink: rgb(26 27 30 / 38%);
    --over: #dae2f9;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #121212;
      --ink: rgb(255 255 255 / 87%);
      --muted: #9f9f9f;
      --line: #8e9099;
      --paper: #212121;
      --field: #212121;
      --accent: #95c4ff;
      --accent-ink: #000;
      --accent-hover: #89b4ea;
      --accent-focus: #7ca3d4;
      --link: #90caf9;
      --visited: #ce93d8;
      --bad: #cf6679;
      --warn: #fcbd00;
      --disabled-bg: rgb(227 226 230 / 12%);
      --disabled-ink: rgb(227 226 230 / 38%);
      --over: #3e4758;
    }
  }
  * { box-sizing: border-box; }
  :focus-visible { outline: 2px solid var(--link); outline-offset: 2px; }
  body {
    margin: 0;
    min-height: 100vh;
    min-height: -webkit-fill-available;
    background: var(--bg);
    color: var(--ink);
    font-family: Roboto, sans-serif;
    font-size: 16px;
    line-height: 1.5;
    letter-spacing: .009375rem;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  }
  @media (pointer: fine) {
    body { overscroll-behavior: none; }
  }
  .skip {
    position: absolute;
    left: 0.5rem;
    top: 0.5rem;
    transform: translateY(-150%);
    background: var(--accent);
    color: var(--accent-ink);
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-weight: 700;
    z-index: 1;
  }
  .skip:focus-visible { transform: none; }
  main { max-width: 832px; margin: 0 auto; padding: 1em; width: 100%; }
  h1 { font-size: 2.25rem; line-height: 2.75rem; letter-spacing: 0; margin: 0 0 0.4rem; text-wrap: balance; }
  .lead { margin: 0 0 1.5rem; white-space: pre-wrap; }
  label { display: block; margin-bottom: 0.35rem; }
  input[type="text"], textarea {
    width: 100%;
    padding: 0.65rem 0.75rem;
    border: 1px solid var(--line);
    border-radius: 12px;
    background: var(--field);
    color: inherit;
    font: inherit;
  }
  textarea { min-height: 9rem; resize: vertical; display: block; margin: 0.35rem 0 0.75rem; }
  input::placeholder, textarea::placeholder { color: var(--muted); }
  #prefix { margin-bottom: 1rem; }
  .drop {
    border: 1px dashed var(--line);
    background: var(--paper);
    border-radius: 12px;
    padding: 1.75rem 1rem;
    text-align: center;
    margin-bottom: 1rem;
    cursor: pointer;
  }
  .drop.over { border-color: var(--link); background: var(--over); }
  ul { list-style: none; padding: 0; margin: 0 0 1rem; }
  li {
    content-visibility: auto;
    contain-intrinsic-size: auto 4rem;
    background: var(--paper);
    border: 1px solid var(--line);
    border-radius: 12px;
    padding: 0.75rem 0.85rem;
    margin-bottom: 0.5rem;
  }
  .row { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
  .row > a { flex: 1; }
  .file { gap: 0.65rem; }
  .file > .size, .file > button { flex: none; }
  .file > .size { width: 9.5ch; text-align: right; }
  #created li {
    background: transparent;
    border: 0;
    border-bottom: 1px solid var(--line);
    border-radius: 0;
    padding: 0.55rem 0;
  }
  #created li:last-child { border-bottom: 0; }
  .name, a { overflow-wrap: anywhere; min-width: 0; }
  .name-input { flex: 1; min-width: 0; width: auto; margin: 0; padding: 0.4rem 0.55rem; }
  .meta { color: var(--muted); font-size: 0.875rem; }
  .size { white-space: nowrap; font-variant-numeric: tabular-nums; }
  .bar { height: 4px; background: var(--line); border-radius: 99px; margin-top: 0.55rem; overflow: hidden; }
  .bar > span { display: block; height: 100%; width: 0; background: var(--accent); }
  a { color: var(--link); text-decoration: none; }
  a:visited { color: var(--visited); }
  a:hover { text-decoration: underline; }
  button.upload, button.secondary {
    color: var(--accent-ink);
    font-size: .9em;
    font-weight: 700;
    letter-spacing: .0892857143em;
    background: var(--accent);
    border-radius: 20px;
    border: 0;
    height: 40px;
    padding: .5rem 1.5rem;
    font-family: inherit;
    cursor: pointer;
  }
  button.upload:hover, button.secondary:hover { background: var(--accent-hover); }
  button.upload:focus-visible, button.secondary:focus-visible {
    background: var(--accent-focus);
    box-shadow: 0 2px 4px -1px rgb(0 0 0 / 20%), 0 4px 5px 0 rgb(0 0 0 / 14%), 0 1px 10px 0 rgb(0 0 0 / 12%);
  }
  button.upload:disabled {
    background: var(--disabled-bg);
    color: var(--disabled-ink);
    box-shadow: none;
    cursor: not-allowed;
  }
  .tools { display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 0 0 1rem; }
  #text-panel { margin-bottom: 1rem; }
  #text-name { margin-bottom: 0.75rem; }
  #show, #claim { margin-bottom: 1rem; }
  #claim { margin-left: 0.5rem; }
  .choices { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.55rem; }
  .choices .no {
    color: var(--ink);
    font-size: .9em;
    font-weight: 700;
    letter-spacing: .0892857143em;
    background: transparent;
    border: 1px solid var(--line);
    border-radius: 20px;
    height: 40px;
    padding: .5rem 1.5rem;
    font-family: inherit;
    cursor: pointer;
  }
  .choices .no:hover { background: var(--over); }
  button.quiet {
    background: transparent;
    border: 0;
    color: var(--bad);
    font: inherit;
    font-weight: 700;
    cursor: pointer;
    padding: 0;
    white-space: nowrap;
    height: auto;
  }
  button.quiet:hover { text-decoration: underline; }
  .err { color: var(--bad); }
  .warn { color: var(--warn); }
</style>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<main id="main">
  <h1>__TITLE__</h1>
  __LEAD__
  <label for="prefix">Folder <span class="meta">(optional)</span></label>
  <input id="prefix" name="folder" type="text" placeholder="photos/2026…" autocomplete="off" spellcheck="false">
  <div class="drop" id="drop" tabindex="0" role="button" aria-label="Choose files">Drop files, click to choose, or paste an image</div>
  <input id="files" type="file" multiple hidden>
  <div class="tools">
    <button class="secondary" id="text-open" type="button" aria-expanded="false" aria-controls="text-panel">Write Text</button>
  </div>
  <div id="text-panel" hidden>
    <label for="text-body">Text</label>
    <textarea id="text-body" name="text" placeholder="Write or paste text…" spellcheck="true"></textarea>
    <label for="text-name">Name <span class="meta">(optional)</span></label>
    <input id="text-name" name="filename" type="text" placeholder="Random name if empty…" autocomplete="off" spellcheck="false">
    <button class="upload" id="text-go" type="button">Upload Text</button>
    <div id="text-status" class="status meta" role="status" aria-live="polite"></div>
  </div>
  <ul id="list"></ul>
  <button class="upload" id="go" type="button">Upload</button>
  <button class="secondary" id="show" type="button" aria-expanded="false" aria-controls="created">My Files</button>
  <button class="secondary" id="claim" type="button" hidden>Claim Existing Files</button>
  <ul id="created" hidden aria-live="polite"></ul>
</main>
<script>
const CONFIG = __CONFIG__;
const drop = document.querySelector("#drop");
const input = document.querySelector("#files");
const list = document.querySelector("#list");
const go = document.querySelector("#go");
const prefix = document.querySelector("#prefix");
const show = document.querySelector("#show");
const claim = document.querySelector("#claim");
const created = document.querySelector("#created");
const textOpen = document.querySelector("#text-open");
const textPanel = document.querySelector("#text-panel");
const textBody = document.querySelector("#text-body");
const textName = document.querySelector("#text-name");
const textGo = document.querySelector("#text-go");
const textStatus = document.querySelector("#text-status");
let items = [];
let uploading = false;
let filesOpen = false;
let filesRequest = 0;

if (CONFIG.claim) claim.hidden = false;
show.addEventListener("click", showCreated);
claim.addEventListener("click", claimExisting);
textOpen.addEventListener("click", toggleText);
textGo.addEventListener("click", uploadText);

window.addEventListener("dragover", (e) => e.preventDefault());
window.addEventListener("drop", (e) => e.preventDefault());
window.addEventListener("paste", onPaste);
window.addEventListener("beforeunload", (e) => {
  if (!textBody.value.trim() && !uploading && !items.some(isPending)) return;
  e.preventDefault();
  e.returnValue = "";
});
textBody.addEventListener("input", () => textBody.removeAttribute("aria-invalid"));
if (location.hash === "#files") showCreated();
drop.addEventListener("click", () => input.click());
drop.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    input.click();
  }
});
drop.addEventListener("dragover", () => drop.classList.add("over"));
drop.addEventListener("dragleave", () => drop.classList.remove("over"));
drop.addEventListener("drop", (e) => {
  drop.classList.remove("over");
  addFiles(e.dataTransfer.files);
});
input.addEventListener("change", () => addFiles(input.files));
go.addEventListener("click", uploadAll);

function onPaste(e) {
  const target = e.target;
  if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
  const data = e.clipboardData;
  if (!data) return;
  const images = pastedImages(data);
  if (!images.length) return;
  e.preventDefault();
  for (const file of images) uploadAuto(file);
}

function toggleText() {
  const open = textPanel.hidden;
  textPanel.hidden = !open;
  textOpen.setAttribute("aria-expanded", open ? "true" : "false");
  if (open) textBody.focus();
}

async function uploadText() {
  const text = textBody.value;
  if (!text) {
    textStatus.className = "status err";
    textStatus.textContent = "Write some text first.";
    textBody.setAttribute("aria-invalid", "true");
    textBody.focus();
    return;
  }
  const name = textName.value.trim();
  const file = new File([text], name || "text", { type: "text/plain" });
  textBody.removeAttribute("aria-invalid");
  textStatus.className = "status meta";
  textStatus.textContent = "Uploading…";
  textGo.disabled = true;
  try {
    const item = name ? addItem(file, false) : await uploadAuto(file);
    if (name) {
      item.nameInput.value = name;
      await uploadNamed(item);
    }
    if (!item.done) {
      textStatus.textContent = "";
      return;
    }
    textBody.value = "";
    textName.value = "";
    textStatus.textContent = "";
  } finally {
    textGo.disabled = false;
  }
}

function pastedImages(data) {
  const images = [];
  const seen = new Set();
  function add(file) {
    if (!file || !file.type || file.type.indexOf("image/") !== 0 || file.size <= 0) return;
    const mark = file.type + "\0" + file.size;
    if (seen.has(mark)) return;
    seen.add(mark);
    images.push(file);
  }
  if (data.items) {
    for (const item of data.items) {
      if (item.kind === "file") add(item.getAsFile());
    }
  }
  if (data.files) {
    for (const file of data.files) add(file);
  }
  return images;
}

async function addFiles(fileList) {
  const chosen = [...(fileList || [])];
  for (const file of chosen) {
    let copy = file;
    try {
      // The chooser can revoke the file after this event, so keep the bytes.
      copy = new File([await file.arrayBuffer()], file.name, {
        type: file.type,
        lastModified: file.lastModified,
      });
    } catch {
      const item = addItem(new File([], file.name || "file"), false);
      item.skipped = true;
      item.status.className = "status err";
      item.status.textContent = "Could not read this file. Choose it again.";
      continue;
    }
    addItem(copy, false);
  }
  input.value = "";
  refreshButton();
}

function addItem(file, auto) {
  const li = document.createElement("li");
  const row = document.createElement("div");
  row.className = "row";
  let nameInput = null;
  let nameEl = null;
  if (auto) {
    nameEl = document.createElement("span");
    nameEl.className = "name";
    nameEl.textContent = file.type.indexOf("image/") === 0 ? "Pasted image" : "Text";
    row.append(nameEl);
  } else {
    nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.className = "name-input";
    nameInput.value = baseName(file.name);
    nameInput.spellcheck = false;
    nameInput.name = "filename";
    nameInput.autocomplete = "off";
    nameInput.setAttribute("aria-label", "File name");
    row.append(nameInput);
  }
  const size = document.createElement("span");
  size.className = "meta size";
  size.textContent = formatBytes(file.size);
  row.append(size);
  const status = document.createElement("div");
  status.className = "status meta";
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  const bar = document.createElement("div");
  bar.className = "bar";
  const fill = document.createElement("span");
  bar.append(fill);
  li.append(row, status, bar);
  list.append(li);
  const item = {
    file: file,
    status: status,
    fill: fill,
    nameInput: nameInput,
    nameEl: nameEl,
    auto: auto,
    done: false,
    conflict: false,
    skipped: false,
    busy: false,
  };
  if (nameInput) nameInput.addEventListener("input", () => resetItem(item));
  items.push(item);
  return item;
}

function resetItem(item) {
  item.done = false;
  item.conflict = false;
  item.skipped = false;
  item.fill.style.width = "0";
  item.status.className = "status meta";
  item.status.textContent = "";
  refreshButton();
}

function refreshButton() {
  go.disabled = uploading;
}

function isPending(item) {
  return !item.auto && !item.done && !item.conflict && !item.skipped && !item.busy;
}

async function uploadAll() {
  uploading = true;
  prefix.disabled = true;
  refreshButton();
  for (const item of items) {
    if (isPending(item)) await uploadNamed(item);
  }
  uploading = false;
  prefix.disabled = false;
  refreshButton();
}

async function uploadNamed(item) {
  let key;
  try {
    key = joinKey(prefix.value, item.nameInput.value);
  } catch (err) {
    item.busy = false;
    item.status.className = "status err";
    item.status.textContent = err.message;
    refreshButton();
    return;
  }
  item.busy = true;
  item.conflict = false;
  item.status.className = "status meta";
  item.status.textContent = "Checking " + key;
  refreshButton();
  try {
    const found = await probe(key);
    if (found.exists) {
      showConflict(item, found);
      return;
    }
    item.status.textContent = key;
    const result = await put(item.file, key);
    finish(item, result);
  } catch (err) {
    if (err.conflict) showConflict(item, err.conflict);
    else {
      item.status.className = "status err";
      item.status.textContent = err.message || "Upload failed. Try again.";
    }
  } finally {
    item.busy = false;
    refreshButton();
  }
}

function showConflict(item, info) {
  item.conflict = true;
  item.status.className = "status warn";
  item.status.textContent = "";
  const message = document.createElement("div");
  message.textContent = info.owned
    ? "You already have a file with this name. Rename it under My files, or choose another name."
    : "A file with this name is already in the bucket.";
  const link = document.createElement("a");
  link.href = info.url;
  link.target = "_blank";
  link.rel = "noreferrer";
  link.textContent = info.url;
  const choices = document.createElement("div");
  choices.className = "choices";
  const no = document.createElement("button");
  no.type = "button";
  no.className = "no";
  no.textContent = "Skip";
  no.addEventListener("click", () => {
    item.conflict = false;
    item.skipped = true;
    item.status.className = "status meta";
    item.status.textContent = "Skipped";
    refreshButton();
  });
  choices.append(no);
  item.status.append(message, link, choices);
  refreshButton();
}

async function uploadAuto(file) {
  const item = addItem(file, true);
  refreshButton();
  try {
    if (prefix.value.trim()) joinKey(prefix.value, "file");
  } catch (err) {
    item.status.className = "status err";
    item.status.textContent = err.message;
    return item;
  }
  item.status.textContent = "Uploading…";
  try {
    const result = await put(file, null);
    item.nameEl.textContent = result.key;
    finish(item, result);
  } catch (err) {
    item.status.className = "status err";
    item.status.textContent = err.message || "Upload failed. Try again.";
  }
  return item;
}

function finish(item, result) {
  item.done = true;
  item.conflict = false;
  item.skipped = false;
  item.fill.style.width = "100%";
  item.status.className = "status";
  item.status.textContent = "";
  const link = document.createElement("a");
  link.href = result.url;
  link.target = "_blank";
  link.rel = "noreferrer";
  link.textContent = result.url;
  item.status.append(link);
  refreshButton();
}

function joinKey(folder, name) {
  const cleaned = folder.trim().replace(/\\\\/g, "/").replace(/^\\/+|\\/+$/g, "");
  const base = String(name).split(/[/\\\\]/).pop();
  if (!base || base === "." || base === "..") throw new Error("That file name cannot be used");
  const key = cleaned ? cleaned + "/" + base : base;
  if (key.split("/").some((part) => !part || part === "." || part === "..")) {
    throw new Error("That folder cannot be used");
  }
  return key;
}

function baseName(name) {
  const parts = String(name).split(/[/\\\\]/);
  return parts.pop() || "";
}

function probe(key) {
  return request("POST", key, null);
}

function put(file, key) {
  return request("POST", key, file);
}

async function request(method, key, body) {
  const headers = {};
  if (key === null) {
    const folder = prefix.value.trim();
    if (folder) headers["x-prefix"] = encodeURIComponent(folder);
  } else {
    headers["x-key"] = encodeURIComponent(key);
  }
  if (body && !body.type) headers["content-type"] = "application/octet-stream";
  let response;
  try {
    response = await fetch(location.pathname, { method, headers, body });
  } catch {
    throw new Error("Network error. Check the connection and try again.");
  }
  const raw = await response.text();
  let parsed = null;
  try { parsed = JSON.parse(raw); } catch (e) { parsed = null; }
  if (response.status === 409 && parsed && parsed.exists) {
    const error = new Error("A file with this name is already in the bucket.");
    error.conflict = parsed;
    throw error;
  }
  if (response.ok && parsed) return parsed;
  throw new Error(raw || "Upload failed. Try again.");
}

function setFilesOpen(open) {
  filesOpen = open;
  created.hidden = !open;
  show.setAttribute("aria-expanded", open ? "true" : "false");
  const url = new URL(location.href);
  url.hash = open ? "files" : "";
  history.replaceState(null, "", url);
}

async function showCreated() {
  if (filesOpen) {
    filesRequest++;
    setFilesOpen(false);
    return;
  }
  const request = ++filesRequest;
  setFilesOpen(true);
  created.textContent = "Loading…";
  try {
    const response = await fetch(location.pathname, { headers: { "x-list": "1" } });
    const raw = await response.text();
    if (request !== filesRequest) return;
    let data = null;
    try { data = JSON.parse(raw); } catch (e) { data = null; }
    if (!response.ok || !data) throw new Error(raw || "Could not list files");
    created.textContent = "";
    if (!data.files.length) {
      created.textContent = "No files yet.";
      return;
    }
    for (const file of data.files) {
      const li = document.createElement("li");
      const row = document.createElement("div");
      row.className = "row file";
      li.dataset.key = file.key;
      li.dataset.url = file.url;
      const size = document.createElement("span");
      size.className = "meta size";
      size.textContent = formatBytes(file.size);
      const rename = document.createElement("button");
      rename.type = "button";
      rename.className = "secondary";
      rename.textContent = "Rename";
      const del = document.createElement("button");
      del.type = "button";
      del.className = "quiet";
      del.textContent = "Delete";
      const status = document.createElement("div");
      status.className = "status meta";
      status.setAttribute("role", "status");
      status.setAttribute("aria-live", "polite");
      rename.addEventListener("click", () => renameCreated(li));
      del.addEventListener("click", () => deleteCreated(li));
      row.append(size, fileLink(file.url, file.key), rename, del);
      li.append(row, status);
      created.append(li);
    }
  } catch (err) {
    if (request !== filesRequest) return;
    created.textContent = err.message || "Could not list files";
  }
}

function fileLink(url, key) {
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noreferrer";
  link.textContent = key;
  return link;
}

function beginRename(li) {
  const link = li.querySelector("a");
  const input = document.createElement("input");
  input.type = "text";
  input.className = "name-input";
  input.value = li.dataset.key;
  input.spellcheck = false;
  input.name = "filename";
  input.autocomplete = "off";
  input.setAttribute("aria-label", "New name");
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      input.committing = true;
      renameCreated(li);
    } else if (e.key === "Escape") {
      cancelRename(li);
    }
  });
  input.addEventListener("blur", () => {
    if (input.committing) return;
    cancelRename(li);
  });
  link.replaceWith(input);
  input.focus();
  input.select();
}

function cancelRename(li) {
  const input = li.querySelector("input");
  if (!input || input.cancelling) return;
  input.cancelling = true;
  input.replaceWith(fileLink(li.dataset.url, li.dataset.key));
}

async function renameCreated(li) {
  const input = li.querySelector("input");
  if (!input) {
    beginRename(li);
    return;
  }
  const oldKey = li.dataset.key;
  const status = li.querySelector(".status");
  let next = input.value.trim();
  while (next.startsWith("/")) next = next.slice(1);
  if (!next || next === oldKey) {
    cancelRename(li);
    return;
  }
  status.className = "status meta";
  status.textContent = "Renaming…";
  const response = await fetch(location.pathname, {
    method: "POST",
    headers: {
      "x-key": encodeURIComponent(oldKey),
      "x-rename": encodeURIComponent(next),
    },
  });
  const raw = await response.text();
  if (!response.ok) {
    input.committing = false;
    status.className = "status err";
    status.textContent = raw || "Could not rename. Try again.";
    input.focus();
    return;
  }
  const data = JSON.parse(raw);
  li.dataset.key = data.key;
  li.dataset.url = data.url;
  input.replaceWith(fileLink(data.url, data.key));
  status.textContent = "";
}

async function deleteCreated(li) {
  if (!confirm("Delete this file?")) return;
  const response = await fetch(location.pathname, {
    method: "DELETE",
    headers: { "x-key": encodeURIComponent(li.dataset.key) },
  });
  if (!response.ok) {
    li.querySelector(".status").textContent = "Could not delete. Try again.";
    li.querySelector(".status").className = "status err";
    return;
  }
  li.remove();
  if (!created.querySelector("li")) created.textContent = "No files yet.";
}

async function claimExisting() {
  claim.disabled = true;
  filesRequest++;
  setFilesOpen(true);
  created.textContent = "Claiming…";
  try {
    const response = await fetch(location.pathname, { method: "POST", headers: { "x-claim": "1" } });
    const raw = await response.text();
    let data = null;
    try { data = JSON.parse(raw); } catch (e) { data = null; }
    if (!response.ok || !data) throw new Error(raw || "Could not claim files");
    created.textContent = data.claimed === 1 ? "Claimed 1 file." : "Claimed " + data.claimed + " files.";
  } catch (err) {
    created.textContent = err.message || "Could not claim files";
  } finally {
    claim.disabled = false;
  }
}

function formatBytes(n) {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = n;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  const digits = i === 0 || value >= 10 ? 0 : 1;
  const formatted = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
  return formatted + "\u00a0" + units[i];
}
</script>
</body>
</html>
`;
