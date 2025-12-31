<script lang="ts">
	import type { PageData } from './$types';
	import MediaCard from '$lib/components/MediaCard.svelte';

	let { data }: { data: PageData } = $props();

	// Filter and pagination states
	let selectedType = $state('all');
	let selectedLanguage = $state('all');
	let currentPage = $state(1);
	const itemsPerPage = 24;

	// Client-side filtering
	let filteredMedia = $derived(() => {
		let result = data.media;

		if (selectedType !== 'all') {
			result = result.filter((m) => m.type === selectedType);
		}

		if (selectedLanguage !== 'all') {
			result = result.filter((m) => m.language === selectedLanguage);
		}

		return result;
	});

	// Client-side pagination
	let paginatedMedia = $derived(() => {
		const filtered = filteredMedia();
		const start = (currentPage - 1) * itemsPerPage;
		const end = start + itemsPerPage;
		return filtered.slice(start, end);
	});

	let totalPages = $derived(Math.ceil(filteredMedia().length / itemsPerPage));
	let filteredTotal = $derived(filteredMedia().length);

	// Apply filters
	function applyFilters() {
		currentPage = 1; // Reset to first page when filtering
	}

	// Clear filters
	function clearFilters() {
		selectedType = 'all';
		selectedLanguage = 'all';
		currentPage = 1;
	}

	// Pagination
	function goToPage(pageNum: number) {
		currentPage = pageNum;
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	// Get page title based on filters
	function getPageTitle(): string {
		const parts = [];
		if (selectedType && selectedType !== 'all') {
			parts.push(
				selectedType === 'audio' ? 'Audio' : selectedType === 'video' ? 'Video' : 'E-Books'
			);
		}
		if (selectedLanguage && selectedLanguage !== 'all') {
			parts.push(selectedLanguage === 'myanmar' ? 'Myanmar' : 'English');
		}
		if (parts.length === 0) return 'All Teachings';
		return `${parts.join(' ')} Teachings`;
	}
</script>

<svelte:head>
	<title>{getPageTitle()} | DhammaStream</title>
	<meta
		name="description"
		content="Browse {data.total.toLocaleString()} Buddhist teachings on DhammaStream. Filter by type and language."
	/>
</svelte:head>

<!-- Hero Section -->
<section class="page-hero">
	<div class="hero-background">
		<div class="hero-gradient"></div>
		<div class="hero-pattern"></div>
	</div>
	<div class="hero-content container">
		<div class="hero-text">
			<h1 class="hero-title">{getPageTitle()}</h1>
			<p class="hero-subtitle myanmar-text">တရားတော်များ ရှာဖွေရန်</p>
			<p class="hero-description">
				Explore our collection of {data.stats.totalMedia.toLocaleString()} teachings from venerable teachers.
				Filter by content type and language to find exactly what you're looking for.
			</p>
		</div>
	</div>
</section>

<!-- Filters Section -->
<section class="filters-section">
	<div class="container">
		<div class="filters-grid">
			<!-- Type Filter -->
			<div class="filter-group">
				<label class="filter-label" for="type-filter">Content Type</label>
				<select
					id="type-filter"
					class="filter-select"
					bind:value={selectedType}
					onchange={applyFilters}
				>
					<option value="all">All Types</option>
					<option value="audio">Audio ({data.stats.totalAudio.toLocaleString()})</option>
					<option value="video">Video ({data.stats.totalVideo.toLocaleString()})</option>
					<option value="ebook">E-Books ({data.stats.totalEbooks.toLocaleString()})</option>
				</select>
			</div>

			<!-- Language Filter -->
			<div class="filter-group">
				<label class="filter-label" for="language-filter">Language</label>
				<select
					id="language-filter"
					class="filter-select"
					bind:value={selectedLanguage}
					onchange={applyFilters}
				>
					<option value="all">All Languages</option>
					<option value="myanmar"
						>Myanmar ({data.stats.totalMyanmarContent.toLocaleString()})</option
					>
					<option value="english"
						>English ({data.stats.totalEnglishContent.toLocaleString()})</option
					>
				</select>
			</div>

			<!-- Clear Filters -->
			{#if (selectedType && selectedType !== 'all') || (selectedLanguage && selectedLanguage !== 'all')}
				<button class="clear-filters-btn" onclick={clearFilters}>
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<path d="M18 6L6 18M6 6l12 12" />
					</svg>
					Clear Filters
				</button>
			{/if}
		</div>

		<!-- Results Count -->
		<div class="results-info">
			<span class="results-count">
				Showing <strong>{paginatedMedia().length}</strong> of
				<strong>{filteredTotal.toLocaleString()}</strong> teachings
			</span>
			{#if totalPages > 1}
				<span class="page-info">Page {currentPage} of {totalPages}</span>
			{/if}
		</div>
	</div>
</section>

<!-- Content Section -->
<section class="content-section">
	<div class="container">
		{#if paginatedMedia().length > 0}
			<div class="media-grid">
				{#each paginatedMedia() as media (media.id)}
					<div class="animate-scale-in stagger-{(paginatedMedia().indexOf(media) % 8) + 1}">
						<MediaCard {media} />
					</div>
				{/each}
			</div>

			<!-- Pagination -->
			{#if totalPages > 1}
				<nav class="pagination" aria-label="Pagination">
					<button
						class="pagination-btn prev"
						disabled={currentPage <= 1}
						onclick={() => goToPage(currentPage - 1)}
					>
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<path d="M15 18l-6-6 6-6" />
						</svg>
						Previous
					</button>

					<div class="pagination-numbers">
						{#if currentPage > 3}
							<button class="pagination-num" onclick={() => goToPage(1)}>1</button>
							{#if currentPage > 4}
								<span class="pagination-ellipsis">...</span>
							{/if}
						{/if}

						{#each Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
							const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
							return start + i;
						}).filter((p) => p >= 1 && p <= totalPages) as pageNum (pageNum)}
							<button
								class="pagination-num"
								class:active={pageNum === currentPage}
								onclick={() => goToPage(pageNum)}
							>
								{pageNum}
							</button>
						{/each}

						{#if currentPage < totalPages - 2}
							{#if currentPage < totalPages - 3}
								<span class="pagination-ellipsis">...</span>
							{/if}
							<button class="pagination-num" onclick={() => goToPage(totalPages)}
								>{totalPages}</button
							>
						{/if}
					</div>

					<button
						class="pagination-btn next"
						disabled={currentPage >= totalPages}
						onclick={() => goToPage(currentPage + 1)}
					>
						Next
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<path d="M9 18l6-6-6-6" />
						</svg>
					</button>
				</nav>
			{/if}
		{:else}
			<div class="empty-state">
				<svg
					width="64"
					height="64"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.5"
				>
					<circle cx="11" cy="11" r="8" />
					<path d="m21 21-4.35-4.35" />
				</svg>
				<h3>No teachings found</h3>
				<p>Try adjusting your filters to see more results</p>
				<button class="btn-primary" onclick={clearFilters}>Clear All Filters</button>
			</div>
		{/if}
	</div>
</section>

<style>
	/* Page Hero */
	.page-hero {
		position: relative;
		padding: 3rem 0 4rem;
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

	.hero-pattern {
		position: absolute;
		inset: 0;
		background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5c-2 8-8 14-16 16 8 2 14 8 16 16 2-8 8-14 16-16-8-2-14-8-16-16z' fill='%23c4883a' fill-opacity='0.04'/%3E%3C/svg%3E");
		opacity: 0.8;
	}

	.hero-content {
		position: relative;
		z-index: 1;
	}

	.hero-text {
		max-width: 700px;
	}

	.hero-title {
		font-family: var(--font-display);
		font-size: clamp(2rem, 5vw, 3rem);
		font-weight: 500;
		margin-bottom: 0.25rem;
	}

	.hero-subtitle {
		font-size: 1.1rem;
		color: var(--color-accent);
		margin-bottom: 1rem;
	}

	.hero-description {
		font-size: 1rem;
		color: var(--color-text-secondary);
		line-height: 1.7;
	}

	/* Filters Section */
	.filters-section {
		padding: 1.5rem 0;
		background: var(--color-bg-secondary);
		border-bottom: 1px solid var(--color-border-light);
		position: sticky;
		top: var(--nav-height);
		z-index: 50;
	}

	.filters-grid {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		gap: 1rem;
	}

	.filter-group {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.filter-label {
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.filter-select {
		padding: 0.75rem 2.5rem 0.75rem 1rem;
		font-size: 0.9rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 10px;
		color: var(--color-text-primary);
		cursor: pointer;
		appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238a8073' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 1rem center;
		transition: all var(--transition-fast);
		min-width: 180px;
	}

	.filter-select:focus {
		outline: none;
		border-color: var(--color-accent);
	}

	.clear-filters-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.75rem 1rem;
		font-size: 0.85rem;
		font-weight: 500;
		color: var(--color-text-secondary);
		background: transparent;
		border: 1px dashed var(--color-border);
		border-radius: 10px;
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.clear-filters-btn:hover {
		color: var(--color-accent);
		border-color: var(--color-accent);
	}

	.results-info {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		margin-top: 1rem;
		font-size: 0.85rem;
		color: var(--color-text-muted);
	}

	.page-info {
		color: var(--color-accent);
		font-weight: 500;
	}

	/* Content Section */
	.content-section {
		padding: 2rem 0 5rem;
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

	/* Pagination */
	.pagination {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 0.5rem;
		margin-top: 3rem;
		flex-wrap: wrap;
	}

	.pagination-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.75rem 1.25rem;
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--color-text-secondary);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 10px;
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.pagination-btn:hover:not(:disabled) {
		border-color: var(--color-accent);
		color: var(--color-accent);
	}

	.pagination-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.pagination-numbers {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.pagination-num {
		min-width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--color-text-secondary);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.pagination-num:hover {
		border-color: var(--color-accent);
		color: var(--color-accent);
	}

	.pagination-num.active {
		background: var(--color-accent);
		border-color: var(--color-accent);
		color: white;
	}

	.pagination-ellipsis {
		padding: 0 0.5rem;
		color: var(--color-text-muted);
	}

	/* Empty State */
	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
		color: var(--color-text-muted);
	}

	.empty-state svg {
		margin-bottom: 1.5rem;
		opacity: 0.5;
	}

	.empty-state h3 {
		font-family: var(--font-display);
		font-size: 1.25rem;
		color: var(--color-text-primary);
		margin-bottom: 0.5rem;
	}

	.empty-state p {
		margin-bottom: 1.5rem;
	}

	.btn-primary {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.875rem 1.75rem;
		background: var(--color-accent);
		color: white;
		font-weight: 600;
		font-size: 0.95rem;
		border: none;
		border-radius: 10px;
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.btn-primary:hover {
		background: var(--color-accent-dark);
	}
</style>
