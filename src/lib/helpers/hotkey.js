// More flexible configuration
export function createHotkeyEmitter(
	options = {
		keys: ['Alt', 'Shift', 'KeyY'],
		debug: true
	}
) {
	return {
		subscribe(callback) {
			const handler = (event) => {
				const isHotkey = options.keys.every((key) => {
					switch (key) {
						case 'Alt':
							return event.altKey;
						case 'Shift':
							return event.shiftKey;
						default:
							return event.code === key;
					}
				});

				if (isHotkey) {
					if (options.debug) {
						console.log('Hotkey detected:', options.keys.join(' + '));
					}
					callback();
				}
			};

			window.addEventListener('keydown', handler);
			return () => window.removeEventListener('keydown', handler);
		}
	};
}

// Usage:
// const hotkeyEmitter = createHotkeyEmitter({
// 	keys: ['Alt', 'Shift', 'KeyY'],
// 	debug: true
// });
