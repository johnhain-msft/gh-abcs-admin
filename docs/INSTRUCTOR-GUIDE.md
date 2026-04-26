# Instructor Guide

This guide provides everything a facilitator needs to deliver the **GitHub Admin Training (GitHub Enterprise Cloud)** VBD workshop. It includes module-by-module talking points, demo scripts, timing guidance, and troubleshooting references.

## Workshop Overview

| Detail | Value |
|--------|-------|
| **Title** | GitHub Admin Training (GitHub Enterprise Cloud) |
| **Format** | Workshop — 2-day, remote delivery |
| **Level** | 300 — Advanced |
| **Duration** | 2 consecutive days, 3 hours/day (6 hours total) |
| **Audience** | Enterprise owners, Organization owners, Repository administrators |
| **Labs** | 15 total (9 in-session, 6 self-paced extension) |
| **Documentation** | 27 numbered reference documents |

### Target Audience

Participants are experienced GitHub users who hold — or will hold — administrative responsibilities for a GitHub Enterprise Cloud environment. They should already be comfortable with basic GitHub workflows (commits, branches, pull requests) and are ready to learn enterprise governance, security, and automation patterns.

### Learning Objectives

By the end of this workshop, participants will be able to:

- Configure repository governance policies including rulesets, required status checks, and templates
- Implement security scanning, push protection, and security-by-default policies
- Manage identity and access through SAML, SCIM, and OIDC integrations
- Administer users, teams, and organizational settings at enterprise scale
- Leverage the GitHub API, webhooks, and gh CLI for automation
- Apply audit logging and dormant user management best practices
- Evaluate deployment strategies, marketplace apps, and third-party integrations

### Workshop Flow

| Day | Theme | Focus Areas |
|-----|-------|-------------|
| **Day 1** | Enterprise, Organization & Governance | Enterprise hierarchy, policies, identity, teams, audit log |
| **Day 2** | Repository, Security, API & Advanced Topics | Repository governance, rulesets, security scanning, API, automation |

Each day follows a consistent rhythm: **presentation → lab → presentation → lab**, with a 10-minute break near the midpoint. Presentations should stay under 20 minutes to keep participants engaged before the next hands-on lab.

## Before the Workshop

### Environment Setup

Complete these environment tasks at least **3 business days** before the workshop:

1. **Provision a GHEC organization** dedicated to the workshop with admin access for all participants
2. **Verify all participants** have active GitHub.com accounts and can access the workshop org
3. **Pre-create demo repositories** needed for instructor walkthroughs (at minimum: one repo with branch protection, one with GitHub Actions workflows, one with security scanning enabled)
4. **Test every lab** end-to-end in the workshop environment — permissions issues are the most common day-of blocker
5. **Prepare screen sharing** setup for remote delivery — test audio, video, and screen sharing in the delivery platform
6. **Configure GitHub Actions** permissions at the org level so participants can run workflows during labs
7. **Enable security features** (Dependabot, code scanning, secret scanning) at the org level so Lab 7 works without manual setup

### Materials Checklist

- [ ] [AGENDA.md](AGENDA.md) printed or shared with participants before Day 1
- [ ] [PRE-WORKSHOP-CHECKLIST.md](PRE-WORKSHOP-CHECKLIST.md) sent to participants at least 1 week before
- [ ] [REFERENCE-CARD.md](REFERENCE-CARD.md) ready to distribute during Day 1
- [ ] Demo org provisioned and all labs tested
- [ ] Backup slides/content available offline in case of connectivity issues
- [ ] [KNOWLEDGE-CHECKS.md](KNOWLEDGE-CHECKS.md) ready for end-of-day review sessions
- [ ] [POST-WORKSHOP-ASSESSMENT.md](POST-WORKSHOP-ASSESSMENT.md) ready to share on Day 2 wrap-up
- [ ] [Setup Guide](../labs/setup.md) link ready to share during environment verification slot
- [ ] [Day 1 Supplement Slides](slides-day1-supplement.html) ready — Copilot governance, audit log/dormant users (13 slides, open in browser)
- [ ] [Day 2 Supplement Slides](slides-day2-supplement.html) ready — Rulesets, security scanning, automation/CLI (21 slides, open in browser)

### VBD Spec Requirements

The VBD specification defines the following **mandatory prerequisites** that the instructor must verify before delivery:

> - "Provision the GitHub Enterprise Cloud organization"
> - "All users with computers, accounts, and access for GitHub.com"
> - "Ensure all attendees will have administrator access"
> - "Designate at least one owner or administrator to share their screen during activities"

**Instructor action:** Before Day 1, confirm each of these items with the customer's technical contact. If any item is unresolved, escalate immediately — the workshop cannot proceed without admin access for all participants.

## Day 1 Module Guide

Day 1 focuses on **"Enterprise, Organization & Governance"** — enterprise hierarchy, policies, identity management, team structure, and audit logging. Total time: 180 minutes (3 hours).

Refer to the [AGENDA.md](AGENDA.md) for the complete schedule with start times.

> **Note:** Modules 2.8–2.11 (API/Webhooks) and 2.9–2.14 (Integrations/Automation) appear at the end of this section for document organization by VBD module number, but they are delivered on **Day 2** per the [AGENDA.md](AGENDA.md). See the Day 2 Timing Summary below for their scheduled slots.

### Module 2.1: Integrations and Authentication

**Duration:** 15 min presentation | **Type:** 📖 only
**Doc References:** [Identity and Access Management](03-identity-access-management.md), [Enterprise Managed Users](04-enterprise-managed-users.md)
**Lab:** No in-session lab — [Lab 11: GitHub Apps and Marketplace](../labs/lab11.md) is a self-paced extension

**Learning Objectives:**

- Compare SAML SSO and Enterprise Managed Users (EMU) approaches
- Understand SCIM provisioning for automated user lifecycle management
- Explain OIDC integration for conditional access policies

**Key Talking Points:**

- **SAML SSO** — how it works with GHEC, linking existing identities, requiring SAML for org access
- **Enterprise Managed Users** — when to use EMU vs. standard SAML; trade-offs (control vs. flexibility)
- **SCIM provisioning** — automated user creation, team sync, deprovisioning on IdP removal
- **OIDC and conditional access** — integrating with Microsoft Entra ID for location and device-based policies
- **PAT and SSH key policies** — restricting personal access tokens and SSH keys at the enterprise level

**Demo Script:**

1. Navigate to **enterprise settings → Authentication security** — show SAML configuration options (do not modify live settings)
2. Show the **identity provider mapping** for team sync
3. Walk through the EMU documentation page and highlight the key differences from standard SAML
4. Show **Enterprise → Policies → Personal access tokens** — demonstrate token restriction policies

**Discussion Prompts:**

- "Is your organization using SAML SSO today? Are you considering EMU?"
- "How do you currently handle offboarding — is SCIM provisioning in place?"
- "Do you restrict PAT creation at the enterprise level?"

**Common Questions:**

- Q: "Can we migrate from SAML to EMU?" → A: This requires creating a new enterprise with EMU-enabled orgs. It is not an in-place migration.
- Q: "Does EMU prevent users from contributing to public repos?" → A: EMU accounts can only interact with resources within the enterprise — they cannot fork or contribute outside.
- Q: "What IdPs are supported?" → A: Microsoft Entra ID, Okta, and PingFederate are officially supported for EMU. SAML SSO works with any SAML 2.0 provider.

**Timing Notes:**

- This is presentation-only — keep it focused on decision points rather than step-by-step configuration
- Many participants will have strong opinions about SAML vs. EMU; allow brief discussion but stay on schedule

---

### Module 2.2: Enterprise Site Administration

**Duration:** 10 min presentation + 15 min lab | **Type:** 📖 + 🔬
**Doc References:** [Enterprise Hierarchy](01-enterprise-hierarchy.md), [Policy Inheritance](06-policy-inheritance.md)
**Lab:** [Lab 15: Copilot Governance Configuration](../labs/lab15.md)

**Learning Objectives:**

- Navigate the enterprise → organization → repository hierarchy
- Configure enterprise-level policies and understand inheritance
- Set up Copilot governance policies at the enterprise and org level

**Key Talking Points:**

- **Enterprise hierarchy** — how enterprise, org, and repo settings relate; which policies cascade down
- **Policy inheritance** — enterprise policies can enforce, allow, or delegate to orgs; orgs can further restrict but not relax
- **Enterprise policies** — Actions permissions, Copilot access, repository visibility defaults, fork policies
- **Copilot governance** — enabling/disabling Copilot at enterprise and org levels, managing seat assignment

**Demo Script:**

1. Navigate to **Enterprise → Policies** — walk through each policy category
2. Show how an enterprise policy restricts what org admins can configure
3. Navigate to **Enterprise → Policies → Copilot** — show seat assignment and policy options
4. Show the org-level Copilot settings and how they inherit from the enterprise

**Discussion Prompts:**

- "Which policies do you enforce at the enterprise level vs. delegate to orgs?"
- "How are you planning to roll out Copilot governance?"

**Common Questions:**

- Q: "Can orgs override enterprise policies?" → A: Only if the enterprise policy is set to "Allow" (delegate). If set to "Enforce," orgs must comply.
- Q: "How many orgs should we have?" → A: It depends on your team structure and policy needs. Refer to [Organization Strategies](02-organization-strategies.md) for guidance.

**Timing Notes:**

- Lab 15 covers Copilot governance — ensure Copilot is enabled in the workshop org before this module
- If Copilot is not available, pivot the lab to explore enterprise policy settings instead

---

### Module 2.4–2.5–2.7: Org Settings, User Admin, and Teams

**Duration:** 15 min presentation + 20 min lab | **Type:** 📖 + 🔬
**Doc References:** [Organization Strategies](02-organization-strategies.md), [Teams and Permissions](05-teams-permissions.md), [User Administration](21-user-administration.md)
**Lab:** [Lab 9: User and Team Administration](../labs/lab09.md)

**Learning Objectives:**

- Configure organization-level settings for Actions, security, and member privileges
- Manage users at scale with team-based permissions
- Implement nested teams for hierarchical access control

**Key Talking Points:**

- **Org settings walkthrough** — member privileges, default permissions, repository creation policies, Actions permissions
- **Team management** — creating teams, nested teams, team sync with IdP, team maintainers
- **User administration** — inviting members, managing roles (member, admin, billing manager), removing users
- **Outside collaborators** — when and how to grant access to external users, security implications

**Demo Script:**

1. Navigate to **org settings → Member privileges** — walk through key settings
2. Create a team → add members → show nested team inheritance
3. Navigate to a repository → **Settings → Manage access** → add the team with a specific role
4. Show the **People** tab — filter by role, search for users, show 2FA status

**Discussion Prompts:**

- "How do you structure your teams? By department, project, or cross-functional?"
- "Do you use nested teams? What hierarchy works for your organization?"
- "How do you manage outside collaborators and their access expiration?"

**Common Questions:**

- Q: "Can I sync teams with Microsoft Entra ID groups?" → A: Yes, team sync works with Microsoft Entra ID, Okta, and other supported IdPs.
- Q: "What's the difference between org admin and enterprise owner?" → A: Org admins manage one org; enterprise owners manage all orgs and enterprise-level policies.
- Q: "How do I bulk-invite users?" → A: Use the GitHub API or `gh` CLI to script bulk invitations.

**Timing Notes:**

- This is a combined 2.4 + 2.5 + 2.7 slot — allocate roughly 5 minutes per sub-topic
- Lab 9 is comprehensive; if time is tight, focus on team creation and permission assignment

---

### Module 2.3–2.6: Audit Log and Dormant Users

**Duration:** 10 min presentation + 20 min lab | **Type:** 📖 + 🔬
**Doc References:** [Audit Log Deep Dive](22-audit-log-deep-dive.md), [User Administration](21-user-administration.md)
**Lab:** [Lab 8: Audit Log Exploration](../labs/lab08.md)

**Learning Objectives:**

- Navigate and search the enterprise and org audit logs
- Use the audit log API and streaming for long-term retention
- Identify and manage dormant users to reclaim licenses

**Key Talking Points:**

- **Audit log overview** — what events are captured, retention periods, UI vs. API access
- **Searching the audit log** — query syntax, filtering by actor, action, and date range
- **Audit log streaming** — sending audit events to external SIEM tools (Splunk, Azure Sentinel, Datadog)
- **Audit log API** — programmatic access for custom reporting and alerting
- **Dormant users** — identifying inactive accounts, license reclamation, setting up automated reports

**Demo Script:**

1. Navigate to **org settings → Archives → Logs → Audit log** — demonstrate search and filtering
2. Show a search query: `action:repo.create actor:username` and explain the syntax
3. Navigate to **Enterprise → Settings → Audit log** — show enterprise-level events
4. Show the dormant users report under **enterprise settings → People**

**Discussion Prompts:**

- "How long do you need to retain audit logs? Does the built-in 180-day retention meet your compliance needs?"
- "Are you streaming audit logs to a SIEM today?"
- "What's your process for handling dormant users?"

**Common Questions:**

- Q: "Can I get audit logs for more than 180 days?" → A: Use audit log streaming to export events to your own storage for long-term retention.
- Q: "What counts as a dormant user?" → A: A user who has not performed any activity (push, login, PR, etc.) in a defined period, typically 90 days.
- Q: "Can I automate dormant user cleanup?" → A: Yes, use the audit log API to identify inactive users and the org members API to remove them. See [Scripts and Automation](24-scripts-automation.md).

**Timing Notes:**

- Lab 8 involves searching the audit log — ensure the workshop org has enough activity to produce interesting results
- Consider generating some audit events before the lab (create repos, change settings) so participants have data to search

---

### Module 2.8–2.11: GitHub API and Webhooks

**Duration:** 10 min presentation + 15 min lab | **Type:** 📖 + 🔬
**Doc References:** [Scripts and Automation](24-scripts-automation.md), [Integrations and Status API](27-integrations-status-api.md)
**Lab:** [Lab 5: GitHub API](../labs/lab05.md)

**Learning Objectives:**

- Use the GitHub REST and GraphQL APIs for administrative tasks
- Configure webhooks for real-time event notifications
- Understand rate limiting and authentication for API access

**Key Talking Points:**

- **REST API vs. GraphQL** — when to use each; GraphQL for complex queries, REST for simple operations
- **Authentication** — PATs, GitHub Apps, and installation tokens; best practices for API credentials
- **`gh` CLI as API client** — using `gh api` for quick administrative queries
- **Webhooks** — configuring org and repo webhooks, payload delivery, securing with webhook secrets
- **Rate limiting** — understanding primary and secondary rate limits, using conditional requests

**Demo Script:**

1. Run `gh api /orgs/{org}/members --paginate` to list org members from the terminal
2. Show `gh api graphql` for a custom query (e.g., list all repos with open security alerts)
3. Navigate to **org settings → Webhooks** — create a test webhook pointing to a request bin
4. Trigger an event and show the webhook delivery log

**Discussion Prompts:**

- "What administrative tasks would you like to automate with the API?"
- "Are you using webhooks today? For what purposes?"

**Common Questions:**

- Q: "What's the rate limit for API requests?" → A: 5,000 requests/hour for authenticated users; 15,000/hour for GitHub App installations.
- Q: "Can I use the API to manage enterprise settings?" → A: Some enterprise settings are available via the GraphQL API. Check the Enterprise Admin API documentation.
- Q: "How do I test webhooks locally?" → A: Use tools like `smee.io` or `ngrok` to forward webhook payloads to your local machine.

**Timing Notes:**

- Lab 5 focuses on REST API usage with `gh` CLI — ensure participants have `gh` installed and authenticated
- [Lab 1: Webhooks and Events](../labs/lab01.md) is a self-paced extension for webhook hands-on practice

---

### Module 2.9–2.14: Third-Party Integrations, Deployment, Automation, and Repo Health

**Duration:** 10 min presentation + 15 min lab | **Type:** 📖 + 🔬
**Doc References:** [Deployment Strategies](23-deployment-strategies.md), [Unhealthy Repos](25-unhealthy-repos-git-history.md)
**Lab:** [Lab 13: Scripts and gh CLI Automation](../labs/lab13.md)

**Learning Objectives:**

- Evaluate and manage third-party integrations and GitHub Apps
- Understand deployment environments, protection rules, and deployment strategies
- Identify and remediate unhealthy repositories with large files or corrupted history
- Build automation scripts with `gh` CLI and GitHub Actions

**Key Talking Points:**

- **Third-party integrations** — evaluating app permissions, managing installed apps, revoking access
- **Deployment environments** — configuring environments with protection rules, required reviewers, wait timers
- **Deployment strategies** — blue-green, canary, rolling deployments with GitHub Actions
- **Repository health** — detecting repos with large binary files, force-pushed history, or missing branch protection
- **Automation patterns** — common `gh` CLI scripts for admin tasks (bulk operations, reporting, cleanup)

**Demo Script:**

1. Navigate to **org settings → GitHub Apps** — show installed apps and their permissions
2. Open a repository → **Settings → Environments** — create an environment with protection rules
3. Run a sample `gh` CLI script that lists repositories without branch protection
4. Show how to identify large files in a repository using `git rev-list` and `git cat-file`

**Discussion Prompts:**

- "What deployment strategy does your team use today?"
- "Have you encountered repositories with performance issues due to large files?"
- "What administrative tasks do you perform repeatedly that could be automated?"

**Common Questions:**

- Q: "How do I find repos without branch protection?" → A: Use the API to list repos and check for protection rules, or use the security overview dashboard.
- Q: "Can I restrict which environments can deploy to production?" → A: Yes, use environment protection rules with required reviewers and branch restrictions.
- Q: "How do I clean up a repository with large files in its history?" → A: Use `git filter-repo` or BFG Repo-Cleaner. See [Unhealthy Repos](25-unhealthy-repos-git-history.md) for a step-by-step guide.

**Timing Notes:**

- This is a combined 2.9 + 2.10 + 2.12 + 2.13 + 2.14 slot — keep the presentation high-level and focus on the most relevant topics for the audience
- Lab 13 focuses on `gh` CLI automation scripts — it ties together many concepts from the workshop
- Self-paced extensions: [Lab 12: Deployments](../labs/lab12.md) and [Lab 14: Unhealthy Repos](../labs/lab14.md)

---

### Day 1 Wrap-Up (10 min)

**Talking Points:**
- Summarize key Day 1 themes: enterprise hierarchy, org structure, identity/access, audit logging
- Preview Day 2: repository governance, rulesets, security, API/automation
- Encourage participants to review self-paced extension labs for topics covered today

**Q&A Facilitation:**
- Open the floor for questions — target 5 minutes
- If no questions, ask: "What's one thing you learned today that you'll apply immediately?"
- Remind participants of the Reference Card as a take-home resource

---

### Day 1 Timing Summary

| Slot | Duration | Content |
|------|----------|---------|
| Welcome | 10 min | Introduction, objectives, logistics |
| Setup | 5 min | Environment verification |
| Enterprise overview | 20 min | GHEC vs GHES, billing, plans |
| Permission flow | 15 min | Hierarchy, visibility, base permissions, roles |
| Enterprise admin | 15 min | Enterprise policies, settings, Copilot governance |
| Lab 15 | 15 min | Copilot Governance Configuration |
| ☕ Break | 10 min | — |
| Org overview | 15 min | SSO, SAML/SCIM, org settings |
| Org admin | 15 min | Teams, nested teams, team sync |
| Lab 9 | 20 min | User and Team Administration |
| Audit & dormant | 10 min | Audit log, dormant user management |
| Lab 8 | 20 min | Audit Log Exploration |
| Wrap-up | 10 min | Day 1 Q&A, preview Day 2 |
| **Total** | **180 min** | — |

## Day 2 Module Guide

Day 2 focuses on **"Repository, Security, API & Advanced Topics"** — repository governance, rulesets, security scanning, API automation, and deployment. Total time: 180 minutes (3 hours).

Refer to the [AGENDA.md](AGENDA.md) for the complete schedule with start times.

### Module 1.1: Repository Permissions and Settings

**Duration:** 15 min presentation + 10 min lab | **Type:** 📖 + 🔬
**Doc References:** [Repository Governance](07-repository-governance.md), [Teams and Permissions](05-teams-permissions.md)
**Lab:** [Lab 4: GitHub Templates](../labs/lab04.md)

**Learning Objectives:**

- Explain repository visibility levels (public, internal, private)
- Configure base permissions at the org level
- Create and assign custom repository roles

**Key Talking Points:**

- **Repository visibility** — when to use public, internal, and private; the inner source pattern with internal visibility
- **Base permissions** — the minimum permission for all org members; why "Read" is a common default for enterprise orgs
- **Custom repository roles** — when built-in roles (Read, Triage, Write, Maintain, Admin) are not granular enough
- **Team-based access** — why teams are preferred over direct user permissions at scale

**Demo Script:**

1. Navigate to **org settings → Member privileges → Base permissions** and explain each option
2. Open a repository → **Settings → Manage access** → show how teams and individuals are granted access
3. Navigate to **org settings → Roles → Repository roles** → walk through custom role creation
4. Show how custom roles appear in the repository access UI

**Discussion Prompts:**

- "What base permission does your organization currently use? Why did you choose it?"
- "When would you use internal visibility vs. private visibility?"
- "Has anyone needed a permission level between Write and Admin? That's where custom roles help."

**Common Questions:**

- Q: "Can I restrict who creates repositories?" → A: Yes, go to **org settings → Member privileges → Repository creation** and limit to admins or specific roles.
- Q: "Do custom roles override team permissions?" → A: Custom roles provide *additional* permissions on top of team-level access; they do not restrict.
- Q: "How do I audit who has access to a repository?" → A: Use the repository **Settings → Manage access** page or the `repos/{owner}/{repo}/collaborators` API endpoint.

**Timing Notes:**

- If running short on time, skip the custom roles deep-dive and mention it as self-study
- If running long, have participants explore Lab 4 independently after the session

---

### Module 1.2–1.3: Branches, Pull Requests, and Rulesets

**Duration:** 20 min presentation + 20 min lab | **Type:** 📖 + 🔬
**Doc References:** [Repository Governance](07-repository-governance.md)
**Lab:** [Lab 3: Repository Rulesets](../labs/lab03.md)

**Learning Objectives:**

- Configure branch protection rules and compare them with rulesets
- Create and manage repository rulesets with bypass actors
- Understand pull request review requirements and merge strategies

**Key Talking Points:**

- **Branch protection vs. rulesets** — rulesets are the modern replacement; they support org-level rules, bypass actors, and layered policies
- **Ruleset targeting** — how to target branches by name pattern (e.g., `main`, `release/*`)
- **Required reviews** — configuring minimum reviewers, dismiss stale reviews, require re-review on push
- **Merge strategies** — merge commit, squash, rebase; when each is appropriate
- **Bypass actors** — who can bypass rulesets and why this matters for CI/CD service accounts

**Demo Script:**

1. Navigate to a repository → **Settings → Rules → Rulesets**
2. Create a new branch ruleset targeting `main`
3. Add rules: require pull request, require approvals (1 reviewer minimum), require status checks
4. Show bypass actors configuration — add a team or app
5. Demonstrate what happens when pushing directly to a protected branch (show the error)

**Discussion Prompts:**

- "Do you currently use branch protection rules or rulesets? What's your migration plan?"
- "How do you handle service accounts that need to bypass protection?"

**Common Questions:**

- Q: "Can I apply rulesets at the org level?" → A: Yes, org-level rulesets apply across all (or targeted) repositories — a major advantage over branch protection.
- Q: "What happens if multiple rulesets conflict?" → A: Rulesets are additive — the most restrictive combination applies.
- Q: "Can I import existing branch protection as rulesets?" → A: Not automatically, but the settings map closely. Plan a manual migration.

**Timing Notes:**

- This is a combined 1.2 + 1.3 slot — spend roughly 10 minutes on branches/PRs and 10 minutes on rulesets
- Lab 3 is 20 minutes; if participants finish early, encourage them to experiment with additional ruleset rules

---

### Module 1.4: Required Status Checks

**Duration:** 15 min presentation + 15 min lab | **Type:** 📖 + 🔬
**Doc References:** [Repository Governance](07-repository-governance.md)
**Lab:** [Lab 6: Advanced Repository Rulesets](../labs/lab06.md)

**Learning Objectives:**

- Configure required status checks as part of a ruleset
- Understand how status checks integrate with GitHub Actions workflows
- Troubleshoot common status check failures

**Key Talking Points:**

- **What status checks are** — external CI/CD signals that report pass/fail to a pull request
- **Requiring specific checks** — how to add named checks to a ruleset and why exact naming matters
- **Strict status checks** — requiring branches to be up-to-date before merging
- **Integration with Actions** — how workflow job names map to status check names
- **Troubleshooting** — common issues when checks don't appear (naming mismatch, workflow not triggered)

**Demo Script:**

1. Open an existing ruleset (from Module 1.2–1.3) → **Add rule → Require status checks**
2. Search for and add a status check by name
3. Enable "Require branches to be up to date"
4. Open a pull request and show the status checks section
5. Show what happens when a required check is missing or failing

**Discussion Prompts:**

- "What CI checks do you currently require before merging?"
- "Have you experienced issues with status checks not appearing? What was the root cause?"

**Common Questions:**

- Q: "Why doesn't my status check appear in the dropdown?" → A: The check must have run at least once in the repository. Trigger the workflow first.
- Q: "Can I require checks from external CI systems?" → A: Yes, any system that reports status via the Commit Status API or Check Runs API works.
- Q: "What's the difference between branch protection checks and ruleset checks?" → A: Functionally similar, but rulesets support org-level enforcement and bypass actors.

**Timing Notes:**

- Lab 6 builds on Lab 3 — ensure participants completed Lab 3 first
- If participants struggle with Lab 6, pair them up or do a guided walkthrough

---

### Module 1.5: Security in the Cloud

**Duration:** 15 min presentation + 20 min lab | **Type:** 📖 + 🔬
**Doc References:** [Security and Compliance](08-security-compliance.md), [Security by Default](11-security-by-default-policies.md)
**Lab:** [Lab 7: Security Scanning and Push Protection](../labs/lab07.md)

**Learning Objectives:**

- Enable and configure Dependabot, code scanning, and secret scanning
- Implement push protection for secret scanning
- Understand security-by-default policies at the org and enterprise level

**Key Talking Points:**

- **Dependabot** — automated dependency updates and vulnerability alerts; configuring `.github/dependabot.yml`
- **Code scanning** — CodeQL analysis setup, default vs. advanced configurations
- **Secret scanning** — detecting secrets in commits; push protection to block secrets before they land
- **Security-by-default policies** — org-level settings that auto-enable security features on new repositories
- **Security overview dashboard** — the enterprise/org-level view of security alerts across all repos

**Demo Script:**

1. Navigate to **org settings → Advanced Security → Configurations** — show the enable-all toggles
2. Open a repository → **Settings → Advanced Security** — show repo-level overrides
3. Navigate to **Security → Security overview** to show the dashboard
4. Demonstrate push protection by attempting to push a test secret (use a revoked/test token)
5. Show how to review and dismiss secret scanning alerts

**Discussion Prompts:**

- "Which security features are you currently using? Are they enabled org-wide or repo-by-repo?"
- "How do you handle false positives in secret scanning?"
- "What's your process when Dependabot opens a PR?"

**Common Questions:**

- Q: "Is CodeQL free for all repositories?" → A: CodeQL is free for public repositories and included with GHEC for private repositories.
- Q: "Can I customize which secrets are detected?" → A: Yes, you can define custom patterns for secret scanning at the org level.
- Q: "What happens when push protection blocks a push?" → A: The developer sees an error with the detected secret. They can bypass with a reason (if allowed) or remove the secret and push again.

**Timing Notes:**

- Lab 7 is the longest Day 2 lab (20 min allocated) — ensure participants have time to complete it
- If running behind, do a guided walkthrough of the first few steps and let participants finish the rest self-paced

---

### Module 1.6–1.8: User Privacy, Licenses, and Marketplace

**Duration:** 5 min presentation (combined) | **Type:** 📖 only
**Doc References:** [User Privacy and Data Residency](26-user-privacy-data-residency.md), [Licenses and Billing](19-licenses-billing.md), [GitHub Marketplace](20-github-marketplace-apps.md)
**Lab:** No in-session lab — [Lab 11: GitHub Apps and Marketplace](../labs/lab11.md) is a self-paced extension

**Learning Objectives:**

- Understand data residency options and user privacy controls in GHEC
- Navigate license management and billing for enterprise accounts
- Evaluate and install GitHub Marketplace apps safely

**Key Talking Points:**

- **User privacy** — profile visibility settings, contribution graph privacy, data residency with GitHub Enterprise Cloud with data residency (GHEC DR)
- **Licenses and billing** — seat-based licensing, viewing consumption, managing unused licenses
- **Marketplace overview** — GitHub Apps vs. OAuth Apps, evaluating third-party apps, app permissions model
- **Enterprise policy** — how to restrict which Marketplace apps org members can install

**Demo Script:**

1. Navigate to **enterprise settings → Billing** — show license consumption
2. Open **org settings → Third-party access** — show app installation policies
3. Browse the GitHub Marketplace briefly and show how to evaluate an app's permissions

**Discussion Prompts:**

- "Does your organization have data residency requirements?"
- "How do you currently manage license allocation?"

**Common Questions:**

- Q: "Can I prevent users from installing any Marketplace apps?" → A: Yes, org owners can restrict app installations to admin-only.
- Q: "How do I reclaim unused licenses?" → A: Remove inactive members from the org or enterprise, or use dormant user reports.

**Timing Notes:**

- This is a quick combined overview (5 min total) — keep it high-level
- Point participants to Lab 11 as self-paced follow-up for Marketplace hands-on practice

---

### Day 2 Wrap-Up (5 min)

**Talking Points:**
- Highlight the "Top 5 Things to Implement This Week" from the slide deck
- Direct participants to the Post-Workshop Assessment
- Share the Reference Card link and self-paced extension lab list

**Action Planning:**
- Prompt: "Write down 3 things you will do in the next 30 days"
- If time allows, ask 1-2 volunteers to share their top action item

---

### Day 2 Timing Summary

| Slot | Duration | Content |
|------|----------|---------|
| Welcome | 5 min | Day 2 kickoff, recap Day 1 |
| Module 1.1 | 25 min | Repository governance, templates + Lab 4 |
| Module 1.2–1.3 | 30 min | Rulesets deep dive + Lab 3 |
| Module 1.3–1.4 | 15 min | Advanced Rulesets: Lab 6 |
| ☕ Break | 10 min | — |
| Module 1.5 | 35 min | Security scanning, push protection + Lab 7 |
| Module 2.8–2.11 | 25 min | API and webhooks + Lab 5 |
| Module 2.9–2.14 | 25 min | Actions, automation, Marketplace + Lab 13 |
| Module 1.6–1.8 | 5 min | Privacy, licenses, repo health overview |
| Wrap-up | 5 min | Knowledge check, assessment, next steps |
| **Total** | **180 min** | — |

## Troubleshooting

### Common Lab Issues

| Issue | Symptom | Solution |
|-------|---------|----------|
| Insufficient permissions | "You don't have access" or 403 errors | Verify the user is an org admin; check enterprise policies for restrictions |
| Actions disabled | Workflows won't run or are greyed out | Check **org settings → Actions → General** — ensure Actions is enabled for all repositories |
| Branch protection conflicts | Can't push to or merge into protected branch | Check ruleset bypass actors; verify the user has admin override if needed |
| Secret scanning not available | No security alerts or scanning tab missing | Verify GHEC plan includes GitHub Secret Protection and GitHub Code Security (formerly GHAS); check **repo settings → Advanced Security** |
| API rate limiting | 403 responses with "rate limit exceeded" | Use authenticated requests; check rate limit headers with `gh api /rate_limit` |
| `gh` CLI not installed | "command not found: gh" errors | Direct participant to [setup.md](../labs/setup.md) installation instructions |
| `gh` CLI not authenticated | "authentication required" errors | Run `gh auth login` and follow the browser-based OAuth flow |
| Repository not found | 404 errors when accessing repos | Verify the repository exists, the user has access, and the org name is correct |
| SAML enforcement blocking access | "SAML authentication required" errors | Ensure the user has completed SAML authentication for the workshop org |
| Webhook delivery failures | Webhook shows "failed" in recent deliveries | Check the payload URL is accessible; verify the webhook secret matches |

### Participant Engagement Tips

- **Keep presentations under 20 minutes** before transitioning to a lab — attention drops significantly after 20 minutes of passive content
- **Use screen sharing for demos** — have participants follow along on their own screens when possible
- **For remote delivery:** use breakout rooms for discussion prompts; assign groups of 3-4 participants
- **Monitor chat actively** during labs — participants often ask questions in chat rather than unmuting
- **Have backup activities** ready for fast finishers — point them to self-paced extension labs or the [FAQ](FAQ-workshop.md)
- **Call on participants by name** periodically to maintain engagement (check the roster before the session)
- **Use polls or quick reactions** in the delivery platform to gauge understanding before moving on
- **Share your screen during labs** for the first 2-3 steps, then let participants work independently

### Timing Adjustment Strategies

- **If behind schedule:** combine remaining presentation topics into quick overviews, skip optional discussion prompts, and have participants complete labs self-paced after the session
- **If ahead of schedule:** extend discussion prompts, add self-paced extension labs as bonus activities, or dive deeper into topics the audience is interested in
- **Break is flexible:** can be 5–15 minutes based on pacing and participant needs
- **Day 2 buffer:** the 1.6–1.7 combined slot (5 min) is lightweight — use it as buffer time if earlier modules ran long
- **Day 2 buffer:** the wrap-up slot can flex between 5–15 minutes depending on how much time the knowledge check and Q&A need

### Audience Adaptation

**For less experienced groups (L200):**

- Spend more time on Day 1 foundations (enterprise hierarchy, rulesets basics, template governance)
- Simplify Lab 06 (skip JSON export/import, focus on UI configuration)
- Skip Lab 13 (advanced API automation) in favor of extended Lab 05 walkthrough
- Use extension labs as post-workshop homework rather than in-session stretch goals
- Add more live demos where participants watch before attempting labs independently

**For advanced groups (L400):**

- Compress Day 1 presentation time to ~10 min per module; focus on labs and discussion
- Promote extension labs (10, 11, 14) to in-session activities
- Deep-dive on API automation (Lab 13), custom roles, and security campaigns
- Add a discussion block: "What governance challenges does your org face?" with group problem-solving
- Reference the Scripts & Automation doc (24) for production-grade patterns participants can take home

**For a shortened 1-day delivery (3 hours):**

- **Core modules:** 2.2 (Enterprise Hierarchy & Copilot), 1.2 (Rulesets), 1.5 (Security), 2.1 (IAM), 2.3 (Audit), 1.1 (Repository Permissions)
- **Core labs:** Lab 03, Lab 06, Lab 07, Lab 08, Lab 15
- **Skip:** Templates, webhooks, marketplace, dormant users, deployment environments
- **Assign as self-paced:** All skipped labs + extension labs
- **Adjust timing:** 15 min presentation + 15 min lab per module, 10 min break, 10 min wrap-up

### Remote Delivery Best Practices

- **Test your setup 30 minutes before** — audio, video, screen sharing, and access to the workshop org
- **Use a co-facilitator** if possible — one person presents while the other monitors chat and assists with lab issues
- **Record the session** (with participant consent) so attendees can review demos later
- **Share links in chat** — don't just say "go to org settings"; paste the full URL in chat
- **Have a backup plan** for connectivity issues — pre-record critical demos or prepare screenshots
- **Use the "raise hand" feature** in your delivery platform to manage Q&A without interruptions

### Post-Workshop Follow-Up

- Share the [POST-WORKSHOP-ASSESSMENT.md](POST-WORKSHOP-ASSESSMENT.md) with participants within 24 hours
- Send links to all self-paced extension labs (Lab 1, Lab 2, Lab 10, Lab 11, Lab 12, Lab 14) for continued learning
- Provide the [REFERENCE-CARD.md](REFERENCE-CARD.md) as a quick-reference bookmark
- Follow up on any unanswered questions from the workshop within 1 week
- Collect delivery feedback to improve future workshop iterations

## PPT Slide Reference

This section maps each slide in the official "Offering - GitHub Administration Training" deck to the corresponding workshop module, documentation, and lab.

The PPT deck follows a **top-down flow**: Enterprise → Organization → Repository → API & Authentication → Actions & Marketplace. The workshop [AGENDA](AGENDA.md) orders sessions differently for pedagogical reasons (enterprise governance on Day 1, repository governance on Day 2). Use this table to quickly locate the supporting documentation and lab for any slide you are presenting.

| Slide # | Slide Title / Topic | Module / Topic | Repo Doc(s) | Lab(s) |
|---------|---------------------|----------------|-------------|--------|
| 1 | Title | — | — | — |
| 2 | Objectives | — | — | — |
| 3–4 | Agenda | — | [AGENDA.md](AGENDA.md) | — |
| 5–9 | GitHub Enterprise Overview (Platforms, GHEC, GHES, Billing) | VBD: Enterprise Overview | [01-enterprise-hierarchy](01-enterprise-hierarchy.md), [19-licenses-billing](19-licenses-billing.md) | — |
| 10–15 | Permission Flow (hierarchy, visibility, base permissions, roles) | VBD 1.1 | [05-teams-permissions](05-teams-permissions.md), [07-repository-governance](07-repository-governance.md) | Lab 4 (Templates) |
| 16–17 | Enterprise Administration (demo) | VBD 2.2 | [01-enterprise-hierarchy](01-enterprise-hierarchy.md), [06-policy-inheritance](06-policy-inheritance.md) | Lab 15 (Copilot Governance) |
| 18–31 | Organization Overview (namespaces, users, SSO, teams) | VBD 2.1, 2.4, 2.5, 2.7 | [02-organization-strategies](02-organization-strategies.md), [03-identity-access-management](03-identity-access-management.md), [04-enterprise-managed-users](04-enterprise-managed-users.md), [05-teams-permissions](05-teams-permissions.md) | Lab 9 (Teams) |
| 32–45 | Organization Administration (settings, nested teams, team sync, insights, security) | VBD 2.3, 2.5, 2.6 | [21-user-administration](21-user-administration.md), [08-security-compliance](08-security-compliance.md), [22-audit-log-deep-dive](22-audit-log-deep-dive.md) | Lab 8 (Audit), Lab 9 (Teams) |
| 46–49 | Repository (overview, settings, rulesets, CODEOWNERS) | VBD 1.1–1.4 | [07-repository-governance](07-repository-governance.md) | Lab 3 (Rulesets), Lab 6 (Advanced Rulesets) |
| 50–61 | API & Authentication Methods (REST, GraphQL, GitHub Apps, OAuth, PATs) | VBD 2.8, 2.11 | [24-scripts-automation](24-scripts-automation.md), [27-integrations-status-api](27-integrations-status-api.md) | Lab 5 (API) |
| 62–67 | Actions Overview (policies, sharing, best practices) | VBD 2.4, 2.12 | [24-scripts-automation](24-scripts-automation.md) | Lab 2 (Actions Settings), Lab 13 (Automation) |
| 68–69 | Marketplace Overview | VBD 1.8 | [20-github-marketplace-apps](20-github-marketplace-apps.md) | Lab 11 (Apps/Marketplace) |
| 70–71 | Q&A / Thank You | — | — | — |
