<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { fade, slide } from 'svelte/transition';

	export let data;
	export let form;

	let { session, supabase, profile } = data;
	$: ({ session, supabase, profile } = data);

	let profileForm: HTMLFormElement;
	let loading = false;
	let username: string = profile?.username ?? '';
	let avatarUrl: string = profile?.avatar_url ?? '';
	$: console.log('🚀 ~ username:', username);
	let avatarFile: FileList;
	let uploading = false;
	let uploadError: string | null = null;

	let needsSaving = false;

	$: if (username === profile?.username) {
		needsSaving = false;
	}

	function handleUsernameChange() {
		needsSaving = true;
	}

	async function uploadAvatar() {
		try {
			uploading = true;
			uploadError = null;

			if (!avatarFile?.[0]) {
				throw new Error('Please select an image to upload.');
			}

			const file = avatarFile[0];
			const fileExt = file.name.split('.').pop();
			const fileName = `${session.user.id}-${Math.random()}.${fileExt}`;
			const filePath = `${fileName}`;

			// Upload the file to Supabase storage
			const { error: storageError } = await supabase.storage.from('avatars').upload(filePath, file);

			if (storageError) {
				throw storageError;
			}

			// Get the public URL
			const {
				data: { publicUrl }
			} = supabase.storage.from('avatars').getPublicUrl(filePath);

			// Update the avatar_url in the form input
			avatarUrl = publicUrl;

			// Reset file input
			avatarFile = undefined;
			needsSaving = true;
		} catch (error) {
			uploadError = error instanceof Error ? error.message : 'Error uploading avatar';
			console.error('Upload error:', error);
		} finally {
			uploading = false;
		}
	}

	const handleSubmit: SubmitFunction = () => {
		loading = true;
		return async () => {
			loading = false;
			// Reload the page after the form submission is processed
			window.location.reload();
		};
	};

	const handleSignOut: SubmitFunction = () => {
		loading = true;
		return async ({ update }) => {
			loading = false;
			// Reload the page after the sign-out is processed
			window.location.reload();
		};
	};
</script>

<div class="mx-auto page-center !max-w-sm" in:fade>
	<form
		class="w-full"
		method="post"
		action="?/update"
		use:enhance={handleSubmit}
		bind:this={profileForm}
	>
		<!-- Avatar Upload Section -->
		<div class="flex flex-col items-center gap-2 mb-4">
			<!-- <label class="text-sm font-medium">Profile Picture</label> -->
			<div class="flex items-center gap-4">
				{#if avatarUrl}
					<img src={avatarUrl} alt="Avatar" class="object-cover w-16 h-16 rounded-full" />
				{:else}
					<div class="flex items-center justify-center w-16 h-16 rounded-full">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="size-6"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
							/>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
							/>
						</svg>
					</div>
				{/if}

				<div class="flex flex-col gap-2 text-light">
					<label
						id="UploadLabel"
						for="avatar"
						class="btn"
						class:opacity-50={uploading}
						class:cursor-not-allowed={uploading}
					>
						{uploading ? 'Uploading...' : 'Upload Avatar'}
					</label>
					<input
						type="file"
						id="avatar"
						accept="image/*"
						class="hidden"
						bind:files={avatarFile}
						on:change={uploadAvatar}
					/>
					<input type="text" class="hidden" name="avatarUrl" value={avatarUrl} />

					{#if uploadError}
						<p class="text-sm text-red-600">{uploadError}</p>
					{/if}
				</div>
			</div>
		</div>
		<div class="flex flex-col items-center gap-6">
			<div>
				<p>
					{session.user.email}
				</p>
			</div>
		</div>

		<div class="flex flex-col items-center gap-6 mt-10">
			<div class="flex items-center w-full gap-2 px-4">
				<label for="username">Username</label>
				<input
					id="username"
					name="username"
					type="text"
					bind:value={username}
					on:keydown={handleUsernameChange}
					autocomplete="off"
				/>
			</div>
			{#if needsSaving}
				<button
					type="submit"
					class="w-full gap-2 shadow btn primary"
					disabled={loading || uploading}
					in:slide
					><svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="size-6"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
					</svg>

					{loading ? 'Loading...' : 'Save'}
				</button>
			{/if}
		</div>
	</form>

	<form method="post" action="?/signout" use:enhance={handleSignOut} class="w-full">
		<div class="w-full mt-10">
			<button id="sign-out" class="w-full gap-2 !bg-red-500 shadow btn" disabled={loading}
				><svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="size-6"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636"
					/>
				</svg>
				Logout</button
			>
		</div>
	</form>
</div>

<style>
	label {
		font-weight: 700;
	}

	input {
		border-radius: 8px;
		width: 100%;
		border: none;
	}

	#upload-label {
		border-radius: 9999px;
		width: 100%;

		height: 3rem;
		margin-bottom: 8px;
	}
</style>
