export const getUserRole = (token) => {
    if (!token) {
        return null;
    }

    try {
        const payload = token.split('.')[1];

        const base64 = payload
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const decodedPayload = JSON.parse(
            atob(base64)
        );

        return decodedPayload.role || null;

    } catch (error) {
        return null;
    }
};