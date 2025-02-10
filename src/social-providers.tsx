import {
    SiApple,
    SiDiscord,
    SiDropbox,
    SiFacebook,
    SiGithub,
    SiGitlab,
    SiGoogle,
    SiReddit,
    SiTwitch,
    SiX
} from "@icons-pack/react-simple-icons"

export const socialProviders = [
    {
        "provider": "apple",
        "name": "Apple",
        "icon": <SiApple />
    },
    {
        "provider": "discord",
        "name": "Discord",
        "icon": <SiDiscord />
    },
    {
        "provider": "facebook",
        "name": "Facebook",
        "icon": <SiFacebook />
    },
    {
        "provider": "github",
        "name": "GitHub",
        "icon": <SiGithub />
    },
    {
        "provider": "google",
        "name": "Google",
        "icon": <SiGoogle />
    },
    {
        "provider": "microsoft",
        "name": "Microsoft",
        "icon": (
            <svg
                height="1em"
                viewBox="0 0 24 24"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M2 3h9v9H2zm9 19H2v-9h9zM21 3v9h-9V3zm0 19h-9v-9h9z"
                    fill="currentColor"
                />
            </svg>
        )
    },
    {
        "provider": "twitch",
        "name": "Twitch",
        "icon": <SiTwitch />
    },
    {
        "provider": "twitter",
        "name": "Twitter (X)",
        "icon": <SiX />
    },
    {
        "provider": "dropbox",
        "name": "Dropbox",
        "icon": <SiDropbox />
    },
    {
        "provider": "linkedin",
        "name": "LinkedIn",
        "icon": (
            <svg
                height="1em"
                viewBox="0 0 24 24"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93zM6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37z"
                    fill="currentColor"
                />
            </svg>
        )
    },
    {
        "provider": "gitlab",
        "name": "GitLab",
        "icon": <SiGitlab />
    },
    {
        "provider": "reddit",
        "name": "Reddit",
        "icon": <SiReddit />
    }
] as const

export type SocialProvider = typeof socialProviders[number]["provider"]