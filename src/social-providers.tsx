import {
    AppleIcon,
    DiscordIcon,
    DropboxIcon,
    FacebookIcon,
    GitHubIcon,
    GitLabIcon,
    GoogleIcon,
    LinkedInIcon,
    MicrosoftIcon,
    RedditIcon,
    SpotifyIcon,
    TwitchIcon,
    XIcon
} from "./components/provider-icons"

export const socialProviders = [
    {
        "provider": "apple",
        "name": "Apple",
        "icon": <AppleIcon />
    },
    {
        "provider": "discord",
        "name": "Discord",
        "icon": <DiscordIcon />
    },
    {
        "provider": "facebook",
        "name": "Facebook",
        "icon": <FacebookIcon />
    },
    {
        "provider": "github",
        "name": "GitHub",
        "icon": <GitHubIcon />
    },
    {
        "provider": "google",
        "name": "Google",
        "icon": <GoogleIcon />
    },
    {
        "provider": "microsoft",
        "name": "Microsoft",
        "icon": <MicrosoftIcon />
    },
    {
        "provider": "twitch",
        "name": "Twitch",
        "icon": <TwitchIcon />
    },
    {
        "provider": "twitter",
        "name": "X",
        "icon": <XIcon />
    },
    {
        "provider": "dropbox",
        "name": "Dropbox",
        "icon": <DropboxIcon />
    },
    {
        "provider": "linkedin",
        "name": "LinkedIn",
        "icon": <LinkedInIcon />
    },
    {
        "provider": "gitlab",
        "name": "GitLab",
        "icon": <GitLabIcon />
    },
    {
        "provider": "reddit",
        "name": "Reddit",
        "icon": <RedditIcon />
    },
    {
        "provider": "spotify",
        "name": "Spotify",
        "icon": <SpotifyIcon />
    }
] as const

export type SocialProvider = typeof socialProviders[number]["provider"]