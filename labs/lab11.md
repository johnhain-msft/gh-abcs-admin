# 11 - GitHub Apps and Marketplace
In this lab you will browse the GitHub Marketplace, install and configure a GitHub App, review app permissions from an admin perspective, and evaluate the differences between GitHub Apps and OAuth Apps for enterprise governance.
> Duration: 15-20 minutes

> **⏱️ Estimated time:** 20 minutes | **Type:** Self-Paced Extension
>
> **What you'll learn:**
> - How to evaluate and install GitHub Apps from the Marketplace
> - How to review and manage app permissions for your organization
> - The key differences between GitHub Apps and OAuth Apps for enterprise governance

References:
- [About GitHub Apps](https://docs.github.com/en/apps/creating-github-apps/about-creating-github-apps/about-creating-github-apps)
- [GitHub Marketplace](https://github.com/marketplace)
- [Installing GitHub Apps](https://docs.github.com/en/apps/using-github-apps/installing-a-github-app-from-github-marketplace-for-your-organizations)
- [Differences between GitHub Apps and OAuth Apps](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/differences-between-github-apps-and-oauth-apps)
- [Reviewing and modifying installed GitHub Apps](https://docs.github.com/en/organizations/managing-programmatic-access-to-your-organization/reviewing-github-apps-installed-in-your-organization)
- [Setting a GitHub Actions policy for your enterprise](https://docs.github.com/en/enterprise-cloud@latest/admin/enforcing-policies/enforcing-policies-for-your-enterprise/enforcing-policies-for-github-actions-in-your-enterprise)
- [Registering a GitHub App](https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/registering-a-github-app)

## 11.1 Browse the GitHub Marketplace

1. Open a new browser tab and navigate to [https://github.com/marketplace](https://github.com/marketplace).
2. Observe that the Marketplace lists two categories of integrations: **Apps** and **Actions**. Click the **Apps** tab to focus on GitHub Apps.
3. Browse by category using the left sidebar. Explore categories relevant to enterprise administration:
   - **Code quality** (e.g., CodeClimate, SonarCloud)
   - **Code review** (e.g., Codacy, Pull Approve)
   - **Security** (e.g., Snyk, Socket, GitGuardian)
   - **Project management** (e.g., ZenHub, Zube)
4. Select 2-3 apps that are relevant to enterprise admin workflows. For each app, note:
   - The app name and publisher
   - Whether it displays the **Verified creator** badge (a blue checkmark indicating the publisher has verified their domain and undergone review by GitHub)
   - The pricing model (free, free trial, paid plans)
5. Click into one of the apps to examine its listing page. Review the description, screenshots, and the **Pricing and setup** section.
6. Discuss with your group:
   - What does the **Verified creator** badge signal to an enterprise admin evaluating an app?
   - Enterprise admins can enforce a policy that restricts GitHub Actions to those published by **verified creators only**. Navigate to **Enterprise** → **Policies** → **Actions** to see this setting.
   - How would you build an internal approval process for Marketplace apps before allowing installation across your enterprise?

> **Note:** The GitHub Marketplace is distinct from the newer [GitHub MCP Registry](https://github.com/mcp), which catalogs Model Context Protocol servers for AI tool integrations. Both represent extensibility surfaces that enterprise admins should be aware of, but they serve different purposes.

## 11.2 Install a GitHub App

1. Return to [https://github.com/marketplace](https://github.com/marketplace) and choose a free, low-risk GitHub App to install. Good candidates include labeling apps, notification bots, or stale-issue managers.
2. On the app's Marketplace listing, click the **Install it for free** (or **Set up a plan**) button.

> **Troubleshooting:** If the installation prompt doesn't appear or you receive a permissions error, verify you have org Owner or App Manager role. If you see "This app is not available for your organization," check whether your enterprise has a policy restricting GitHub App installations to approved apps only (Enterprise → Policies → GitHub Apps).
3. Select the organization where you want to install the app. If prompted, choose a free plan.
4. On the installation page, you will be asked to choose repository access:
   - **All repositories** — the app gains access to every repository in the organization, including future repositories.
   - **Only select repositories** — the app gains access only to the repositories you explicitly choose.
5. From a security and governance perspective, **Only select repositories** is the recommended default. Select one or two test repositories.
6. Review the list of permissions the app is requesting before clicking **Install**. These permissions are set by the app developer and define exactly what the app can read or write.
7. Click **Install** to complete the installation.
8. After installation, verify that the app appears in your organization settings:
   - Navigate to **Organization** → **Settings** → **Third-party Access** → **GitHub Apps**
   - You should see the newly installed app listed with its permissions summary and repository access scope.

## 11.3 Review app permissions

1. Navigate to **Organization** → **Settings** → **Third-party Access** → **GitHub Apps**.
2. Click **Configure** next to the app you installed in section 11.2.
3. On the app configuration page, review the permissions grouped into three categories:
   - **Repository permissions** — access to repository contents, issues, pull requests, workflows, metadata, etc.
   - **Organization permissions** — access to members, teams, organization projects, etc.
   - **Account permissions** — access to email addresses, profile information, etc.
4. Each permission has an access level: **No access**, **Read-only**, or **Read and write**. Verify that the app follows the principle of least privilege — it should only request permissions it actually needs.
5. Scroll to the **Repository access** section. You can change the app's access from **All repositories** to **Only select repositories** (or vice versa) at any time. Practice changing this setting:
   - If you chose "All repositories" during install, switch to "Only select repositories" and pick specific repos.
   - If you chose "Only select repositories," add or remove a repository from the list.
6. Note the difference between **suspending** and **uninstalling** an app:
   - **Suspend** — temporarily disables the app. It retains its configuration and permissions but stops receiving events and cannot make API calls. Useful for troubleshooting or temporary disablement.
   - **Uninstall** — permanently removes the app from the organization. All configuration is lost and the app must be reinstalled from scratch.

> **Troubleshooting:** If the **Suspend** option is grayed out or missing, the app may not support suspension. Not all GitHub Apps implement the suspension webhook — in that case, uninstalling and reinstalling is the only option to temporarily disable the app. See the [Instructor Guide](../docs/INSTRUCTOR-GUIDE.md) for additional help.

7. Discuss with your group: what governance controls would you put in place to ensure apps installed in your organization are regularly reviewed for appropriate permissions?

## 11.4 Evaluate OAuth App vs GitHub App

1. This section is a guided discussion and analysis exercise. Navigate to **Organization** → **Settings** → **Third-party access** to view any authorized OAuth Apps.
2. Compare the two integration types using the following reference table:

   | Characteristic | GitHub App | OAuth App |
   |---|---|---|
   | **Permission model** | Fine-grained, per-resource permissions (e.g., Issues: read-only, Contents: read-write) | Coarse OAuth scopes (e.g., `repo`, `admin:org`) |
   | **Token lifetime** | Short-lived installation tokens (1-hour expiry), automatically rotated | Long-lived tokens valid until the user revokes them |
   | **Seat consumption** | Does **not** consume a GHEC seat (acts as a bot identity) | Machine-user accounts **do** consume a GHEC seat |
   | **Rate limits** | Scales with the number of repositories and organization members (up to 12,500 requests/hour) | Fixed at 5,000 requests per hour per authenticated user |
   | **Acting identity** | Can act as itself (bot) or on behalf of a user (user-to-server tokens) | Always acts on behalf of the authorizing user |
   | **Webhook delivery** | Receives events at a single, centrally configured endpoint | Relies on OAuth authorization flow; no built-in webhook |
   | **Enterprise API access** | Cannot yet access the enterprise-level API object directly | Required for enterprise-level API access (e.g., `admin:enterprise` scope) |

3. Discuss the key decision question: **"When would you still need an OAuth App instead of a GitHub App?"**
   - The primary remaining use case is **enterprise-level API access**. GitHub Apps currently cannot interact with the enterprise object itself (e.g., managing enterprise members, querying enterprise audit logs). For these operations, an OAuth App or personal access token with the `admin:enterprise` scope is still required.
4. Discuss the migration path from OAuth Apps to GitHub Apps:
   - Identify existing OAuth App integrations and their scope usage.
   - Map OAuth scopes to the equivalent fine-grained GitHub App permissions.
   - Plan a phased migration: install the GitHub App alongside the OAuth App, validate functionality, then revoke the OAuth App.
5. Consider the security implications:
   - OAuth Apps with long-lived tokens represent a larger blast radius if a token is compromised.
   - GitHub Apps with 1-hour token expiry and fine-grained permissions provide a significantly smaller attack surface.
   - Enterprise admins should audit all OAuth App authorizations regularly via the **Third-party access** settings.

## 11.5 _(Optional)_ Register a test GitHub App

1. This section walks through registering your own GitHub App. It is optional because it requires additional setup time.
2. Navigate to **Settings** (personal account) → **Developer settings** → **GitHub Apps** → **New GitHub App**.
3. Fill in the required fields:
   - **GitHub App name** — choose a unique name (e.g., `yourname-test-app`)
   - **Homepage URL** — enter your organization's GitHub URL or any placeholder URL
   - **Webhook URL** — if you created a smee.io channel in Lab 01, reuse that URL here. Otherwise, create a new channel at [https://smee.io](https://smee.io) and paste the proxy URL.
4. Under **Permissions**, set minimal permissions to start:
   - **Repository permissions** → **Issues** → **Read-only**
   - Leave all other permissions at **No access**
5. Under **Where can this GitHub App be installed?**, select **Only on this account** for testing purposes.
6. Click **Create GitHub App**.
7. After creation, you will be taken to the app's settings page. Click **Generate a private key** to download a `.pem` file. This private key is used to authenticate as the app and generate installation tokens.
8. Note the **App ID** displayed on the settings page — you will need this along with the private key to authenticate.
9. _(Optional)_ Discuss **app manifests** and the **manifest flow**:
   - Instead of filling in the registration form manually, you can define your app's configuration in a JSON manifest and use the [App Manifest flow](https://docs.github.com/en/apps/creating-github-apps/setting-up-a-github-app/creating-a-github-app-from-a-manifest) to register it programmatically.
   - This is useful for distributing app configurations across teams or automating app setup in CI/CD pipelines.
10. Install the app on your test organization by navigating to the app's settings page and clicking **Install App** in the left sidebar.

## 11.6 Verify your work

1. Confirm that you browsed the **GitHub Marketplace** and identified at least 2-3 apps relevant to enterprise administration.
2. Confirm that you installed a GitHub App on your organization:
   - Navigate to **Organization** → **Settings** → **Third-party Access** → **GitHub Apps**
   - Verify the app appears in the list with the correct repository access scope.
3. Confirm that you reviewed the installed app's permissions and understand the three permission categories (repository, organization, account).
4. Confirm that you discussed the key differences between GitHub Apps and OAuth Apps, including when an OAuth App is still necessary.
5. _(Optional)_ If you completed section 11.5, confirm that your registered test app appears under **Settings** → **Developer settings** → **GitHub Apps** and that you generated a private key.
6. Review this governance checklist for GitHub App management in your enterprise:
   - [ ] An approval process exists for installing new GitHub Apps
   - [ ] Apps are limited to **Only select repositories** unless a broader scope is justified
   - [ ] Installed apps are reviewed quarterly for appropriate permissions
   - [ ] OAuth Apps are tracked separately and migration to GitHub Apps is planned where possible
   - [ ] Enterprise policy restricts Actions and apps to verified creators where appropriate
   - [ ] A process exists for revoking or suspending apps that are no longer needed
7. Discussion question: **"What governance policy would you set for GitHub App installations in your enterprise? How would you balance developer productivity with security controls?"**

> **Note:** GitHub Apps are the recommended integration type for building on the GitHub platform. They offer fine-grained permissions, short-lived tokens, and do not consume enterprise seats — making them more secure and cost-effective than OAuth Apps. When evaluating new integrations, always prefer a GitHub App over an OAuth App unless enterprise-level API access is specifically required.
