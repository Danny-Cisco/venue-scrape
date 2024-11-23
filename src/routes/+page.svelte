<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, SubmitFunction } from './$types.js';

	export let form: ActionData;

	let loading = false;

	const handleSubmit: SubmitFunction = () => {
		loading = true;
		return async ({ update }) => {
			update();
			loading = false;
		};
	};
</script>

<div class="flex flex-col justify-center h-full max-w-md gap-2 mx-auto">
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 424 424"
		width="300"
		height="300"
		fill="none"
		stroke="magenta"
		stroke-width="2"
		><circle cx="17" cy="407" r="15" /><circle cx="32" cy="392" r="30" /><circle
			cx="47"
			cy="377"
			r="45"
		/><circle cx="62" cy="362" r="60" /><circle cx="77" cy="347" r="75" /><circle
			cx="92"
			cy="332"
			r="90"
		/><circle cx="107" cy="317" r="105" /><circle cx="122" cy="302" r="120" /><circle
			cx="137"
			cy="287"
			r="135"
		/><circle cx="152" cy="272" r="150" /><circle cx="167" cy="257" r="165" /><circle
			cx="182"
			cy="242"
			r="180"
		/></svg
	>
	<h1 class="text-5xl text-[magenta]">MindMapr.ai</h1>
	<div class="h-[1rem]"></div>
	<div>
		<h1>Welcome To MindMapr.ai</h1>

		<p>A collection of Ai whiteboard tools for:</p>
		<ul>
			<li>- brainstorming</li>
			<li>- summarising</li>
			<li>- visualisation</li>
		</ul>
		<div class="h-[1rem]"></div>

		<p>Amplify your thoughts in Ai meeting rooms now</p>
	</div>

	<form class="flex row flex-center" method="POST" use:enhance={handleSubmit}>
		<div class="col-6 form-widget">
			<h2 class="header">Sign in via magic link with your email below</h2>
			{#if form?.message !== undefined}
				<div class="success {form?.success ? '' : 'fail'}">
					{form?.message}
				</div>
			{/if}
			<div>
				<label for="email">Email address</label>
				<input
					id="email"
					name="email"
					class="inputField"
					type="email"
					placeholder="Your email"
					value={form?.email ?? ''}
				/>
			</div>
			{#if form?.errors}
				<div class="flex flex-col gap-1 mt-2">
					{#each Object.entries(form.errors) as [key, error]}
						<span class="flex items-center text-sm text-red-500 error">
							{error}
						</span>
					{/each}
				</div>
			{/if}
			<div>
				<button class="block button primary">
					{loading ? 'Loading' : 'Send magic link'}
				</button>
			</div>
		</div>
	</form>
</div>
