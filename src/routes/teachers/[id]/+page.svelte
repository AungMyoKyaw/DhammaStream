<script lang="ts">
	import type { PageData } from './$types';
	import MediaCard from '$lib/components/MediaCard.svelte';
	import { base } from '$app/paths';

	let { data }: { data: PageData } = $props();

	let activeTab = $state<'all' | 'audio' | 'video' | 'ebook'>('all');

	const displayedMedia = $derived(() => {
		switch (activeTab) {
			case 'audio':
				return data.audioMedia;
			case 'video':
				return data.videoMedia;
			case 'ebook':
				return data.ebookMedia;
			default:
				return data.media;
		}
	});

	// Generate avatar initials
	function getInitials(name: string): string {
		return name
			.split(' ')
			.map((word) => word[0])
			.join('')
			.slice(0, 2)
			.toUpperCase();
	}

	// Generate a color based on name
	function getAvatarColor(name: string): string {
		const colors = [
			'#c4883a',
			'#6b8e7a',
			'#8b6b8e',
			'#8e7a6b',
			'#7a8b6b',
			'#6b7a8e',
			'#8e6b7a',
			'#7a6b8e'
		];
		let hash = 0;
		for (let i = 0; i < name.length; i++) {
			hash = name.charCodeAt(i) + ((hash << 5) - hash);
		}
		return colors[Math.abs(hash) % colors.length];
	}
</script>

<svelte:head>
	<title>{data.teacher.name} | DhammaStream</title>
	<meta
		name="description"
		content="Listen to {data.media.length} teachings from {data.teacher.name} on DhammaStream."
	/>
</svelte:head>

<!-- Hero Section -->
<section class="teacher-hero">
	<div class="hero-background">
		<div class="hero-gradient"></div>
	</div>
	<div class="hero-content container">
		<!-- Breadcrumb -->
		<nav class="breadcrumb">
			<a href={base + '/'}>Home</a>
			<span class="breadcrumb-sep">/</span>
			<a href={base + '/teachers'}>Teachers</a>
			<span class="breadcrumb-sep">/</span>
			<span class="breadcrumb-current">{data.teacher.name}</span>
		</nav>

		<div class="teacher-profile">
			<div class="teacher-avatar" style="--avatar-color: {getAvatarColor(data.teacher.name)}">
				{#if data.teacher.image_url}
					<img src={data.teacher.image_url} alt={data.teacher.name} class="avatar-image" />
				{:else}
					<span class="avatar-initials">{getInitials(data.teacher.name)}</span>
				{/if}
			</div>
			<div class="teacher-info">
				<h1 class="teacher-name">{data.teacher.name}</h1>
				{#if data.teacher.name_myanmar}
					<p class="teacher-name-mm myanmar-text">{data.teacher.name_myanmar}</p>
				{/if}
				{#if data.teacher.title}
					<p class="teacher-title">{data.teacher.title}</p>
				{/if}
				{#if data.teacher.description}
					<p class="teacher-description">{data.teacher.description}</p>
				{/if}
			</div>
		</div>

		<!-- Stats -->
		<div class="teacher-stats">
			<div class="stat-item">
				<div class="stat-icon all">
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<path
							d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
						/>
					</svg>
				</div>
				<span class="stat-number">{data.media.length}</span>
				<span class="stat-label">Total</span>
			</div>
			{#if data.audioMedia.length > 0}
				<div class="stat-item">
					<div class="stat-icon audio">
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<path d="M9 18V5l12-2v13" />
							<circle cx="6" cy="18" r="3" />
							<circle cx="18" cy="16" r="3" />
						</svg>
					</div>
					<span class="stat-number">{data.audioMedia.length}</span>
					<span class="stat-label">Audio</span>
				</div>
			{/if}
			{#if data.videoMedia.length > 0}
				<div class="stat-item">
					<div class="stat-icon video">
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<rect x="2" y="6" width="20" height="12" rx="2" />
							<path d="m10 9 5 3-5 3V9z" />
						</svg>
					</div>
					<span class="stat-number">{data.videoMedia.length}</span>
					<span class="stat-label">Video</span>
				</div>
			{/if}
			{#if data.ebookMedia.length > 0}
				<div class="stat-item">
					<div class="stat-icon ebook">
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
							<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
						</svg>
					</div>
					<span class="stat-number">{data.ebookMedia.length}</span>
					<span class="stat-label">E-Books</span>
				</div>
			{/if}
		</div>
	</div>
</section>

<!-- Content Section -->
<section class="content-section">
	<div class="container">
		<!-- Tabs -->
		<div class="tabs-wrapper">
			<div class="tabs">
				<button class="tab" class:active={activeTab === 'all'} onclick={() => (activeTab = 'all')}>
					All ({data.media.length})
				</button>
				{#if data.audioMedia.length > 0}
					<button
						class="tab"
						class:active={activeTab === 'audio'}
						onclick={() => (activeTab = 'audio')}
					>
						Audio ({data.audioMedia.length})
					</button>
				{/if}
				{#if data.videoMedia.length > 0}
					<button
						class="tab"
						class:active={activeTab === 'video'}
						onclick={() => (activeTab = 'video')}
					>
						Video ({data.videoMedia.length})
					</button>
				{/if}
				{#if data.ebookMedia.length > 0}
					<button
						class="tab"
						class:active={activeTab === 'ebook'}
						onclick={() => (activeTab = 'ebook')}
					>
						E-Books ({data.ebookMedia.length})
					</button>
				{/if}
			</div>
		</div>

		<!-- Media Grid -->
		{#if displayedMedia().length > 0}
			<div class="media-grid">
				{#each displayedMedia() as media, i}
					<div class="animate-scale-in stagger-{(i % 8) + 1}">
						<MediaCard {media} />
					</div>
				{/each}
			</div>
		{:else}
			<div class="empty-state">
				<p>No content available in this category.</p>
			</div>
		{/if}
	</div>
</section>

<style>
	/* Teacher Hero */
	.teacher-hero {
		position: relative;
		padding: 2rem 0 3rem;
		overflow: hidden;
	}

	.hero-background {
		position: absolute;
		inset: 0;
		z-index: 0;
	}

	.hero-gradient {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			135deg,
			var(--color-bg) 0%,
			var(--color-accent-muted) 50%,
			var(--color-bg-secondary) 100%
		);
		opacity: 0.5;
	}

	.hero-content {
		position: relative;
		z-index: 1;
	}

	/* Breadcrumb */
	.breadcrumb {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.85rem;
		margin-bottom: 2rem;
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

	/* Teacher Profile */
	.teacher-profile {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	@media (min-width: 768px) {
		.teacher-profile {
			flex-direction: row;
			text-align: left;
			gap: 2rem;
		}
	}

	.teacher-avatar {
		position: relative;
		width: 120px;
		height: 120px;
		border-radius: 50%;
		background: var(--avatar-color);
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		flex-shrink: 0;
		box-shadow: var(--shadow-lg);
	}

	@media (min-width: 768px) {
		.teacher-avatar {
			width: 140px;
			height: 140px;
		}
	}

	.avatar-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.avatar-initials {
		font-family: var(--font-display);
		font-size: 2.5rem;
		font-weight: 600;
		color: white;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.teacher-info {
		flex: 1;
	}

	.teacher-name {
		font-family: var(--font-display);
		font-size: clamp(1.75rem, 4vw, 2.5rem);
		font-weight: 500;
		margin: 0;
		line-height: 1.2;
	}

	.teacher-name-mm {
		font-size: 1.25rem;
		color: var(--color-accent);
		margin-top: 0.25rem;
	}

	.teacher-title {
		font-size: 1rem;
		color: var(--color-text-secondary);
		margin-top: 0.5rem;
	}

	.teacher-description {
		font-size: 0.95rem;
		color: var(--color-text-muted);
		line-height: 1.7;
		margin-top: 0.75rem;
		max-width: 600px;
	}

	/* Teacher Stats */
	.teacher-stats {
		display: flex;
		justify-content: center;
		gap: 1.5rem;
		flex-wrap: wrap;
	}

	@media (min-width: 768px) {
		.teacher-stats {
			justify-content: flex-start;
			gap: 2rem;
		}
	}

	.stat-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 1rem 1.5rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border-light);
		border-radius: 12px;
		min-width: 90px;
	}

	.stat-icon {
		width: 36px;
		height: 36px;
		border-radius: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 0.5rem;
	}

	.stat-icon.all {
		background: var(--color-accent-muted);
		color: var(--color-accent);
	}

	.stat-icon.audio {
		background: rgba(107, 142, 122, 0.1);
		color: var(--color-audio);
	}

	.stat-icon.video {
		background: rgba(139, 107, 142, 0.1);
		color: var(--color-video);
	}

	.stat-icon.ebook {
		background: rgba(142, 122, 107, 0.1);
		color: var(--color-ebook);
	}

	.stat-number {
		font-family: var(--font-display);
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-text-primary);
		line-height: 1;
	}

	.stat-label {
		font-size: 0.75rem;
		color: var(--color-text-muted);
		margin-top: 0.25rem;
	}

	/* Content Section */
	.content-section {
		padding: 2rem 0 5rem;
		background: var(--color-bg-secondary);
		min-height: 50vh;
	}

	/* Tabs */
	.tabs-wrapper {
		margin-bottom: 2rem;
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
	}

	.tabs {
		display: flex;
		gap: 0.5rem;
		min-width: max-content;
		padding-bottom: 0.5rem;
	}

	.tab {
		padding: 0.75rem 1.25rem;
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--color-text-secondary);
		background: var(--color-surface);
		border: 1px solid var(--color-border-light);
		border-radius: 10px;
		cursor: pointer;
		transition: all var(--transition-fast);
		white-space: nowrap;
	}

	.tab:hover {
		border-color: var(--color-accent-muted);
	}

	.tab.active {
		background: var(--color-accent);
		border-color: var(--color-accent);
		color: white;
	}

	/* Media Grid */
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

	@media (min-width: 1280px) {
		.media-grid {
			grid-template-columns: repeat(4, 1fr);
		}
	}

	/* Empty State */
	.empty-state {
		text-align: center;
		padding: 3rem 2rem;
		color: var(--color-text-muted);
	}
</style>
