<script>
    import {onMount} from "svelte";

    let {images, data} = $props();
    let produceInfoText = $state("");

    const getQuantity = (name) => {
        return data[name.toLowerCase()];
    };

    onMount(() => {
        function showProduceText(event, showInfoText) {
            const targetElement = event.target;
            const hasProduceClass = targetElement.classList.contains("produce");
            const itemQuantity = parseInt(targetElement.dataset.quantity, 10) || 0;

            if(hasProduceClass && itemQuantity > 0) {
                produceInfoText = showInfoText ? targetElement.alt : "";
            }
        }

        document.addEventListener("mouseover", (e) => {
            showProduceText(e, true);
        });

        document.addEventListener("mouseout", (e) => {
            showProduceText(e, false);
        });
    });
</script>

<div class="produce-images-container">
    {#each images as image}
        {@const quantity = getQuantity(image.name)}
        <img class="produce {quantity === 0 ? 'not-obtained' : ''}" src={image.url} alt="{image.name} x {quantity}" data-quantity={quantity}/>
    {/each}
</div>
<p class="produce-info">{produceInfoText}</p>

<style>
    .not-obtained {
        filter: brightness(0);
        opacity: 75%;
    }

    .produce {
        height: 45px;
        margin: 0 5px;
    }

    .produce-images-container {
        max-width: 650px;
        text-align: center;
        border: 4px solid var(--color-deep-forest);
        border-radius: 15px;
        margin: 20px auto 0;
        padding: 0 10px;
    }

    .produce-info {
        text-align: center;
        font-size: 18px;
    }
</style>