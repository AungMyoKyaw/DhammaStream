<script lang="ts">
	const currentYear = new Date().getFullYear();
</script>

<footer class="footer">
	<div class="footer-content container">
		<!-- Main Footer Grid -->
		<div class="footer-grid">
			<!-- Brand Column -->
			<div class="footer-brand">
				<div class="brand-logo">
					<svg class="lotus-icon" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path
							d="M20 4C18 12 12 18 4 20C12 22 18 28 20 36C22 28 28 22 36 20C28 18 22 12 20 4Z"
							fill="currentColor"
							opacity="0.9"
						/>
						<circle cx="20" cy="20" r="4" fill="currentColor" opacity="0.4" />
					</svg>
					<div class="brand-text">
						<span class="brand-title">DhammaStream</span>
						<span class="brand-subtitle myanmar-text">ဓမ္မစီးကြောင်း</span>
					</div>
				</div>
				<p class="brand-description">
					Preserving and sharing the wisdom of the Buddha's teachings through audio, video, and written
					content from venerable teachers.
				</p>
				<p class="brand-description myanmar-text">
					ဘုရားရှင်၏ တရားတော်များကို သင်္ဂိတင်ထိန်းသိမ်းပြီး မျှဝေခြင်း။
				</p>
			</div>

			<!-- Quick Links -->
			<div class="footer-links">
				<h4 class="footer-heading">Explore</h4>
				<ul class="link-list">
					<li><a href="/teachers">Teachers</a></li>
					<li><a href="/browse?type=audio">Audio Teachings</a></li>
					<li><a href="/browse?type=video">Video Teachings</a></li>
					<li><a href="/browse?type=ebook">E-Books</a></li>
				</ul>
			</div>

			<!-- Languages -->
			<div class="footer-links">
				<h4 class="footer-heading">Languages</h4>
				<ul class="link-list">
					<li><a href="/browse?language=english">English Content</a></li>
					<li><a href="/browse?language=myanmar">Myanmar Content</a></li>
				</ul>
			</div>

			<!-- About -->
			<div class="footer-links">
				<h4 class="footer-heading">About</h4>
				<ul class="link-list">
					<li><span class="info-text">Free Dhamma Resources</span></li>
					<li><span class="info-text">212+ Teachers</span></li>
					<li><span class="info-text">28,000+ Media Files</span></li>
				</ul>
			</div>
		</div>

		<!-- Divider -->
		<div class="footer-divider"></div>

		<!-- Bottom Bar -->
		<div class="footer-bottom">
			<p class="copyright">
				© {currentYear} DhammaStream. For the benefit of all beings.
			</p>
			<p class="blessing myanmar-text">
				သဗ္ဗေ သတ္တာ ဘဝန္တု သုခိတတ္တာ။
			</p>
		</div>
	</div>

	<!-- Decorative Background -->
	<div class="footer-decoration"></div>
</footer>

<style>
	.footer {
		position: relative;
		background: var(--color-bg-secondary);
		border-top: 1px solid var(--color-border-light);
		margin-top: auto;
		overflow: hidden;
	}

	.footer-content {
		position: relative;
		z-index: 1;
		padding: 4rem 1.5rem 2rem;
	}

	@media (min-width: 768px) {
		.footer-content {
			padding: 5rem 2rem 2rem;
		}
	}

	.footer-grid {
		display: grid;
		gap: 2.5rem;
	}

	@media (min-width: 768px) {
		.footer-grid {
			grid-template-columns: 2fr 1fr 1fr 1fr;
			gap: 3rem;
		}
	}

	.footer-brand {
		max-width: 320px;
	}

	.brand-logo {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1.25rem;
	}

	.lotus-icon {
		width: 32px;
		height: 32px;
		color: var(--color-accent);
	}

	.brand-text {
		display: flex;
		flex-direction: column;
		line-height: 1.1;
	}

	.brand-title {
		font-family: var(--font-display);
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.brand-subtitle {
		font-size: 0.7rem;
		color: var(--color-text-muted);
	}

	.brand-description {
		font-size: 0.9rem;
		color: var(--color-text-secondary);
		line-height: 1.7;
		margin-bottom: 0.75rem;
	}

	.footer-links {
		min-width: 120px;
	}

	.footer-heading {
		font-family: var(--font-body);
		font-size: 0.8rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-text-muted);
		margin-bottom: 1rem;
	}

	.link-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.link-list a {
		font-size: 0.9rem;
		color: var(--color-text-secondary);
		transition: color var(--transition-fast);
	}

	.link-list a:hover {
		color: var(--color-accent);
	}

	.info-text {
		font-size: 0.9rem;
		color: var(--color-text-muted);
	}

	.footer-divider {
		height: 1px;
		background: var(--color-border);
		margin: 2.5rem 0 1.5rem;
	}

	.footer-bottom {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		text-align: center;
	}

	@media (min-width: 768px) {
		.footer-bottom {
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
		}
	}

	.copyright {
		font-size: 0.85rem;
		color: var(--color-text-muted);
	}

	.blessing {
		font-size: 0.85rem;
		color: var(--color-accent);
		font-style: italic;
	}

	.footer-decoration {
		position: absolute;
		bottom: 0;
		right: -100px;
		width: 400px;
		height: 400px;
		background: radial-gradient(circle, var(--color-accent-muted) 0%, transparent 70%);
		opacity: 0.3;
		pointer-events: none;
	}
</style>
