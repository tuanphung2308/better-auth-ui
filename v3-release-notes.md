# Better Auth UI v3 – Release Notes

This release introduces a new routing and view model that cleanly separates authentication, account, and organization experiences. It also removes legacy components and consolidates logic into focused containers.

## Highlights

- Split view paths and containers
  - authViewPaths (signed-out flows)
  - accountViewPaths (user account settings)
  - organizationViewPaths (org settings/members/api keys)
- New containers
  - AuthView (replaces AuthCard)
  - AccountView (replaces SettingsCards navigation layout; renders account/security/API keys/org list)
  - OrganizationView (org settings/members/API keys with its own navigation)
- Provider updates
  - settings prop renamed to account with basePath default /account
  - Additional authViewPaths, accountViewPaths, organizationViewPaths overrides accepted
  - Back-compat: viewPaths still maps to authViewPaths
- Presentational rename
  - OrganizationView (presentational) → OrganizationCellView

## Breaking Changes

- Removed components
  - AuthCard → use AuthView
  - SettingsCards → use AccountView
- Renamed types
  - AuthCardClassNames → AuthViewClassNames
- Provider API changes
  - settings → account
  - viewPaths is retained but now refers to auth views; use authViewPaths, accountViewPaths, organizationViewPaths for specific sets
- Navigation
  - Account settings navigation moved into AccountView
  - Organization navigation moved into OrganizationView

## New Defaults

- Account routes default to /account (customize via account.basePath)
- Organization routes default to /organization (customize via organization.basePath and organization.slugPaths)

## Deprecations

- viewPaths on the provider is deprecated for non-auth sections; use the new split view paths.

## Migration Summary

- Replace AuthCard with AuthView
- Replace SettingsCards usage with AccountView
- Replace presentational OrganizationView with OrganizationCellView and use new OrganizationView container for org pages
- Update any references to AuthCardClassNames to AuthViewClassNames
- Rename provider prop settings → account; move base path to account.basePath
- Update hardcoded routes to use authViewPaths, accountViewPaths, and organizationViewPaths
