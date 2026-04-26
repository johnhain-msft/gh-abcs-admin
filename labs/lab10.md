# 10 - Dormant User Management
In this lab you will identify inactive users in your GitHub organization, generate dormant user reports using API scripts, and design a license reclamation workflow to optimize seat costs.
> Duration: 15-20 minutes

> **⏱️ Estimated time:** 20 minutes | **Type:** Self-Paced Extension
>
> **What you'll learn:**
> - How to list organization members and query their activity via the GitHub API
> - How to identify dormant users using public events and audit log data
> - How to design a license reclamation workflow to optimize seat costs

> **Environment note:** This lab is written for **organization-level** access. All hands-on steps work with an org admin account — no enterprise account is needed. The enterprise dormant users dashboard is covered in collapsible sections for participants who have enterprise access.

References:
- [Viewing and managing a user's SAML access to your enterprise](https://docs.github.com/en/enterprise-cloud@latest/admin/user-management/managing-users-in-your-enterprise/viewing-and-managing-a-users-saml-access-to-your-enterprise)
- [Managing dormant users](https://docs.github.com/en/enterprise-cloud@latest/admin/managing-accounts-and-repositories/managing-users-in-your-enterprise/managing-dormant-users)
- [Viewing people in your enterprise](https://docs.github.com/en/enterprise-cloud@latest/admin/managing-accounts-and-repositories/managing-users-in-your-enterprise/viewing-people-in-your-enterprise)
- [About enterprise managed users](https://docs.github.com/en/enterprise-cloud@latest/admin/identity-and-access-management/understanding-iam-for-enterprises/about-enterprise-managed-users)
- [REST API - List organization members](https://docs.github.com/en/rest/orgs/members#list-organization-members)
- [Audit log events for your enterprise](https://docs.github.com/en/enterprise-cloud@latest/admin/monitoring-activity-in-your-enterprise/reviewing-audit-logs-for-your-enterprise/audit-log-events-for-your-enterprise)

## 10.1 List organization members with activity

1. Navigate to your organization on GitHub.com and click the **People** tab to view all current members.
2. Observe the information displayed for each member — you can see their **role**, **2FA status**, and **SAML identity** (if SAML SSO is configured).
3. Use the `gh` CLI to list all members of your organization programmatically:

   ```bash
   gh api /orgs/YOUR-ORG/members --paginate \
     --jq '.[] | [.login, .id] | @tsv'
   ```

4. Review the output. Each line shows a member's login and numeric user ID.
5. To include role information, use the `filter` parameter which returns role data:

   ```bash
   gh api "/orgs/YOUR-ORG/members?role=admin" --paginate \
     --jq '.[] | [.login, .id, "admin"] | @tsv'
   ```

   Run this once with `role=admin` and once with `role=member` to build a complete list with role annotations. The standard list-members endpoint returns simple user objects without a role field, so filtering by role is the reliable approach.

<details>
<summary>🏛️ Enterprise Path — view members across all organizations (requires enterprise owner access)</summary>

1. For an enterprise-wide view, navigate to your enterprise account at `https://github.com/enterprises/YOUR-ENTERPRISE`, then click **People** → **Members**.
2. The enterprise People view aggregates members across all organizations and shows their enterprise role, organization memberships, and 2FA status.
3. The **Dormant users** sub-tab is available here — this is the primary UI for identifying inactive users at the enterprise level.

</details>

## 10.2 Identify dormant users

GitHub considers a user dormant if they have had no qualifying activity in the past **30 days** (trailing window, not a calendar month).

**Qualifying activity** includes any of the following (among others):
- Authenticating to access enterprise resources via SAML SSO
- Creating a repository
- Pushing to an internal repository via HTTPS
- Creating, commenting on, or closing/reopening issues or pull requests
- Applying or removing labels on issues or pull requests
- Publishing a release
- Pushing to a wiki or starring a repository
- Signing in to GitHub.com

GitHub does **not** consider the following as active: accessing resources via a personal access token, SSH key, or GitHub App; Git operations (pushes, pulls, clones) on **private** repositories.

**Organization-level approach:** There is no built-in dormant users dashboard at the org level, but you can build an equivalent report using the API. Run the following script to check each member's recent public activity:

```bash
# List org members and check their most recent public event
echo "login,last_public_event"
gh api /orgs/YOUR-ORG/members --paginate \
  --jq '.[].login' | while read user; do
  last_event=$(gh api "/users/$user/events/public" \
    --jq '.[0].created_at // "none"' 2>/dev/null)
  echo "$user,$last_event"
done
```

Review the output and note the limitations:
- Only **public events** are returned — private repository activity is not visible through this endpoint

> **Troubleshooting:** If the dormant user script returns zero results or errors, check that: (1) you replaced `YOUR-ORG` with your actual org name, (2) your PAT has `read:org` and `read:user` scopes, and (3) the org has more than one member. If all members show "none" for last activity, your org may be too new — adjust the detection threshold or use the audit log approach below instead.
- API rate limits apply (5,000 requests per hour for authenticated requests)
- Enterprise Managed User (EMU) accounts may not generate public events

For a more reliable approach, query the **organization audit log** for recent activity:

```bash
# Query the org audit log for recent activity by each member
gh api /orgs/YOUR-ORG/audit-log \
  -F phrase='action:org.invite_member action:repo.create action:git.push' \
  -F per_page=100 \
  --jq '.[] | [.actor, .created_at] | @tsv' | sort -u -k1,1 | sort -k2 -r | head -20
```

This shows recently active users based on their audit trail. Members **absent** from this list are candidates for further investigation.

<details>
<summary>🏛️ Enterprise Path — use the built-in dormant users report (requires enterprise owner access)</summary>

1. Navigate to your enterprise account at `https://github.com/enterprises/YOUR-ENTERPRISE`.
2. Click **People** in the left sidebar, then select the **Dormant users** tab.
3. Review the list of dormant users — the enterprise dashboard automatically calculates the 30-day inactivity window.
4. Download the dormant users report as a CSV file:
   - Navigate to your enterprise account, then click **Compliance** at the top of the page
   - Scroll to **Reports** and locate the **Dormant Users** section
   - Click **New report** to generate a fresh report, then click **Download** next to the most recent report
   - The CSV includes each user's login, email, last activity date, and activity type
5. You can also query the enterprise audit log API for login activity:
   ```bash
   # Requires a token with the admin:enterprise scope
   gh api /enterprises/YOUR-ENTERPRISE/audit-log \
     -F phrase='action:user.login' \
     -F per_page=100 \
     --jq '.[] | [.actor, .created_at] | @tsv' | sort -k2 -r | head -20
   ```

</details>

In a small workshop organization, you may see few or no dormant users — this is expected. Focus on understanding the process and the data available.

## 10.3 Generate a comprehensive dormant user report

1. Combine the member list with activity data to create a structured dormant user candidate report:

   ```bash
   # Generate a dormant user candidate report at the org level
   echo "login,last_public_event" > dormant-report.csv

   gh api /orgs/YOUR-ORG/members --paginate \
     --jq '.[].login' | while read user; do
     last_event=$(gh api "/users/$user/events/public" \
       --jq '.[0].created_at // "none"' 2>/dev/null)
     echo "$user,$last_event" >> dormant-report.csv
   done

   echo "Report saved to dormant-report.csv"
   cat dormant-report.csv | column -t -s ','
   ```

> **Troubleshooting:** If the report script hangs or runs very slowly, you may be hitting API rate limits (5,000 requests/hour). Add `sleep 1` inside the `while` loop to throttle requests, or reduce the scope with `| head -20` after the `--jq` filter. See the [Instructor Guide](../docs/INSTRUCTOR-GUIDE.md) for additional help.

2. Run the script and review the output. Users showing `none` for their last event are your primary candidates for further investigation.
3. Cross-reference the public events report with the **org audit log** to capture private activity that the public events API misses:

   ```bash
   # Get distinct active users from the org audit log (last 30 days)
   gh api /orgs/YOUR-ORG/audit-log \
     -F phrase="created:>=$(date -u -d '30 days ago' +%Y-%m-%d)" \
     -F per_page=100 \
     --paginate \
     --jq '.[].actor' | sort -u > active-users.txt

   echo "Active users in the last 30 days:"
   cat active-users.txt
   ```

4. Compare the two lists — members in your org who do **not** appear in `active-users.txt` are your dormant user candidates.

> **Note:** This org-level scripted approach provides an approximation. In production, always cross-reference with the official **Dormant users** report from the enterprise compliance settings if enterprise access becomes available.

## 10.4 Plan a reclamation workflow

1. Discuss with your group: why does dormant user management matter? Consider that each GitHub Enterprise Cloud seat has a per-user license cost. Unused seats represent direct cost that could be reclaimed.
2. Design a monthly reclamation process using these steps:
   - **Step 1 — Report:** Generate a dormant user report using the org-level API scripts from section 10.3 on a monthly cadence. Automate this with a scheduled GitHub Actions workflow.
   - **Step 2 — Filter:** Exclude service accounts, CI/CD bot accounts, and shared accounts from the dormant list. These accounts may appear inactive but are essential for automation.
   - **Step 3 — Notify:** Send a notification to dormant users (via email or Slack) informing them that their account will be removed in 14 days unless they log in and perform qualifying activity.
   - **Step 4 — Reclaim:** After the 14-day grace period, remove users who are still inactive from the organization.

<details>
<summary>🏛️ Enterprise Path — use the enterprise dormant users report for Step 1</summary>

If you have enterprise access, replace the API scripts in Step 1 with the built-in report: navigate to **Enterprise** → **People** → **Dormant users** and download the CSV. This is the authoritative source and includes private repository activity that org-level API queries cannot capture.

</details>

3. Discuss what happens when you remove a user from an organization:
   - Their private forks of organization repositories become independent repositories
   - Issue and pull request attributions remain intact (they are not reassigned)
   - They lose access to organization repositories, teams, and projects
   - They can be re-invited later if needed
4. For **Enterprise Managed User (EMU)** enterprises, discuss the difference between:
   - **Soft-deprovisioning (suspension):** The user account is suspended via SCIM. It is reversible — re-provisioning restores access and history.
   - **Hard-deprovisioning (permanent suspension):** The account is permanently suspended. A new account must be created if the user returns.
5. Discuss how to automate this workflow using a scheduled GitHub Actions workflow:
   - Use a `schedule` trigger with a cron expression (e.g., monthly on the 1st)
   - Call the org members API and public events API to generate the dormant candidates list (or the enterprise API if enterprise access is available)
   - Parse the results, filter out service accounts, and send notifications
   - Create an issue in an admin repository tracking the reclamation cycle
6. Consider edge cases:
   - Users on extended leave (parental leave, sabbatical) should be excluded
   - Seasonal contributors (e.g., interns, contractors) may appear dormant between engagement periods
   - Accounts used exclusively for code review may have long gaps between activity

## 10.5 Verify your work

1. Confirm that you can navigate to the **People** tab of your organization and view the member list.
2. Confirm that you ran the `gh api /orgs/YOUR-ORG/members` command and received a list of member logins and IDs.
3. Confirm that you ran at least one of the dormant user detection approaches from section 10.2 (public events check or org audit log query) and reviewed the output.
4. Confirm that you generated the dormant user candidate report from section 10.3 and understand how to cross-reference public events with the org audit log.
5. Discuss with your group: "How would you handle a dormant service account that is used for CI/CD pipelines? Should it be excluded from the dormant analysis, and if so, how would you maintain that exclusion list?"
6. Review your reclamation workflow plan from section 10.4 and verify it includes:
   - [ ] A reporting cadence (monthly recommended)
   - [ ] A notification step with a grace period
   - [ ] An exclusion list for service accounts and bots
   - [ ] A defined process for EMU suspension vs. removal
   - [ ] An automation plan using GitHub Actions or a similar scheduler

> **Note:** Dormant license management is one of the most impactful cost-optimization practices for GitHub Enterprise Cloud. Each unused seat represents a recurring per-user cost. Organizations with hundreds or thousands of members can reclaim significant budget by regularly reviewing and removing dormant users. Establishing an automated, repeatable reclamation workflow ensures that license spend stays aligned with actual usage.
