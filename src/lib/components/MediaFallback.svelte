<script lang="ts">
	import { browser } from '$app/environment';
	import { Headphones, Video, BookOpen } from 'lucide-svelte';

	interface Props {
		title: string;
		downloadUrl: string;
		mediaType: 'audio' | 'video' | 'pdf';
		errorType?: 'cors' | 'network' | 'unknown';
		fileFormat?: string;
		duration?: string;
	}

	let { title, downloadUrl, mediaType, errorType = 'cors', fileFormat, duration }: Props = $props();

	let showExplanation = $state(false);

	const mediaConfig = $derived({
		audio: {
			label: 'Audio Teaching',
			color: 'var(--color-audio)',
			format: fileFormat || 'MP3'
		},
		video: {
			label: 'Video Teaching',
			color: 'var(--color-video)',
			format: fileFormat || 'MP4'
		},
		pdf: {
			label: 'PDF Document',
			color: 'var(--color-ebook)',
			format: fileFormat || 'PDF'
		}
	});

	const config = $derived(mediaConfig[mediaType]);

	const errorMessages = {
		cors: {
			heading: 'Unable to Stream This Teaching',
			message: 'Due to technical limitations, this media cannot be played directly in your browser.'
		},
		network: {
			heading: 'Connection Issue',
			message:
				"We're having trouble loading this content. Please check your connection and try again."
		},
		unknown: {
			heading: 'Playback Error',
			message: 'Something went wrong while trying to play this media.'
		}
	};

	const explanation = `This teaching is hosted on an external server that doesn't allow direct streaming in web browsers. This is a technical limitation (CORS policy), not a restriction on the content. You can download the file to play it with any media player on your device.`;

	function handleDownload() {
		if (browser) {
			window.open(downloadUrl, '_blank');
		}
	}

	function handleOpenNewTab() {
		if (browser) {
			window.open(downloadUrl, '_blank');
		}
	}
</script>

<div class="media-fallback" style="--media-color: {config.color}">
	<div class="fallback-icon">
		<div class="icon-wrapper">
			{#if mediaType === 'audio'}
				<Headphones size={56} strokeWidth={1.5} />
			{:else if mediaType === 'video'}
				<Video size={56} strokeWidth={1.5} />
			{:else}
				<BookOpen size={56} strokeWidth={1.5} />
			{/if}
		</div>
	</div>

	<div class="fallback-content">
		<h3 class="fallback-heading">{errorMessages[errorType].heading}</h3>
		<p class="fallback-title">{title}</p>
		<p class="fallback-message">{errorMessages[errorType].message}</p>

		<div class="download-card">
			<button onclick={handleDownload} class="download-primary">
				<svg
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
					<polyline points="7 10 12 15 17 10" />
					<line x1="12" y1="15" x2="12" y2="3" />
				</svg>
				<span class="download-text">
					<span class="download-label">Download & Play Locally</span>
					<span class="download-meta">
						{config.format}
						{#if duration}
							• {duration}
						{/if}
					</span>
				</span>
			</button>
		</div>

		<div class="fallback-actions">
			<button onclick={handleOpenNewTab} class="action-button">
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
					<polyline points="15 3 21 3 21 9" />
					<line x1="10" y1="14" x2="21" y2="3" />
				</svg>
				Open in New Tab
			</button>

			{#if errorType === 'cors'}
				<button onclick={() => (showExplanation = !showExplanation)} class="action-button">
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<circle cx="12" cy="12" r="10" />
						<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
						<line x1="12" y1="17" x2="12.01" y2="17" />
					</svg>
					Why can't I play this?
				</button>
			{/if}
		</div>

		{#if showExplanation}
			<div class="explanation-panel">
				<p>{explanation}</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.media-fallback {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 3rem 2rem;
		background: linear-gradient(135deg, #fef3c7 0%, #fef9e7 100%);
		border: 1px solid #fde68a;
		border-radius: 16px;
		text-align: center;
		position: relative;
		overflow: hidden;
	}

	.media-fallback::before {
		content: '';
		position: absolute;
		top: -50%;
		right: -50%;
		width: 200%;
		height: 200%;
		background: radial-gradient(circle, rgba(251, 191, 36, 0.1) 0%, transparent 70%);
		pointer-events: none;
	}

	.fallback-icon {
		margin-bottom: 1.5rem;
		position: relative;
		z-index: 1;
	}

	.icon-wrapper {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 4rem;
		height: 4rem;
		padding: 0.75rem;
		background: rgba(255, 255, 255, 0.8);
		backdrop-filter: blur(8px);
		border-radius: 20px;
		border: 2px solid rgba(251, 191, 36, 0.3);
		box-shadow:
			0 4px 20px rgba(251, 191, 36, 0.15),
			0 2px 8px rgba(0, 0, 0, 0.05);
		animation: gentle-float 3s ease-in-out infinite;
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.icon-wrapper :global(svg) {
		width: 100%;
		height: 100%;
		color: var(--media-color, #f59e0b);
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
		transition: all 0.3s ease;
	}

	@keyframes gentle-float {
		0%,
		100% {
			transform: translateY(0) scale(1);
			box-shadow:
				0 4px 20px rgba(251, 191, 36, 0.15),
				0 2px 8px rgba(0, 0, 0, 0.05);
		}
		50% {
			transform: translateY(-8px) scale(1.02);
			box-shadow:
				0 8px 30px rgba(251, 191, 36, 0.25),
				0 4px 12px rgba(0, 0, 0, 0.08);
		}
	}

	.fallback-content {
		max-width: 480px;
		width: 100%;
		position: relative;
		z-index: 1;
	}

	.fallback-heading {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
		font-size: 1.5rem;
		font-weight: 600;
		color: #78350f;
		margin: 0 0 0.75rem 0;
		line-height: 1.3;
	}

	.fallback-title {
		font-size: 1rem;
		color: #78350f;
		line-height: 1.5;
		margin: 0 0 1rem 0;
		font-weight: 500;
	}

	.fallback-message {
		font-size: 1rem;
		color: #92400e;
		line-height: 1.6;
		margin: 0 0 2rem 0;
		opacity: 0.9;
	}

	.download-card {
		margin-bottom: 1.5rem;
	}

	.download-primary {
		display: inline-flex;
		align-items: center;
		gap: 1rem;
		width: 100%;
		max-width: 380px;
		padding: 1.25rem 1.5rem;
		background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
		border: none;
		border-radius: 12px;
		color: white;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow:
			0 4px 12px rgba(217, 119, 6, 0.3),
			0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.download-primary:hover {
		transform: translateY(-2px);
		box-shadow:
			0 6px 20px rgba(217, 119, 6, 0.4),
			0 4px 8px rgba(0, 0, 0, 0.15);
	}

	.download-primary:active {
		transform: translateY(0);
	}

	.download-primary svg {
		flex-shrink: 0;
	}

	.download-text {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.25rem;
		flex: 1;
		text-align: left;
	}

	.download-label {
		font-size: 1rem;
		font-weight: 600;
		letter-spacing: -0.01em;
	}

	.download-meta {
		font-size: 0.85rem;
		opacity: 0.9;
		font-weight: 400;
	}

	.fallback-actions {
		display: flex;
		gap: 0.75rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	.action-button {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.625rem 1rem;
		background: rgba(255, 255, 255, 0.6);
		backdrop-filter: blur(8px);
		border: 1px solid rgba(217, 119, 6, 0.2);
		border-radius: 8px;
		color: #92400e;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.action-button:hover {
		background: rgba(255, 255, 255, 0.9);
		border-color: rgba(217, 119, 6, 0.4);
		transform: translateY(-1px);
	}

	.action-button svg {
		flex-shrink: 0;
	}

	.explanation-panel {
		margin-top: 1.5rem;
		padding: 1.25rem;
		background: rgba(255, 255, 255, 0.7);
		backdrop-filter: blur(12px);
		border: 1px solid rgba(217, 119, 6, 0.15);
		border-radius: 12px;
		animation: slide-down 0.3s ease-out;
	}

	.explanation-panel p {
		font-size: 0.9rem;
		line-height: 1.6;
		color: #78350f;
		margin: 0;
		text-align: left;
	}

	@keyframes slide-down {
		from {
			opacity: 0;
			transform: translateY(-8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 640px) {
		.media-fallback {
			padding: 2rem 1.5rem;
		}

		.fallback-heading {
			font-size: 1.25rem;
		}

		.fallback-message {
			font-size: 0.9rem;
		}

		.icon-wrapper {
			width: 3.5rem;
			height: 3.5rem;
			padding: 0.625rem;
		}

		.icon-wrapper :global(svg) {
			width: 100%;
			height: 100%;
		}

		.download-primary {
			padding: 1rem 1.25rem;
		}

		.fallback-actions {
			flex-direction: column;
			width: 100%;
		}

		.action-button {
			width: 100%;
			justify-content: center;
		}
	}
</style>
