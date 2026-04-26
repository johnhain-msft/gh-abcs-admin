# GitHub Admin Training — GitHub Enterprise Cloud (L300)

**Workshop** · 2-day · Remote · Level 300 — Advanced · 3 hours/day (6 hours total)
**Audience:** Enterprise owners · Organization owners · Repository administrators

Master the administration and governance of GitHub Enterprise Cloud at scale. This hands-on workshop covers enterprise hierarchy, identity management, repository rulesets, security-by-default policies, Copilot governance, API automation, and migration strategies — equipping administrators with the skills to run a secure, compliant, and well-governed GitHub environment.

---

## 📋 Quick Start

| Step | Link |
|------|------|
| **1. Prepare** | [Pre-Workshop Checklist](docs/PRE-WORKSHOP-CHECKLIST.md) |
| **2. Set Up** | [Hands-on Labs Setup](labs/setup.md) |
| **3. Follow Along** | [Workshop Agenda](docs/AGENDA.md) |

---

## 📅 Workshop Agenda

> Full session timing, demos, and lab schedule are in [docs/AGENDA.md](docs/AGENDA.md).

| Day | Theme | Topics |
|-----|-------|--------|
| **Day 1** | Enterprise, Organization & Governance | Enterprise hierarchy, IAM (SAML/SCIM/OIDC), Copilot governance, teams, audit logs, dormant users |
| **Day 2** | Repository, Security, API & Advanced | Repository governance, rulesets, security scanning, push protection, templates, API & automation, privacy, licenses |

### Learning Objectives

By the end of this workshop, participants will be able to:

- Configure repository governance policies including rulesets, required status checks, and templates
- Implement security scanning, push protection, and security-by-default policies
- Manage identity and access through SAML, SCIM, and OIDC integrations
- Administer users, teams, and organizational settings at enterprise scale
- Leverage the GitHub API, webhooks, and `gh` CLI for automation
- Apply audit logging and dormant user management best practices
- Evaluate deployment strategies, marketplace apps, and third-party integrations

---

## 🔧 Hands-on Labs

### In-Session Labs

These labs are completed during the workshop with instructor guidance.

| Lab | Title | Duration | VBD Topics |
|-----|-------|----------|------------|
| [Setup](labs/setup.md) | Environment Setup | 5 min | — |
| [Lab 3](labs/lab03.md) | Repository Rulesets | 20 min | 1.2, 1.3 |
| [Lab 4](labs/lab04.md) | GitHub Templates | 10 min | 1.1 |
| [Lab 5](labs/lab05.md) | GitHub API — REST & GraphQL | 15 min | 2.8 |
| [Lab 6](labs/lab06.md) | Advanced Repository Rulesets | 20 min | 1.3, 1.4 |
| [Lab 7](labs/lab07.md) | Security Scanning and Push Protection | 25 min | 1.5 |
| [Lab 8](labs/lab08.md) | Audit Log Exploration | 20 min | 2.3 |
| [Lab 9](labs/lab09.md) | User and Team Administration | 20 min | 2.5, 2.7 |
| [Lab 13](labs/lab13.md) | Scripts and gh CLI Automation | 15 min | 2.12 |
| [Lab 15](labs/lab15.md) | Copilot Governance Configuration | 15 min | 2.2 |

### Self-Paced Extension Labs

Complete these after the workshop to deepen your skills.

| Lab | Title | Duration | VBD Topics |
|-----|-------|----------|------------|
| [Lab 1](labs/lab01.md) | Webhooks and Events | 5–10 min | 2.11 |
| [Lab 2](labs/lab02.md) | Actions Settings | 5–10 min | 2.4 |
| [Lab 10](labs/lab10.md) | Dormant User Management | 15–20 min | 2.6 |
| [Lab 11](labs/lab11.md) | GitHub Apps and Marketplace | 15–20 min | 1.8, 2.1 |
| [Lab 12](labs/lab12.md) | Deployments and Environments | 20–25 min | 2.10 |
| [Lab 14](labs/lab14.md) | Unhealthy Repos and Git History | 20–25 min | 2.13, 2.14 |

---

## 📘 Workshop Documentation

### Enterprise & Organization

| # | Title | Topics |
|---|-------|--------|
| [01](docs/01-enterprise-hierarchy.md) | GitHub Enterprise Cloud Hierarchy | GHEC structure, roles, multi-org management |
| [02](docs/02-organization-strategies.md) | Organization Design Patterns and Strategies | Single/multi-org patterns, red-green-sandbox-archive |

### Identity & Access Management

| # | Title | Topics |
|---|-------|--------|
| [03](docs/03-identity-access-management.md) | Identity and Access Management (IAM) | SAML SSO, SCIM, enterprise type selection |
| [04](docs/04-enterprise-managed-users.md) | Enterprise Managed Users (EMU) | EMU deep dive, advantages, best practices |

### Teams & Permissions

| # | Title | Topics |
|---|-------|--------|
| [05](docs/05-teams-permissions.md) | Teams and Permissions | Team structures, nested teams, permission models |
| [06](docs/06-policy-inheritance.md) | Policy Enforcement and Inheritance | Enterprise → Org → Repo policy enforcement |

### Repository Governance & Security

| # | Title | Topics |
|---|-------|--------|
| [07](docs/07-repository-governance.md) | Repository Governance | Rulesets, branch protection, templates |
| [08](docs/08-security-compliance.md) | Security and Compliance | Secret Protection, Code Security, audit logs |
| [11](docs/11-security-by-default-policies.md) | Security-by-Default Policies | Comprehensive security settings and recommendations |

### Best Practices & Architecture

| # | Title | Topics |
|---|-------|--------|
| [09](docs/09-best-practices-waf.md) | GitHub Well-Architected Framework | Best practices and principles |
| [10](docs/10-reference-architecture.md) | Reference Architecture | Architecture diagrams and patterns |

### Copilot & AI Governance

| # | Title | Topics |
|---|-------|--------|
| [12](docs/12-github-copilot-governance.md) | GitHub Copilot Governance | Enterprise Copilot policies, content exclusions, license management |

### Implementation & Migration

| # | Title | Topics |
|---|-------|--------|
| [13](docs/13-github-onboarding-implementation-plan.md) | Onboarding Implementation Plan | Priority task list for Enterprise onboarding |
| [14](docs/14-github-enterprise-importer-ado-guide.md) | GitHub Enterprise Importer — ADO Guide | Step-by-step migration from Azure DevOps |
| [15](docs/15-azure-pipelines-github-repos-integration.md) | Azure Pipelines with GitHub Repos | Impact analysis after migration |
| [16](docs/16-azure-devops-to-github-migration-analysis.md) | Azure DevOps to GitHub Migration Analysis | Detailed technical analysis |

### Security Deep Dives

| # | Title | Topics |
|---|-------|--------|
| [17](docs/17-github-actions-security-echo-command-injection.md) | Actions Security: Echo Command Injection | Preventing command injection in workflows |
| [18](docs/18-github-rename-org-impact.md) | Impact of Renaming a GitHub Organization | Copilot and user impact analysis |

### Operations, API & Advanced Topics

| # | Title | Topics |
|---|-------|--------|
| [19](docs/19-licenses-billing.md) | Licenses and Billing | License types, seat management, billing |
| [20](docs/20-github-marketplace-apps.md) | GitHub Marketplace and Apps | Apps, actions, integrations marketplace |
| [21](docs/21-user-administration.md) | User Administration and Dormant Users | User lifecycle, invitations, roles |
| [22](docs/22-audit-log-deep-dive.md) | Audit Log Deep Dive | Audit log streaming, SIEM, compliance |
| [23](docs/23-deployment-strategies.md) | Deployment Strategies | Environments, protection rules, OIDC |
| [24](docs/24-scripts-automation.md) | Scripts and Automation | gh CLI, API scripting, automation patterns |
| [25](docs/25-unhealthy-repos-git-history.md) | Unhealthy Repos and Git History | Large files, stale branches, repo health |
| [26](docs/26-user-privacy-data-residency.md) | User Privacy and Data Residency | Data residency, export, GDPR |
| [27](docs/27-integrations-status-api.md) | Third-Party Integrations and Status API | Webhooks, check runs, Status API |

---

## 📎 Supplementary Materials

| File | Description |
|------|-------------|
| [ADO to GitHub Migration Assessment](docs/ado-to-github-migration-assessment.md) | Comprehensive ADO DevSecOps mapping |
| [ADO to GitHub Migration Business Case](docs/ADO-to-GitHub-Migration-Business-Case.md) | Strategic business case |

---

## 🎓 Instructor & Workshop Materials

| File | Description |
|------|-------------|
| [Agenda](docs/AGENDA.md) | Full 2-day workshop agenda with timing |
| [Instructor Guide](docs/INSTRUCTOR-GUIDE.md) | Facilitator guide with talking points, demos, timing |
| [Pre-Workshop Checklist](docs/PRE-WORKSHOP-CHECKLIST.md) | Preparation checklist for participants and instructors |
| [Knowledge Checks](docs/KNOWLEDGE-CHECKS.md) | Module-by-module comprehension questions |
| [Post-Workshop Assessment](docs/POST-WORKSHOP-ASSESSMENT.md) | Learning outcomes and feedback |
| [FAQ](docs/FAQ-workshop.md) | Common workshop questions |
| [Reference Card](docs/REFERENCE-CARD.md) | Quick-reference guide for admins |
| [Slide Deck Outline](docs/SLIDE-DECK-OUTLINE.md) | Structure for creating presentation slides |
| [Day 1 Supplement Slides](docs/slides-day1-supplement.html) | Copilot governance, audit log, dormant users (13 slides) |
| [Day 2 Supplement Slides](docs/slides-day2-supplement.html) | Rulesets, security scanning, automation, CLI (21 slides) |

---

## 📚 Additional Resources

### Learning GitHub Admin

- [Microsoft Learn — GitHub Administration Collection](https://docs.microsoft.com/en-us/users/githubtraining/collections/mom7u1gzjdxw03)
- [GitHub Enterprise Onboarding Guide](https://resources.github.com/getting-started/enterprise/)
- [The Book on GitHub Enterprise Cloud Adoption](https://resources.github.com/devops/get-started-with-github-enterprise-cloud/)
- [GitHub Skills](https://skills.github.com/)

### GitHub Documentation

- [Enterprise administrators](https://docs.github.com/en/enterprise-cloud@latest/admin)
- [Organizations](https://docs.github.com/en/enterprise-cloud@latest/organizations)
- [Repositories](https://docs.github.com/en/enterprise-cloud@latest/repositories)
- [Roles in an organization](https://docs.github.com/en/organizations/managing-peoples-access-to-your-organization-with-roles/roles-in-an-organization#permission-levels-for-an-organization)
- [About Enterprise Managed Users](https://docs.github.com/en/enterprise-cloud@latest/admin/identity-and-access-management/using-enterprise-managed-users-for-iam/about-enterprise-managed-users)
- [Configuring SCIM provisioning for EMU](https://docs.github.com/en/enterprise-cloud@latest/admin/identity-and-access-management/using-enterprise-managed-users-and-saml-for-iam/configuring-scim-provisioning-for-enterprise-managed-users)
- [Managing a branch protection rule](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/managing-a-branch-protection-rule)
- [GitHub Actions — Security guides](https://docs.github.com/en/actions/security-guides)

### Changelog

- [GitHub Changelog](https://github.blog/changelog/)
- [Enterprise Changelog](https://github.blog/changelog/label/enterprise/)

### Videos

- [Universe 2024: New Previews and Releases](https://github.blog/news-insights/product-news/universe-2024-previews-releases/) — Multi-model Copilot, Copilot Autofix, enterprise governance, EMU improvements
- [Universe 2025: Welcome Home, Agents](https://github.blog/news-insights/company-news/welcome-home-agents/) — Agent HQ, mission control, enterprise AI controls, Copilot metrics dashboard
- [GitHub Universe Recap — What's New](https://github.com/events/universe/recap) — Latest announcements overview
- [Getting Started with GitHub Security](https://www.youtube.com/watch?v=zhxXaFzzJYA) — Security fundamentals tutorial
- [Let's Talk About GitHub Actions](https://github.blog/news-insights/product-news/lets-talk-about-github-actions/) — Actions re-architecture, YAML anchors, 2026 roadmap
- [GitHub Copilot: The Agent Awakens](https://github.blog/news-insights/product-news/github-copilot-the-agent-awakens/) — Agent mode, Copilot Edits, Project Padawan
- [GitHub Universe](https://githubuniverse.com/)

### Articles & Guides

- [Best practices for organizations and teams using GHEC](https://github.blog/2023-08-02-best-practices-for-organizations-and-teams-using-github-enterprise-cloud/)
- [How to secure your GitHub organization and enterprise account](https://github.blog/2020-07-23-how-to-secure-your-github-organization-and-enterprise-account/)
- [Connect GitHub Enterprise Cloud to Defender for Cloud Apps](https://docs.microsoft.com/en-us/defender-cloud-apps/connect-github-ec)
- [Defender for Cloud Apps — Protect your GitHub Enterprise environment](https://docs.microsoft.com/en-us/defender-cloud-apps/protect-github)
- [GitHub Workflow Guide](https://github.github.com/services-workflow-guide/#/)
- [Removing sensitive data from a repository](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)

---

*Licensed under [MIT](LICENSE). © GitHub Professional Services.*
