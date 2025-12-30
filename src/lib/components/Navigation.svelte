<script lang="ts">
	import { page } from '$app/stores';
	import { base } from '$app/paths';

	const navItems = [
		{ href: '/', label: 'Home', labelMm: 'ပင်မစာမျက်နှာ' },
		{ href: '/teachers', label: 'Teachers', labelMm: 'ဆရာတော်များ' },
		{ href: '/browse', label: 'Browse', labelMm: 'ရှာဖွေရန်' }
	];

	let mobileMenuOpen = $state(false);

	function isActive(href: string): boolean {
		const pathname = $page.url.pathname;
		const basePath = $base.replace(/\/$/, '');
		const fullPath = basePath + href;
		
		if (href === '/') {
			return pathname === basePath || pathname === basePath + '/';
		}
		return pathname.startsWith(fullPath);
	}

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}
</script>

<header class="nav-header">
	<nav class="nav-container container">
		<!-- Logo -->
		<a href="{$base}" class="logo-link">
			<div class="logo">
				<svg class="lotus-icon" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path
						d="M20 4C18 12 12 18 4 20C12 22 18 28 20 36C22 28 28 22 36 20C28 18 22 12 20 4Z"
						fill="currentColor"
						opacity="0.9"
					/>
					<circle cx="20" cy="20" r="4" fill="currentColor" opacity="0.4" />
				</svg>
				<div class="logo-text">
					<span class="logo-title">DhammaStream</span>
					<span class="logo-subtitle myanmar-text">ဓမ္မစီးကြောင်း</span>
				</div>
			</div>
		</a>

		<!-- Desktop Navigation -->
		<div class="nav-links">
			{#each navItems as item}
				<a href="{$base + item.href}" class="nav-link" class:active={isActive(item.href)}>
					<span class="nav-link-en">{item.label}</span>
					<span class="nav-link-mm myanmar-text">{item.labelMm}</span>
				</a>
			{/each}
		</div>

		<!-- Stats Badge -->
		<div class="nav-stats">
			<div class="stat-badge">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
				</svg>
				<span>28K+ Teachings</span>
			</div>
		</div>

		<!-- Mobile Menu Button -->
		<button class="mobile-menu-btn" onclick={toggleMobileMenu} aria-label="Toggle menu">
			<svg
				class="menu-icon"
				class:open={mobileMenuOpen}
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
			>
				{#if mobileMenuOpen}
					<path d="M18 6L6 18M6 6l12 12" />
				{:else}
					<path d="M3 12h18M3 6h18M3 18h18" />
				{/if}
			</svg>
		</button>
	</nav>

	<!-- Mobile Menu -->
	{#if mobileMenuOpen}
		<div class="mobile-menu animate-slide-down">
			{#each navItems as item, i}
				<a
					href={$base + item.href}
					class="mobile-nav-link stagger-{i + 1}"
					class:active={isActive(item.href)}
					onclick={() => (mobileMenuOpen = false)}
				>
					<span class="mobile-link-en">{item.label}</span>
					<span class="mobile-link-mm myanmar-text">{item.labelMm}</span>
				</a>
			{/each}
		</div>
	{/if}
</header>

<style>
	.nav-header {
		position: sticky;
		top: 0;
		z-index: 100;
		background: rgba(250, 248, 245, 0.85);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		border-bottom: 1px solid var(--color-border-light);
	}

	.nav-container {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: var(--nav-height);
		gap: 2rem;
	}

	.logo-link {
		flex-shrink: 0;
	}

	.logo {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.lotus-icon {
		width: 36px;
		height: 36px;
		color: var(--color-accent);
		transition: transform var(--transition-base);
	}

	.logo:hover .lotus-icon {
		transform: rotate(45deg);
	}

	.logo-text {
		display: flex;
		flex-direction: column;
		line-height: 1.1;
	}

	.logo-title {
		font-family: var(--font-display);
		font-size: 1.35rem;
		font-weight: 600;
		color: var(--color-text-primary);
		letter-spacing: -0.02em;
	}

	.logo-subtitle {
		font-size: 0.75rem;
		color: var(--color-text-muted);
		letter-spacing: 0.02em;
	}

	.nav-links {
		display: none;
		align-items: center;
		gap: 0.5rem;
	}

	@media (min-width: 768px) {
		.nav-links {
			display: flex;
		}
	}

	.nav-link {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0.5rem 1rem;
		border-radius: 8px;
		transition: all var(--transition-fast);
		text-align: center;
	}

	.nav-link:hover {
		background: var(--color-bg-secondary);
	}

	.nav-link.active {
		background: var(--color-accent-muted);
	}

	.nav-link-en {
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--color-text-primary);
	}

	.nav-link-mm {
		font-size: 0.7rem;
		color: var(--color-text-muted);
	}

	.nav-link.active .nav-link-en {
		color: var(--color-accent-dark);
	}

	.nav-stats {
		display: none;
	}

	@media (min-width: 1024px) {
		.nav-stats {
			display: block;
		}
	}

	.stat-badge {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: var(--color-bg-secondary);
		border-radius: 100px;
		font-size: 0.8rem;
		font-weight: 500;
		color: var(--color-text-secondary);
	}

	.stat-badge svg {
		color: var(--color-accent);
	}

	.mobile-menu-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		border-radius: 10px;
		color: var(--color-text-primary);
		transition: background var(--transition-fast);
	}

	.mobile-menu-btn:hover {
		background: var(--color-bg-secondary);
	}

	@media (min-width: 768px) {
		.mobile-menu-btn {
			display: none;
		}
	}

	.menu-icon {
		transition: transform var(--transition-base);
	}

	.menu-icon.open {
		transform: rotate(90deg);
	}

	.mobile-menu {
		position: absolute;
		top: var(--nav-height);
		left: 0;
		right: 0;
		background: var(--color-surface);
		border-bottom: 1px solid var(--color-border);
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		box-shadow: var(--shadow-lg);
	}

	@media (min-width: 768px) {
		.mobile-menu {
			display: none;
		}
	}

	.mobile-nav-link {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.25rem;
		border-radius: 12px;
		transition: all var(--transition-fast);
		opacity: 0;
		animation: slideUp var(--transition-base) ease-out forwards;
	}

	.mobile-nav-link:hover {
		background: var(--color-bg-secondary);
	}

	.mobile-nav-link.active {
		background: var(--color-accent-muted);
	}

	.mobile-link-en {
		font-size: 1.1rem;
		font-weight: 500;
		color: var(--color-text-primary);
	}

	.mobile-link-mm {
		font-size: 0.85rem;
		color: var(--color-text-muted);
	}
</style>
