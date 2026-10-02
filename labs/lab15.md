# 15 - Copilot Governance Configuration
In this lab you will configure and review GitHub Copilot policies, manage seat assignments, set up content exclusions, and explore audit events to govern Copilot usage across your organization.
> Duration: 15-20 minutes

> **Prerequisites:** This lab requires **GitHub Copilot Business** ($19/user/month) or **Copilot Enterprise** ($39/user/month) to be provisioned on your workshop organization. Verify with your instructor that Copilot licenses are assigned before starting. You can still review the policy settings UI without an active subscription, but seat management and audit events require an active license.

> **Environment note:** This lab is written for **organization-level** access. All hands-on steps work with an org admin account — no enterprise account is needed. Enterprise-level policy views are included in collapsible sections for participants who have enterprise access.

References:
- [Managing Copilot policies for your organization](https://docs.github.com/en/enterprise-cloud@latest/copilot/managing-copilot/managing-github-copilot-in-your-organization/managing-policies-for-copilot-in-your-organization)
- [Configuring content exclusions for GitHub Copilot](https://docs.github.com/en/enterprise-cloud@latest/copilot/managing-copilot/managing-github-copilot-in-your-organization/configuring-content-exclusions-for-github-copilot)
- [Managing GitHub Copilot access in your organization](https://docs.github.com/en/enterprise-cloud@latest/copilot/managing-copilot/managing-github-copilot-in-your-organization/granting-access-to-copilot-for-members-of-your-organization)
- [Reviewing audit logs for Copilot events](https://docs.github.com/en/enterprise-cloud@latest/admin/monitoring-activity-in-your-enterprise/reviewing-audit-logs-for-your-enterprise/audit-log-events-for-your-enterprise)
- [Using the Copilot usage metrics API](https://docs.github.com/en/enterprise-cloud@latest/rest/copilot/copilot-metrics)
- [About GitHub Copilot Enterprise](https://docs.github.com/en/enterprise-cloud@latest/copilot/about-github-copilot/subscription-plans-for-github-copilot)

## What You'll Learn

- Configure Copilot organization policies including public code matching and agent controls
- Set up content exclusions to prevent Copilot from accessing sensitive files
- Manage seat assignments and review Copilot audit events for governance

## 15.1 Review Copilot organization policies

1. Navigate to your organization on GitHub.com and click **Settings** in the top navigation bar.
2. In the left sidebar, under **Code, planning, and automation**, click **Copilot**, then **Policies**. This opens the Copilot policy configuration page for your organization.

> **Troubleshooting:** If the **Copilot** option doesn't appear in the left sidebar, verify your organization has a GitHub Copilot Business or Enterprise subscription assigned. Without an active license, the Copilot configuration page may not be visible. Contact your enterprise owner to verify license allocation. See the [Instructor Guide](../docs/INSTRUCTOR-GUIDE.md) for additional help.

3. Review the **Access** setting (**Copilot** → **Access**). This controls whether Copilot is **Enabled** or **Disabled** for organization members. Note the current setting, then return to **Policies**.
4. Review the **Suggestions matching public code** policy. When set to **Blocked**, Copilot suppresses code suggestions that closely match publicly available code on GitHub. This is an important IP compliance control.
5. Review the **Copilot cloud agent** policy (formerly "Copilot coding agent"). When enabled, members can use Copilot to work on issues and pull requests directly on GitHub.com. Since 2026-04-03, organization owners can also govern the agent for every repository:
   - **Copilot** → **Internet access**: the agent firewall (**Enable firewall**, **Recommended allowlist**, **Allow repository custom rules** and the **Organization custom allowlist**). By default, each repository decides.
   - **Copilot** → **Cloud agent**: the default **Runner type**, and whether repositories may customize it.
6. Review the **Copilot code review** policy. When enabled, members can request AI-powered code reviews on pull requests. Since 2026-06-01, each review also uses GitHub Actions minutes on private repositories. Open **Copilot** → **Code review** to see the review effort level and the **Approvals** setting, which decides whether Copilot approvals count toward merge requirements (public preview since 2026-09-01). Since 2026-07-17, code review has its own section on the **Internet access** page; its default runner is set under **Copilot** → **Runner type**.
7. Review the **Agent mode (IDE)** policy. This controls whether members can use agentic coding capabilities within their IDE (e.g., VS Code, JetBrains).
8. Review the **GitHub Copilot app** policy. Since 2026-07-27, the desktop app has its own policy, separate from **Copilot CLI**; the enterprise default is **Enabled everywhere**.
9. On the same **Policies** page, review **MCP servers in Copilot**. This controls whether organization members can connect Copilot to external Model Context Protocol servers. Which servers may run is a separate control: since 2026-08-06, enterprise owners can approve or block individual servers with `allowedMcpServers` and `deniedMcpServers` in enterprise managed settings.

> **Tip:** Policies decide which Copilot features users get. Since 2026-07-01, enterprise managed settings (`copilot/managed-settings.json` in the enterprise's `.github-private` repository) decide how Copilot clients behave, for example blocking bypass ("yolo") mode or limiting MCP servers. [Lab 17](lab17.md) covers them.

<details>
<summary>🏛️ Enterprise Path — view enterprise-wide Copilot policies (requires enterprise owner access)</summary>

1. Navigate to `https://github.com/enterprises/YOUR-ENTERPRISE` and click **AI controls** at the top of the page.
2. The sidebar has three pages: **Agents**, **Copilot**, and **MCP**.
   - **Copilot**: under "Features & clients", click **Configure features & clients** for feature and client policies, including **GitHub Copilot app** (since 2026-07-27). **Configure models** sets each model to **Enabled**, **Disabled** or a delegate state, and **Targeted model rules** (public preview since 2026-05-26) allow specific models for selected organizations. The **Default policy for new features** is on this page too.
   - **Agents**: under "Available agents", **Copilot Cloud Agent** offers **Enabled for selected organizations** (since 2026-04-15) besides enabling it everywhere, disabling it everywhere or letting organizations decide, so you can run a pilot. This page also shows the organization that holds the enterprise managed settings (see [Lab 17](lab17.md)).
   - **MCP**: the **MCP servers in Copilot** policy.
3. Enterprise-level policies cascade down to all organizations in the enterprise — an organization cannot enable a capability that the enterprise has disabled.
4. An enterprise policy left **Unconfigured** is not simply **Disabled**. From 2026-10-22, eligible generally available features left Unconfigured follow the enterprise's **Default policy for new features**, which ships **Enabled**. Unconfigured models already follow **Default availability for released models** (shown as **Delegate to Default Policy**). Set every policy you care about explicitly.

</details>

> **Note:** If your workshop organization does not have a Copilot Business or Enterprise license, you can still navigate to the **Settings → Copilot** page to review the available policy options. The UI will display the configuration controls even without an active subscription, though changes will not take effect until a license is assigned.

10. Discuss with your table: GitHub offers several Copilot plans — **Free**, **Student**, **Pro** ($10/user/mo), **Pro+** ($39/user/mo), **Max** ($100/user/mo), **Business** ($19/user/mo), and **Enterprise** ($39/user/mo). Since 2026-06-01, every plan bills in GitHub AI Credits: Business includes 1,900 and Enterprise 3,900 AI Credits per user per month, pooled across the billing entity. Verified students get Copilot Student free, and verified teachers and maintainers of popular open source projects may get Copilot Pro free. Enterprise adds a larger AI Credits pool; policy controls, audit logs, content exclusions and custom models come with both plans. Copilot IDE features (completions, chat, agent mode) work for GHES users licensed via github.com, but github.com-native features — cloud agent, pull request code review, and web-based Copilot chat — require GHEC.

## 15.2 Configure content exclusions

1. Navigate to your organization **Settings** → **Copilot** → **Content exclusion** (this may appear as a tab or subsection on the Copilot settings page).

2. Click **Add exclusion** (or **New rule**) to create a new content exclusion rule.
3. In the **Repository** field, select a specific repository from your organization — or enter `*` to apply the rule to all repositories in the organization.
4. In the **Paths** field, add the following glob patterns to exclude sensitive files from Copilot suggestions:

   ```
   **/*.env
   **/secrets/**
   **/config/production/**
   ```

5. Click **Save** to apply the content exclusion rule.
6. Understand what content exclusions do and do not do:
   - **Do:** Suppress Copilot code completions and chat responses for files matching the specified patterns. When a developer opens an excluded file in their IDE, Copilot will not generate inline suggestions.
   - **Do:** Prevent Copilot from using excluded file content as context for suggestions in *other* files. Excluded content is not sent to the Copilot service.
   - **Do:** Apply in Copilot CLI and the GitHub Copilot app (generally available since 2026-09-02, Business and Enterprise), and in Copilot code review, which since 2026-06-12 doesn't review excluded files.
   - **Do not:** Cover the **Edit** and **Agent** modes of Copilot Chat in VS Code and other editors, or third-party agents.
   - **Do not:** Affect files that are already not tracked by Git (e.g., `.gitignore`-excluded files). For files that are in the repository, content exclusions are the primary governance mechanism.
   - **Limitation:** Content exclusions may take **up to 30 minutes** to propagate to IDE clients.
7. Discuss when to apply content exclusions:
   - Environment files containing secrets or connection strings (`*.env`, `*.pem`, `*.key`)
   - Proprietary algorithms or trade-secret code paths
   - Files containing regulated data (PII, PHI, financial data)
   - Production configuration that should not be accidentally duplicated
8. Note that content exclusions can also be configured at the **enterprise level** — enterprise exclusions apply across all organizations and cannot be overridden at the org level.

> **Tip:** Content exclusions are one layer of a defense-in-depth approach. Combine them with **Custom Instructions** (natural-language files like `.github/copilot-instructions.md` that guide Copilot responses) and **Copilot Spaces** (curated collections of repos, code, PRs, and issues that provide shared context to Copilot) for comprehensive governance of Copilot behavior.

## 15.3 Manage seat assignments

1. Navigate to your organization **Settings** → **Copilot** → **Access** (this may also be labeled **Seat management** depending on your plan).
2. Review the current seat assignment policy. There are three options:
   - **Enabled for all members** — every organization member automatically receives a Copilot seat.
   - **Enabled for selected members** — you manually assign seats to specific individuals or teams.
   - **Disabled** — Copilot is not available for any organization member.
3. If your organization is set to **Enabled for selected members**, click **Add members** or **Add teams** to assign a Copilot seat. Search for a team or individual and select them.
4. Review the seat usage summary displayed on the page — this shows the total number of seats assigned, seats in use, and seats available under your license.
5. Discuss cost management considerations:
   - Copilot Business costs **$19/user/month** and Copilot Enterprise costs **$39/user/month**. For a 500-person organization, this translates to $9,500–$19,500/month in seat charges, plus any AI Credits used beyond the pooled allowance if paid usage is allowed.
   - If the organization pays by credit card or PayPal, each new seat must be paid for before the user gets access (since 2026-09-03), and from 2026-10-01 assigned seats are charged upfront at the start of each billing cycle.
   - Use the **Enabled for selected members** policy to control costs during an initial rollout — start with pilot teams and expand based on adoption data.
   - GitHub supports **automatic seat reclamation**: if enabled, GitHub will automatically revoke seats from users who have not used Copilot in **30 or more days**. This prevents paying for unused seats.
6. To view seat assignment details programmatically, use the `gh` CLI:

   ```bash
   gh api /orgs/YOUR-ORG/copilot/billing/seats \
     --paginate \
     --jq '.seats[] | [.assignee.login, .last_activity_at, .plan_type] | @tsv'
   ```

> **Troubleshooting:** If the Copilot billing API returns a 404 error, verify your organization has an active Copilot Business or Enterprise subscription and your PAT includes the `manage_billing:copilot` or `read:org` scope. Run `gh auth refresh -s manage_billing:copilot` to add the required scope. See the [Instructor Guide](../docs/INSTRUCTOR-GUIDE.md) for additional help.

7. Review the output — each line shows a member's login, their last Copilot activity timestamp, and their plan type. Look for users with no recent activity as candidates for seat reclamation.
8. Mention the **Copilot usage metrics API** for deeper adoption tracking. This API (available on Business and Enterprise plans) provides data on completions generated, suggestions accepted, and active users over time:

   ```bash
   curl -s "$(gh api "/orgs/YOUR-ORG/copilot/metrics/reports/organization-1-day?day=$(date -d yesterday +%Y-%m-%d)" \
     --jq '.download_links[0]')" | jq '{day, daily_active_users, code_generation_activity_count, code_acceptance_activity_count}'
   ```

   > **Note:** The legacy `/copilot/metrics` endpoint was removed April 2026. The new API returns a download link to an NDJSON report. The command above fetches and parses it in one step. On macOS, replace `date -d yesterday` with `date -v-1d`.
   >
   > Since 2026-04-10, the top-level totals in these reports, including `code_generation_activity_count` and `code_acceptance_activity_count`, count Copilot CLI activity as well as IDE activity; CLI appears as `copilot_cli` in the feature breakdowns. Since 2026-05-20, the download link points to `copilot-reports.github.com`. Behind a firewall or proxy, allowlist it; the fallback hosts are in the [Copilot allowlist reference](https://docs.github.com/en/enterprise-cloud@latest/copilot/reference/copilot-allowlist-reference).

## 15.4 Review Copilot audit events

1. Navigate to your organization **Settings** → **Audit log** (in the left sidebar under **Archives** → **Logs**).
2. In the search bar, enter the following filter to show all Copilot-related events:

   ```
   action:copilot
   ```

3. Press **Enter** and review the filtered results. Each audit log entry shows the **action**, the **actor** (who performed the action), the **target**, and the **timestamp**.
4. To query the audit log programmatically using the `gh` CLI, run:

   ```bash
   gh api /orgs/YOUR-ORG/audit-log --method GET \
     -F phrase='action:copilot' \
     -F per_page=10 \
     --jq '.[] | {action, actor: .actor, created_at}'
   ```

5. Review common Copilot audit events and what they indicate:
   - `copilot.cfr_create` — A Copilot code review was created on a pull request.
   - `copilot.seat_added` — A Copilot seat was assigned to a user.
   - `copilot.seat_removed` — A Copilot seat was revoked from a user.
   - `copilot.content_exclusion_changed` — A content exclusion rule was added, modified, or removed.
   - `copilot.policy_update` — A Copilot policy setting was changed at the org or enterprise level.

<details>
<summary>🏛️ Enterprise Path — query the enterprise audit log for Copilot events (requires enterprise owner access)</summary>

For enterprise-level audit log access, navigate to `https://github.com/enterprises/YOUR-ENTERPRISE` → **Settings** → **Audit log** and use the same `action:copilot` filter. The enterprise audit log aggregates Copilot events from all organizations, giving you a single-pane view of policy changes and seat management across the enterprise.

Audit log events don't include prompts or responses. If your enterprise uses Enterprise Managed Users, enterprise owners can export agent session data (prompts, responses and tool calls) from cloud agents, Copilot CLI and IDEs (public preview since 2026-07-02): turn on the Copilot usage records streaming and API policies on the AI Controls **Copilot** page, then use audit log streaming or `GET /enterprises/YOUR-ENTERPRISE/copilot/usage-records`.

</details>

6. Discuss how to use audit log data for Copilot governance:
   - Track policy changes over time to maintain a compliance trail.
   - Monitor seat assignment churn to identify teams that are adopting or abandoning Copilot.
   - Correlate code review events (`copilot.cfr_create`) with PR merge rates to measure Copilot's impact on code quality.
8. For more detailed telemetry beyond the audit log, use the **Copilot usage metrics API**. This API provides aggregated data on suggestion acceptance rates, active users, and language-level breakdowns — useful for measuring ROI and reporting to leadership.

## 15.5 Verify your work

1. Confirm you have reviewed the Copilot policy settings at the organization level (Section 15.1). You should be able to describe the current state of each policy: access, public code matching, cloud agent (including its firewall and runner settings), code review, agent mode, the GitHub Copilot app, and MCP servers.
2. Confirm you have added at least one content exclusion rule (Section 15.2). Navigate to **Organization Settings** → **Copilot** → **Content exclusion** and verify that your rule (e.g., `**/*.env`) appears in the list.
3. Confirm you have reviewed seat assignment settings (Section 15.3). You should be able to describe whether the organization uses "all members", "selected members", or "disabled" — and explain the cost implications of each.
4. Confirm you have explored the audit log for Copilot events (Section 15.4). You should be able to filter the audit log by `action:copilot` and identify at least two event types.
5. Discuss with your table: **"What content exclusion rules would you set for your organization?"** Consider environment files, secrets, proprietary code, and compliance-sensitive paths.
6. Discuss with your table: **"How would you measure Copilot ROI using the usage metrics API?"** Consider tracking adoption rates, suggestion acceptance rates, and correlating with developer productivity metrics.
7. Discuss with your table: **"How would you design a Copilot rollout plan?"** Consider starting with pilot teams, using selected-member seat assignment, enabling automatic seat reclamation, and establishing content exclusion rules before enabling Copilot broadly.

> **Note:** GitHub Copilot is evolving rapidly — new features, policy controls, and governance options are released frequently. Review your organization's Copilot policies on a regular cadence (at least quarterly) to ensure they align with your security, compliance, and cost management requirements. From 2026-10-22, eligible generally available features left **Unconfigured** follow the enterprise's **Default policy for new features**, which ships **Enabled**, so new features can turn on between reviews. Check the [GitHub Copilot changelog](https://github.blog/changelog/label/copilot/) for the latest updates.
