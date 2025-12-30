<script lang="ts">
	import type { Teacher } from '$lib/server/db';

	interface Props {
		teacher: Teacher;
	}

	let { teacher }: Props = $props();

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

<a href="/teachers/{teacher.id}" class="teacher-card card-hover">
	<div class="teacher-avatar" style="--avatar-color: {getAvatarColor(teacher.name)}">
		{#if teacher.image_url}
			<img src={teacher.image_url} alt={teacher.name} class="avatar-image" />
		{:else}
			<span class="avatar-initials">{getInitials(teacher.name)}</span>
		{/if}
	</div>
	<div class="teacher-info">
		<h3 class="teacher-name">{teacher.name}</h3>
		{#if teacher.name_myanmar}
			<p class="teacher-name-mm myanmar-text">{teacher.name_myanmar}</p>
		{/if}
		{#if teacher.media_count && teacher.media_count > 0}
			<div class="teacher-stats">
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M9 18V5l12-2v13" />
					<circle cx="6" cy="18" r="3" />
					<circle cx="18" cy="16" r="3" />
				</svg>
				<span>{teacher.media_count.toLocaleString()} teachings</span>
			</div>
		{/if}
	</div>
</a>

<style>
	.teacher-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 1.5rem 1rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border-light);
		border-radius: 16px;
		box-shadow: var(--shadow-sm);
	}

	.teacher-avatar {
		position: relative;
		width: 72px;
		height: 72px;
		border-radius: 50%;
		background: var(--avatar-color);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 1rem;
		overflow: hidden;
		transition: transform var(--transition-base);
	}

	.teacher-card:hover .teacher-avatar {
		transform: scale(1.05);
	}

	.avatar-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.avatar-initials {
		font-family: var(--font-display);
		font-size: 1.5rem;
		font-weight: 600;
		color: white;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
	}

	.teacher-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.teacher-name {
		font-family: var(--font-display);
		font-size: 1rem;
		font-weight: 500;
		color: var(--color-text-primary);
		margin: 0;
		line-height: 1.3;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.teacher-name-mm {
		font-size: 0.8rem;
		color: var(--color-text-muted);
		margin-top: 0.25rem;
		line-height: 1.4;
		display: -webkit-box;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.teacher-stats {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.35rem;
		margin-top: 0.75rem;
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}

	.teacher-stats svg {
		color: var(--color-accent);
	}
</style>
