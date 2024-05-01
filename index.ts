import { $ } from "bun";
import path from "path";

type Link = {
    link: string;
    title: string;
};

if (Bun.argv.length !== 4) {
    console.error("Usage: bun run ./index.ts <input-file> <output-directory>");
    process.exit(1);
}

const inputFile = Bun.argv[2];

const localFile = await Bun.file(inputFile).text();
const input: Link[] = JSON.parse(localFile);

const determineGoogleDocsExtension = (url: URL): "xlsx" | "docx" | "pptx" | undefined => {
    const type = url.pathname.split("/")[1];
    switch (type) {
        case "document":
            return "docx";
        case "spreadsheets":
            return "xlsx";
        case "presentation":
            return "pptx";
        default:
            return undefined;
    }
};

const allowedHosts = ["drive.google.com", "docs.google.com"];
for (let { link, title } of input) {
    const url = new URL(link);

    if (!allowedHosts.includes(url.hostname)) {
        console.error(`Skipping ${title} because it's not a Google Drive link`);
        continue;
    } else {
        if (url.hostname === "docs.google.com") {
            const extension = determineGoogleDocsExtension(url);
            if (extension) {
                title = `${title}.${extension}`;
                console.debug(`Detected Google Docs file, changing title to ${title}`);
            }
        }
    }

    const id = url.pathname.split("/")[3];
    console.debug(`Downloading ${title} from Google Drive with ID ${id}`);

    const outputDirectory = Bun.argv[3];
    const outputFile = path.resolve(outputDirectory, `${title}`);

    await $`rclone backend copyid school: "${id}" "${outputFile}"`.catch((e) => {
        console.error(`Failed to download ${title}: ${e}`);
    });

    console.debug(`Downloaded ${title} to ${outputFile}`);
}
