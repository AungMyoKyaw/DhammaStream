<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { resolve } from '$app/paths';
	import MediaFallback from './MediaFallback.svelte';

	function resolveUrl(url: string): string {
		// Only use resolve for internal paths, return external URLs as-is
		try {
			new URL(url);
			// If it has a protocol, it's external
			return url;
		} catch {
			// If URL parsing fails, assume it's a relative/internal path
			return resolve(url);
		}
	}

	interface Props {
		url: string;
		title: string;
		downloadUrl?: string;
	}

	let { url, title, downloadUrl = url }: Props = $props();

	let audioElement: HTMLAudioElement | undefined;
	let player: unknown = null;
	let isLoading = $state(true);
	let error = $state<string | null>(null);
	let corsError = $state(false);
	let hasStartedPlaying = $state(false);
	let playbackTimeout: ReturnType<typeof setTimeout> | null = null;

	onMount(async () => {
		if (!browser || !audioElement) return;

		try {
			// Dynamically import Plyr only in browser
			const PlyrModule = await import('plyr');
			const Plyr = PlyrModule.default;

			// Initialize Plyr with custom controls including download
			player = new Plyr(audioElement, {
				controls: [
					'play',
					'progress',
					'current-time',
					'duration',
					'mute',
					'volume',
					'download',
					'settings',
					'rewind',
					'fast-forward'
				],
				settings: ['speed'],
				speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
				tooltips: { controls: true, seek: true },
				keyboard: { focused: true, global: true },
				urls: {
					download: downloadUrl
				}
			});

			// Add custom event listeners
			player.on('ready', () => {
				console.log('Audio player ready');
				isLoading = false;

				// Set timeout to detect CORS issues if playback never starts
				playbackTimeout = setTimeout(() => {
					if (!hasStartedPlaying && !error && !corsError) {
						console.warn('Audio playback timeout - likely CORS issue');
						corsError = true;
					}
				}, 8000);
			});

			player.on('playing', () => {
				hasStartedPlaying = true;
				if (playbackTimeout) {
					clearTimeout(playbackTimeout);
					playbackTimeout = null;
				}
			});

			player.on('error', (event: Event) => {
				console.error('Audio player error:', event);

				// Try to detect CORS errors
				const mediaError = audioElement?.error;
				if (mediaError) {
					if (
						mediaError.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED ||
						mediaError.code === MediaError.MEDIA_ERR_NETWORK
					) {
						corsError = true;
					} else {
						error = 'Failed to load audio';
					}
				} else {
					corsError = true; // Assume CORS if no specific error
				}

				isLoading = false;
			});

			// Listen for native audio element errors too
			audioElement.addEventListener('error', () => {
				const mediaError = audioElement.error;
				if (mediaError && mediaError.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED) {
					corsError = true;
					isLoading = false;
				}
			});
		} catch (err) {
			console.error('Failed to initialize audio player:', err);
			error = 'Failed to initialize player';
			isLoading = false;
		}
	});

	onDestroy(() => {
		if (playbackTimeout) {
			clearTimeout(playbackTimeout);
		}
		if (player && browser) {
			try {
				player.destroy();
			} catch (err) {
				console.error('Error destroying player:', err);
			}
			player = null;
		}
	});
</script>

{#if corsError}
	<MediaFallback {title} {downloadUrl} mediaType="audio" errorType="cors" fileFormat="MP3" />
{:else}
	<div class="audio-player-wrapper">
		<div class="audio-player-header">
			<svg
				class="audio-icon"
				width="32"
				height="32"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
			>
				<path d="M9 18V5l12-2v13" />
				<circle cx="6" cy="18" r="3" />
				<circle cx="18" cy="16" r="3" />
			</svg>
			<div class="audio-info">
				<h3 class="audio-title">{title}</h3>
				<span class="audio-type">Audio Teaching</span>
			</div>
		</div>

		{#if isLoading && browser}
			<div class="loading-state">
				<div class="spinner"></div>
				<p>Loading audio player...</p>
			</div>
		{:else if error}
			<div class="error-state">
				<p>{error}</p>
			</div>
		{/if}

		<audio bind:this={audioElement} class="plyr-audio">
			<source src={url} type="audio/mp3" />
			<source src={url} type="audio/mpeg" />
			Your browser does not support the audio element.
		</audio>

		<div class="download-fallback">
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
			<a href={resolveUrl(downloadUrl)} download class="download-button">
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
					<polyline points="7 10 12 15 17 10" />
					<line x1="12" y1="15" x2="12" y2="3" />
				</svg>
				Download Audio
			</a>
		</div>
	</div>
{/if}

<style>
	.audio-player-wrapper {
		background: var(--color-surface);
		border: 1px solid var(--color-border-light);
		border-radius: 16px;
		padding: 1.5rem;
		box-shadow: var(--shadow-sm);
	}

	.audio-player-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1.5rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--color-border-light);
	}

	.audio-icon {
		color: var(--color-audio);
		flex-shrink: 0;
	}

	.audio-info {
		flex: 1;
		min-width: 0;
	}

	.audio-title {
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0 0 0.25rem 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.audio-type {
		font-size: 0.85rem;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.loading-state,
	.error-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		text-align: center;
		color: var(--color-text-muted);
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 3px solid var(--color-border-light);
		border-top-color: var(--color-accent);
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 0.75rem;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.error-state p {
		color: var(--color-error, #ef4444);
	}

	.plyr-audio {
		width: 100%;
	}

	.download-fallback {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid var(--color-border-light);
	}

	.download-button {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.625rem 1.25rem;
		background: var(--color-bg-secondary);
		color: var(--color-text-secondary);
		font-size: 0.9rem;
		font-weight: 500;
		border-radius: 8px;
		transition: all var(--transition-fast);
	}

	.download-button:hover {
		background: var(--color-accent-muted);
		color: var(--color-accent);
		transform: translateY(-1px);
	}

	/* Plyr customization */
	:global(.plyr--audio .plyr__controls) {
		background: transparent;
		border-radius: 8px;
		padding: 1rem 0.5rem;
	}

	:global(.plyr--audio .plyr__control) {
		color: var(--color-text-primary);
	}

	:global(.plyr--audio .plyr__control:hover) {
		background: var(--color-bg-secondary);
	}

	:global(.plyr--audio .plyr__control.plyr__tab-focus) {
		box-shadow: 0 0 0 2px var(--color-accent);
	}

	:global(.plyr--audio .plyr__progress input[type='range']) {
		color: var(--color-audio);
	}

	:global(.plyr--audio .plyr__volume input[type='range']) {
		color: var(--color-audio);
	}

	:global(.plyr--audio .plyr__time) {
		color: var(--color-text-secondary);
	}
</style>
