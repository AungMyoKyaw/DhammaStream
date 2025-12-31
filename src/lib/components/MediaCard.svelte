<script lang="ts">
	import type { Media } from '$lib/server/db';
	import { resolve } from '$app/paths';

	interface Props {
		media: Media;
		compact?: boolean;
	}

	let { media, compact = false }: Props = $props();

	// Format duration if available
	function formatDuration(duration: string | null): string {
		if (!duration) return '';
		return duration;
	}

	// Get type label
	function getTypeLabel(type: string): string {
		return type.charAt(0).toUpperCase() + type.slice(1);
	}
</script>

<a
	href={resolve('/media/' + media.id)}
	class="media-card media-{media.type} card-hover"
	class:compact
>
	<!-- Media Type Badge -->
	<div class="media-badge">
		{#if media.type === 'audio'}
			<svg
				width="14"
				height="14"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
			>
				<path d="M9 18V5l12-2v13" />
				<circle cx="6" cy="18" r="3" />
				<circle cx="18" cy="16" r="3" />
			</svg>
		{:else if media.type === 'video'}
			<svg
				width="14"
				height="14"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
			>
				<rect x="2" y="6" width="20" height="12" rx="2" />
				<path d="m10 9 5 3-5 3V9z" />
			</svg>
		{:else}
			<svg
				width="14"
				height="14"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
			>
				<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
				<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
			</svg>
		{/if}
		<span>{getTypeLabel(media.type)}</span>
	</div>

	<!-- Content -->
	<div class="media-content">
		<h3 class="media-title">{media.title}</h3>
		{#if media.title_myanmar}
			<p class="media-title-mm myanmar-text">{media.title_myanmar}</p>
		{/if}

		{#if media.teacher_name || media.teacher_name_myanmar}
			<div class="media-teacher">
				<svg
					width="12"
					height="12"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
					<circle cx="12" cy="7" r="4" />
				</svg>
				<span>
					{media.teacher_name || ''}
					{#if media.teacher_name_myanmar}
						<span class="myanmar-text"> ({media.teacher_name_myanmar})</span>
					{/if}
				</span>
			</div>
		{/if}
	</div>

	<!-- Footer -->
	<div class="media-footer">
		{#if media.duration}
			<span class="media-duration">
				<svg
					width="12"
					height="12"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<circle cx="12" cy="12" r="10" />
					<path d="M12 6v6l4 2" />
				</svg>
				{formatDuration(media.duration)}
			</span>
		{/if}
		<span class="media-language">{media.language}</span>
	</div>

	<!-- Hover Arrow -->
	<div class="media-arrow">
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
	</div>
</a>

<style>
	.media-card {
		position: relative;
		display: flex;
		flex-direction: column;
		padding: 1.25rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border-light);
		border-radius: 14px;
		box-shadow: var(--shadow-sm);
		min-height: 160px;
		overflow: hidden;
	}

	.media-card:hover {
		border-color: var(--media-color, var(--color-accent));
	}

	.media-card.compact {
		min-height: auto;
		padding: 1rem;
	}

	/* Type Badges */
	.media-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.35rem 0.65rem;
		border-radius: 6px;
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		margin-bottom: 0.75rem;
		width: fit-content;
	}

	.media-audio .media-badge {
		background: rgba(107, 142, 122, 0.1);
		color: var(--color-audio);
	}

	.media-video .media-badge {
		background: rgba(139, 107, 142, 0.1);
		color: var(--color-video);
	}

	.media-ebook .media-badge {
		background: rgba(142, 122, 107, 0.1);
		color: var(--color-ebook);
	}

	/* Content */
	.media-content {
		flex: 1;
	}

	.media-title {
		font-family: var(--font-display);
		font-size: 1rem;
		font-weight: 500;
		line-height: 1.4;
		color: var(--color-text-primary);
		margin: 0 0 0.35rem;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.media-title-mm {
		font-size: 0.8rem;
		color: var(--color-text-muted);
		margin-bottom: 0.5rem;
		line-height: 1.5;
		display: -webkit-box;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.media-teacher {
		display: flex;
		align-items: flex-start;
		gap: 0.35rem;
		font-size: 0.8rem;
		color: var(--color-text-secondary);
		line-height: 1.4;
	}

	.media-teacher svg {
		flex-shrink: 0;
		margin-top: 2px;
		color: var(--color-text-muted);
	}

	/* Footer */
	.media-footer {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-top: 0.75rem;
		padding-top: 0.75rem;
		border-top: 1px solid var(--color-border-light);
	}

	.media-duration {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}

	.media-language {
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--color-text-muted);
		background: var(--color-bg-secondary);
		padding: 0.2rem 0.5rem;
		border-radius: 4px;
	}

	/* Hover Arrow */
	.media-arrow {
		position: absolute;
		right: 1rem;
		bottom: 1rem;
		opacity: 0;
		transform: translateX(-8px);
		color: var(--media-color, var(--color-accent));
		transition: all var(--transition-fast);
	}

	.media-card:hover .media-arrow {
		opacity: 1;
		transform: translateX(0);
	}
</style>
