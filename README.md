# r2-upload

A single Cloudflare Worker that serves an upload page on one secret path and writes files into the R2 bucket that this domain already serves.

Anyone who has the URL can upload. There is no other login.

## Setup

1. Install dependencies: `npm install`
2. Pick a path: `openssl rand -hex 24`
3. Copy `wrangler.toml.example` to `wrangler.toml`. Then:
   - Set `bucket_name` to the bucket this domain serves. The placeholder is not a real bucket.
   - Set `UPLOAD_PATH` to `/` plus that path.
   - Uncomment `[[routes]]` and use the same host and path. Add the trailing-slash route only if you want both.
   - Create the ownership namespace with `wrangler kv namespace create FILES` and set `id` under `[[kv_namespaces]]` to the id it prints.
4. `npx wrangler login`, then `npm run deploy`
5. Open `https://<your-domain>/<the-path>`

`PAGE_TITLE` is the page heading. `PAGE_DESCRIPTION` is the paragraph under it; leave that empty to hide the paragraph.

Give each worker its own `name`, `WORKER_NAME`, `UPLOAD_PATH`, and route. File ownership is stored in the `FILES` KV namespace, under that `WORKER_NAME`. A worker can list, rename, and delete only those files. Uploading an existing name is refused. `QUOTA_BYTES` defaults to `1000000000` (1 GB) for that worker, and `ACCOUNT_QUOTA_BYTES` defaults to `10000000000` (10 GB) for the whole bucket. Either limit responds with “Quota reached. Please delete some of your files.”

To give one worker the files already in the bucket, set `CLAIM_UNOWNED = "true"` on that worker, deploy, open its page, and use **Claim existing files**. Then set it back to `"false"` and deploy again. That also copies any older `.uploader` records into KV and deletes those empty objects. Files already recorded for another worker are left alone. `CLAIM_EXCLUDE` is an optional comma-separated list of directories to leave unowned, such as `assets/,docs/`. Claimed files count toward that worker's quota. The free plan allows 1,000 KV writes per day, so a large claim may need another day to finish.

Deleting a Worker in Cloudflare removes the script and its route. The files stay in the bucket, and their KV records stay under the old `WORKER_NAME`. They still count toward the bucket cap. Deploy another worker with that same `WORKER_NAME` to manage them again.

The route has to be that exact path. A `*` route, or a Worker Custom Domain on this hostname, would take the rest of the URLs away from the bucket.

## Upload without the page

```bash
curl -T photo.jpg \
  -H "content-type: image/jpeg" \
  -H "x-key: photos/photo.jpg" \
  https://files.example.com/the-secret-path
```

Use the secret path itself as the URL, with no extra slash or file name after it. `x-key` is the object name. `x-keep-original` is `true` or `false`. Leave that header off and `KEEP_ORIGINAL_NAMES` decides. When the choice is true, `x-key` is stored as given. When it is false, the object gets a random name even if `x-key` is set. With no `x-key`, the name is random either way. A random name has no extension unless `KEEP_EXTENSION` is `"true"` or the request sends `x-keep-extension: true`. Then an image gets an extension from its content type, and `text/plain` still has none. The worker checks that name against the bucket and draws another, up to five times. If all five are taken, the upload fails with “Could not pick a name”. `RANDOM_NAME_LENGTH` is how many characters that name has. The characters are digits and both letter cases. It defaults to 8, and the longest accepted value is 64. Percent-encode spaces and other reserved characters in `x-key` (`photo%20name.jpg`).

`curl -d @-` is a POST, and a POST with a body uploads. Leave the name off for a random text paste with no extension. Curl’s default type is stored as `text/plain`. `-d` removes newlines; `--data-binary @-` keeps them. Both read until the pipe closes, so `cat` waits until you press Ctrl-D:

```bash
echo hello | curl -d @- \
  https://files.example.com/the-secret-path

cat | curl --data-binary @- \
  -H "x-key: notes/hello" \
  https://files.example.com/the-secret-path
```

With `--proto-default https` in `.curlrc` or `.config/curlrc`, leave off the `https://`.

Set `content-type` when the paste is not text, for example `image/jpeg`. The JSON response includes the public URL. A second upload of the same name returns 409. Saved objects use `cache-control: public, max-age=60`.

On the page, a pasted image or a chosen file stays in the list until you use its Upload button. The name is editable before that. A pasted image starts with a random name. **Keep original filenames** starts checked when `KEEP_ORIGINAL_NAMES` is `"true"`. A file you choose after that uses its own name while the box is checked, and a random name when it is not. **Keep extension** starts checked when `KEEP_EXTENSION` is `"true"`. It is only used while **Keep original filenames** is unchecked, and a random name includes its extension only while it is checked. The page sends that name, so the upload stores it. A name you send is checked once: if it is already in the bucket, the upload is refused. Rename and delete are under **My files**. Write text with the curl examples above.

Zone upload limits apply before the Worker runs: 100 MB on Free and Pro, 200 MB on Business.

## Local check

`npm run dev` serves every path locally, which is only the dev server. The path check still applies. Point `UPLOAD_PATH` at something other than the placeholder first. Links printed after an upload 404 on that dev server; on the real domain those same paths are served by the bucket.
