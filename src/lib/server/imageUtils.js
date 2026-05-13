import {list} from "@vercel/blob";
import {BLOB_READ_WRITE_TOKEN} from "$env/static/private";

async function fetchFromBlob(prefixPath) {
    try {
        const {blobs} = await list({token: BLOB_READ_WRITE_TOKEN, prefix: prefixPath});
        return blobs;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getProduceImages() {
    const blobs = await fetchFromBlob("treeshaker/produce-images/");
    const image = blobs.filter(blob => blob.url.endsWith(".png"));
    return {
        images: image.map(img => ({
            url: img.url,
            name: img.pathname.split("/").pop().replace(".png", "").split("-")[0]
        }))
    }
}

export async function getBoostSound() {
    const blobs = await fetchFromBlob("treeshaker/sfx/");
    const sound = blobs.find(blob => blob.url.endsWith("boost-power.mp3"));
    return sound?.url ?? null;
}