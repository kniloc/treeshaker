<script>
    let {text, link} = $props();
</script>

<div class="login-container">
    <a class="login-button" href={link}>{text}</a>
</div>

<style>
    .login-button {
        display: block;
        text-decoration: none;
        background-color: var(--color-deep-forest);
        color: var(--color-white);
        border: none;
        border-radius: 4px;
        width: 250px;
        height: 40px;
        margin: 20px auto 0;
        padding: 4px 0;
        font-size: 20px;
        cursor: pointer;
    }
    
    .login-container {
        text-align: center;
    }
</style>