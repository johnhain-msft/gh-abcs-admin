# Pre-Workshop Checklist

This checklist ensures all participants and instructors are prepared for the GitHub Admin Training workshop. Complete all items at least 1 week before the workshop date.

## Participant Requirements

### GitHub Account and Access

- [ ] GitHub.com account created and active
- [ ] Added to the workshop GitHub Enterprise Cloud organization
- [ ] Administrator access verified in the workshop organization
- [ ] Ability to create repositories in the workshop org

### Software and Tools

- [ ] Modern web browser (Chrome, Firefox, or Edge recommended)
- [ ] GitHub CLI (`gh`) installed — [installation guide](https://cli.github.com/)
- [ ] `gh` authenticated: run `gh auth login` and verify with `gh auth status`
- [ ] Git installed and configured with name/email
- [ ] Terminal/command line access (Terminal, PowerShell, or WSL)
- [ ] Text editor (VS Code recommended)

### Network and Environment

- [ ] Unrestricted access to github.com (no corporate proxy blocking API calls)
- [ ] Ability to clone repositories via HTTPS or SSH
- [ ] Screen sharing capability for remote delivery (if asked to demonstrate)

### Pre-Reading (Optional but Recommended)

- Review [Enterprise Hierarchy](01-enterprise-hierarchy.md) for GHEC structure overview
- Review [Repository Governance](07-repository-governance.md) for Day 2 context
- Complete the [Setup Guide](../labs/setup.md) if available

## Instructor Requirements

### Organization Setup

- [ ] GitHub Enterprise Cloud organization provisioned for the workshop
- [ ] All participants invited with **Owner** or **Admin** role
- [ ] At least one organization owner designated to share screen during activities
- [ ] Demo repositories created and tested (at least 1 repo with sample code)
- [ ] GitHub Actions enabled at the organization level
- [ ] Security features enabled (secret scanning, code scanning, Dependabot)

### Delivery Preparation

- [ ] Workshop agenda shared with participants ([AGENDA.md](AGENDA.md))
- [ ] Pre-workshop checklist sent at least 1 week before workshop
- [ ] Screen sharing and video conferencing tested
- [ ] Backup content available offline (in case of connectivity issues)
- [ ] [Instructor Guide](INSTRUCTOR-GUIDE.md) reviewed
- [ ] [Knowledge Checks](KNOWLEDGE-CHECKS.md) ready
- [ ] [Reference Card](REFERENCE-CARD.md) ready to distribute
- [ ] Breakout room setup tested (for remote discussion activities)

### VBD Specification Requirements

From the official VBD delivery specification:

> - "Provision the GitHub Enterprise Cloud organization"
> - "All users with computers, accounts, and access for GitHub.com"
> - "Ensure all attendees will have administrator access"
> - "Designate at least one owner or administrator to share their screen during activities"

## Environment Verification

### Quick Verification Steps

Run these commands to verify your environment is ready:

```bash
# Verify GitHub CLI
gh --version

# Verify authentication
gh auth status

# Verify git
git --version
git config user.name
git config user.email

# Verify org access (replace ORG with workshop org name)
gh api /orgs/ORG/memberships/$USER --jq '.role'
# Expected output: "admin"
```

### Troubleshooting

| Issue | Solution |
|-------|----------|
| `gh: command not found` | Install from https://cli.github.com/ |
| `gh auth status` shows not logged in | Run `gh auth login` and follow prompts |
| Cannot access organization | Contact instructor to verify invitation |
| Corporate proxy blocking API | Try: `gh config set http_unix_socket ""` or contact IT |
| Git not configured | Run `git config --global user.name "Your Name"` and `git config --global user.email "you@example.com"` |
