<script lang="ts">
	import type { PageData } from './$types';
	import TeacherCard from '$lib/components/TeacherCard.svelte';

	let { data }: { data: PageData } = $props();

	let searchQuery = $state('');
	let sortBy = $state<'name' | 'media'>('media');

	const filteredTeachers = $derived(() => {
		let result = [...data.teachers];

		// Filter by search
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			result = result.filter(
				(t) =>
					t.name.toLowerCase().includes(query) ||
					(t.name_myanmar && t.name_myanmar.toLowerCase().includes(query))
			);
		}

		// Sort
		if (sortBy === 'name') {
			result.sort((a, b) => a.name.localeCompare(b.name));
		} else {
			result.sort((a, b) => (b.media_count || 0) - (a.media_count || 0));
		}

		return result;
	});
</script>

<svelte:head>
	<title>Teachers | DhammaStream</title>
	<meta
		name="description"
		content="Explore teachings from {data.stats.totalTeachers} venerable Buddhist teachers on DhammaStream."
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
			<h1 class="hero-title">Venerable Teachers</h1>
			<p class="hero-subtitle myanmar-text">သာသနာ့ဆရာတော်ကြီးများ</p>
			<p class="hero-description">
				Discover the wisdom of {data.stats.totalTeachers} teachers who have dedicated their lives to
				sharing the Dhamma. Browse their teachings in audio, video, and written formats.
			</p>
		</div>
		<div class="hero-stats">
			<div class="stat-item">
				<span class="stat-number">{data.stats.totalTeachers}</span>
				<span class="stat-label">Teachers</span>
			</div>
			<div class="stat-divider"></div>
			<div class="stat-item">
				<span class="stat-number">{data.stats.totalMedia.toLocaleString()}</span>
				<span class="stat-label">Total Teachings</span>
			</div>
		</div>
	</div>
</section>

<!-- Filters Section -->
<section class="filters-section">
	<div class="container">
		<div class="filters-bar">
			<div class="search-wrapper">
				<svg
					class="search-icon"
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<circle cx="11" cy="11" r="8" />
					<path d="m21 21-4.35-4.35" />
				</svg>
				<input
					type="text"
					placeholder="Search teachers..."
					class="search-input"
					bind:value={searchQuery}
				/>
			</div>
			<div class="sort-wrapper">
				<label class="sort-label" for="sort-select">Sort by:</label>
				<select id="sort-select" class="sort-select" bind:value={sortBy}>
					<option value="media">Most Teachings</option>
					<option value="name">Name (A-Z)</option>
				</select>
			</div>
		</div>
		<div class="results-count">
			Showing <strong>{filteredTeachers().length}</strong> teachers
		</div>
	</div>
</section>

<!-- Teachers Grid -->
<section class="teachers-section">
	<div class="container">
		{#if filteredTeachers().length > 0}
			<div class="teachers-grid">
				{#each filteredTeachers() as teacher, i}
					<div class="animate-scale-in stagger-{(i % 8) + 1}">
						<TeacherCard {teacher} />
					</div>
				{/each}
			</div>
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
				<h3>No teachers found</h3>
				<p>Try adjusting your search terms</p>
				<button class="btn-secondary" onclick={() => (searchQuery = '')}>Clear Search</button>
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
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	@media (min-width: 768px) {
		.hero-content {
			flex-direction: row;
			justify-content: space-between;
			align-items: flex-end;
		}
	}

	.hero-text {
		max-width: 600px;
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

	.hero-stats {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		padding: 1.25rem 2rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border-light);
		border-radius: 16px;
		box-shadow: var(--shadow-sm);
	}

	.stat-item {
		text-align: center;
	}

	.stat-number {
		display: block;
		font-family: var(--font-display);
		font-size: 1.75rem;
		font-weight: 600;
		color: var(--color-text-primary);
		line-height: 1;
	}

	.stat-label {
		font-size: 0.8rem;
		color: var(--color-text-muted);
		margin-top: 0.25rem;
	}

	.stat-divider {
		width: 1px;
		height: 40px;
		background: var(--color-border);
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

	.filters-bar {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	@media (min-width: 640px) {
		.filters-bar {
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
		}
	}

	.search-wrapper {
		position: relative;
		flex: 1;
		max-width: 400px;
	}

	.search-icon {
		position: absolute;
		left: 1rem;
		top: 50%;
		transform: translateY(-50%);
		color: var(--color-text-muted);
		pointer-events: none;
	}

	.search-input {
		width: 100%;
		padding: 0.75rem 1rem 0.75rem 2.75rem;
		font-size: 0.95rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 10px;
		color: var(--color-text-primary);
		transition: all var(--transition-fast);
	}

	.search-input::placeholder {
		color: var(--color-text-muted);
	}

	.search-input:focus {
		outline: none;
		border-color: var(--color-accent);
		box-shadow: 0 0 0 3px var(--color-accent-muted);
	}

	.sort-wrapper {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.sort-label {
		font-size: 0.85rem;
		color: var(--color-text-muted);
	}

	.sort-select {
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
	}

	.sort-select:focus {
		outline: none;
		border-color: var(--color-accent);
	}

	.results-count {
		margin-top: 1rem;
		font-size: 0.85rem;
		color: var(--color-text-muted);
	}

	/* Teachers Section */
	.teachers-section {
		padding: 3rem 0 5rem;
	}

	.teachers-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
	}

	@media (min-width: 640px) {
		.teachers-grid {
			grid-template-columns: repeat(3, 1fr);
			gap: 1.25rem;
		}
	}

	@media (min-width: 1024px) {
		.teachers-grid {
			grid-template-columns: repeat(4, 1fr);
			gap: 1.5rem;
		}
	}

	@media (min-width: 1280px) {
		.teachers-grid {
			grid-template-columns: repeat(5, 1fr);
		}
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

	.btn-secondary {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		color: var(--color-text-primary);
		font-weight: 500;
		font-size: 0.9rem;
		border-radius: 10px;
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.btn-secondary:hover {
		background: var(--color-bg-secondary);
		border-color: var(--color-accent-muted);
	}
</style>
