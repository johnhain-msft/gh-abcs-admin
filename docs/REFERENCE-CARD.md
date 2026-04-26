# Participant Reference Card

Quick-reference guide for GitHub Enterprise Cloud administrators. Keep this card handy during and after the workshop.

## Key URLs

### GitHub Administration

| Resource | URL |
|----------|-----|
| GitHub Enterprise Cloud Docs | `https://docs.github.com/en/enterprise-cloud@latest` |
| Enterprise Settings | `https://github.com/enterprises/YOUR-ENTERPRISE/settings` |
| Organization Settings | `https://github.com/organizations/YOUR-ORG/settings` |
| GitHub Status | `https://www.githubstatus.com/` |
| GitHub Changelog | `https://github.blog/changelog/` |
| GitHub Advisory Database | `https://github.com/advisories` |
| GitHub Support | `https://support.github.com/` |

### Security

| Resource | URL |
|----------|-----|
| Security Overview | `https://github.com/orgs/YOUR-ORG/security` |
| Secret Scanning Alerts | `https://github.com/orgs/YOUR-ORG/security/secret-scanning` |
| Code Scanning Alerts | `https://github.com/orgs/YOUR-ORG/security/code-scanning` |
| Dependabot Alerts | `https://github.com/orgs/YOUR-ORG/security/dependabot` |

### API

| Resource | URL |
|----------|-----|
| REST API Reference | `https://docs.github.com/en/rest` |
| GraphQL API Explorer | `https://docs.github.com/en/graphql/overview/explorer` |
| API Rate Limits | `https://docs.github.com/en/rest/rate-limit` |

## GitHub CLI (`gh`) Quick Reference

### Authentication

```bash
gh auth login                    # Interactive login
gh auth status                   # Check auth status
gh auth token                    # Display current token
```

### Repository Management

```bash
gh repo create ORG/REPO --private          # Create private repo
gh repo list ORG --limit 100               # List org repos
gh repo clone ORG/REPO                     # Clone a repo
gh repo view ORG/REPO --json name,visibility  # View repo details
```

### Organization and User Management

```bash
gh api /orgs/ORG/members --paginate        # List org members
gh api /orgs/ORG/teams --paginate          # List org teams
gh api /orgs/ORG/outside_collaborators     # List outside collaborators
gh api /orgs/ORG/memberships/USER          # Check user membership
```

### Audit Log

```bash
# Search audit log (REST API)
gh api /orgs/ORG/audit-log?phrase=action:org.update_member_repository_permission

# Export recent audit log entries
gh api /orgs/ORG/audit-log --paginate --jq '.[] | [.created_at, .action, .actor] | @tsv'
```

### Security

```bash
# List secret scanning alerts
gh api /orgs/ORG/secret-scanning/alerts --paginate

# List code scanning alerts for a repo
gh api /repos/ORG/REPO/code-scanning/alerts

# List Dependabot alerts for a repo
gh api /repos/ORG/REPO/dependabot/alerts
```

### Rulesets

```bash
# List org rulesets
gh api /orgs/ORG/rulesets

# List repo rulesets
gh api /repos/ORG/REPO/rulesets

# Get ruleset details
gh api /repos/ORG/REPO/rulesets/RULESET_ID
```

## Permission Levels

### Enterprise Roles

| Role | Scope | Key Capabilities |
|------|-------|------------------|
| **Enterprise Owner** | Enterprise | Full control: billing, policies, org management, audit log |
| **Billing Manager** | Enterprise | View and manage billing, payment, licenses |
| **Member** | Enterprise | Default access as defined by enterprise/org policies |

### Organization Roles

| Role | Scope | Key Capabilities |
|------|-------|------------------|
| **Owner** | Organization | Full control: settings, members, teams, billing |
| **Member** | Organization | Access based on base permission + team assignments |
| **Moderator** | Organization | Manage comments, discussions, interactions |
| **Billing Manager** | Organization | View and manage billing only |
| **Security Manager** | Organization | Read access to all repos + manage security alerts |
| **Outside Collaborator** | Repository | Access to specific repos only (not an org member) |

### Repository Permission Levels

| Permission | Read | Triage | Write | Maintain | Admin |
|------------|------|--------|-------|----------|-------|
| View code and issues | ✅ | ✅ | ✅ | ✅ | ✅ |
| Manage issues/PRs | ❌ | ✅ | ✅ | ✅ | ✅ |
| Push code | ❌ | ❌ | ✅ | ✅ | ✅ |
| Manage branches/rulesets | ❌ | ❌ | ❌ | ✅ | ✅ |
| Manage settings | ❌ | ❌ | ❌ | ❌ | ✅ |
| Delete repository | ❌ | ❌ | ❌ | ❌ | ✅ |

## Audit Log

### Common Audit Log Events

| Event | Description |
|-------|-------------|
| `org.update_member_repository_permission` | Base permission changed |
| `org.add_member` | User added to org |
| `org.remove_member` | User removed from org |
| `repo.create` | Repository created |
| `repo.destroy` | Repository deleted |
| `repo.access` | Repository visibility changed |
| `team.add_member` | User added to team |
| `team.remove_member` | User removed from team |
| `protected_branch.create` | Branch protection created |
| `repository_ruleset.create` | Ruleset created |
| `business.set_actions_retention_limit` | Actions retention policy changed |
| `org.enable_two_factor_requirement` | 2FA requirement enabled |
| `org.update_saml_provider_settings` | SAML configuration changed |

### Audit Log Query Cheat Sheet

| Query | Purpose |
|-------|---------|
| `action:org.add_member` | Find when users were added |
| `actor:USERNAME` | Find all actions by a specific user |
| `created:>2024-01-01` | Filter by date |
| `action:repo.create actor:USERNAME` | Who created which repos |
| `action:org.update_member_repository_permission` | Base permission changes |
| `action:protected_branch` | All branch protection changes |
| `action:repository_ruleset` | All ruleset changes |

## Enterprise Policy Inheritance

```text
Enterprise (enforced policies)
  └── Organization (can add, cannot weaken)
        └── Repository (can add, cannot weaken)
              └── Ruleset (most specific rules)
```

Key principle: **Policies cascade downward. Lower levels can add restrictions but cannot remove restrictions set at higher levels.**

## Copilot Governance

### Policy Cascade

```text
Enterprise (Copilot policies)
  └── Organization (inherits, can restrict further)
        └── Individual (seat assignment)
```

### Key Policy Settings

| Setting | Scope | Description |
|---------|-------|-------------|
| Enable/Disable Copilot | Enterprise / Org | Control whether Copilot is available |
| Suggestion Matching | Enterprise / Org | Block suggestions matching public code |
| Content Exclusions | Enterprise / Org | Exclude specific files/repos from Copilot context |
| Editor Availability | Enterprise / Org | Control which editors can use Copilot |
| Copilot Chat in GitHub.com | Enterprise / Org | Enable/disable Copilot Chat on the web |

### Plan Comparison

| Feature | Free | Pro | Business | Enterprise |
|---------|------|-----|----------|------------|
| Code completions | ✅ (limited) | ✅ | ✅ | ✅ |
| Copilot Chat | ✅ (limited) | ✅ | ✅ | ✅ |
| Organization policy controls | ❌ | ❌ | ✅ | ✅ |
| Content exclusions | ❌ | ❌ | ✅ | ✅ |
| Audit log integration | ❌ | ❌ | ✅ | ✅ |
| Knowledge bases | ❌ | ❌ | ❌ | ✅ |
| Fine-grained policy control | ❌ | ❌ | ❌ | ✅ |

### Copilot Metrics API

```bash
# Get Copilot usage metrics for an organization (daily report)
# Note: Returns a download link; pipe through curl to get JSON data
gh api "/orgs/ORG/copilot/metrics/reports/organization-1-day?day=YYYY-MM-DD"

# Get Copilot usage metrics for an enterprise (daily report)
gh api "/enterprises/ENTERPRISE/copilot/metrics/reports/enterprise-1-day?day=YYYY-MM-DD"

# Get Copilot seat assignments
gh api /orgs/ORG/copilot/billing/seats --paginate
```

## Quick Decision Matrix

| Need | Feature | Where to Configure |
|------|---------|-------------------|
| Protect branches across all repos | Organization Rulesets | Org → Settings → Rules → Rulesets |
| Require 2FA for all members | Enterprise/Org Policy | Enterprise → Settings → Authentication |
| Block public repos | Enterprise Policy | Enterprise → Settings → Policies → Repositories |
| Enable secret scanning org-wide | Org Security Settings | Org → Settings → Code security |
| Stream audit log to SIEM | Audit Log Streaming | Enterprise → Settings → Audit log |
| Automate user provisioning | SCIM | Enterprise → Settings → Authentication |

### Rate Limit Quick Check

```bash
# Check remaining API quota
gh api rate_limit --jq '.resources.core | "\(.remaining)/\(.limit) remaining, resets \(.reset | strftime("%H:%M UTC"))"'

# Check GraphQL rate limit
gh api rate_limit --jq '.resources.graphql | "\(.remaining)/\(.limit) remaining"'
```

> **Tip:** Authenticated REST requests are limited to **5,000/hour**. GitHub Apps scale up to **12,500/hour**. GraphQL uses a point system with **5,000 points/hour**. If you hit limits during automation, add `sleep` between calls or switch to GraphQL to reduce request count.
