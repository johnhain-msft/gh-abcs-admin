# 7 - Security Scanning and Push Protection
In this lab you will enable and configure GitHub's security products — Secret Protection and Code Security — to detect secrets, scan code for vulnerabilities, manage Dependabot alerts, and enforce push protection policies across your repository and organization.
> Duration: 25-30 minutes

> **Prerequisites:** This lab requires **GitHub Secret Protection** ($19/active committer/month) and **GitHub Code Security** ($30/active committer/month) to be enabled on your workshop organization. Verify with your instructor that these products are provisioned before starting. Dependabot alerts are included with all GHEC plans at no additional cost.

> **Instructor Note:** For the 20-minute in-session time slot, focus on sections 7.1–7.4. Section 7.5 (auto-triage rules) is an optional extension if time permits.

References:
- [About secret scanning - GitHub Docs](https://docs.github.com/en/code-security/secret-scanning/introduction/about-secret-scanning)
- [About push protection - GitHub Docs](https://docs.github.com/en/code-security/secret-scanning/introduction/about-push-protection)
- [About code scanning with CodeQL - GitHub Docs](https://docs.github.com/en/code-security/code-scanning/introduction-to-code-scanning/about-code-scanning-with-codeql)
- [About Dependabot alerts - GitHub Docs](https://docs.github.com/en/code-security/dependabot/dependabot-alerts/about-dependabot-alerts)
- [About security configurations - GitHub Docs](https://docs.github.com/en/code-security/concepts/security-at-scale/about-security-configurations)
- [About delegated bypass for push protection - GitHub Docs](https://docs.github.com/en/code-security/secret-scanning/using-advanced-secret-scanning-and-push-protection-features/delegated-bypass-for-push-protection/about-delegated-bypass-for-push-protection)
- [Configuring auto-triage rules for Dependabot - GitHub Docs](https://docs.github.com/en/code-security/dependabot/dependabot-auto-triage-rules/about-dependabot-auto-triage-rules)
- [GitHub Secret Protection](https://github.com/security/advanced-security)
- [GitHub Code Security](https://github.com/security/advanced-security/code-security)
- [About the security overview - GitHub Docs](https://docs.github.com/en/code-security/security-overview/about-security-overview)

## What You'll Learn

- Enable and test secret scanning with push protection to block leaked credentials
- Configure CodeQL code scanning for automated vulnerability detection
- Review Dependabot alerts and configure auto-triage rules for dependency security

## 7.1 Enable secret scanning and push protection

Secret scanning is part of **GitHub Secret Protection** ($19/active committer/month). It detects known secret patterns — API keys, tokens, connection strings — that have been committed to your repository. Push protection extends this by blocking secrets _before_ they reach the remote.

1. Navigate to your repository on GitHub
2. Go to **Settings** → **Advanced Security** (under the "Security" section of the left sidebar)
3. Under the **Secret scanning** section, click **Enable** if it is not already active
4. Once secret scanning is enabled, locate the **Push protection** option directly below and click **Enable**
5. Review the confirmation — push protection is now active for all pushes to this repository
6. Optionally, expand the **AI detection** toggle if available — this enables AI-powered detection of unstructured secrets such as passwords and generic credentials (requires a GitHub Secret Protection license)

> **Org-level alternative:** Organization owners can enable these features at scale from **Settings** → **Advanced Security → Configurations**. Security configurations let you define a policy (e.g., "GitHub recommended" or a custom configuration) and apply it to all or selected repositories at once. This is the preferred approach for Enterprise Cloud administrators managing hundreds of repositories.

7. _(Optional)_ Configure **Delegated bypass for push protection**:
   - In the same **Advanced Security** settings page, under **Push protection**, click **Configure delegated bypass**
   - Add a bypass list — typically a security team or a specific GitHub Team
   - When a contributor's push is blocked, they can request a bypass; only members of the designated team can approve it
   - This gives your security team centralized control over push protection exceptions without disabling the feature

> **Note:** On public repositories, secret scanning (partner alerts) and push protection for users are free. The paid GitHub Secret Protection license adds push protection for the organization, AI-powered detection, validity checks, and non-provider pattern detection.

## 7.2 Test push protection

In this section you will intentionally trigger a push protection block to understand the developer experience.

1. Clone your repository locally if you have not already:
   ```bash
   git clone https://github.com/<your-org>/<your-repo>.git
   cd <your-repo>
   ```
2. Create a new branch for testing:
   ```bash
   git checkout -b test/secret-push-protection
   ```
3. Create a test file that contains a fake AWS-format secret key:
   ```bash
   echo 'aws_access_key_id = "AKIAIOSFODNN7EXAMPLE"' > test-secret.txt
   ```
4. Stage and commit the file:
   ```bash
   git add test-secret.txt
   git commit -m "test: trigger push protection"
   ```
5. Push the branch to the remote:
   ```bash
   git push origin test/secret-push-protection
   ```
6. Observe the push protection block — Git will reject the push with a message identifying the detected secret type (in this case, an AWS Access Key ID) and the file and line where it was found

> **Troubleshooting:** If the push goes through without being blocked, verify push protection is enabled at the repository level (Settings → Advanced Security → Push protection). Also confirm the test string uses the exact `AKIA` prefix — AWS key detection requires this format. **If the repo or org does not have GitHub Secret Protection licensed, push protection will not block regardless of UI state — check `/orgs/{org}/settings/billing/advanced-security` to verify licensing.** See the [Instructor Guide](../docs/INSTRUCTOR-GUIDE.md) for additional help.
7. Review the bypass options presented in the terminal output:
   - **It's used in tests** — marks the secret as a test credential
   - **It's a false positive** — the detected string is not actually a secret
   - **I'll fix it later** — acknowledges the secret and creates a secret scanning alert
8. Select one of the bypass options to unblock the push, or remove the secret from the file before pushing again

> **Enterprise policy note:** Organization and enterprise owners can restrict which bypass reasons are available to contributors. For example, you can disable "I'll fix it later" to enforce immediate remediation. This is configured under **Settings** → **Advanced Security** → **Push protection** at the organization level.

9. Clean up the test branch and file:
   ```bash
   git checkout main
   git branch -D test/secret-push-protection
   git push origin --delete test/secret-push-protection
   ```
10. If you bypassed the push, navigate to the **Security** tab → **Secret scanning** in your repository and dismiss or close the resulting alert

## 7.3 Enable code scanning with CodeQL

Code scanning with CodeQL is part of **GitHub Code Security** ($30/active committer/month). CodeQL is GitHub's semantic code analysis engine that finds security vulnerabilities and coding errors.

1. Navigate to your repository **Settings** → **Advanced Security**
2. Under **Code scanning**, locate the **CodeQL analysis** section
3. Click **Set up** → **Default**
4. Review the default setup configuration:
   - GitHub automatically detects the languages in your repository
   - The analysis runs on every push to the default branch and on every pull request targeting the default branch
   - Default setup covers the most common security queries for each detected language
5. Click **Enable CodeQL** to confirm
6. Navigate to the **Actions** tab to observe the CodeQL analysis workflow running — it may take several minutes depending on repository size and language

> **Troubleshooting:** If the CodeQL scan hasn't appeared in the Actions tab after 5 minutes, verify the workflow was created by checking `.github/workflows/` for a `codeql.yml` file. If the scan fails, check the workflow logs for language detection issues — you may need to switch to Advanced setup for compiled languages.

> **Timing note:** The initial CodeQL scan can take anywhere from 1 to 15+ minutes depending on repository size and languages. **Continue to the next section (7.4 Dependabot) while the scan runs** and return to review results afterward. This avoids idle waiting during the workshop.

> **Default vs. Advanced setup:** Default setup is the recommended starting point — it requires zero configuration and automatically updates when GitHub improves its query suites. Advanced setup generates a CodeQL workflow YAML file in your repository, giving you full control over languages, query suites, build commands, and schedule triggers. Use advanced setup when you need to analyze compiled languages with custom build steps, add third-party query packs, or integrate with monorepo configurations.

7. Once the scan completes, go to the **Security** tab → **Code scanning alerts**
8. Review any alerts that were found:
   - Each alert shows the vulnerability type (CWE), severity, file location, and a description of the issue
   - Click into an alert to see the data-flow path from source to sink
9. Look for the **Copilot Autofix** suggestion on applicable alerts — Copilot Autofix (included with GitHub Code Security) automatically generates a fix as a code suggestion that you can commit directly or open as a pull request
10. _(Optional)_ Dismiss a false-positive alert with a reason to train the system for your repository

## 7.4 Review Dependabot alerts

Dependabot alerts notify you when your repository depends on a package with a known security vulnerability. The dependency graph (enabled by default) powers this feature.

1. Navigate to the **Security** tab → **Dependabot alerts**
2. Review the list of alerts — each entry shows:
   - The affected package name and ecosystem (npm, pip, Maven, etc.)
   - The vulnerable version range and the patched version (if available)
   - The advisory severity (Critical, High, Medium, Low) and CVSS score
   - The GitHub Advisory Database identifier (GHSA)
3. Click on an alert to view its detail page:
   - Read the vulnerability description and remediation guidance
   - Check which manifest file (e.g., `package.json`, `requirements.txt`) introduced the dependency
   - If a patched version exists, note the **Dependabot security update** button — clicking it will open a pull request that bumps the dependency to the fixed version
4. Understand the distinction between Dependabot's two update mechanisms:
   - **Dependabot security updates** — automatically open PRs to fix _vulnerable_ dependencies; triggered by new advisories
   - **Dependabot version updates** — automatically open PRs to keep dependencies up to date based on a schedule you define in `.github/dependabot.yml`; these are proactive, not reactive to vulnerabilities
5. _(Optional)_ Navigate to **Insights** → **Dependency graph** to see the full dependency tree for your repository — this is the data source that powers Dependabot alerts

> **Governance perspective:** For organizations with hundreds of repositories, use the **Security overview** dashboard (**Organization** → **Security** tab) to see aggregated Dependabot alert counts, mean time to remediate (MTTR), and trends across all repositories. This is essential for compliance reporting and executive visibility.

## 7.5 Configure security auto-triage rules _(if time permits)_

Auto-triage rules let you automatically dismiss or act on Dependabot alerts based on criteria you define. Custom auto-triage rules require a **GitHub Code Security** license.

> **⏱️ Timing note:** This section is optional during in-session delivery. If the workshop is running behind schedule, skip to section 7.6 (Verification) and complete this section as self-paced practice.

1. Navigate to your repository **Settings** → **Advanced Security**
2. Scroll to the **Dependabot** section and locate **Dependabot rules**
3. Notice the built-in preset rule: **Dismiss low impact issues for development-scoped dependencies** — this rule automatically dismisses alerts for vulnerabilities that only affect dev dependencies (e.g., `devDependencies` in npm, `test` scope in Maven) and have low or moderate severity
4. Enable the preset rule by toggling it on
5. Click **New rule** to create a custom auto-triage rule:
   - **Rule name:** Give it a descriptive name (e.g., "Auto-dismiss low-severity npm dev alerts")
   - **Target alerts:** Select the filtering criteria:
     - **Ecosystem:** Choose a specific package ecosystem (e.g., npm, pip) or leave as "All"
     - **Scope:** Select "Development" to target only dev dependencies
     - **Severity:** Select "Low" and/or "Medium"
     - **Package name:** Optionally target specific packages
   - **Action:** Choose either:
     - **Dismiss** — automatically closes matching alerts with a reason
     - **Open a pull request** — automatically creates a Dependabot security update PR for matching alerts
6. Save the rule and verify it appears in the rules list

> **Org-level rules:** Organization owners can create auto-triage rules at the organization level under **Settings** → **Advanced Security** → **Configurations** → **Dependabot rules**. Organization-level rules apply across all repositories in the organization and take precedence over repository-level rules. This is the recommended approach for enforcing consistent triage policies at scale.

7. Review any alerts that were automatically dismissed by your new rule — they will appear in the **Closed** tab of Dependabot alerts with a label indicating they were auto-dismissed

> **Tip:** Start conservative with auto-triage rules. Begin by auto-dismissing only low-severity alerts on dev dependencies, monitor for a few weeks, then expand the criteria as your team gains confidence in the automation.

## 7.6 Verify your work

Use this checklist to confirm that all security features are properly configured.

1. **Secret scanning is active:**
   - Navigate to **Settings** → **Advanced Security**
   - Confirm that **Secret scanning** shows as **Enabled**
   - Confirm that **Push protection** shows as **Enabled** beneath it

2. **Push protection is working:**
   - Confirm that you successfully triggered (and resolved) a push protection block in section 7.2
   - If you bypassed a secret, confirm the resulting alert is visible under **Security** → **Secret scanning**

3. **Code scanning is configured:**
   - Navigate to the **Security** tab → **Code scanning alerts**
   - Confirm that at least one CodeQL analysis has completed (check the **Actions** tab for the CodeQL workflow run)
   - If alerts were found, confirm you can view alert details and see Copilot Autofix suggestions where available

4. **Dependabot alerts are accessible:**
   - Navigate to the **Security** tab → **Dependabot alerts**
   - Confirm the dependency graph is enabled (**Settings** → **Advanced Security** → **Dependency graph**)
   - Review at least one alert detail (or confirm the alert list loads if no vulnerable dependencies exist)

5. **Auto-triage rule is configured:**
   - Navigate to **Settings** → **Security** → **Code security** → **Dependabot rules**
   - Confirm at least one rule (built-in preset or custom) is enabled
   - Verify the rule criteria match your intended policy

6. **Organization-level review** _(if you have org admin access)_:
   - Navigate to your **Organization** → **Security** tab → **Security overview**
   - Confirm you can see the aggregated security posture across repositories
   - Review the coverage tab to identify repositories that do not yet have security features enabled

> **Note:** As of 2025, GitHub Advanced Security has been restructured into two standalone products: **GitHub Secret Protection** ($19/active committer/month) and **GitHub Code Security** ($30/active committer/month). These products are available on both GitHub Team and GitHub Enterprise Cloud plans. The umbrella term "GitHub Advanced Security" still exists and refers to both products together. When planning your security rollout, evaluate which product fits your organization's needs — many teams start with Secret Protection for immediate value and add Code Security as they mature their application security program. For public repositories, many of these features — including secret scanning partner alerts, push protection for users, CodeQL code scanning, Copilot Autofix, and dependency review — are available for free.
