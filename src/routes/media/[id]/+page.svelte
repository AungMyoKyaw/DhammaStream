<script lang="ts">
	import type { PageData } from './$types';
	import MediaCard from '$lib/components/MediaCard.svelte';
	import { base } from '$app/paths';

	let { data }: { data: PageData } = $props();

	function getTypeLabel(type: string): string {
		return type.charAt(0).toUpperCase() + type.slice(1);
	}

	function getTypeColor(type: string): string {
		switch (type) {
			case 'audio':
				return 'var(--color-audio)';
			case 'video':
				return 'var(--color-video)';
			case 'ebook':
				return 'var(--color-ebook)';
			default:
				return 'var(--color-accent)';
		}
	}
</script>

<svelte:head>
	<title>{data.media.title} | DhammaStream</title>
	<meta
		name="description"
		content="{data.media.title} - {getTypeLabel(data.media.type)} teaching on DhammaStream."
	/>
</svelte:head>

<!-- Media Detail Section -->
<section class="media-detail">
	<div class="container">
		<!-- Breadcrumb -->
		<nav class="breadcrumb">
			<a href={base + '/'}>Home</a>
			<span class="breadcrumb-sep">/</span>
			<a href={base + '/browse'}>Browse</a>
			<span class="breadcrumb-sep">/</span>
			<a href={base + '/browse?type=' + data.media.type}>{getTypeLabel(data.media.type)}</a>
			<span class="breadcrumb-sep">/</span>
			<span class="breadcrumb-current">{data.media.title.slice(0, 30)}...</span>
		</nav>

		<div class="media-layout">
			<!-- Main Content -->
			<div class="media-main">
				<!-- Player Card -->
				<div class="player-card" style="--type-color: {getTypeColor(data.media.type)}">
					<div class="player-icon-wrapper">
						{#if data.media.type === 'audio'}
							<svg
								class="player-icon"
								width="64"
								height="64"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.5"
							>
								<path d="M9 18V5l12-2v13" />
								<circle cx="6" cy="18" r="3" />
								<circle cx="18" cy="16" r="3" />
							</svg>
						{:else if data.media.type === 'video'}
							<svg
								class="player-icon"
								width="64"
								height="64"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.5"
							>
								<rect x="2" y="6" width="20" height="12" rx="2" />
								<path d="m10 9 5 3-5 3V9z" />
							</svg>
						{:else}
							<svg
								class="player-icon"
								width="64"
								height="64"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.5"
							>
								<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
								<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
							</svg>
						{/if}
					</div>

					<div class="player-content">
						<span class="media-type-badge">{getTypeLabel(data.media.type)}</span>
						<h1 class="media-title">{data.media.title}</h1>
						{#if data.media.title_myanmar}
							<p class="media-title-mm myanmar-text">{data.media.title_myanmar}</p>
						{/if}
					</div>

					<!-- Action Button -->
					<a href={data.media.url} target="_blank" rel="noopener noreferrer" class="play-button">
						{#if data.media.type === 'audio'}
							<svg
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
							>
								<polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
							</svg>
							Listen Now
						{:else if data.media.type === 'video'}
							<svg
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
							>
								<polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
							</svg>
							Watch Now
						{:else}
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
							Download
						{/if}
					</a>
				</div>

				<!-- Description -->
				{#if data.media.description}
					<div class="description-card">
						<h2 class="card-title">Description</h2>
						<p class="description-text">{data.media.description}</p>
					</div>
				{/if}
			</div>

			<!-- Sidebar -->
			<aside class="media-sidebar">
				<!-- Info Card -->
				<div class="info-card">
					<h2 class="card-title">Details</h2>
					<ul class="info-list">
						{#if data.teacher}
							<li class="info-item">
								<span class="info-label">Teacher</span>
								<a href={base + '/teachers/' + data.teacher.id} class="info-value link">
									{data.teacher.name}
									{#if data.teacher.name_myanmar}
										<span class="myanmar-text">({data.teacher.name_myanmar})</span>
									{/if}
								</a>
							</li>
						{/if}
						<li class="info-item">
							<span class="info-label">Type</span>
							<span class="info-value">{getTypeLabel(data.media.type)}</span>
						</li>
						<li class="info-item">
							<span class="info-label">Language</span>
							<span class="info-value capitalize">{data.media.language}</span>
						</li>
						{#if data.media.format}
							<li class="info-item">
								<span class="info-label">Format</span>
								<span class="info-value uppercase">{data.media.format}</span>
							</li>
						{/if}
						{#if data.media.duration}
							<li class="info-item">
								<span class="info-label">Duration</span>
								<span class="info-value">{data.media.duration}</span>
							</li>
						{/if}
						{#if data.media.date_recorded}
							<li class="info-item">
								<span class="info-label">Date</span>
								<span class="info-value">{data.media.date_recorded}</span>
							</li>
						{/if}
						{#if data.media.location}
							<li class="info-item">
								<span class="info-label">Location</span>
								<span class="info-value">{data.media.location}</span>
							</li>
						{/if}
					</ul>
				</div>

				<!-- Quick Links -->
				<div class="quick-links">
					<a href={base + '/browse?type=' + data.media.type} class="quick-link">
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<path d="M5 12h14M12 5l7 7-7 7" />
						</svg>
						More {getTypeLabel(data.media.type)} Content
					</a>
					<a href={base + '/browse?language=' + data.media.language} class="quick-link">
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<path d="M5 12h14M12 5l7 7-7 7" />
						</svg>
						More in {data.media.language === 'myanmar' ? 'Myanmar' : 'English'}
					</a>
				</div>
			</aside>
		</div>
	</div>
</section>

<!-- Related Content -->
{#if data.relatedMedia.length > 0}
	<section class="related-section">
		<div class="container">
			<h2 class="section-title">Related Teachings</h2>
			<div class="media-grid">
				{#each data.relatedMedia as media, i}
					<div class="animate-scale-in stagger-{i + 1}">
						<MediaCard {media} />
					</div>
				{/each}
			</div>
		</div>
	</section>
{/if}

<style>
	/* Media Detail */
	.media-detail {
		padding: 2rem 0 3rem;
	}

	/* Breadcrumb */
	.breadcrumb {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.85rem;
		margin-bottom: 2rem;
		flex-wrap: wrap;
	}

	.breadcrumb a {
		color: var(--color-text-muted);
		transition: color var(--transition-fast);
	}

	.breadcrumb a:hover {
		color: var(--color-accent);
	}

	.breadcrumb-sep {
		color: var(--color-border);
	}

	.breadcrumb-current {
		color: var(--color-text-secondary);
	}

	/* Layout */
	.media-layout {
		display: grid;
		gap: 2rem;
	}

	@media (min-width: 1024px) {
		.media-layout {
			grid-template-columns: 1fr 340px;
			gap: 2.5rem;
		}
	}

	/* Player Card */
	.player-card {
		background: var(--color-surface);
		border: 1px solid var(--color-border-light);
		border-radius: 20px;
		padding: 2.5rem;
		text-align: center;
		box-shadow: var(--shadow-sm);
	}

	.player-icon-wrapper {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 120px;
		height: 120px;
		border-radius: 50%;
		background: color-mix(in srgb, var(--type-color) 10%, transparent);
		margin-bottom: 1.5rem;
	}

	.player-icon {
		color: var(--type-color);
	}

	.player-content {
		margin-bottom: 2rem;
	}

	.media-type-badge {
		display: inline-block;
		padding: 0.35rem 0.75rem;
		background: color-mix(in srgb, var(--type-color) 10%, transparent);
		color: var(--type-color);
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		border-radius: 6px;
		margin-bottom: 1rem;
	}

	.media-title {
		font-family: var(--font-display);
		font-size: clamp(1.5rem, 4vw, 2rem);
		font-weight: 500;
		line-height: 1.3;
		margin: 0;
	}

	.media-title-mm {
		font-size: 1.1rem;
		color: var(--color-text-muted);
		margin-top: 0.5rem;
	}

	.play-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 1rem 2.5rem;
		background: var(--type-color);
		color: white;
		font-size: 1rem;
		font-weight: 600;
		border-radius: 100px;
		transition: all var(--transition-fast);
		box-shadow: 0 4px 16px color-mix(in srgb, var(--type-color) 30%, transparent);
	}

	.play-button:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 24px color-mix(in srgb, var(--type-color) 40%, transparent);
	}

	/* Description Card */
	.description-card {
		margin-top: 1.5rem;
		padding: 1.5rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border-light);
		border-radius: 16px;
	}

	.card-title {
		font-family: var(--font-body);
		font-size: 0.85rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-muted);
		margin-bottom: 1rem;
	}

	.description-text {
		font-size: 0.95rem;
		color: var(--color-text-secondary);
		line-height: 1.8;
	}

	/* Info Card */
	.info-card {
		padding: 1.5rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border-light);
		border-radius: 16px;
	}

	.info-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.info-item {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		padding: 0.75rem 0;
		border-bottom: 1px solid var(--color-border-light);
	}

	.info-item:last-child {
		border-bottom: none;
	}

	.info-label {
		font-size: 0.85rem;
		color: var(--color-text-muted);
		flex-shrink: 0;
	}

	.info-value {
		font-size: 0.9rem;
		color: var(--color-text-primary);
		text-align: right;
		font-weight: 500;
	}

	.info-value.link {
		color: var(--color-accent);
		transition: color var(--transition-fast);
	}

	.info-value.link:hover {
		color: var(--color-accent-dark);
	}

	.capitalize {
		text-transform: capitalize;
	}

	.uppercase {
		text-transform: uppercase;
	}

	/* Quick Links */
	.quick-links {
		margin-top: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.quick-link {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.875rem 1rem;
		background: var(--color-bg-secondary);
		border-radius: 10px;
		font-size: 0.9rem;
		color: var(--color-text-secondary);
		transition: all var(--transition-fast);
	}

	.quick-link:hover {
		background: var(--color-accent-muted);
		color: var(--color-accent);
	}

	.quick-link svg {
		transition: transform var(--transition-fast);
	}

	.quick-link:hover svg {
		transform: translateX(4px);
	}

	/* Related Section */
	.related-section {
		padding: 3rem 0 5rem;
		background: var(--color-bg-secondary);
	}

	.section-title {
		font-family: var(--font-display);
		font-size: 1.5rem;
		font-weight: 500;
		margin-bottom: 2rem;
	}

	.media-grid {
		display: grid;
		grid-template-columns: repeat(1, 1fr);
		gap: 1rem;
	}

	@media (min-width: 640px) {
		.media-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: 1.25rem;
		}
	}

	@media (min-width: 1024px) {
		.media-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}
</style>
