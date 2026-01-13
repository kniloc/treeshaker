import {getUserData} from "$lib/server/userUtils.js";
import {getProduceImages} from "$lib/server/imageUtils.js";

export async function load({locals}) {
    const session = locals.session;
    const currentUser = session.user.name.toLowerCase();
    let clonkData = {};
    const users = await getUserData(currentUser);
    const userData = users.find(user => user.name === currentUser);
    const produceImageSet = await getProduceImages();

    const res = await fetch(`https://api.colonq.computer/api/user/${currentUser}`);

    if(res.ok) {
        const data = await res.text();

        if(data) {
            const boost = data.match(/:boost.*?(\d+)/);
            const copFishRatio = data.match(/:copfish-ratio.*?(\d+).*?(\d+)/);

            if(boost) {
                clonkData.boost = parseInt(boost[1], 10);
            } else {
                clonkData.boost = null;
            }

            if(copFishRatio) {
                const numerator = parseInt(copFishRatio[1], 10);
                const denominator = parseInt(copFishRatio[2], 10);

                clonkData.copFishRatio = ((numerator / denominator) * 10).toFixed(1);
            } else {
                clonkData.copFishRatio = 0;
            }
        }
    } else {
        console.error(`error: ${res.status}`);
    }

    return {
        clonkData,
        user: userData,
        images: produceImageSet.images
    }
}