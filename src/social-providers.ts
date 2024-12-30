export const socialProviders = [
    {
        "provider": "apple",
        "name": "Apple",
        "icon": "mdi:apple"
    },
    {
        "provider": "discord",
        "name": "Discord",
        "icon": "ic:baseline-discord"
    },
    {
        "provider": "facebook",
        "name": "Facebook",
        "icon": "mdi:facebook"
    },
    {
        "provider": "github",
        "name": "GitHub",
        "icon": "mdi:github"
    },
    {
        "provider": "google",
        "name": "Google",
        "icon": "mdi:google"
    },
    {
        "provider": "microsoft",
        "name": "Microsoft",
        "icon": "mdi:microsoft"
    },
    {
        "provider": "twitch",
        "name": "Twitch",
        "icon": "mdi:twitch"
    },
    {
        "provider": "twitter",
        "name": "Twitter (X)",
        "icon": "mdi:twitter"
    },
    {
        "provider": "dropbox",
        "name": "Dropbox",
        "icon": "mdi:dropbox"
    },
    {
        "provider": "linkedin",
        "name": "LinkedIn",
        "icon": "mdi:linkedin"
    },
    {
        "provider": "gitlab",
        "name": "GitLab",
        "icon": "mdi:gitlab"
    },
    {
        "provider": "reddit",
        "name": "Reddit",
        "icon": "mdi:reddit"
    }
] as const

export type SocialProvider = typeof socialProviders[number]["provider"]