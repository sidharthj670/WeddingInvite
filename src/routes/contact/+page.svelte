<script lang="ts">
	import { inView } from '$lib/actions/inView';

	let name = $state('');
	let email = $state('');
	let message = $state('');
	let sent = $state(false);

	function submit(e: Event) {
		e.preventDefault();
		sent = true;
	}
</script>

<svelte:head>
	<title>Contact · Vow & Scroll</title>
	<meta name="description" content="Reach the Vow & Scroll team — we read every message." />
</svelte:head>

<div class="contact">
	<header class="head reveal" use:inView>
		<p class="eyebrow">Contact</p>
		<h1>We’re here for your story.</h1>
		<p class="sub">
			Whether you’re planning a multi-day celebration or a single intimate gathering — write to us. We read
			every note (really).
		</p>
	</header>

	<div class="grid">
		<section class="card reveal reveal-delay-1" use:inView>
			<h2>Write to us</h2>
			<p class="hint">Prefer email? Use this address — we’ll respond as soon as we can.</p>
			<a class="mail" href="mailto:hello@vowandscroll.example">hello@vowandscroll.example</a>
			<p class="tiny">Replace with your real address when you deploy.</p>
		</section>

		<section class="card form-card reveal reveal-delay-2" use:inView>
			<h2>Send a message</h2>
			{#if sent}
				<p class="thanks">
					Thank you — this demo doesn’t send mail yet, but your note would go straight to our inbox. Connect
					the form to your backend or Formspark when you’re ready.
				</p>
			{:else}
				<form onsubmit={submit}>
					<label>
						Name
						<input type="text" bind:value={name} required autocomplete="name" placeholder="Your name" />
					</label>
					<label>
						Email
						<input
							type="email"
							bind:value={email}
							required
							autocomplete="email"
							placeholder="you@example.com"
						/>
					</label>
					<label>
						Message
						<textarea bind:value={message} rows="5" placeholder="Tell us about your wedding…"></textarea>
					</label>
					<button type="submit" class="submit">Send (demo)</button>
				</form>
			{/if}
		</section>
	</div>

	<div class="social-note reveal" use:inView>
		<p>
			Social: YouTube and Instagram links will appear here — add your URLs in the site settings when you deploy.
		</p>
	</div>
</div>

<style>
	.contact {
		max-width: 52rem;
		margin: 0 auto;
		padding: clamp(4rem, 12vw, 7rem) clamp(1.25rem, 4vw, 2rem) 5rem;
	}

	.head {
		margin-bottom: 2.5rem;
		max-width: 36rem;
	}

	.eyebrow {
		font-family: var(--font-ui);
		font-size: 0.72rem;
		letter-spacing: 0.28em;
		text-transform: uppercase;
		color: var(--maroon);
		margin: 0 0 1rem;
	}

	.head h1 {
		font-family: var(--font-display);
		font-size: clamp(2rem, 4vw, 2.75rem);
		margin: 0 0 0.75rem;
		line-height: 1.15;
	}

	.sub {
		margin: 0;
		font-size: 1.1rem;
		line-height: 1.65;
		color: var(--ink-soft);
	}

	.grid {
		display: grid;
		gap: 1.5rem;
	}

	@media (min-width: 800px) {
		.grid {
			grid-template-columns: 1fr 1.2fr;
			align-items: start;
		}
	}

	.card {
		padding: 1.75rem;
		border-radius: 16px;
		background: rgba(255, 252, 248, 0.75);
		border: 1px solid var(--line-gold);
		box-shadow: 0 16px 48px rgba(50, 18, 28, 0.06);
	}

	.card h2 {
		font-family: var(--font-display);
		font-size: 1.35rem;
		margin: 0 0 0.75rem;
	}

	.hint {
		font-size: 0.95rem;
		color: var(--ink-soft);
		margin: 0 0 1rem;
	}

	.mail {
		font-family: var(--font-ui);
		font-weight: 600;
		font-size: 1.05rem;
		display: inline-block;
		margin-bottom: 0.5rem;
	}

	.tiny {
		font-size: 0.8rem;
		opacity: 0.65;
		margin: 0;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		font-family: var(--font-ui);
		font-size: 0.82rem;
		font-weight: 600;
		color: var(--ink);
	}

	input,
	textarea {
		font: inherit;
		padding: 0.55rem 0.65rem;
		border-radius: 8px;
		border: 1px solid var(--line);
		background: #fffdf9;
		color: var(--ink);
	}

	.submit {
		align-self: flex-start;
		font-family: var(--font-ui);
		font-weight: 600;
		padding: 0.65rem 1.25rem;
		border-radius: 999px;
		border: none;
		cursor: pointer;
		background: linear-gradient(145deg, var(--maroon), #8a3348);
		color: #fffaf8;
		margin-top: 0.25rem;
	}

	.thanks {
		margin: 0;
		line-height: 1.65;
		color: var(--ink-soft);
	}

	.social-note {
		margin-top: 2.5rem;
		padding: 1.25rem;
		border-radius: 12px;
		background: rgba(201, 162, 39, 0.1);
		border: 1px solid var(--line-gold);
	}

	.social-note p {
		margin: 0;
		font-size: 0.95rem;
		line-height: 1.6;
		color: var(--ink-soft);
	}
</style>
