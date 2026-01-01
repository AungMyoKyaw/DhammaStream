<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { resolve } from '$app/paths';
	import MediaFallback from './MediaFallback.svelte';

	function resolveUrl(url: string): string {
		try {
			new URL(url);
			return url;
		} catch {
			return resolve(url);
		}
	}

	interface Props {
		url: string;
		title: string;
		downloadUrl?: string;
		poster?: string;
	}

	let { url, title, downloadUrl = url, poster }: Props = $props();

	let videoElement: HTMLVideoElement | undefined;
	let player: unknown = null;
	let isLoading = $state(true);
	let error = $state<string | null>(null);
	let corsError = $state(false);
	let hasStartedPlaying = $state(false);
	let playbackTimeout: ReturnType<typeof setTimeout> | null = null;

	onMount(async () => {
		if (!browser || !videoElement) return;

		try {
			// Dynamically import Plyr only in browser
			const PlyrModule = await import('plyr');
			const Plyr = PlyrModule.default;

			// Initialize Plyr with custom controls including download
			player = new Plyr(videoElement, {
				controls: [
					'play-large',
					'play',
					'progress',
					'current-time',
					'duration',
					'mute',
					'volume',
					'captions',
					'settings',
					'pip',
					'airplay',
					'download',
					'fullscreen'
				],
				settings: ['captions', 'quality', 'speed'],
				speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
				tooltips: { controls: true, seek: true },
				keyboard: { focused: true, global: true },
				ratio: '16:9',
				urls: {
					download: downloadUrl
				},
				quality: {
					default: 720,
					options: [1080, 720, 480, 360]
				}
			});

			// Add custom event listeners
			player.on('ready', () => {
				console.log('Video player ready');
				isLoading = false;

				// Set timeout to detect CORS issues if playback never starts
				playbackTimeout = setTimeout(() => {
					if (!hasStartedPlaying && !error && !corsError) {
						console.warn('Video playback timeout - likely CORS issue');
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
				console.error('Video player error:', event);

				// Try to detect CORS errors
				const mediaError = videoElement?.error;
				if (mediaError) {
					if (
						mediaError.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED ||
						mediaError.code === MediaError.MEDIA_ERR_NETWORK
					) {
						corsError = true;
					} else {
						error = 'Failed to load video';
					}
				} else {
					corsError = true; // Assume CORS if no specific error
				}

				isLoading = false;
			});

			player.on('play', () => {
				console.log('Video playback started');
			});

			// Listen for native video element errors too
			videoElement.addEventListener('error', () => {
				const mediaError = videoElement.error;
				if (mediaError && mediaError.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED) {
					corsError = true;
					isLoading = false;
				}
			});
		} catch (err) {
			console.error('Failed to initialize video player:', err);
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
	<MediaFallback {title} {downloadUrl} mediaType="video" errorType="cors" fileFormat="MP4" />
{:else}
	<div class="video-player-wrapper">
		<div class="video-player-header">
			<svg
				class="video-icon"
				width="32"
				height="32"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
			>
				<rect x="2" y="6" width="20" height="12" rx="2" />
				<path d="m10 9 5 3-5 3V9z" />
			</svg>
			<div class="video-info">
				<h3 class="video-title">{title}</h3>
				<span class="video-type">Video Teaching</span>
			</div>
		</div>

		<div class="video-container">
			{#if isLoading && browser}
				<div class="loading-state">
					<div class="spinner"></div>
					<p>Loading video player...</p>
				</div>
			{:else if error}
				<div class="error-state">
					<p>{error}</p>
				</div>
			{/if}

			<video bind:this={videoElement} class="plyr-video" playsinline {poster}>
				<source src={url} type="video/mp4" />
				<source src={url} type="video/webm" />
				Your browser does not support the video element.
			</video>
		</div>

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
				Download Video
			</a>
		</div>
	</div>
{/if}

<style>
	.video-player-wrapper {
		background: var(--color-surface);
		border: 1px solid var(--color-border-light);
		border-radius: 16px;
		padding: 1.5rem;
		box-shadow: var(--shadow-sm);
	}

	.video-player-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1.5rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--color-border-light);
	}

	.video-icon {
		color: var(--color-video);
		flex-shrink: 0;
	}

	.video-info {
		flex: 1;
		min-width: 0;
	}

	.video-title {
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0 0 0.25rem 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.video-type {
		font-size: 0.85rem;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.video-container {
		border-radius: 12px;
		overflow: hidden;
		background: #000;
		position: relative;
		min-height: 300px;
	}

	.loading-state,
	.error-state {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		color: var(--color-text-muted);
		z-index: 10;
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

	.plyr-video {
		width: 100%;
		height: auto;
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
	:global(.plyr--video) {
		border-radius: 12px;
		overflow: hidden;
	}

	:global(.plyr--video .plyr__controls) {
		background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
	}

	:global(.plyr--video .plyr__control) {
		color: white;
	}

	:global(.plyr--video .plyr__control:hover) {
		background: rgba(255, 255, 255, 0.1);
	}

	:global(.plyr--video .plyr__control.plyr__tab-focus) {
		box-shadow: 0 0 0 2px var(--color-video);
	}

	:global(.plyr--video .plyr__progress input[type='range']) {
		color: var(--color-video);
	}

	:global(.plyr--video .plyr__volume input[type='range']) {
		color: var(--color-video);
	}

	:global(.plyr--video .plyr__control--overlaid) {
		background: var(--color-video);
	}

	:global(.plyr--video .plyr__control--overlaid:hover) {
		background: var(--color-video);
		opacity: 0.9;
	}
</style>
