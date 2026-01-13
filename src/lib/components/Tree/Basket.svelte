<script>
    let {caught, basket, onCountsUpdate} = $props();

    const names = basket.map(item =>item.name);

    const groupProduceItems = (arr) => {
        const counts = {};
        const result = [];

        if(onCountsUpdate) {
            onCountsUpdate(counts);
        }

        for (const item of arr) {
            counts[item] = (counts[item] || 0) + 1;
        }

        for (const [item, count] of Object.entries(counts)) {
            if(count > 1) {
                result.push(`${item} (${count})`);
            } else {
                result.push(item);
            }
        }

        return result.join(", ");
    };

    const formattedList = names.length ? groupProduceItems(names) : `(empty)`;
</script>


<div class="produce-basket">
    <div class="image-container">
        <img src={caught.url} alt="{caught.name}">
        <p>{caught.name}</p>
    </div>
    <div class="basket-items">
        <h2 class="basket-title">Current Basket:</h2>
        <span class="basket-list">{formattedList}</span>
    </div>
</div>

<style>
    .basket-items {
        padding: 0 5px 5px;
    }

    .basket-title {
        text-decoration: underline;
    }

    .image-container {
        text-align: center;
        align-content: center;

        > img {
            width: 50px;
        }
    }

    .produce-basket {
        display: grid;
        grid-template-columns: 20% 80%;
        width: 700px;
        border: 4px solid var(--color-deep-forest);
        border-radius: 4px;
        margin-top: 20px;
    }

    /*mobile styles*/
    @media (max-width: 767px) {
        .produce-basket {
            grid-template-columns: 25% 75%;
            width: 375px;
        }
    }
</style>