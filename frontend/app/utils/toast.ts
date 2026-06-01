export const toast = {
    success: (message: string) => {
        window.dispatchEvent(new CustomEvent('global-success', { detail: message }));
    },
    error: (message: string) => {
        window.dispatchEvent(new CustomEvent('global-error', { detail: message }));
    },
};
