# google-classroom-files-export

A naively implemented script for exporting files posted on Google Classrooms streams

## Usage

1. Open the Google Classroom stream in your browser
2. Scroll down to the bottom of the page to load all the posts
3. Open the browser console (F12) and paste the following code:

```javascript
Array.from(document.querySelectorAll("a"))
    .filter((a) => a.getAttribute("aria-label") ?? "".startsWith("Attachment:"))
    .map((a) => {
        const url = a.getAttribute("href");
        if (!URL.canParse(url)) {
            return null;
        }

        return { link: url, title: a.getAttribute("title") };
    })
    .filter((a) => a !== null && a.title !== null);
```

4. Save the output to a JSON file
5. Run the download script:

```sh
bun run ./index.ts <path-to-json-file> <output-directory>
```
