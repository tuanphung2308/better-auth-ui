export const socialProviders = [
    {
        "provider": "apple",
        "name": "Apple",
        "icon": "fa-brands:apple"
    },
    {
        "provider": "discord",
        "name": "Discord",
        "icon": "fa-brands:discord"
    },
    {
        "provider": "facebook",
        "name": "Facebook",
        "icon": "fa-brands:facebook"
    },
    {
        "provider": "github",
        "name": "GitHub",
        "icon": "fa-brands:github"
    },
    {
        "provider": "google",
        "name": "Google",
        "icon": "fa-brands:google"
    },
    {
        "provider": "microsoft",
        "name": "Microsoft",
        "icon": "fa-brands:microsoft"
    },
    {
        "provider": "twitch",
        "name": "Twitch",
        "icon": "fa-brands:twitch"
    },
    {
        "provider": "twitter",
        "name": "Twitter (X)",
        "icon": "fa-brands:twitter"
    },
    {
        "provider": "dropbox",
        "name": "Dropbox",
        "icon": "fa-brands:dropbox"
    },
    {
        "provider": "linkedin",
        "name": "LinkedIn",
        "icon": "fa-brands:linkedin"
    },
    {
        "provider": "gitlab",
        "name": "GitLab",
        "icon": "fa-brands:gitlab"
    },
    {
        "provider": "reddit",
        "name": "Reddit",
        "icon": "fa-brands:reddit"
    }
] as const

export type SocialProvider = typeof socialProviders[number]["provider"]