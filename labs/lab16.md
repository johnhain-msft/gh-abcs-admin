# 16 - Enterprise Teams
In this lab you will plan an enterprise team, create it and assign it to an organization, find and use the enterprise teams assigned to your organization, and review the licensing, role, cost center and audit controls that enterprise teams drive.
> Duration: 20-30 minutes

> **Prerequisites:** A GitHub Enterprise Cloud enterprise. Creating and managing enterprise teams requires the **enterprise owner** role. Sections 16.1 and 16.3 work for **organization owners** too, as long as an enterprise owner or your instructor has assigned an enterprise team to your workshop organization. This is a self-paced extension lab; it isn't part of the timed agenda.

> **Environment note:** Use a training or sandbox enterprise. Assigning an enterprise team to an organization adds its members to that organization without an invitation, and outside collaborators or unaffiliated users in the team become licensed enterprise members. Don't connect a production IdP group, assign Copilot licenses, change cost centers or turn on enterprise teams mode in a production enterprise for this exercise. Each section has collapsible paths for enterprise owners and for organization-owner-only participants.

References:
- [Teams in an enterprise](https://docs.github.com/en/enterprise-cloud@latest/admin/concepts/enterprise-fundamentals/teams-in-an-enterprise)
- [Creating enterprise teams](https://docs.github.com/en/enterprise-cloud@latest/admin/managing-accounts-and-repositories/managing-users-in-your-enterprise/create-enterprise-teams)
- [REST API endpoints for enterprise teams](https://docs.github.com/en/enterprise-cloud@latest/rest/enterprise-teams/enterprise-teams)
- [Managing teams and people with access to your repository](https://docs.github.com/en/enterprise-cloud@latest/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/managing-teams-and-people-with-access-to-your-repository)
- [Audit log events for your enterprise](https://docs.github.com/en/enterprise-cloud@latest/admin/monitoring-activity-in-your-enterprise/reviewing-audit-logs-for-your-enterprise/audit-log-events-for-your-enterprise)
- [Enterprise Teams (workshop guide)](../docs/28-enterprise-teams.md)

## What You'll Learn

- Decide when an enterprise team fits better than an organization team
- Create an enterprise team, add members and assign it to an organization
- Find the enterprise teams assigned to your organization and use one for repository access and review requests
- Trace how enterprise teams connect to Copilot licenses, enterprise roles, cost centers and audit events

## 16.1 Plan an enterprise team

1. Pick a group that needs the same access in more than one organization, for example on-call SREs who review infrastructure changes in every product organization. Write down the organizations involved.
2. Copy this planning table into your notes and fill in the right-hand column:

   | Decision | Example answer |
   |----------|----------------|
   | Team name | `Workshop SRE YOUR-HANDLE` (GitHub adds the `ent:` prefix to the generated slug) |
   | Membership source | Manual for this lab; an IdP group synced through SCIM in an EMU enterprise |
   | Organization access | Selected organizations only, not all organizations |
   | Repository access | Granted by each organization's admins after assignment |
   | Enterprise roles | None for this lab |
   | Copilot | Copilot Business licenses could be assigned to the team directly |
   | Cost center | The cost center that pays for this group's usage |

3. Check the plan against the limits: 2,500 enterprise teams per enterprise, 5,000 members per team and 1,000 organizations per team.
4. Check it against what enterprise teams don't support: CODEOWNERS, nested teams, secret teams, team maintainers, project boards, and team synchronization for enterprises with personal accounts. If the group needs one of these, plan an organization team instead.
5. Discuss with your table: **"Which teams do we recreate in several organizations today, and which of them could become one enterprise team?"**

## 16.2 Create an enterprise team and assign it to an organization

<details>
<summary>🏛️ Enterprise owner path — create the team in the UI</summary>

1. Navigate to `https://github.com/enterprises/YOUR-ENTERPRISE` and click **People**.
2. In the left sidebar, click **Enterprise teams**.
3. Click **Create Enterprise team**.
4. Enter the name `Workshop SRE YOUR-HANDLE` and the description `Lab 16 - delete after the workshop`.
5. For organization access, select only your workshop organization. Don't choose all organizations.
6. Click **Create Enterprise team**, then note the team's slug. It starts with `ent:`.
7. Click **Add members**, add yourself and one teammate, then click **Add**.
8. Optional, EMU training enterprises only: to drive membership from a **test** IdP group instead, remove the manual members, click **Edit**, choose **Identity provider group** under "Manage members", select the group and click **Update team**.

</details>

<details>
<summary>⌨️ Enterprise owner path — create the team with the REST API</summary>

1. Make sure the GitHub CLI token has the `admin:enterprise` scope, which the enterprise teams endpoints require for changes:

   ```bash
   gh auth refresh -s admin:enterprise
   ```

2. Create the team, assigned to selected organizations, and note the slug in the response:

   ```bash
   gh api \
     --method POST \
     -H "Accept: application/vnd.github+json" \
     -H "X-GitHub-Api-Version: 2026-03-10" \
     /enterprises/YOUR-ENTERPRISE/teams \
     -f name='Workshop SRE YOUR-HANDLE' \
     -f description='Lab 16 - delete after the workshop' \
     -f organization_selection_type='selected' \
     --jq '{name, slug, organization_selection_type}'
   ```

3. Add members, replacing `TEAM-SLUG` with the slug from step 2 and the usernames with yours:

   ```bash
   gh api \
     --method POST \
     -H "Accept: application/vnd.github+json" \
     -H "X-GitHub-Api-Version: 2026-03-10" \
     /enterprises/YOUR-ENTERPRISE/teams/TEAM-SLUG/memberships/add \
     -f 'usernames[]=YOUR-HANDLE' \
     -f 'usernames[]=TEAMMATE-HANDLE'
   ```

4. Assign the team to your workshop organization:

   ```bash
   gh api \
     --method POST \
     -H "Accept: application/vnd.github+json" \
     -H "X-GitHub-Api-Version: 2026-03-10" \
     /enterprises/YOUR-ENTERPRISE/teams/TEAM-SLUG/organizations/add \
     -f 'organization_slugs[]=YOUR-ORG'
   ```

</details>

<details>
<summary>🏢 Organization owner path — no enterprise owner access</summary>

1. Organization owners can't create enterprise teams. Ask your instructor for the slug of the enterprise team assigned to your workshop organization.
2. Read the "Creating Enterprise Teams" and "Assigning Teams to Organizations" sections of [28-enterprise-teams.md](../docs/28-enterprise-teams.md) so you know what the enterprise owner did.
3. Continue with 16.3.

</details>

> **Note:** When the team is assigned to the organization, its members join the organization directly, without an invitation, and get the organization's base permissions. Organization admins can grant more access but can't remove permissions an enterprise administrator granted.

## 16.3 Find and use enterprise teams in your organization

1. List the enterprise teams assigned to your organization:

   ```bash
   gh api "/orgs/YOUR-ORG/teams?team_type=enterprise" --jq '.[] | {name, slug}'
   ```

2. List the organization teams for comparison:

   ```bash
   gh api "/orgs/YOUR-ORG/teams?team_type=organization" --jq '.[] | {name, slug}'
   ```

3. Give the enterprise team access to a workshop repository: open the repository, click **Settings**, then in the "Access" section click **Collaborators & teams**. Click **Add teams**, search for the enterprise team, choose the **Write** role and confirm.
4. Open a pull request in that repository with any small change. In the **Reviewers** sidebar, search for the enterprise team and request its review.
5. In a pull request comment, mention the team as `@YOUR-ORG/ent:TEAM-SLUG`. Members are notified unless the team's notification setting is disabled.
6. Note what you can't do from the organization: you can't edit the team's membership or remove permissions an enterprise administrator granted, and you can't name the enterprise team as a code owner in `CODEOWNERS`.

> **Troubleshooting:** If the first command returns an empty list, no enterprise team is assigned to your organization yet. Ask an enterprise owner to assign one, or complete 16.2 first.

## 16.4 Review the controls enterprise teams drive

<details>
<summary>🏛️ Enterprise owner path — review only, change nothing</summary>

1. **Copilot licenses:** go to **Billing and licensing** → **Licensing**, next to "Copilot" click **Manage**, then open the **Enterprise Teams** tab. Direct assignment covers Copilot Business licenses; Copilot Enterprise is granted through organizations. Don't assign licenses in this lab.
2. **Enterprise roles:** go to **People** → **Enterprise roles** → **Role assignments**. App manager, security manager and custom roles can be assigned to teams; the security manager role can only be assigned to a team. Enterprise owner, billing manager and guest collaborator can't be assigned to teams.
3. **Cost centers:** go to **Billing and licensing** → **Cost centers** and open a cost center. Enterprise teams can be listed under **Resources**, and their members' usage is then attributed to that cost center. A cost center user-level budget on that cost center caps each member's GitHub AI Credits, including members who joined through the team.
4. **Model access:** go to **AI controls** → **Copilot** and check whether **Enterprise teams mode** (public preview) is on. In that mode, organization-level model settings no longer apply. Don't toggle it in a production enterprise.
5. **Managed settings:** if your enterprise uses server-managed Copilot settings, open `copilot/team-mappings.json` in its `.github-private` repository to see which enterprise teams get their own values for overridable keys. [Lab 17](lab17.md) walks through giving one enterprise team an exception.

</details>

<details>
<summary>🏢 Organization owner path — discuss</summary>

1. Ask your instructor to show the **Enterprise Teams** tab of the Copilot licensing page and the **Resources** list of a cost center.
2. Discuss with your table how your organization's Copilot seats and cost reporting would change if licenses and cost centers followed enterprise teams instead of organizations.

</details>

## 16.5 Review enterprise team audit events

<details>
<summary>🏛️ Enterprise owner path — query the enterprise audit log</summary>

1. Navigate to `https://github.com/enterprises/YOUR-ENTERPRISE` → **Settings** → **Audit log**.
2. Filter with:

   ```
   action:enterprise_team
   ```

3. Find the `enterprise_team.create` and `enterprise_team.add_member` events from 16.2.
4. Query the same events with the REST API:

   ```bash
   gh api "/enterprises/YOUR-ENTERPRISE/audit-log?phrase=action:enterprise_team&per_page=20" \
     --jq '.[] | {action, actor, enterprise_team, created_at}'
   ```

</details>

> **Note:** Enterprise team events are enterprise audit log events. The organization audit log events reference doesn't list them, so organization owners need an enterprise owner to review this trail.

## 16.6 Clean up

<details>
<summary>🏛️ Enterprise owner path — delete the workshop team</summary>

1. Delete the team you created in 16.2, from the **Enterprise teams** page or with the REST API:

   ```bash
   gh api \
     --method DELETE \
     -H "Accept: application/vnd.github+json" \
     -H "X-GitHub-Api-Version: 2026-03-10" \
     /enterprises/YOUR-ENTERPRISE/teams/TEAM-SLUG
   ```

2. Deleting an enterprise team also deletes its IdP group mapping. Confirm the `enterprise_team.destroy` event in the enterprise audit log.

</details>

## 16.7 Verify your work

1. Confirm you completed the planning table in 16.1 and can explain why your use case fits an enterprise team rather than an organization team.
2. If you are an enterprise owner, confirm the team from 16.2 appeared with an `ent:` slug, had members and was assigned only to your workshop organization.
3. Confirm the `team_type=enterprise` query in 16.3 returned the enterprise team assigned to your organization, and that you could request the team's review on a pull request.
4. Confirm you can name the controls from 16.4 that follow team membership: Copilot Business licenses, enterprise roles, cost center attribution, managed settings overrides and, in preview, model access.
5. If you are an enterprise owner, confirm you found `enterprise_team.*` events in 16.5 and deleted the workshop team in 16.6.
6. Discuss with your table: **"Which of our access, licensing or chargeback processes would we move to IdP-synced enterprise teams first, and what would we keep on organization teams?"**

> **Note:** Enterprise teams have been generally available on GitHub Enterprise Cloud since 2026-06-04, with cost centers (2026-06-25), model access targeting (preview, 2026-07-31) and managed settings overrides (2026-08-03) added since. Check the [GitHub changelog](https://github.blog/changelog/) for later changes before you rely on a capability in production.
