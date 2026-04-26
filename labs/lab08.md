# 8 - Audit Log Exploration
In this lab you will navigate, filter, and query the GitHub audit log to understand how organizational events are tracked, and explore options for streaming audit data to external systems.
> Duration: 20-25 minutes

> **Environment note:** This lab is written for **organization-level** access. All hands-on steps work with an org admin account — no enterprise account is needed. Enterprise-level alternatives are included in collapsible sections for participants who have enterprise access.

References:
- [Reviewing the audit log for your organization](https://docs.github.com/en/organizations/keeping-your-organization-secure/managing-security-settings-for-your-organization/reviewing-the-audit-log-for-your-organization)
- [Reviewing the audit log for your enterprise](https://docs.github.com/en/enterprise-cloud@latest/admin/monitoring-activity-in-your-enterprise/reviewing-audit-logs-for-your-enterprise/about-the-audit-log-for-your-enterprise)
- [Audit log events for your enterprise](https://docs.github.com/en/enterprise-cloud@latest/admin/monitoring-activity-in-your-enterprise/reviewing-audit-logs-for-your-enterprise/audit-log-events-for-your-enterprise)
- [Using the audit log API for your enterprise](https://docs.github.com/en/enterprise-cloud@latest/admin/monitoring-activity-in-your-enterprise/reviewing-audit-logs-for-your-enterprise/using-the-audit-log-api-for-your-enterprise)
- [Streaming the audit log for your enterprise](https://docs.github.com/en/enterprise-cloud@latest/admin/monitoring-activity-in-your-enterprise/reviewing-audit-logs-for-your-enterprise/streaming-the-audit-log-for-your-enterprise)
- [Identifying audit log events performed by an access token](https://docs.github.com/en/enterprise-cloud@latest/admin/monitoring-activity-in-your-enterprise/reviewing-audit-logs-for-your-enterprise/identifying-audit-log-events-performed-by-an-access-token)

## What You'll Learn

- Navigate and filter the organization audit log to track administrative actions
- Query the audit log REST API with the `gh` CLI for programmatic event retrieval
- Explore audit log streaming options for long-term retention and SIEM integration

## 8.1 Navigate the audit log UI

1. To view the **organization audit log**, navigate to your organization page, then go to **Settings** → in the left sidebar under **Archives**, click **Logs** → **Audit log**.

> **Troubleshooting:** If the **Audit log** option doesn't appear under Settings, verify you have organization **Owner** permissions. The audit log is not visible to regular members, moderators, or billing managers. See the [Instructor Guide](../docs/INSTRUCTOR-GUIDE.md) for additional help.

2. Observe the timeline view. Each entry displays:
   - **Action** — the event that occurred (e.g., `repo.create`, `org.invite_member`)
   - **Actor** — the user who performed the action
   - **Timestamp** — when the event occurred
   - **IP address** — the source IP (only visible if IP address disclosure has been explicitly enabled by an enterprise owner)
3. Note that the default view shows approximately the last 3 months of events, but the full retention period is **180 days** for web-based events and **7 days** for Git events (clone, push, fetch).
4. Locate the **Export** button in the upper-right area of the audit log page. You can export results as **CSV** or **JSON** for offline analysis.

<details>
<summary>🏛️ Enterprise Path — view the enterprise audit log (requires enterprise owner access)</summary>

1. To view the **enterprise audit log**, navigate to your enterprise account, then go to **Settings** → **Audit log**.
2. The enterprise audit log aggregates events from all organizations under the enterprise account, plus enterprise-level events (SAML SSO, SCIM provisioning, enterprise policy changes).
3. If your enterprise uses **Enterprise Managed Users (EMU)**, note that the enterprise audit log also includes user-level security log events for all managed accounts.

</details>

## 8.2 Filter by event type and actor

1. Click into the **Search audit logs** bar at the top of the audit log page.
2. Enter a filter using the `action:` qualifier to find a specific event type:
   - `action:repo.create` — shows all repository creation events
   - `action:org.invite_member` — shows all organization invitation events
   - `action:team.add_member` — shows team membership additions
3. Use the `actor:` qualifier to filter by who performed the action:
   - `actor:username` — replace `username` with the GitHub handle of the user you want to investigate
4. Use the `created:` qualifier to filter by date range:
   - `created:>2026-03-01` — events after March 1, 2026
   - `created:2026-03-01..2026-03-31` — events within March 2026
5. Combine multiple filters in a single query to narrow results:
   ```
   action:repo.create actor:admin-user created:>2026-03-01
   ```
6. Explore common event categories and discuss which are most relevant for compliance monitoring:
   - `repo.*` — repository creation, deletion, visibility changes, transfer
   - `org.*` — organization membership, settings changes
   - `team.*` — team creation, membership changes
   - `members.*` — member permission changes, removals
   - `business.*` — enterprise-level events (available only in the **enterprise** audit log — not visible at the org level)
7. If IP address disclosure is enabled, add `country:US` or check the **IP address** column to identify the geographic origin of actions.

## 8.3 Query the audit log API

1. Open your terminal and verify you are authenticated with the GitHub CLI:
   ```bash
   gh auth status
   ```
2. Query the **organization audit log** for repository creation events using the REST API:
   ```bash
   gh api /orgs/YOUR-ORG/audit-log \
     -F phrase='action:repo.create' \
     -F per_page=10 \
     --jq '.[0:3]'
   ```
   Replace `YOUR-ORG` with the name of your workshop organization.
3. Query the organization audit log for **member invitation events**:
   ```bash
   gh api /orgs/YOUR-ORG/audit-log \
     -F phrase='action:org.invite_member' \
     -F per_page=5 \
     --jq '.[] | {action, actor, created_at}'
   ```

<details>
<summary>🏛️ Enterprise Path — query the enterprise audit log API (requires enterprise admin access)</summary>

If you have enterprise admin access, you can query the enterprise-level audit log which aggregates events across all organizations:

```bash
gh api /enterprises/YOUR-ENTERPRISE/audit-log \
  -F phrase='action:org.invite_member' \
  -F per_page=5 \
  --jq '.[] | {action, actor, created_at}'
```

Replace `YOUR-ENTERPRISE` with the slug of your enterprise account. The enterprise audit log includes `business.*` events not available at the org level.

</details>

4. Fetch **Git events** by including the `include=git` parameter. Git events have a 7-day retention period:
   ```bash
   gh api /orgs/YOUR-ORG/audit-log \
     -F phrase='action:git.push' \
     -F include=git \
     -F per_page=5
   ```
5. For large result sets the API uses **cursor-based pagination**. Look for the `after` cursor in the response `Link` header or the last event's `_document_id` field. Pass it to subsequent requests:
   ```bash
   gh api /orgs/YOUR-ORG/audit-log \
     -F phrase='action:repo.create' \
     -F per_page=100 \
     -F after='CURSOR_VALUE'
   ```
6. Keep in mind the rate limit for audit log API queries is **1,750 requests per hour** per enterprise or organization.

> **Troubleshooting:** If the audit log API returns empty results, verify your PAT has the `admin:org` scope (or `admin:enterprise` for enterprise-level logs). Also confirm you're querying the correct org name — audit logs are org-scoped, not repo-scoped.

## 8.4 Explore event payloads

1. Run the following command to retrieve a single audit log event with full detail:
   ```bash
   gh api /orgs/YOUR-ORG/audit-log \
     -F phrase='action:repo.create' \
     -F per_page=1 \
     --jq '.[0]'
   ```
2. Examine the structure of a typical audit log event. A `repo.create` event looks similar to this:
   ```json
   {
     "@timestamp": 1743465600000,
     "action": "repo.create",
     "actor": "admin-user",
     "actor_id": 12345678,
     "actor_location": {
       "country_code": "US"
     },
     "business": "YOUR-ENTERPRISE",
     "created_at": 1743465600000,
     "operation_type": "create",
     "org": "YOUR-ORG",
     "org_id": 87654321,
     "repo": "YOUR-ORG/new-repository",
     "repository_public": false,
     "user_agent": "Mozilla/5.0",
     "_document_id": "abc123def456"
   }
   ```
3. Review the key fields in the payload:
   - **action** — the fully qualified event name (e.g., `repo.create`)
   - **actor** — the GitHub username that triggered the event
   - **actor_location.country_code** — geographic origin (requires IP disclosure to be enabled)
   - **created_at** — Unix epoch timestamp in milliseconds
   - **org** — the organization where the event occurred
   - **repo** — the full `org/repo` path of the affected repository
   - **_document_id** — unique identifier that can be used as a pagination cursor
4. Use `--jq` to extract only the fields you need for a compliance report:
   ```bash
   gh api /orgs/YOUR-ORG/audit-log \
     -F phrase='action:repo.create' \
     -F per_page=5 \
     --jq '.[] | {action, actor, repo, created_at, actor_country: .actor_location.country_code}'
   ```
5. For events that modify settings (e.g., `repo.update`), the payload may include additional fields such as `old_permission` and `new_permission` or `visibility` to indicate what changed.

## 8.5 Discuss streaming configuration

Audit log streaming is an **enterprise-level** feature that forwards events in real time to external Security Information and Event Management (SIEM) and storage systems. Even without enterprise access, understanding streaming capabilities is essential for admins planning a production deployment.

1. Review the supported streaming targets. GitHub Enterprise Cloud can stream audit log events to:
   - **Splunk** — via HTTP Event Collector (HEC)
   - **Azure Event Hubs** — for integration with Azure Monitor or Microsoft Sentinel
   - **Azure Blob Storage** — for archival and batch processing
   - **Amazon S3** — for storage and integration with AWS-based SIEM tools
   - **Google Cloud Storage** — for integration with Google Cloud operations
   - **Datadog** — for direct integration with Datadog's log management
2. Discuss why audit log streaming is essential for most enterprises:
   - Web-based events are retained for only **180 days** in the UI and API
   - Git events (clone, push, fetch) are retained for only **7 days**
   - Compliance frameworks (SOC 2, FedRAMP, HIPAA) often require longer retention periods
   - Streaming enables real-time alerting on suspicious activity through your SIEM
3. Review important operational details for audit log streaming:
   - Delivery guarantee: **at-least-once** (consumers must handle duplicate events)
   - Format: **compressed JSON** (one event per line)
   - If streaming is paused, events are buffered for up to **7 days** — events older than 7 days are dropped
   - GitHub performs **health checks every 24 hours** on configured streams
   - If a stream becomes misconfigured, you have a **6-day window** to fix it before the stream is automatically disabled
4. **Organization-level workaround for long-term retention:** Without enterprise streaming, you can build a scheduled GitHub Actions workflow that calls the org audit log API daily and archives events to your own storage:

   ```bash
   # Example: export the last 24 hours of org audit events to a JSON file
   gh api /orgs/YOUR-ORG/audit-log \
     -F phrase="created:>=$(date -u -d '1 day ago' +%Y-%m-%d)" \
     -F per_page=100 \
     --paginate > "audit-export-$(date +%Y-%m-%d).json"
   ```

   This gives you long-term retention without enterprise streaming — schedule this in a cron-based Actions workflow and push the output to your archival system.

5. Discuss with your group: _"Given your organization's existing SIEM and cloud infrastructure, which streaming target would you choose and why?"_

<details>
<summary>🏛️ Enterprise Path — configure streaming in the UI (requires enterprise owner access)</summary>

1. Navigate to your enterprise account, then go to **Settings** → **Audit log** → **Log streaming**.
2. Click **Set up stream** and select your target (Splunk, Azure Event Hubs, S3, etc.).
3. Configure the connection credentials and endpoint URL.
4. Save and verify the health check passes within 24 hours.
5. Enterprise streaming supports **multi-endpoint streaming** — you can send audit data to two destinations simultaneously.

</details>

## 8.6 Verify your work

1. Confirm you completed the following tasks during this lab:
   - [ ] Navigated the audit log UI for your organization
   - [ ] Applied search filters using `action:`, `actor:`, and `created:` qualifiers
   - [ ] Successfully queried the organization audit log REST API with `gh api`
   - [ ] Examined an audit log event payload and identified key fields
   - [ ] Discussed audit log streaming targets, retention implications, and the org-level export workaround
2. Run this command to verify your API access is working:
   ```bash
   gh api /orgs/YOUR-ORG/audit-log \
     -F phrase='action:repo.create' \
     -F per_page=1 \
     --jq 'if length > 0 then "✅ Audit log API access confirmed" else "⚠️ No results — verify org name and permissions" end'
   ```
3. Discussion question: _"Which streaming target would best fit your organization's SIEM setup, and what retention policy would you configure?"_

> **Note:** Remember that the audit log retains web-based events for 180 days and Git events for only 7 days. For long-term compliance and real-time security monitoring, configuring audit log streaming to an external destination is strongly recommended. Events that exceed the retention window are permanently deleted and cannot be recovered.
