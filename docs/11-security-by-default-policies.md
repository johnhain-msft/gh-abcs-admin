# GitHub Security-by-Default: Policies and Settings Recommendations

This document provides comprehensive security policy and settings recommendations for GitHub Enterprise Cloud across three hierarchical levels: **Enterprise**, **Organization**, and **Repository**. Following these recommendations will help establish a strong security posture following the principle of "security by default."

> **Last Updated:** October 2, 2026

> ⚠️ **Important Compliance Note:** These recommendations are based on official GitHub documentation and the GitHub Well-Architected Framework. Settings may vary based on your enterprise type (EMU vs. standard), compliance requirements, and organizational needs. Always verify current documentation at [docs.github.com](https://docs.github.com) before implementing. Some policies behave differently for Enterprise Managed Users (EMU) enterprises vs. standard enterprises.

---

## Table of Contents

1. [Enterprise Level Policies](#enterprise-level-policies)
2. [Organization Level Settings](#organization-level-settings)
3. [Repository Level Settings](#repository-level-settings)
4. [References](#references)

---

## Enterprise Level Policies

Enterprise policies provide the highest level of governance and cascade down to all organizations and repositories. Enforcing policies at this level ensures consistent security controls across your entire enterprise.

### Identity and Access Management

| Level | Policy/Setting | Description | Recommended Setting | Reference |
|-------|---------------|-------------|---------------------|-----------|
| Enterprise | **Enterprise Managed Users (EMU)** | Centrally managed user accounts controlled through your identity provider | **Enable** - Use EMU for centralized identity management, ensuring all users are provisioned/deprovisioned through IdP | [About Enterprise Managed Users](https://docs.github.com/en/enterprise-cloud@latest/admin/identity-and-access-management/using-enterprise-managed-users-for-iam/about-enterprise-managed-users) |
| Enterprise | **SAML Single Sign-On** | Requires authentication through external identity provider | **Require** - Enforce SAML SSO for all organizations in the enterprise | [About SAML for Enterprise IAM](https://docs.github.com/en/enterprise-cloud@latest/admin/identity-and-access-management/using-saml-for-enterprise-iam/about-saml-for-enterprise-iam) |
| Enterprise | **Two-Factor Authentication** | Requires 2FA for all organization members | **Require** - Enforce 2FA for all members across the enterprise. **Note:** This policy is not available for EMU enterprises (EMU users authenticate via IdP) | [Enforcing policies for security settings](https://docs.github.com/en/enterprise-cloud@latest/admin/enforcing-policies/enforcing-policies-for-your-enterprise/enforcing-policies-for-security-settings-in-your-enterprise#requiring-two-factor-authentication-for-organizations-in-your-enterprise) |
| Enterprise | **Secure 2FA Methods** | Requires secure 2FA methods (passkeys, security keys, authenticator apps, GitHub mobile) | **Require** - Only allow secure 2FA methods; disallow SMS-based 2FA. **Note:** This policy is not available for EMU enterprises | [Requiring secure methods of two-factor authentication](https://docs.github.com/en/enterprise-cloud@latest/admin/enforcing-policies/enforcing-policies-for-your-enterprise/enforcing-policies-for-security-settings-in-your-enterprise#requiring-secure-methods-of-two-factor-authentication-for-organizations-in-your-enterprise) |
| Enterprise | **IP Allow List** | Restricts access to enterprise resources from specified IP addresses | **Enable** - Configure IP allow list with corporate network ranges. **Note:** For EMU enterprises, also select **Enable IP allow list user-level enforcement** (enterprise **Settings → Authentication security**, GA 2026-06-08) so repositories owned by managed user accounts, including forks, are covered for web, Git and API access with any credential. It is off by default; add every IP range your managed users connect from before you turn it on | [Restricting network traffic with IP allow list](https://docs.github.com/en/enterprise-cloud@latest/admin/configuration/configuring-your-enterprise/restricting-network-traffic-to-your-enterprise-with-an-ip-allow-list) |
| Enterprise | **SSH Certificate Authorities** | Manage SSH certificates for repository access | **Configure** - Add SSH CA for certificate-based authentication; upgrade CAs to require certificate expiration | [Managing SSH certificate authorities](https://docs.github.com/en/enterprise-cloud@latest/admin/enforcing-policies/enforcing-policies-for-your-enterprise/enforcing-policies-for-security-settings-in-your-enterprise#managing-ssh-certificate-authorities-for-your-enterprise) |
| Enterprise | **SSO Auto-Redirect (EMU)** | Automatically redirects unauthenticated users to IdP sign-in | **Enable** (for EMU) - Redirect users to SSO instead of showing 404 errors | [Managing SSO for unauthenticated users](https://docs.github.com/en/enterprise-cloud@latest/admin/enforcing-policies/enforcing-policies-for-your-enterprise/enforcing-policies-for-security-settings-in-your-enterprise#managing-sso-for-unauthenticated-users) |

### Repository Management Policies

| Level | Policy/Setting | Description | Recommended Setting | Reference |
|-------|---------------|-------------|---------------------|-----------|
| Enterprise | **Base Repository Permissions** | Default access level for all organization members | **None** - Set to "No permission" to enforce least privilege principle | [Enforcing a policy for base repository permissions](https://docs.github.com/en/enterprise-cloud@latest/admin/enforcing-policies/enforcing-policies-for-your-enterprise/enforcing-repository-management-policies-in-your-enterprise#enforcing-a-policy-for-base-repository-permissions) |
| Enterprise | **Repository Creation** | Controls who can create repositories | **Restrict** - Limit to Organization Owners or use automated repository creation workflows | [Enforcing a policy for repository creation](https://docs.github.com/en/enterprise-cloud@latest/admin/enforcing-policies/enforcing-policies-for-your-enterprise/enforcing-repository-management-policies-in-your-enterprise#enforcing-a-policy-for-repository-creation) |
| Enterprise | **Block User Namespace Repositories** | Prevents EMU users from creating personal repositories | **Enable** - Block creation of user namespace repositories for EMU enterprises. **Note:** If you allow them, enable IP allow list user-level enforcement (see [Identity and Access Management](#identity-and-access-management)) so the allow list also covers repositories owned by managed users | [Enforcing a policy for repository creation](https://docs.github.com/en/enterprise-cloud@latest/admin/enforcing-policies/enforcing-policies-for-your-enterprise/enforcing-repository-management-policies-in-your-enterprise#enforcing-a-policy-for-repository-creation) |
| Enterprise | **Public Repository Creation** | Controls creation of public repositories | **Disable** - Prevent members from creating public repositories | [GitHub Well-Architected - Governance Policies](https://wellarchitected.github.com/library/governance/recommendations/governance-policies-best-practices/) |
| Enterprise | **Repository Visibility Change** | Controls who can change repository visibility | **Restrict to Organization Owners** - Prevent accidental exposure of private code | [Enforcing a policy for changes to repository visibility](https://docs.github.com/en/enterprise-cloud@latest/admin/enforcing-policies/enforcing-policies-for-your-enterprise/enforcing-repository-management-policies-in-your-enterprise#enforcing-a-policy-for-changes-to-repository-visibility) |
| Enterprise | **Repository Deletion and Transfer** | Controls who can delete or transfer repositories | **Restrict to Organization Owners** - Prevent accidental data loss | [Enforcing a policy for repository deletion and transfer](https://docs.github.com/en/enterprise-cloud@latest/admin/enforcing-policies/enforcing-policies-for-your-enterprise/enforcing-repository-management-policies-in-your-enterprise#enforcing-a-policy-for-repository-deletion-and-transfer) |
| Enterprise | **Repository Forking** | Controls forking of private/internal repositories | **Restrict** - Allow forking only within the same organization or disable if not needed. **Note:** If EMU blocks user namespace repos and forking is allowed, users cannot fork to their user accounts regardless of this policy | [Enforcing a policy for forking private or internal repositories](https://docs.github.com/en/enterprise-cloud@latest/admin/enforcing-policies/enforcing-policies-for-your-enterprise/enforcing-repository-management-policies-in-your-enterprise#enforcing-a-policy-for-forking-private-or-internal-repositories) |
| Enterprise | **Default Branch Name** | Sets the default branch name for new repositories | **Enforce** - Set consistent default branch name (e.g., `main`) across enterprise | [Enforcing a policy for the default branch name](https://docs.github.com/en/enterprise-cloud@latest/admin/enforcing-policies/enforcing-policies-for-your-enterprise/enforcing-repository-management-policies-in-your-enterprise#enforcing-a-policy-for-the-default-branch-name) |
| Enterprise | **Outside Collaborators** | Controls who can invite external collaborators | **Restrict to Enterprise/Organization Owners** - Centralize control over external access | [Enforcing a policy for inviting outside collaborators](https://docs.github.com/en/enterprise-cloud@latest/admin/enforcing-policies/enforcing-policies-for-your-enterprise/enforcing-repository-management-policies-in-your-enterprise#enforcing-a-policy-for-inviting-outside-collaborators-to-repositories) |
| Enterprise | **Deploy Keys** | Controls creation and use of deploy keys | **Restrict** - Consider restricting or using GitHub Apps instead for better access control. **Warning:** Changing to disabled will disable existing deploy keys in all repositories | [Enforcing a policy for deploy keys](https://docs.github.com/en/enterprise-cloud@latest/admin/enforcing-policies/enforcing-policies-for-your-enterprise/enforcing-repository-management-policies-in-your-enterprise#enforcing-a-policy-for-deploy-keys) |
| Enterprise | **Issue Deletion** | Controls who can delete issues in repositories | **Restrict to Organization Owners** - Prevent loss of issue history | [Enforcing a policy for deleting issues](https://docs.github.com/en/enterprise-cloud@latest/admin/enforcing-policies/enforcing-policies-for-your-enterprise/enforcing-repository-management-policies-in-your-enterprise#enforcing-a-policy-for-deleting-issues) |

### Code Security and Analysis Policies

| Level | Policy/Setting | Description | Recommended Setting | Reference |
|-------|---------------|-------------|---------------------|-----------|
| Enterprise | **GitHub Advanced Security** | Controls availability of GitHub Secret Protection and GitHub Code Security. It does not control GitHub Code Quality, a separate paid product (GA 2026-07-20, $10 per active committer per month) with its own enterprise policy | **Enable for all organizations** - Allow organizations to enable advanced security features. **Note:** This policy only impacts repository administrators; organization owners and security managers can always enable security features. To stop organization owners changing features you set centrally, apply an enterprise security configuration with **Enforcement** set to **Enforce for repository and organization owners** (since 2026-09-15) | [Enforcing policies for code security and analysis](https://docs.github.com/en/enterprise-cloud@latest/admin/enforcing-policies/enforcing-policies-for-your-enterprise/enforcing-policies-for-code-security-and-analysis-for-your-enterprise) |
| Enterprise | **GitHub Code Quality** | Controls which organizations can use GitHub Code Quality (enterprise **Policies → Code Quality**: "Organization access" and "Repository admin policy"). Billed per active committer plus GitHub AI Credits and Actions minutes since 2026-07-20; access previously followed the Advanced Security policies, and those settings were copied to the Code Quality policies | **Allow for selected organizations** - Allow it where the cost is budgeted, and review where it is enabled. Restricting it also blocks Copilot-powered autofixes for code quality findings | [Allowing use of GitHub Code Quality in your enterprise](https://docs.github.com/en/enterprise-cloud@latest/code-security/how-tos/secure-at-scale/configure-enterprise-security/configure-specific-tools/allow-github-code-quality-in-enterprise) |
| Enterprise | **Dependabot Alerts** | Controls who can enable/disable Dependabot alerts | **Allow** - Enable for repository admins to manage Dependabot alerts | [Enforcing a policy to manage the use of Dependabot alerts](https://docs.github.com/en/enterprise-cloud@latest/admin/enforcing-policies/enforcing-policies-for-your-enterprise/enforcing-policies-for-code-security-and-analysis-for-your-enterprise#enforcing-a-policy-to-manage-the-use-of-dependabot-alerts-in-your-enterprise) |
| Enterprise | **Secret Scanning** | Automatically scans for exposed secrets | **Enable** - Enable secret scanning across all repositories | [About Secret Scanning](https://docs.github.com/en/enterprise-cloud@latest/code-security/secret-scanning/introduction/about-secret-scanning) |
| Enterprise | **Code Scanning (CodeQL)** | Automated security analysis of code | **Enable** - Enable CodeQL analysis for supported languages | [About code scanning with CodeQL](https://docs.github.com/en/enterprise-cloud@latest/code-security/code-scanning/introduction-to-code-scanning/about-code-scanning-with-codeql) |
| Enterprise | **Dependency Insights Visibility** | Controls visibility of dependency insights | **Enable** - Allow organization members to view dependency insights | [Enforcing a policy for visibility of dependency insights](https://docs.github.com/en/enterprise-cloud@latest/admin/enforcing-policies/enforcing-policies-for-your-enterprise/enforcing-policies-for-code-security-and-analysis-for-your-enterprise#enforcing-a-policy-for-visibility-of-dependency-insights) |
| Enterprise | **Copilot Autofix** | AI-powered security fix suggestions for code scanning results | **Enable** - Allow Copilot Autofix for code security results. **Note:** This policy controls Autofix for code scanning security queries only; Copilot Autofix is integral to GitHub Code Quality and cannot be disabled for that feature (Code Quality bills its AI features in AI Credits). Since 2026-07-10 the policy also covers agentic autofix (public preview): where Copilot cloud agent is available, assigning an alert to Copilot starts a cloud agent session billed in AI Credits plus Actions minutes, and disabling the policy turns off both experiences. Budget for that usage | [Enforcing a policy for Copilot Autofix](https://docs.github.com/en/enterprise-cloud@latest/admin/enforcing-policies/enforcing-policies-for-your-enterprise/enforcing-policies-for-code-security-and-analysis-for-your-enterprise#enforcing-a-policy-to-manage-the-use-of-copilot-autofix-in-your-enterprises-repositories) |
| Enterprise | **AI Detection for Secret Scanning** | Uses AI to detect generic passwords and secrets | **Enable** - Allow AI detection to find passwords and unstructured secrets. **Note:** This policy requires that repository administrators are allowed to enable Secret Protection (controlled by a separate policy) | [Enforcing a policy for AI detection](https://docs.github.com/en/enterprise-cloud@latest/admin/enforcing-policies/enforcing-policies-for-your-enterprise/enforcing-policies-for-code-security-and-analysis-for-your-enterprise#enforcing-a-policy-to-manage-the-use-of-ai-detection-for-secret-scanning-in-your-enterprises-repositories) |

### GitHub Actions Policies

| Level | Policy/Setting | Description | Recommended Setting | Reference |
|-------|---------------|-------------|---------------------|-----------|
| Enterprise | **Actions Availability** | Controls which organizations can use GitHub Actions | **Enable for all organizations** - Allow Actions while enforcing other restrictions | [Enforcing policies for GitHub Actions](https://docs.github.com/en/enterprise-cloud@latest/admin/enforcing-policies/enforcing-policies-for-your-enterprise/enforcing-policies-for-github-actions-in-your-enterprise) |
| Enterprise | **Allowed Actions** | Controls which actions can be used | **Restrict** - Allow only enterprise actions, GitHub actions, and verified creators | [Controlling access to public actions](https://docs.github.com/en/enterprise-cloud@latest/admin/enforcing-policies/enforcing-policies-for-your-enterprise/enforcing-policies-for-github-actions-in-your-enterprise#controlling-access-to-public-actions-and-reusable-workflows) |
| Enterprise | **Require Actions SHA Pinning** | Requires actions to be pinned to full commit SHA | **Enable** - Require full-length commit SHA for all actions. **Note:** SHA-pinned `actions/checkout` steps don't pick up backported fixes automatically. The 2026-07-20 backport that makes checkout refuse fork pull request code in `pull_request_target` workflows reached floating major tags (except v1) only, so keep pinned SHAs current with Dependabot | [Enforcing policies for GitHub Actions](https://docs.github.com/en/enterprise-cloud@latest/admin/enforcing-policies/enforcing-policies-for-your-enterprise/enforcing-policies-for-github-actions-in-your-enterprise) |
| Enterprise | **Default Workflow Permissions** | Controls default GITHUB_TOKEN permissions | **Read-only** - Set to read-only for all scopes. **Note:** Enterprises created on or after February 2, 2023 default to read-only; older enterprises may default to read-write | [Workflow permissions](https://docs.github.com/en/enterprise-cloud@latest/admin/enforcing-policies/enforcing-policies-for-your-enterprise/enforcing-policies-for-github-actions-in-your-enterprise#workflow-permissions) |
| Enterprise | **Allow Actions to Create PRs** | Controls if Actions can create/approve PRs | **Disable** - Prevent GITHUB_TOKEN from creating/approving pull requests | [Workflow permissions](https://docs.github.com/en/enterprise-cloud@latest/admin/enforcing-policies/enforcing-policies-for-your-enterprise/enforcing-policies-for-github-actions-in-your-enterprise#workflow-permissions) |
| Enterprise | **Fork Pull Request Workflows** | Controls workflow execution from fork PRs | **Require approval for all outside collaborators** - Prevent malicious workflow execution. **Note:** Workflows triggered by `pull_request_target` events always run regardless of approval settings. Restrict or block that event with workflow execution protections (next row); since 2026-06-18, `actions/checkout` v7 also refuses to check out fork pull request code in `pull_request_target` workflows unless the step sets `allow-unsafe-pr-checkout` | [Fork pull request workflows from outside collaborators](https://docs.github.com/en/enterprise-cloud@latest/admin/enforcing-policies/enforcing-policies-for-your-enterprise/enforcing-policies-for-github-actions-in-your-enterprise#fork-pull-request-workflows-from-outside-collaborators) |
| Enterprise | **Workflow Execution Protections** | Ruleset-based allowlists of who (actor rules) and which events (event rules) can trigger workflows, with evaluate mode, workflow file targeting and Insights. GA 2026-09-17; configured in the **Policies** section of Actions settings at enterprise, organization and repository level | **Configure** - Start in evaluate mode, then enforce: restrict `pull_request_target` and limit `workflow_dispatch` to maintainers. From 2026-11-02, a default rule blocks `pull_request_target` in public repositories that don't have their own event policy | [Workflow execution protections](./30-actions-workflow-execution-protections.md) |
| Enterprise | **Repository-Level Runners** | Controls creation of repository-level self-hosted runners | **Disable** - Prevent repository-level self-hosted runners; use org/enterprise level for better security control. Self-hosted runners at repository level pose risks as they may be compromised by untrusted code | [Runners policy](https://docs.github.com/en/enterprise-cloud@latest/admin/enforcing-policies/enforcing-policies-for-your-enterprise/enforcing-policies-for-github-actions-in-your-enterprise#runners) |

> **Workflow execution protections (GA 2026-09-17):** Approval settings and pinning don't stop someone with write access from triggering a workflow, or a `pull_request_target` workflow from running with secrets. Actor rules decide who can trigger workflows and event rules decide which events can; GitHub evaluates both before a run starts. Roll rules out in evaluate mode, check Insights, then enforce. From 2026-11-02, public repositories without their own event policy get a default rule that blocks `pull_request_target`; private and internal repositories aren't affected. See [Workflow execution protections](./30-actions-workflow-execution-protections.md) for setup and the REST API.

### Personal Access Token Policies

| Level | Policy/Setting | Description | Recommended Setting | Reference |
|-------|---------------|-------------|---------------------|-----------|
| Enterprise | **Fine-Grained PAT Access** | Controls fine-grained PAT access to resources | **Allow with approval** - Require approval for fine-grained PATs | [Enforcing policies for personal access tokens](https://docs.github.com/en/enterprise-cloud@latest/admin/enforcing-policies/enforcing-policies-for-your-enterprise/enforcing-policies-for-personal-access-tokens-in-your-enterprise) |
| Enterprise | **PAT (Classic) Access** | Controls classic PAT access to resources | **Restrict** - Consider restricting or blocking classic PATs in favor of fine-grained PATs | [Restricting access by personal access tokens](https://docs.github.com/en/enterprise-cloud@latest/admin/enforcing-policies/enforcing-policies-for-your-enterprise/enforcing-policies-for-personal-access-tokens-in-your-enterprise#restricting-access-by-personal-access-tokens) |
| Enterprise | **PAT Maximum Lifetime** | Sets maximum lifetime for PATs | **Enable** - Set maximum lifetime (e.g., 90-365 days) to limit exposure window. **Note:** For fine-grained PATs, the default maximum lifetime is 366 days. Classic PATs do not have an expiration requirement by default | [Enforcing a maximum lifetime policy](https://docs.github.com/en/enterprise-cloud@latest/admin/enforcing-policies/enforcing-policies-for-your-enterprise/enforcing-policies-for-personal-access-tokens-in-your-enterprise#enforcing-a-maximum-lifetime-policy-for-personal-access-tokens) |
| Enterprise | **Fine-Grained PAT Approval** | Requires approval for fine-grained PATs | **Require approval** - Require organization owner approval for PATs | [Enforcing an approval policy](https://docs.github.com/en/enterprise-cloud@latest/admin/enforcing-policies/enforcing-policies-for-your-enterprise/enforcing-policies-for-personal-access-tokens-in-your-enterprise#enforcing-an-approval-policy-for-fine-grained-personal-access-tokens) |

### GitHub Copilot Policies

| Level | Policy/Setting | Description | Recommended Setting | Reference |
|-------|---------------|-------------|---------------------|-----------|
| Enterprise | **Copilot Availability** | Controls which organizations can use Copilot | **Configure per organization** - Enable based on licensing and compliance needs | [Managing Copilot policies](https://docs.github.com/en/enterprise-cloud@latest/copilot/managing-copilot/managing-copilot-for-your-enterprise/managing-policies-and-features-for-copilot-in-your-enterprise) |
| Enterprise | **Copilot in IDE** | Controls code completion in IDEs | **Enable** - Allow for licensed users | [GitHub Copilot policies](https://docs.github.com/en/enterprise-cloud@latest/copilot/concepts/policies) |
| Enterprise | **Copilot in GitHub.com** | Controls Copilot features on github.com | **Enable** - Allow Copilot Chat on GitHub.com | [Managing Copilot policies](https://docs.github.com/en/enterprise-cloud@latest/copilot/managing-copilot/managing-copilot-for-your-enterprise/managing-policies-and-features-for-copilot-in-your-enterprise) |
| Enterprise | **Copilot Chat in IDE** | Controls Copilot Chat availability | **Enable** - Allow Chat for code assistance | [GitHub Copilot policies](https://docs.github.com/en/enterprise-cloud@latest/copilot/concepts/policies) |
| Enterprise | **Copilot CLI** | Controls Copilot in command line | **Enable** - Allow CLI assistance. **Note:** Since 2026-07-02, enabling Copilot CLI also enables **Allow use of Copilot CLI billed to the organization** by default: workflows with the `copilot-requests: write` permission can run Copilot CLI with `GITHUB_TOKEN`, billed to the organization in AI Credits. User-level budgets don't apply to that usage, so cap it with cost-center budgets, or turn the option off if you don't want org-billed CLI runs in Actions | [GitHub Copilot policies](https://docs.github.com/en/enterprise-cloud@latest/copilot/concepts/policies) |
| Enterprise | **GitHub Copilot app** | Controls access to the GitHub Copilot app. It has its own policy since 2026-07-27; before that, the Copilot CLI policy also governed the app | **Decide explicitly** - The default is **Enabled everywhere**; choose **Disabled everywhere** or **Let organizations decide** if the app isn't approved for your developers | [GitHub Copilot policies for enterprises and organizations](https://docs.github.com/en/enterprise-cloud@latest/copilot/concepts/enterprise/policies) |
| Enterprise | **Local Bring Your Own Key (BYOK) in IDEs** | Lets users add their own LLM provider keys for chat in their IDE (VS Code for Copilot Business and Enterprise since 2026-04-22; not code completions). Keys are handled client-side, requests don't go through GitHub's Copilot API, and the provider bills the usage outside AI Credits | **Disable** unless approved - The policy is on by default; allow it only for providers your data-handling review has approved | [Bring your own key for GitHub Copilot](https://docs.github.com/en/enterprise-cloud@latest/copilot/concepts/models/bring-your-own-key) |
| Enterprise | **Suggestions Matching Public Code** | Controls blocking of suggestions matching public code | **Block** - Prevent suggestions identical to public code | [Managing Copilot policies](https://docs.github.com/en/enterprise-cloud@latest/copilot/managing-copilot/managing-copilot-for-your-enterprise/managing-policies-and-features-for-copilot-in-your-enterprise) |
| Enterprise | **User Feedback Collection** | Allows collection of user feedback | **Optional** - Enable if participating in product improvement | [Managing Copilot policies](https://docs.github.com/en/enterprise-cloud@latest/copilot/managing-copilot/managing-copilot-for-your-enterprise/managing-policies-and-features-for-copilot-in-your-enterprise) |
| Enterprise | **Preview Features** | Allows access to preview Copilot features | **Disable** - Avoid preview features in production unless needed | [Managing Copilot policies](https://docs.github.com/en/enterprise-cloud@latest/copilot/managing-copilot/managing-copilot-for-your-enterprise/managing-policies-and-features-for-copilot-in-your-enterprise) |

### Audit and Compliance

| Level | Policy/Setting | Description | Recommended Setting | Reference |
|-------|---------------|-------------|---------------------|-----------|
| Enterprise | **Audit Log Streaming** | Streams audit logs to external SIEM/storage | **Enable** - Configure audit log streaming to your SIEM for monitoring and compliance | [Streaming the audit log](https://docs.github.com/en/enterprise-cloud@latest/admin/monitoring-activity-in-your-enterprise/reviewing-audit-logs-for-your-enterprise/streaming-the-audit-log-for-your-enterprise) |
| Enterprise | **Verified Domains** | Verifies ownership of email domains | **Configure** - Verify company domains to restrict notifications and add credibility. Verified domains also let secret scanning public monitoring (public preview since 2026-07-01) attribute leaks to your enterprise when someone commits with a work email from a personal account | [Verifying or approving a domain](https://docs.github.com/en/enterprise-cloud@latest/admin/configuration/configuring-user-applications-for-your-enterprise/verifying-or-approving-a-domain-for-your-enterprise) |

---

## Organization Level Settings

Organization settings provide granular control within the boundaries set by enterprise policies. These settings should complement enterprise policies while allowing necessary flexibility.

### Access and Permissions

| Level | Policy/Setting | Description | Recommended Setting | Reference |
|-------|---------------|-------------|---------------------|-----------|
| Organization | **Base Repository Permissions** | Default access for organization members | **No permission** or **Read** - Follow least privilege; use Read for innersource. **Note:** Internal repositories have a minimum visibility of read even if base permission is set to none | [Managing base permissions](https://docs.github.com/en/enterprise-cloud@latest/organizations/managing-user-access-to-your-organizations-repositories/managing-repository-roles/setting-base-permissions-for-an-organization) |
| Organization | **Member Privileges** | Controls what members can do in the organization | **Restrict** - Limit member capabilities to necessary functions | [Managing organization settings](https://docs.github.com/en/enterprise-cloud@latest/organizations/managing-organization-settings) |
| Organization | **Team Creation Permissions** | Controls who can create teams | **Restrict to Organization Admins** - Centralize team management | [Setting team creation permissions](https://docs.github.com/en/enterprise-cloud@latest/organizations/managing-organization-settings/setting-team-creation-permissions-in-your-organization) |
| Organization | **Team Synchronization** | Syncs teams with IdP groups | **Enable** - Sync teams with IdP groups for automatic provisioning | [Managing team synchronization](https://docs.github.com/en/enterprise-cloud@latest/organizations/managing-saml-single-sign-on-for-your-organization/managing-team-synchronization-for-your-organization) |
| Organization | **Outside Collaborator Permissions** | Controls adding outside collaborators | **Restrict** - Require organization owner approval | [Setting permissions for adding outside collaborators](https://docs.github.com/en/enterprise-cloud@latest/organizations/managing-organization-settings/setting-permissions-for-adding-outside-collaborators) |

### Repository Governance

| Level | Policy/Setting | Description | Recommended Setting | Reference |
|-------|---------------|-------------|---------------------|-----------|
| Organization | **Default Repository Visibility** | Default visibility for new repositories | **Internal** - Default to internal for innersource; prevent accidental public repos | [Governing how people use repositories](https://docs.github.com/en/enterprise-cloud@latest/organizations/managing-organization-settings/governing-how-people-use-repositories-in-your-organization) |
| Organization | **Repository Forking Policy** | Controls forking within the organization | **Restrict** - Allow forking only within the same organization | [Managing the forking policy](https://docs.github.com/en/enterprise-cloud@latest/organizations/managing-organization-settings/managing-the-forking-policy-for-your-organization) |
| Organization | **Repository Visibility Changes** | Controls who can change visibility | **Restrict** - Only allow organization owners to change visibility | [Restricting repository visibility changes](https://docs.github.com/en/enterprise-cloud@latest/organizations/managing-organization-settings/restricting-repository-visibility-changes-in-your-organization) |
| Organization | **Repository Deletion Permissions** | Controls who can delete repositories | **Restrict** - Only allow organization owners to delete repositories | [Setting permissions for deleting or transferring repositories](https://docs.github.com/en/enterprise-cloud@latest/organizations/managing-organization-settings/setting-permissions-for-deleting-or-transferring-repositories) |
| Organization | **Issue Deletion** | Controls who can delete issues | **Restrict** - Only allow organization owners to delete issues | [Allowing people to delete issues](https://docs.github.com/en/enterprise-cloud@latest/organizations/managing-organization-settings/allowing-people-to-delete-issues-in-your-organization) |

### Repository Rulesets (Organization Level)

| Level | Policy/Setting | Description | Recommended Setting | Reference |
|-------|---------------|-------------|---------------------|-----------|
| Organization | **Organization Rulesets** | Centralized branch/tag protection rules | **Enable** - Create organization-wide rulesets for consistent protection | [Creating rulesets for repositories in your organization](https://docs.github.com/en/enterprise-cloud@latest/organizations/managing-organization-settings/creating-rulesets-for-repositories-in-your-organization) |
| Organization | **Ruleset Bypass Permissions** | Controls who can bypass rulesets | **Restrict** - Limit bypass to specific roles with documented procedures | [Managing rulesets](https://docs.github.com/en/enterprise-cloud@latest/organizations/managing-organization-settings/managing-rulesets-for-repositories-in-your-organization) |
| Organization | **Custom Properties** | Metadata for repository classification | **Define** - Create properties for security tier, compliance, production status | [Managing custom properties](https://docs.github.com/en/enterprise-cloud@latest/organizations/managing-organization-settings/managing-custom-properties-for-repositories-in-your-organization) |

### Security Features

| Level | Policy/Setting | Description | Recommended Setting | Reference |
|-------|---------------|-------------|---------------------|-----------|
| Organization | **Security Configurations** | Organization-wide security settings | **Enable default configuration** - Apply consistent security settings to all repositories | [Creating a security configuration](https://docs.github.com/en/enterprise-cloud@latest/code-security/securing-your-organization/meeting-your-specific-security-needs-with-custom-security-configurations/creating-a-custom-security-configuration) |
| Organization | **Dependency Graph** | Visualizes repository dependencies | **Enable** - Enable for all repositories | [About the dependency graph](https://docs.github.com/en/enterprise-cloud@latest/code-security/supply-chain-security/understanding-your-software-supply-chain/about-the-dependency-graph) |
| Organization | **Dependabot Alerts** | Alerts for vulnerable dependencies | **Enable** - Enable for all repositories | [About Dependabot alerts](https://docs.github.com/en/enterprise-cloud@latest/code-security/dependabot/dependabot-alerts/about-dependabot-alerts) |
| Organization | **Dependabot Security Updates** | Automatic PRs for security fixes | **Enable** - Enable automatic security updates | [About Dependabot security updates](https://docs.github.com/en/enterprise-cloud@latest/code-security/dependabot/dependabot-security-updates/about-dependabot-security-updates) |
| Organization | **Secret Scanning** | Detects exposed secrets | **Enable** - Enable for all repositories | [About secret scanning](https://docs.github.com/en/enterprise-cloud@latest/code-security/secret-scanning/introduction/about-secret-scanning) |
| Organization | **Push Protection** | Blocks pushes containing secrets | **Enable** - Enable push protection for all repositories | [About push protection](https://docs.github.com/en/enterprise-cloud@latest/code-security/secret-scanning/introduction/about-push-protection) |
| Organization | **Push Protection Bypass** | Controls who can bypass push protection | **Restrict** - Limit bypass to specific roles/teams | [GitHub Well-Architected - Governance Policies](https://wellarchitected.github.com/library/governance/recommendations/governance-policies-best-practices/) |
| Organization | **Custom Secret Patterns** | Define custom patterns for organization-specific secrets | **Configure** - Add patterns for internal tokens, API keys, credentials | [Defining custom patterns](https://docs.github.com/en/enterprise-cloud@latest/code-security/secret-scanning/using-advanced-secret-scanning-and-push-protection-features/custom-patterns/defining-custom-patterns-for-secret-scanning) |
| Organization | **Generic Pattern Detection** | Detects generic secrets such as private keys and connection strings (renamed from "non-provider patterns" on 2026-07-10; AI-based detection of passwords is named "AI-detected secrets") | **Enable** - Enable detection of SSH keys, PGP keys, connection strings | [Supported secret scanning patterns](https://docs.github.com/en/enterprise-cloud@latest/code-security/secret-scanning/introduction/supported-secret-scanning-patterns) |
| Organization | **Code Scanning** | Automated code security analysis | **Enable** - Enable default setup for all repositories | [About code scanning](https://docs.github.com/en/enterprise-cloud@latest/code-security/code-scanning/introduction-to-code-scanning/about-code-scanning) |

### GitHub Actions (Organization Level)

| Level | Policy/Setting | Description | Recommended Setting | Reference |
|-------|---------------|-------------|---------------------|-----------|
| Organization | **Actions Permissions** | Controls which actions can run | **Restrict** - Allow only selected actions and verified creators | [Disabling or limiting GitHub Actions](https://docs.github.com/en/enterprise-cloud@latest/organizations/managing-organization-settings/disabling-or-limiting-github-actions-for-your-organization) |
| Organization | **Runner Groups** | Controls which organizations, repositories and workflows can use self-hosted runners, larger runners and, since 2026-06-25, macOS GitHub-hosted runners | **Configure** - Create runner groups limited to specific repositories. To force jobs through runner groups, disable standard GitHub-hosted runners (Team and Enterprise plans) after checking the concurrency impact | [Runner groups](https://docs.github.com/en/enterprise-cloud@latest/actions/concepts/runners/runner-groups) |
| Organization | **Organization Rulesets** | Enforces workflows across repositories (required workflows have been superseded by organization rulesets) | **Configure** - Define required security/compliance workflows via rulesets | [Managing rulesets for repositories](https://docs.github.com/en/enterprise-cloud@latest/organizations/managing-organization-settings/managing-rulesets-for-repositories-in-your-organization) |

### Webhooks and Integrations

| Level | Policy/Setting | Description | Recommended Setting | Reference |
|-------|---------------|-------------|---------------------|-----------|
| Organization | **Webhook Secrets** | Authenticates webhook payloads | **Required** - Always configure webhooks with secrets | [GitHub Well-Architected - Governance Policies](https://wellarchitected.github.com/library/governance/recommendations/governance-policies-best-practices/) |
| Organization | **Webhook SSL Verification** | Validates SSL for webhook endpoints | **Enable** - Configure webhooks to use SSL | [GitHub Well-Architected - Governance Policies](https://wellarchitected.github.com/library/governance/recommendations/governance-policies-best-practices/) |
| Organization | **GitHub App Permissions** | Controls installed app permissions | **Review** - Audit and minimize app permissions regularly | [Managing GitHub App installations](https://docs.github.com/en/enterprise-cloud@latest/organizations/managing-programmatic-access-to-your-organization/reviewing-github-apps-installed-in-your-organization) |

---

## Repository Level Settings

Repository settings provide the most granular control for individual repositories. These should be configured to meet specific project needs while adhering to organization and enterprise policies.

### Branch Protection and Rulesets

| Level | Policy/Setting | Description | Recommended Setting | Reference |
|-------|---------------|-------------|---------------------|-----------|
| Repository | **Ruleset - Require Pull Request** | Requires PRs before merging | **Enable** - Require PRs for default/protected branches | [About rulesets](https://docs.github.com/en/enterprise-cloud@latest/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets) |
| Repository | **Ruleset - Required Approvals** | Number of required PR approvals | **At least 1** (2+ for production) - Enforce peer review. **Note:** Since 2026-09-01 (public preview), Copilot code review can submit an approval that counts toward this rule if allowed: enterprise **AI controls → Copilot code review → Allow Copilot to approve pull requests** (default **Disabled everywhere**; other options **Let organizations decide** and **Enable for selected organizations**), and organizations then choose which repositories count Copilot approvals with **Count Copilot approvals toward merge requirements**. Keep it disabled, or require 2+ approvals so a person still reviews every change | [Rulesets Best Practices](https://wellarchitected.github.com/library/governance/recommendations/managing-repositories-at-scale/rulesets-best-practices/) |
| Repository | **Ruleset - Dismiss Stale Approvals** | Invalidates approvals on new commits | **Enable** - Ensure approvals apply to final code | [Rulesets Best Practices](https://wellarchitected.github.com/library/governance/recommendations/managing-repositories-at-scale/rulesets-best-practices/) |
| Repository | **Ruleset - Require CODEOWNERS Review** | Requires approval from code owners | **Enable** - Ensure domain experts review changes | [About code owners](https://docs.github.com/en/enterprise-cloud@latest/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners) |
| Repository | **Ruleset - Require Conversation Resolution** | Requires resolving review comments | **Enable** - Ensure feedback is addressed | [Rulesets Best Practices](https://wellarchitected.github.com/library/governance/recommendations/managing-repositories-at-scale/rulesets-best-practices/) |
| Repository | **Ruleset - Block Force Pushes** | Prevents force pushes to protected branches | **Enable** - Protect commit history integrity | [Rulesets Best Practices](https://wellarchitected.github.com/library/governance/recommendations/managing-repositories-at-scale/rulesets-best-practices/) |
| Repository | **Ruleset - Block Branch Deletion** | Prevents deletion of protected branches | **Enable** - Protect important branches from deletion | [Rulesets Best Practices](https://wellarchitected.github.com/library/governance/recommendations/managing-repositories-at-scale/rulesets-best-practices/) |
| Repository | **Ruleset - Require Signed Commits** | Requires GPG/SSH signed commits | **Enable** (if adoption ≥80%) - Ensure commit authenticity. **Note:** Consider organizational readiness before enforcing; developers need signing keys configured | [Rulesets Best Practices](https://wellarchitected.github.com/library/governance/recommendations/managing-repositories-at-scale/rulesets-best-practices/) |
| Repository | **Ruleset - Require Up-to-Date Branches** | Requires branch to be current before merging | **Enable** - Ensure CI runs on final merged code | [Rulesets Best Practices](https://wellarchitected.github.com/library/governance/recommendations/managing-repositories-at-scale/rulesets-best-practices/) |
| Repository | **Ruleset - Required Status Checks** | Requires CI/security checks to pass | **Enable** - Configure required CI, security, and compliance checks | [About rulesets](https://docs.github.com/en/enterprise-cloud@latest/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets) |
| Repository | **Ruleset - Require Code Scanning Results** | Requires code scanning to pass | **Enable** - Block merges with high/critical severity findings | [Rulesets Best Practices](https://wellarchitected.github.com/library/governance/recommendations/managing-repositories-at-scale/rulesets-best-practices/) |
| Repository | **Ruleset - Bypass Permissions** | Controls who can bypass rules | **Restrict** - Limit bypass to emergency situations with audit | [About rulesets](https://docs.github.com/en/enterprise-cloud@latest/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets) |

### Push Rules (Push Rulesets)

| Level | Policy/Setting | Description | Recommended Setting | Reference |
|-------|---------------|-------------|---------------------|-----------|
| Repository | **Restrict File Paths** | Blocks changes to sensitive paths | **Configure** - Protect `.github/`, security configs, CI/CD files | [Available rules for rulesets](https://docs.github.com/en/enterprise-cloud@latest/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets) |
| Repository | **Restrict File Extensions** | Blocks specific file types | **Configure** - Block executables, binaries (`.exe`, `.dll`, etc.) | [Rulesets Best Practices](https://wellarchitected.github.com/library/governance/recommendations/managing-repositories-at-scale/rulesets-best-practices/) |
| Repository | **Restrict File Size** | Limits maximum file size | **Configure** - Set appropriate limits to prevent large files | [Rulesets Best Practices](https://wellarchitected.github.com/library/governance/recommendations/managing-repositories-at-scale/rulesets-best-practices/) |

### Security Features (Repository Level)

| Level | Policy/Setting | Description | Recommended Setting | Reference |
|-------|---------------|-------------|---------------------|-----------|
| Repository | **Dependency Graph** | Tracks repository dependencies | **Enable** - Enable for dependency visibility | [About the dependency graph](https://docs.github.com/en/enterprise-cloud@latest/code-security/supply-chain-security/understanding-your-software-supply-chain/about-the-dependency-graph) |
| Repository | **Dependabot Alerts** | Alerts for vulnerable dependencies | **Enable** - Enable and monitor alerts | [Managing security and analysis settings](https://docs.github.com/en/enterprise-cloud@latest/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-security-and-analysis-settings-for-your-repository) |
| Repository | **Dependabot Security Updates** | Automatic security update PRs | **Enable** - Enable for automatic remediation | [About Dependabot security updates](https://docs.github.com/en/enterprise-cloud@latest/code-security/dependabot/dependabot-security-updates/about-dependabot-security-updates) |
| Repository | **Dependabot Version Updates** | Automatic dependency update PRs | **Enable** - Keep dependencies current | [About Dependabot version updates](https://docs.github.com/en/enterprise-cloud@latest/code-security/dependabot/dependabot-version-updates/about-dependabot-version-updates) |
| Repository | **Secret Scanning** | Detects committed secrets | **Enable** - Enable secret scanning | [About secret scanning](https://docs.github.com/en/enterprise-cloud@latest/code-security/secret-scanning/introduction/about-secret-scanning) |
| Repository | **Push Protection** | Blocks commits containing secrets | **Enable** - Prevent secret exposure at commit time | [About push protection](https://docs.github.com/en/enterprise-cloud@latest/code-security/secret-scanning/introduction/about-push-protection) |
| Repository | **Secret Scanning Validity Checks** | Validates if detected secrets are active | **Enable** - Prioritize active secrets for remediation | [Enabling validity checks](https://docs.github.com/en/enterprise-cloud@latest/code-security/secret-scanning/enabling-secret-scanning-features/enabling-validity-checks-for-your-repository) |
| Repository | **Code Scanning (CodeQL)** | Static analysis security scanning | **Enable default setup** - Enable CodeQL for supported languages | [About code scanning](https://docs.github.com/en/enterprise-cloud@latest/code-security/code-scanning/introduction-to-code-scanning/about-code-scanning) |
| Repository | **Private Vulnerability Reporting** | Allows private security reports | **Enable** - Enable for responsible disclosure | [About private vulnerability reporting](https://docs.github.com/en/enterprise-cloud@latest/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability) |

### Repository Configuration

| Level | Policy/Setting | Description | Recommended Setting | Reference |
|-------|---------------|-------------|---------------------|-----------|
| Repository | **CODEOWNERS File** | Defines code ownership | **Configure** - Create `.github/CODEOWNERS` for critical paths | [About code owners](https://docs.github.com/en/enterprise-cloud@latest/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners) |
| Repository | **Security Policy** | Documents security practices | **Create** - Add `SECURITY.md` with vulnerability reporting instructions | [Adding a security policy](https://docs.github.com/en/enterprise-cloud@latest/code-security/getting-started/adding-a-security-policy-to-your-repository) |
| Repository | **Repository Visibility** | Public, private, or internal | **Internal/Private** - Use internal for innersource; avoid public for proprietary code | [Setting repository visibility](https://docs.github.com/en/enterprise-cloud@latest/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/setting-repository-visibility) |
| Repository | **Merge Strategies** | Allowed merge methods | **Squash or Rebase** - Maintain clean commit history | [Managing repository settings](https://docs.github.com/en/enterprise-cloud@latest/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/about-merge-methods-on-github) |
| Repository | **Auto-Delete Head Branches** | Deletes branches after merge | **Enable** - Keep repository clean | [Managing the automatic deletion of branches](https://docs.github.com/en/enterprise-cloud@latest/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-the-automatic-deletion-of-branches) |
| Repository | **Commit Signoff** | Requires DCO sign-off | **Enable** (if required) - For compliance/licensing requirements | [Managing the commit signoff policy](https://docs.github.com/en/enterprise-cloud@latest/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/managing-the-commit-signoff-policy-for-your-repository) |

### GitHub Actions (Repository Level)

| Level | Policy/Setting | Description | Recommended Setting | Reference |
|-------|---------------|-------------|---------------------|-----------|
| Repository | **Actions Permissions** | Controls workflow execution | **Restrict** - Follow organization policy; use reusable workflows | [Managing GitHub Actions settings](https://docs.github.com/en/enterprise-cloud@latest/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository) |
| Repository | **Workflow Permissions** | GITHUB_TOKEN permissions | **Read-only** - Request specific permissions in workflow | [Modifying the permissions for the GITHUB_TOKEN](https://docs.github.com/en/enterprise-cloud@latest/actions/tutorials/authenticate-with-github_token#modifying-the-permissions-for-the-github_token) |
| Repository | **Require Approval for Fork PRs** | Requires approval before running workflows | **Enable** - Prevent malicious workflow execution from forks | [Managing GitHub Actions settings](https://docs.github.com/en/enterprise-cloud@latest/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository) |

---

## Quick Reference: Security Priority Matrix

| Priority | Setting Category | Key Actions |
|----------|-----------------|-------------|
| **Critical** | Identity & Access | Enable EMU/SAML SSO, Require 2FA (secure methods), Configure IP allow list |
| **Critical** | Secrets Protection | Enable secret scanning + push protection, Enable AI detection for generic secrets, Define custom patterns |
| **Critical** | Code Protection | Enable rulesets with required reviews, block force pushes, require status checks |
| **High** | Supply Chain | Enable Dependabot alerts/updates, dependency review in workflows |
| **High** | Code Quality | Enable CodeQL scanning, Copilot Autofix, require code scanning results in rulesets |
| **High** | Actions Security | Restrict actions to verified sources, read-only GITHUB_TOKEN, require approval for fork PRs, workflow execution protections for `pull_request_target` and `workflow_dispatch` |
| **High** | Access Control | Set base permissions to None/Read, restrict repository creation/visibility changes |
| **Medium** | PAT Management | Enforce PAT lifetime limits, require approval for fine-grained PATs, restrict classic PATs |
| **Medium** | Audit & Compliance | Enable audit log streaming, verify domains |
| **Medium** | Repository Hygiene | Enforce signed commits (where feasible), configure CODEOWNERS |
| **Medium** | Copilot Governance | Block suggestions matching public code, control Copilot feature availability |

---

## References

### Official GitHub Documentation

1. **Enterprise Policies**
   - [Setting policies for your enterprise](https://docs.github.com/en/enterprise-cloud@latest/admin/enforcing-policies)
   - [Enforcing repository management policies](https://docs.github.com/en/enterprise-cloud@latest/admin/enforcing-policies/enforcing-policies-for-your-enterprise/enforcing-repository-management-policies-in-your-enterprise)
   - [Enforcing policies for security settings](https://docs.github.com/en/enterprise-cloud@latest/admin/enforcing-policies/enforcing-policies-for-your-enterprise/enforcing-policies-for-security-settings-in-your-enterprise)
   - [Enforcing policies for code security and analysis](https://docs.github.com/en/enterprise-cloud@latest/admin/enforcing-policies/enforcing-policies-for-your-enterprise/enforcing-policies-for-code-security-and-analysis-for-your-enterprise)
   - [Enforcing policies for GitHub Actions](https://docs.github.com/en/enterprise-cloud@latest/admin/enforcing-policies/enforcing-policies-for-your-enterprise/enforcing-policies-for-github-actions-in-your-enterprise)
   - [Enforcing policies for personal access tokens](https://docs.github.com/en/enterprise-cloud@latest/admin/enforcing-policies/enforcing-policies-for-your-enterprise/enforcing-policies-for-personal-access-tokens-in-your-enterprise)
   - [Managing Copilot policies for your enterprise](https://docs.github.com/en/enterprise-cloud@latest/copilot/managing-copilot/managing-copilot-for-your-enterprise/managing-policies-and-features-for-copilot-in-your-enterprise)

2. **Organization Settings**
   - [Managing organization settings](https://docs.github.com/en/enterprise-cloud@latest/organizations/managing-organization-settings)
   - [Creating rulesets for repositories in your organization](https://docs.github.com/en/enterprise-cloud@latest/organizations/managing-organization-settings/creating-rulesets-for-repositories-in-your-organization)
   - [Managing custom properties for repositories](https://docs.github.com/en/enterprise-cloud@latest/organizations/managing-organization-settings/managing-custom-properties-for-repositories-in-your-organization)

3. **Repository Settings**
   - [Managing your repository's settings and features](https://docs.github.com/en/enterprise-cloud@latest/repositories/managing-your-repositorys-settings-and-features)
   - [About rulesets](https://docs.github.com/en/enterprise-cloud@latest/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)
   - [Available rules for rulesets](https://docs.github.com/en/enterprise-cloud@latest/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets)

4. **Security Features**
   - [About secret scanning](https://docs.github.com/en/enterprise-cloud@latest/code-security/secret-scanning/introduction/about-secret-scanning)
   - [About push protection](https://docs.github.com/en/enterprise-cloud@latest/code-security/secret-scanning/introduction/about-push-protection)
   - [Defining custom patterns for secret scanning](https://docs.github.com/en/enterprise-cloud@latest/code-security/secret-scanning/using-advanced-secret-scanning-and-push-protection-features/custom-patterns/defining-custom-patterns-for-secret-scanning)
   - [Supported secret scanning patterns](https://docs.github.com/en/enterprise-cloud@latest/code-security/secret-scanning/introduction/supported-secret-scanning-patterns)
   - [About code scanning with CodeQL](https://docs.github.com/en/enterprise-cloud@latest/code-security/code-scanning/introduction-to-code-scanning/about-code-scanning-with-codeql)
   - [About Dependabot alerts](https://docs.github.com/en/enterprise-cloud@latest/code-security/dependabot/dependabot-alerts/about-dependabot-alerts)

5. **Identity and Access Management**
   - [About Enterprise Managed Users](https://docs.github.com/en/enterprise-cloud@latest/admin/identity-and-access-management/using-enterprise-managed-users-for-iam/about-enterprise-managed-users)
   - [Restricting network traffic with IP allow list](https://docs.github.com/en/enterprise-cloud@latest/admin/configuration/configuring-your-enterprise/restricting-network-traffic-to-your-enterprise-with-an-ip-allow-list)

### GitHub Well-Architected Framework

6. [GitHub Well-Architected Framework](https://wellarchitected.github.com/)
7. [Application Security Pillar](https://wellarchitected.github.com/library/application-security/)
8. [Governance Pillar](https://wellarchitected.github.com/library/governance/)
9. [GitHub Enterprise Policies & Best Practices](https://wellarchitected.github.com/library/governance/recommendations/governance-policies-best-practices/)
10. [Rulesets Best Practices](https://wellarchitected.github.com/library/governance/recommendations/managing-repositories-at-scale/rulesets-best-practices/)
11. [Custom Properties Best Practices](https://wellarchitected.github.com/library/governance/recommendations/managing-repositories-at-scale/custom-properties-best-practices/)

### GitHub Resources and Blog

12. [Configure GitHub Enterprise Cloud enterprise settings and policies](https://resources.github.com/learn/pathways/administration-governance/essentials/configure-github-enterprise-cloud-enterprise-settings-policies/)
13. [Best practices for organizations and teams using GitHub Enterprise Cloud](https://github.blog/enterprise-software/devops/best-practices-for-organizations-and-teams-using-github-enterprise-cloud/)
14. [Best practices for enterprises](https://docs.github.com/en/enterprise-cloud@latest/admin/overview/best-practices-for-enterprises)
15. [The Book on GitHub Enterprise Cloud Adoption](https://resources.github.com/devops/book-on-github-enterprise-adoption/)

### Community Resources

16. [Locking Down GitHub Enterprise: A Security-First Approach](https://github.com/orgs/community/discussions/182182)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | January 2026 | Initial document creation |
| 1.1 | January 20, 2026 | Accuracy review: Added EMU-specific clarifications, updated policy notes for 2FA, workflow permissions, PAT lifetimes, fork restrictions, deploy keys, Copilot Autofix, AI detection, and signed commits |
| 1.2 | October 2, 2026 | Apr–Oct 2026 changelog refresh: IP allow list user-level enforcement for EMU, enforced enterprise security configurations, GitHub Code Quality policy, agentic autofix, workflow execution protections and `pull_request_target` defaults, runner groups, Copilot CLI billed to the organization, GitHub Copilot app and local BYOK policies, Copilot approvals, generic patterns rename, public monitoring via verified domains |

---

> **Note:** This document should be reviewed and updated regularly as GitHub releases new features and security capabilities. Always refer to the official GitHub documentation for the most current information.
