<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import MediaFallback from './MediaFallback.svelte';

	interface Props {
		url: string;
		title: string;
		downloadUrl?: string;
	}

	let { url, title, downloadUrl = url }: Props = $props();

	let currentPage = $state(1);
	let totalPages = $state(0);
	let scale = $state(1.5);
	let isLoading = $state(true);
	let error = $state<string | null>(null);
	let corsError = $state(false);

	let pdfDoc: unknown = null;
	let pdfjsLib: unknown = null;
	let pageRendering = false;
	let pageNumPending: number | null = null;
	let pdfCanvas: HTMLCanvasElement | null = $state(null);

	onMount(async () => {
		if (!browser) return;

		try {
			// First, test for CORS issues with a quick fetch
			try {
				const testResponse = await fetch(url, {
					method: 'HEAD',
					mode: 'cors',
					cache: 'no-cache'
				});

				if (!testResponse.ok) {
					console.warn('PDF fetch returned non-OK status:', testResponse.status);
				}
			} catch (fetchError: unknown) {
				// If fetch fails, it's likely a CORS issue
				if (
					fetchError instanceof TypeError ||
					(fetchError instanceof Error && fetchError.message?.includes('CORS'))
				) {
					console.error('CORS detected during PDF HEAD request:', fetchError);
					corsError = true;
					isLoading = false;
					return;
				}
			}

			// Dynamically import PDF.js only in browser
			pdfjsLib = await import('pdfjs-dist');

			// Set worker source
			const pdfLib = pdfjsLib as { GlobalWorkerOptions: { workerSrc: string }; version: string };
			pdfLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfLib.version}/build/pdf.worker.min.mjs`;

			// Load PDF
			const loadingTask = pdfjsLib.getDocument(url);
			pdfDoc = await loadingTask.promise;
			totalPages = pdfDoc.numPages;
			isLoading = false;

			// Render first page
			await renderPage(1);
		} catch (err: unknown) {
			console.error('Error loading PDF:', err);

			// Check if it's a CORS error
			if (
				err instanceof TypeError ||
				(err instanceof Error &&
					(err.message?.includes('CORS') ||
						err.message?.includes('NetworkError') ||
						err.message?.includes('Failed to fetch')))
			) {
				corsError = true;
			} else {
				error = 'Failed to load PDF document';
			}

			isLoading = false;
		}
	});

	onDestroy(() => {
		if (pdfDoc && browser) {
			try {
				pdfDoc.destroy();
			} catch (err) {
				console.error('Error destroying PDF:', err);
			}
			pdfDoc = null;
		}
	});

	async function renderPage(num: number) {
		if (!pdfDoc || !browser) return;

		pageRendering = true;

		try {
			// Cast to proper PDF.js types
			const pdfDocument = pdfDoc as {
				getDocument: (url: string) => unknown;
				getPage: (num: number) => unknown;
			};

			const page = (await pdfDocument.getPage(num)) as {
				getViewport: (options: { scale: number }) => unknown;
			};
			const viewport = page.getViewport({ scale }) as { width: number; height: number };

			// Support HiDPI displays
			const outputScale = window.devicePixelRatio || 1;

			// Create canvas if it doesn't exist
			if (!pdfCanvas) {
				pdfCanvas = document.createElement('canvas');
			}

			const context = pdfCanvas.getContext('2d');

			pdfCanvas.width = Math.floor(viewport.width * outputScale);
			pdfCanvas.height = Math.floor(viewport.height * outputScale);
			pdfCanvas.style.width = Math.floor(viewport.width) + 'px';
			pdfCanvas.style.height = Math.floor(viewport.height) + 'px';

			const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

			const renderContext = {
				canvasContext: context!,
				transform: transform,
				viewport: viewport
			};

			await page.render(renderContext).promise;

			pageRendering = false;

			// If there's a pending page, render it
			if (pageNumPending !== null) {
				const pending = pageNumPending;
				pageNumPending = null;
				await renderPage(pending);
			}
		} catch (err) {
			console.error('Error rendering page:', err);
			pageRendering = false;
		}
	}

	function queueRenderPage(num: number) {
		if (pageRendering) {
			pageNumPending = num;
		} else {
			renderPage(num);
		}
	}

	function previousPage() {
		if (currentPage <= 1) return;
		currentPage--;
		queueRenderPage(currentPage);
	}

	function nextPage() {
		if (currentPage >= totalPages) return;
		currentPage++;
		queueRenderPage(currentPage);
	}

	function zoomIn() {
		scale = Math.min(scale + 0.25, 3);
		queueRenderPage(currentPage);
	}

	function zoomOut() {
		scale = Math.max(scale - 0.25, 0.5);
		queueRenderPage(currentPage);
	}

	function handleDownload() {
		if (browser) {
			window.open(downloadUrl, '_blank');
		}
	}
</script>

{#if corsError}
	<MediaFallback {title} {downloadUrl} mediaType="pdf" errorType="cors" fileFormat="PDF" />
{:else}
	<div class="pdf-viewer-wrapper">
		<div class="pdf-viewer-header">
			<svg
				class="pdf-icon"
				width="32"
				height="32"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
			>
				<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
				<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
			</svg>
			<div class="pdf-info">
				<h3 class="pdf-title">{title}</h3>
				<span class="pdf-type">PDF Document</span>
			</div>
		</div>

		{#if isLoading}
			<div class="loading-state">
				<div class="spinner"></div>
				<p>Loading PDF...</p>
			</div>
		{:else if error}
			<div class="error-state">
				<svg
					width="48"
					height="48"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<circle cx="12" cy="12" r="10" />
					<line x1="12" y1="8" x2="12" y2="12" />
					<line x1="12" y1="16" x2="12.01" y2="16" />
				</svg>
				<p>{error}</p>
			</div>
		{:else}
			<div class="pdf-controls">
				<div class="pdf-navigation">
					<button onclick={previousPage} disabled={currentPage <= 1} class="control-button">
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<polyline points="15 18 9 12 15 6" />
						</svg>
						Previous
					</button>
					<span class="page-info">
						Page {currentPage} of {totalPages}
					</span>
					<button onclick={nextPage} disabled={currentPage >= totalPages} class="control-button">
						Next
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<polyline points="9 18 15 12 9 6" />
						</svg>
					</button>
				</div>

				<div class="pdf-zoom">
					<button
						onclick={zoomOut}
						disabled={scale <= 0.5}
						class="control-button icon-button"
						aria-label="Zoom out"
					>
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<circle cx="11" cy="11" r="8" />
							<line x1="21" y1="21" x2="16.65" y2="16.65" />
							<line x1="8" y1="11" x2="14" y2="11" />
						</svg>
					</button>
					<span class="zoom-level">{Math.round(scale * 100)}%</span>
					<button
						onclick={zoomIn}
						disabled={scale >= 3}
						class="control-button icon-button"
						aria-label="Zoom in"
					>
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<circle cx="11" cy="11" r="8" />
							<line x1="21" y1="21" x2="16.65" y2="16.65" />
							<line x1="11" y1="8" x2="11" y2="14" />
							<line x1="8" y1="11" x2="14" y2="11" />
						</svg>
					</button>
				</div>

				<button onclick={handleDownload} class="download-button">
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
					Download PDF
				</button>
			</div>

			<div class="pdf-canvas-container">
				{#if pdfCanvas}
					<canvas bind:this={pdfCanvas}></canvas>
				{/if}
			</div>
		{/if}
	</div>
{/if}

<style>
	.pdf-viewer-wrapper {
		background: var(--color-surface);
		border: 1px solid var(--color-border-light);
		border-radius: 16px;
		padding: 1.5rem;
		box-shadow: var(--shadow-sm);
	}

	.pdf-viewer-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1.5rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--color-border-light);
	}

	.pdf-icon {
		color: var(--color-ebook);
		flex-shrink: 0;
	}

	.pdf-info {
		flex: 1;
		min-width: 0;
	}

	.pdf-title {
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0 0 0.25rem 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.pdf-type {
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
		padding: 4rem 2rem;
		text-align: center;
		color: var(--color-text-muted);
	}

	.spinner {
		width: 48px;
		height: 48px;
		border: 4px solid var(--color-border-light);
		border-top-color: var(--color-accent);
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 1rem;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.error-state svg {
		color: var(--color-error, #ef4444);
		margin-bottom: 1rem;
	}

	.pdf-controls {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 1rem;
		background: var(--color-bg-secondary);
		border-radius: 12px;
		margin-bottom: 1.5rem;
	}

	.pdf-navigation {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.pdf-zoom {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.page-info,
	.zoom-level {
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--color-text-secondary);
	}

	.control-button {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.625rem 1rem;
		background: var(--color-surface);
		color: var(--color-text-primary);
		font-size: 0.9rem;
		font-weight: 500;
		border: 1px solid var(--color-border-light);
		border-radius: 8px;
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.control-button.icon-button {
		padding: 0.625rem;
	}

	.control-button:hover:not(:disabled) {
		background: var(--color-accent-muted);
		border-color: var(--color-accent);
		color: var(--color-accent);
		transform: translateY(-1px);
	}

	.control-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.download-button {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.625rem 1.25rem;
		background: var(--color-ebook);
		color: white;
		font-size: 0.9rem;
		font-weight: 600;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.download-button:hover {
		opacity: 0.9;
		transform: translateY(-1px);
	}

	.pdf-canvas-container {
		display: flex;
		justify-content: center;
		align-items: flex-start;
		padding: 1.5rem;
		background: var(--color-bg-secondary);
		border-radius: 12px;
		overflow: auto;
		max-height: 800px;
	}

	.pdf-canvas-container :global(canvas) {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		border-radius: 4px;
		background: white;
	}

	@media (max-width: 768px) {
		.pdf-controls {
			flex-direction: column;
			align-items: stretch;
		}

		.pdf-navigation,
		.pdf-zoom {
			justify-content: space-between;
			width: 100%;
		}

		.download-button {
			width: 100%;
			justify-content: center;
		}
	}
</style>
