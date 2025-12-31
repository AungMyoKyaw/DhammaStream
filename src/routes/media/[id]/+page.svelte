<script lang="ts">
	import type { PageData } from './$types';
	import MediaCard from '$lib/components/MediaCard.svelte';
	import MediaPlayer from '$lib/components/MediaPlayer.svelte';
	import { resolve } from '$app/paths';

	let { data }: { data: PageData } = $props();

	function getTypeLabel(type: string): string {
		return type.charAt(0).toUpperCase() + type.slice(1);
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
			<a href={resolve('/')} class="breadcrumb-link">Home</a>
			<a href={resolve('/browse')} class="breadcrumb-link">Browse</a>
			<a href={resolve('/browse?type=' + data.media.type)} class="breadcrumb-link current"
				>{getTypeLabel(data.media.type)}</a
			>
			<span class="breadcrumb-sep">/</span>
			<span class="breadcrumb-current">{data.media.title.slice(0, 30)}...</span>
		</nav>

		<div class="media-layout">
			<!-- Main Content -->
			<div class="media-main">
				<!-- Integrated Media Player -->
				<MediaPlayer media={data.media} />

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
								<a href={resolve('/teachers/' + data.teacher.id)} class="info-value link">
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
					<a href={resolve('/browse?type=' + data.media.type)} class="quick-link">
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
					<a href={resolve('/browse?language=' + data.media.language)} class="quick-link">
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
				{#each data.relatedMedia as media (media.id)}
					<div class="animate-scale-in stagger-{data.relatedMedia.indexOf(media) + 1}">
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
