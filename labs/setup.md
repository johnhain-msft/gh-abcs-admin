# Hands-on Labs Setup
In this lab you will use the repository to create your own admin repository
> Duration: 5 minutes

References:
- [Fork a repo](https://docs.github.com/en/get-started/quickstart/fork-a-repo)
- [Creating a repository from a template](https://docs.github.com/en/enterprise-cloud@latest/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template)

## 1.  Fork the current repository

1. Fork the current repository [gh-abcs-admin](https://github.com/githubabcs/gh-abcs-admin)
2. _(Optional)_ Clone the repository by importing it into your own account.

## 2. _(Optional)_ Creating a repository from current template

1. Navigate to the main page of the repository [gh-abcs-admin](https://github.com/githubabcs/gh-abcs-admin)
2. Click `Use this template`
3. Follow the instructions to create your own repository from this template
4. Name the repository `gh-abcs-admin-[USERNAME]`

## 3. Prerequisites

For full environment prerequisites and instructor setup, see the [Pre-Workshop Checklist](../docs/PRE-WORKSHOP-CHECKLIST.md).

> **📝 Note your workshop organization name:** `___________________________`
> You will use this as `YOUR-ORG` throughout the labs. Your instructor will share the org name during the welcome session.

Minimum requirements:
- GitHub.com account with access to the workshop organization
- Modern web browser (Chrome, Firefox, or Edge)
- [GitHub CLI (`gh`)](https://cli.github.com/) installed
- Git installed and configured with name/email
- Terminal or command-line access

## 4. Verify Your Environment

Run these commands to confirm your tools are ready:

```bash
gh --version
```

Expected output (version may vary):

```
gh version 2.x.x (20xx-xx-xx)
```

```bash
gh auth status
```

Expected output:

```
github.com
  ✓ Logged in to github.com account YOUR-USERNAME (keyring)
  ✓ Git operations for github.com configured to use https protocol.
  ✓ Token: gho_************************************
  ✓ Token scopes: 'admin:org', 'gist', 'read:enterprise', 'repo', 'workflow'
```

```bash
git --version
```

Expected output:

```
git version 2.x.x
```

## 5. Troubleshooting

| Issue | Solution |
|-------|----------|
| `gh: command not found` | Install the GitHub CLI from [cli.github.com](https://cli.github.com/). On macOS use `brew install gh`, on Windows use `winget install --id GitHub.cli`. |
| `gh auth status` shows not logged in | Run `gh auth login`, select `GitHub.com`, and follow the browser-based authentication prompts. |
| Cannot clone or push to repositories | Verify your organization membership. Contact the instructor to confirm your invitation was accepted. |
| API calls fail or time out behind a corporate network | Check with your IT team whether proxies or firewalls block `github.com` or `api.github.com`. You may need to configure proxy settings: `git config --global http.proxy http://proxy:port`. |

## 6. Network Requirements

> **Note:** This workshop requires unrestricted HTTPS access to `github.com`, `api.github.com`, and `*.githubusercontent.com`. If your organization uses a corporate proxy or firewall, verify these domains are allowed before the workshop. VPN split-tunneling may also need to be configured to allow direct access to GitHub endpoints.
