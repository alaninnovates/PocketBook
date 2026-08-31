export function redirectSystemPath({
                                       path,
                                   }: {
    path: string
    initial: boolean
}) {
    try {
        const url = new URL(path)

        if (
            url.protocol === 'pocketbook:' &&
            ['discord-auth', 'google-auth', 'apple-auth'].includes(
                url.hostname
            )
        ) {
            return '/'
        }
    } catch {
    }

    return path
}