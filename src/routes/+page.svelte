<script lang="ts">
	import type { PageData } from './$types';
	import MediaCard from '$lib/components/MediaCard.svelte';
	import TeacherCard from '$lib/components/TeacherCard.svelte';
	import { base } from '$app/paths';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>DhammaStream | Buddhist Teachings from Venerable Teachers</title>
</svelte:head>

<!-- Hero Section -->
<section class="hero">
	<div class="hero-background">
		<div class="hero-gradient"></div>
		<div class="hero-pattern"></div>
	</div>
	<div class="hero-content container">
		<div class="hero-text animate-slide-up">
			<span class="hero-badge">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<circle cx="12" cy="12" r="10" />
					<path d="M12 6v6l4 2" />
				</svg>
				Stream Anytime, Anywhere
			</span>
			<h1 class="hero-title">
				Discover the Path to
				<span class="text-gradient">Enlightenment</span>
			</h1>
			<p class="hero-subtitle">
				Access thousands of Dhamma teachings from venerable teachers.
				Audio discourses, video lectures, and sacred texts in English and Myanmar.
			</p>
			<p class="hero-subtitle-mm myanmar-text">
				သာသနာ့ဆရာတော်ကြီးများ၏ တရားတော်များကို နာယူလေ့လာပါ။
			</p>
			<div class="hero-actions">
				<a href={base + "/browse"} class="btn-primary">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="11" cy="11" r="8" />
						<path d="m21 21-4.35-4.35" />
					</svg>
					Browse Library
				</a>
				<a href={base + "/teachers"} class="btn-secondary">
					Meet Our Teachers
				</a>
			</div>
		</div>

		<!-- Stats Cards -->
		<div class="hero-stats animate-slide-up stagger-2">
			<div class="stat-card">
				<div class="stat-icon audio">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M9 18V5l12-2v13" />
						<circle cx="6" cy="18" r="3" />
						<circle cx="18" cy="16" r="3" />
					</svg>
				</div>
				<div class="stat-info">
					<span class="stat-number">{data.stats.totalAudio.toLocaleString()}</span>
					<span class="stat-label">Audio Teachings</span>
				</div>
			</div>
			<div class="stat-card">
				<div class="stat-icon video">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<rect x="2" y="6" width="20" height="12" rx="2" />
						<path d="m10 9 5 3-5 3V9z" />
					</svg>
				</div>
				<div class="stat-info">
					<span class="stat-number">{data.stats.totalVideo.toLocaleString()}</span>
					<span class="stat-label">Video Lectures</span>
				</div>
			</div>
			<div class="stat-card">
				<div class="stat-icon ebook">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
						<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
					</svg>
				</div>
				<div class="stat-info">
					<span class="stat-number">{data.stats.totalEbooks.toLocaleString()}</span>
					<span class="stat-label">E-Books & Texts</span>
				</div>
			</div>
			<div class="stat-card">
				<div class="stat-icon teachers">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
						<circle cx="12" cy="7" r="4" />
					</svg>
				</div>
				<div class="stat-info">
					<span class="stat-number">{data.stats.totalTeachers}</span>
					<span class="stat-label">Venerable Teachers</span>
				</div>
			</div>
		</div>
	</div>

	<!-- Decorative Elements -->
	<div class="hero-decoration-left"></div>
	<div class="hero-decoration-right"></div>
</section>

<!-- Featured Teachers Section -->
<section class="section featured-teachers">
	<div class="container">
		<div class="section-header">
			<div class="section-title-group">
				<h2 class="section-title">Venerable Teachers</h2>
				<p class="section-subtitle myanmar-text">သာသနာ့ဆရာတော်ကြီးများ</p>
			</div>
			<a href="/teachers" class="view-all-link">
				View All Teachers
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M5 12h14M12 5l7 7-7 7" />
				</svg>
			</a>
		</div>
		<div class="teachers-grid">
			{#each data.featuredTeachers as teacher, i}
				<div class="animate-scale-in stagger-{i + 1}">
					<TeacherCard {teacher} />
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- Content Types Section -->
<section class="section content-types gradient-accent">
	<div class="container">
		<div class="section-header center">
			<h2 class="section-title">Explore by Content Type</h2>
			<p class="section-description">
				Discover teachings in the format that suits your practice
			</p>
		</div>
		<div class="content-types-grid">
			<a href="/browse?type=audio" class="content-type-card audio">
				<div class="content-type-icon">
					<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<path d="M9 18V5l12-2v13" />
						<circle cx="6" cy="18" r="3" />
						<circle cx="18" cy="16" r="3" />
					</svg>
				</div>
				<h3 class="content-type-title">Audio Teachings</h3>
				<p class="content-type-count">{data.stats.totalAudio.toLocaleString()} recordings</p>
				<p class="content-type-description">
					Dhamma talks, meditation instructions, and chanting from venerable teachers
				</p>
			</a>
			<a href="/browse?type=video" class="content-type-card video">
				<div class="content-type-icon">
					<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<rect x="2" y="6" width="20" height="12" rx="2" />
						<path d="m10 9 5 3-5 3V9z" />
					</svg>
				</div>
				<h3 class="content-type-title">Video Lectures</h3>
				<p class="content-type-count">{data.stats.totalVideo.toLocaleString()} videos</p>
				<p class="content-type-description">
					Visual teachings, retreat recordings, and ceremonial events
				</p>
			</a>
			<a href="/browse?type=ebook" class="content-type-card ebook">
				<div class="content-type-icon">
					<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
						<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
					</svg>
				</div>
				<h3 class="content-type-title">E-Books & Texts</h3>
				<p class="content-type-count">{data.stats.totalEbooks.toLocaleString()} publications</p>
				<p class="content-type-description">
					Sacred texts, commentaries, and written teachings for study
				</p>
			</a>
		</div>
	</div>
</section>

<!-- Recent Additions Section -->
<section class="section recent-additions">
	<div class="container">
		<div class="section-header">
			<div class="section-title-group">
				<h2 class="section-title">Recent Additions</h2>
				<p class="section-subtitle">Latest teachings added to our library</p>
			</div>
			<a href="/browse" class="view-all-link">
				Browse All
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M5 12h14M12 5l7 7-7 7" />
				</svg>
			</a>
		</div>
		<div class="media-grid">
			{#each data.recentMedia as media, i}
				<div class="animate-slide-up stagger-{(i % 6) + 1}">
					<MediaCard {media} />
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- Language Section -->
<section class="section languages">
	<div class="container">
		<div class="languages-grid">
			<a href="/browse?language=myanmar" class="language-card myanmar">
				<div class="language-content">
					<span class="language-label">Myanmar Language</span>
					<h3 class="language-title myanmar-text">မြန်မာဘာသာ</h3>
					<p class="language-count">{data.stats.totalMyanmarContent.toLocaleString()} teachings</p>
				</div>
				<div class="language-arrow">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M5 12h14M12 5l7 7-7 7" />
					</svg>
				</div>
			</a>
			<a href="/browse?language=english" class="language-card english">
				<div class="language-content">
					<span class="language-label">English Language</span>
					<h3 class="language-title">English</h3>
					<p class="language-count">{data.stats.totalEnglishContent.toLocaleString()} teachings</p>
				</div>
				<div class="language-arrow">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M5 12h14M12 5l7 7-7 7" />
					</svg>
				</div>
			</a>
		</div>
	</div>
</section>

<!-- Call to Action -->
<section class="section cta">
	<div class="container">
		<div class="cta-content">
			<div class="cta-decoration">
				<svg width="80" height="80" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path
						d="M20 4C18 12 12 18 4 20C12 22 18 28 20 36C22 28 28 22 36 20C28 18 22 12 20 4Z"
						fill="currentColor"
						opacity="0.15"
					/>
					<circle cx="20" cy="20" r="4" fill="currentColor" opacity="0.1" />
				</svg>
			</div>
			<h2 class="cta-title">Begin Your Journey of Learning</h2>
			<p class="cta-subtitle myanmar-text">သင်၏ တရားအားထုတ်မှုခရီးကို စတင်ပါ</p>
			<p class="cta-description">
				All teachings are freely available for the benefit of all beings.
				May you find peace and wisdom in the Dhamma.
			</p>
			<a href="/browse" class="btn-primary large">
				Start Exploring
			</a>
		</div>
	</div>
</section>

<style>
	/* Hero Section */
	.hero {
		position: relative;
		padding: 4rem 0 5rem;
		overflow: hidden;
	}

	@media (min-width: 768px) {
		.hero {
			padding: 6rem 0 7rem;
		}
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
		opacity: 0.6;
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
		max-width: 720px;
		margin-bottom: 3rem;
	}

	.hero-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 100px;
		font-size: 0.85rem;
		font-weight: 500;
		color: var(--color-text-secondary);
		margin-bottom: 1.5rem;
		box-shadow: var(--shadow-sm);
	}

	.hero-badge svg {
		color: var(--color-accent);
	}

	.hero-title {
		font-family: var(--font-display);
		font-size: clamp(2.5rem, 6vw, 4rem);
		font-weight: 500;
		line-height: 1.1;
		margin-bottom: 1.5rem;
		letter-spacing: -0.03em;
	}

	.hero-subtitle {
		font-size: 1.15rem;
		color: var(--color-text-secondary);
		line-height: 1.7;
		margin-bottom: 0.75rem;
		max-width: 600px;
	}

	.hero-subtitle-mm {
		font-size: 1rem;
		color: var(--color-text-muted);
		margin-bottom: 2rem;
	}

	.hero-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
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
		border-radius: 10px;
		transition: all var(--transition-fast);
		box-shadow: var(--shadow-md);
	}

	.btn-primary:hover {
		background: var(--color-accent-dark);
		transform: translateY(-2px);
		box-shadow: var(--shadow-lg);
	}

	.btn-primary.large {
		padding: 1rem 2rem;
		font-size: 1rem;
	}

	.btn-secondary {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.875rem 1.75rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		color: var(--color-text-primary);
		font-weight: 500;
		font-size: 0.95rem;
		border-radius: 10px;
		transition: all var(--transition-fast);
	}

	.btn-secondary:hover {
		background: var(--color-bg-secondary);
		border-color: var(--color-accent-muted);
	}

	.hero-stats {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
	}

	@media (min-width: 768px) {
		.hero-stats {
			grid-template-columns: repeat(4, 1fr);
			gap: 1.25rem;
		}
	}

	.stat-card {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1.25rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border-light);
		border-radius: 16px;
		box-shadow: var(--shadow-sm);
		transition: all var(--transition-base);
	}

	.stat-card:hover {
		box-shadow: var(--shadow-md);
		transform: translateY(-2px);
	}

	.stat-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 48px;
		height: 48px;
		border-radius: 12px;
		flex-shrink: 0;
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

	.stat-icon.teachers {
		background: var(--color-accent-muted);
		color: var(--color-accent);
	}

	.stat-info {
		display: flex;
		flex-direction: column;
	}

	.stat-number {
		font-family: var(--font-display);
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--color-text-primary);
		line-height: 1.1;
	}

	.stat-label {
		font-size: 0.8rem;
		color: var(--color-text-muted);
		margin-top: 0.25rem;
	}

	.hero-decoration-left,
	.hero-decoration-right {
		position: absolute;
		width: 300px;
		height: 300px;
		border-radius: 50%;
		pointer-events: none;
	}

	.hero-decoration-left {
		top: 10%;
		left: -150px;
		background: radial-gradient(circle, var(--color-accent) 0%, transparent 70%);
		opacity: 0.08;
	}

	.hero-decoration-right {
		bottom: 10%;
		right: -150px;
		background: radial-gradient(circle, var(--color-accent-light) 0%, transparent 70%);
		opacity: 0.1;
	}

	/* Sections */
	.section {
		padding: 4rem 0;
	}

	@media (min-width: 768px) {
		.section {
			padding: 5rem 0;
		}
	}

	.section-header {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-bottom: 2.5rem;
	}

	@media (min-width: 768px) {
		.section-header {
			flex-direction: row;
			justify-content: space-between;
			align-items: flex-end;
		}
	}

	.section-header.center {
		text-align: center;
		align-items: center;
	}

	.section-title {
		font-family: var(--font-display);
		font-size: clamp(1.75rem, 4vw, 2.25rem);
		font-weight: 500;
		margin: 0;
	}

	.section-subtitle {
		font-size: 0.95rem;
		color: var(--color-text-muted);
		margin-top: 0.25rem;
	}

	.section-description {
		font-size: 1rem;
		color: var(--color-text-secondary);
		max-width: 500px;
		margin-top: 0.5rem;
	}

	.view-all-link {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 500;
		color: var(--color-accent);
		transition: gap var(--transition-fast);
	}

	.view-all-link:hover {
		gap: 0.75rem;
	}

	/* Teachers Grid */
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

	/* Content Types */
	.content-types-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.5rem;
	}

	@media (min-width: 768px) {
		.content-types-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.content-type-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 2.5rem 1.5rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border-light);
		border-radius: 20px;
		transition: all var(--transition-base);
	}

	.content-type-card:hover {
		transform: translateY(-4px);
		box-shadow: var(--shadow-lg);
	}

	.content-type-card.audio:hover {
		border-color: var(--color-audio);
	}

	.content-type-card.video:hover {
		border-color: var(--color-video);
	}

	.content-type-card.ebook:hover {
		border-color: var(--color-ebook);
	}

	.content-type-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 80px;
		height: 80px;
		border-radius: 20px;
		margin-bottom: 1.5rem;
	}

	.content-type-card.audio .content-type-icon {
		background: rgba(107, 142, 122, 0.1);
		color: var(--color-audio);
	}

	.content-type-card.video .content-type-icon {
		background: rgba(139, 107, 142, 0.1);
		color: var(--color-video);
	}

	.content-type-card.ebook .content-type-icon {
		background: rgba(142, 122, 107, 0.1);
		color: var(--color-ebook);
	}

	.content-type-title {
		font-family: var(--font-display);
		font-size: 1.35rem;
		font-weight: 500;
		margin-bottom: 0.5rem;
	}

	.content-type-count {
		font-size: 0.85rem;
		color: var(--color-accent);
		font-weight: 600;
		margin-bottom: 0.75rem;
	}

	.content-type-description {
		font-size: 0.9rem;
		color: var(--color-text-muted);
		line-height: 1.6;
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

	/* Language Cards */
	.languages-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.5rem;
	}

	@media (min-width: 768px) {
		.languages-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	.language-card {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 2rem 2.5rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 20px;
		transition: all var(--transition-base);
	}

	.language-card:hover {
		transform: translateX(8px);
		box-shadow: var(--shadow-md);
		border-color: var(--color-accent-muted);
	}

	.language-label {
		font-size: 0.8rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-text-muted);
		display: block;
		margin-bottom: 0.5rem;
	}

	.language-title {
		font-family: var(--font-display);
		font-size: 2rem;
		font-weight: 500;
		margin-bottom: 0.25rem;
	}

	.language-count {
		font-size: 0.9rem;
		color: var(--color-accent);
		font-weight: 500;
	}

	.language-arrow {
		color: var(--color-text-muted);
		transition: transform var(--transition-fast);
	}

	.language-card:hover .language-arrow {
		transform: translateX(4px);
		color: var(--color-accent);
	}

	/* CTA Section */
	.cta {
		background: var(--color-bg-secondary);
	}

	.cta-content {
		position: relative;
		text-align: center;
		max-width: 600px;
		margin: 0 auto;
		padding: 3rem 2rem;
	}

	.cta-decoration {
		position: absolute;
		top: -40px;
		left: 50%;
		transform: translateX(-50%);
		color: var(--color-accent);
	}

	.cta-title {
		font-family: var(--font-display);
		font-size: clamp(1.75rem, 4vw, 2.25rem);
		font-weight: 500;
		margin-bottom: 0.5rem;
	}

	.cta-subtitle {
		font-size: 1.1rem;
		color: var(--color-accent);
		margin-bottom: 1rem;
	}

	.cta-description {
		font-size: 1rem;
		color: var(--color-text-secondary);
		line-height: 1.7;
		margin-bottom: 2rem;
	}
</style>
