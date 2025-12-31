<script lang="ts">
	import AudioPlayer from './AudioPlayer.svelte';
	import VideoPlayer from './VideoPlayer.svelte';
	import PDFViewer from './PDFViewer.svelte';
	import { resolve } from '$app/paths';
	import type { Media } from '$lib/server/db';

	interface Props {
		media: Media;
	}

	let { media }: Props = $props();

	// Determine download URL (use media URL as download URL)
	const downloadUrl = media.url;
</script>

{#if media.type === 'audio'}
	<AudioPlayer url={media.url} title={media.title} {downloadUrl} />
{:else if media.type === 'video'}
	<VideoPlayer url={media.url} title={media.title} {downloadUrl} />
{:else if media.type === 'ebook'}
	<PDFViewer url={media.url} title={media.title} {downloadUrl} />
{:else}
	<div class="unsupported-media">
		<svg
			width="64"
			height="64"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="1.5"
		>
			<circle cx="12" cy="12" r="10" />
			<line x1="12" y1="8" x2="12" y2="12" />
			<line x1="12" y1="16" x2="12.01" y2="16" />
		</svg>
		<h3>Unsupported Media Type</h3>
		<p>The media type "{media.type}" is not currently supported for playback.</p>
		<a href={resolve(media.url)} target="_blank" rel="noopener noreferrer" class="download-link">
			<svg
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
			>
				<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
				<polyline points="7 10 12 15 17 10" />
				<line x1="12" y1="15" x2="12" y2="3" />
			</svg>
			Download File
		</a>
	</div>
{/if}

<style>
	.unsupported-media {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 4rem 2rem;
		text-align: center;
		background: var(--color-surface);
		border: 1px solid var(--color-border-light);
		border-radius: 16px;
		color: var(--color-text-muted);
	}

	.unsupported-media svg {
		margin-bottom: 1.5rem;
		color: var(--color-accent);
	}

	.unsupported-media h3 {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0 0 0.5rem 0;
	}

	.unsupported-media p {
		font-size: 1rem;
		margin: 0 0 2rem 0;
	}

	.download-link {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.875rem 1.75rem;
		background: var(--color-accent);
		color: white;
		font-size: 1rem;
		font-weight: 600;
		border-radius: 100px;
		transition: all var(--transition-fast);
	}

	.download-link:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
	}
</style>
