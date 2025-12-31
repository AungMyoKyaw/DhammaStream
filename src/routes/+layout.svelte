<script lang="ts">
	import './layout.css';
	import 'plyr/dist/plyr.css';
	import favicon from '$lib/assets/favicon.svg';
	import Navigation from '$lib/components/Navigation.svelte';
	import Footer from '$lib/components/Footer.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta
		name="description"
		content="DhammaStream - Discover and listen to Buddhist teachings from venerable teachers. Audio, video, and e-book content in English and Myanmar."
	/>
	<meta name="theme-color" content="#c4883a" />
</svelte:head>

<div class="app-wrapper">
	<Navigation />
	<main class="main-content">
		{@render children()}
	</main>
	<Footer />
</div>

<style>
	.app-wrapper {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	.main-content {
		flex: 1;
	}
</style>
