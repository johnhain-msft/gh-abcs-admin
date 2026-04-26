# 9 - User and Team Administration
In this lab you will create team hierarchies with nested teams, assign repository permissions through teams, create custom repository roles, and explore team synchronization with identity providers.
> Duration: 20-25 minutes

References:
- [Organizing members into teams](https://docs.github.com/en/organizations/organizing-members-into-teams)
- [Managing access to your organization's repositories](https://docs.github.com/en/organizations/managing-user-access-to-your-organizations-repositories)
- [Managing custom repository roles for an organization](https://docs.github.com/en/organizations/managing-user-access-to-your-organizations-repositories/managing-repository-roles/managing-custom-repository-roles-for-an-organization)
- [Repository roles for an organization](https://docs.github.com/en/organizations/managing-user-access-to-your-organizations-repositories/managing-repository-roles/repository-roles-for-an-organization)
- [Synchronizing a team with an identity provider group](https://docs.github.com/en/organizations/organizing-members-into-teams/synchronizing-a-team-with-an-identity-provider-group)
- [Setting base permissions for an organization](https://docs.github.com/en/organizations/managing-user-access-to-your-organizations-repositories/managing-repository-roles/setting-base-permissions-for-an-organization)

## What You'll Learn

- Create nested team hierarchies and assign repository permissions through teams
- Define custom repository roles for fine-grained access control
- Explore team synchronization with identity providers for automated membership management

## 9.1 Create nested teams

GitHub supports nested teams, where child teams automatically inherit the access permissions of their parent team. This allows you to model your organization's group structure directly in GitHub.

1. Navigate to your organization's main page and click the **Teams** tab.
2. Click the **New team** button in the upper-right corner.
3. Enter the following details for the parent team:
   - **Team name**: `YOUR-HANDLE-engineering` (replace `YOUR-HANDLE` with your GitHub username to avoid naming conflicts in a shared workshop org)
   - **Description**: `Engineering department — parent team`
   - **Team visibility**: Select **Visible** (all organization members can see this team and @mention it)
   - Leave **Parent team** empty — this is the top-level team
4. Click **Create team**.
5. Navigate back to the **Teams** tab and click **New team** again.
6. Create the first child team:
   - **Team name**: `YOUR-HANDLE-engineering-frontend`
   - **Description**: `Frontend engineering team`
   - **Team visibility**: **Visible**
   - **Parent team**: Select `YOUR-HANDLE-engineering`
7. Click **Create team**.
8. Create a second child team by clicking **New team** once more:
   - **Team name**: `YOUR-HANDLE-engineering-backend`
   - **Description**: `Backend engineering team`
   - **Team visibility**: **Visible**
   - **Parent team**: Select `YOUR-HANDLE-engineering`
9. Click **Create team**.
10. Navigate to **Teams** > `YOUR-HANDLE-engineering` and click the **Teams** tab within the team page. Confirm that both `YOUR-HANDLE-engineering-frontend` and `YOUR-HANDLE-engineering-backend` appear as child teams.
11. Click into `engineering-frontend`, then click the **Members** tab and add yourself by clicking **Add a member**.

Teams can be **Visible** (discoverable by all organization members) or **Secret** (visible only to team members and organization owners). Secret teams are useful for groups handling sensitive work, such as security response teams, where membership should not be broadly visible.

> When you @mention a parent team (e.g., `@org/engineering`), all members of its child teams are notified as well. This is useful for broad announcements but should be used judiciously in large organizations.

## 9.2 Assign repository permissions via teams

Team-based permission assignment is strongly preferred over adding individual collaborators. It provides scalability (add a person to a team, they get all the right access), auditability (review a team's repo list in one place), and clean off-boarding (remove from team, access is revoked everywhere).

GitHub's built-in repository permission levels are:
- **Read** — Clone and pull. Open and comment on issues and pull requests.
- **Triage** — Read, plus manage issues and pull requests (label, close, reopen, assign, mark duplicate).
- **Write** — Triage, plus push to non-protected branches and merge pull requests.
- **Maintain** — Write, plus manage some repository settings (topics, wikis, pages, webhooks).
- **Admin** — Full control, including managing access, branches, and destructive actions.

1. Navigate to one of your organization's repositories and click **Settings**.
2. In the left sidebar, click **Collaborators and teams** (under the **Access** section).
3. Click **Add teams** and search for `engineering`.
4. Select the `engineering` team and assign it the **Read** role. Click **Add engineering to this repository**.
5. Click **Add teams** again, search for `engineering-frontend`, and assign it the **Write** role.

> **Troubleshooting:** If the team doesn't appear in the search results when adding teams to a repository, verify the team was created in the same organization that owns the repository. Cross-organization team assignments are not supported. See the [Instructor Guide](../docs/INSTRUCTOR-GUIDE.md) for additional help.

6. Observe the **Collaborators and teams** page. You should see:
   - `engineering` with **Read**
   - `engineering-frontend` with **Write**
7. Because `engineering-frontend` is a child of `engineering`, its members effectively receive **Write** access (the higher of the two permissions). GitHub resolves permissions by granting the most permissive role across all sources: direct repo access, team access, and organization base permissions.

> The permission resolution order is: direct repository collaborator role > team-based role (highest wins when multiple teams apply) > organization base permissions. A child team can never have *fewer* permissions than its parent.

## 9.3 Create a custom repository role

Custom repository roles are a GitHub Enterprise Cloud feature that lets organizations define fine-grained permission sets beyond the five built-in levels. Each organization can create up to **5 custom repository roles**.

1. Navigate to your organization's main page and click **Settings** in the top navigation.
2. In the left sidebar, scroll to the **Access** section and click **Repository roles**.
3. Click **Create a Role** in the upper-right corner.
4. Configure the first custom role:
   - **Role name**: `contractor`
   - **Description**: `External contractor access — read plus limited issue management`
   - **Base role**: Select **Read**
   - Under **Additional permissions**, check the following:
     - `Close and reopen issues`
     - `Mark issues as duplicate`
     - `Apply and dismiss labels`
5. Click **Create role**.
6. Return to **Repository roles** and click **Create a Role** to create a second custom role:
   - **Role name**: `security-reviewer`
   - **Description**: `Security review access — triage plus security alert management`
   - **Base role**: Select **Triage**
   - Under **Additional permissions**, check the following:
     - `View secret scanning alerts`
     - `Dismiss or reopen code scanning alerts`
     - `View Dependabot alerts`
7. Click **Create role**.
8. Verify both roles appear in the **Repository roles** list with their descriptions and base role indicators.

Custom roles can be assigned to both teams and individual collaborators. When combined with team-based access, they give you precise control — for example, assigning the `contractor` role to an external vendor team without granting full Write access.

> Keep the 5-role limit in mind when planning your role strategy. Design roles around personas (contractor, security reviewer, release manager) rather than individual permission combinations, to maximize reuse across teams.

> **Troubleshooting:** If the custom role doesn't appear in repository access dropdowns, refresh the page — role creation can take up to 30 seconds to propagate. If you've hit the 5-role limit, you'll need to delete an existing custom role before creating a new one.

## 9.4 Test permission inheritance

In this section you will verify that the nested team and permission structure you created works as expected.

1. Open a private or incognito browser window and sign in as a user who is a member of `engineering-frontend` (but was not directly added to the repository as a collaborator).
2. Navigate to the repository where you assigned team permissions in section 9.2.
3. Verify that the user can:
   - **View** the repository contents (inherited from `engineering` → Read)
   - **Create a branch** from the repository's default branch (granted by `engineering-frontend` → Write)
   - **Push a commit** to the new branch
4. Try to access the repository's **Settings** page. The user should **not** be able to see the full Settings because Write does not include Admin privileges.
5. Navigate to **Issues** and confirm the user can create and comment on issues (included in both Read and Write).
6. Now test the custom role. Navigate to the repository's **Collaborators and teams** settings and assign the `contractor` custom role to a test user or a different team.
7. In the incognito window, sign in as the user with the `contractor` role and confirm they can:
   - View the repository (Read base)
   - Close and reopen an issue
   - Apply a label to an issue
   - **Not** push code (Read does not include Write)

> If you only have one GitHub account available, you can verify permissions by reviewing the **Collaborators and teams** page and checking the effective role column, or by using the Organization's **People** > **Member privileges** audit view. The incognito approach adds time — plan for 3-5 extra minutes if using two accounts.

## 9.5 Configure team sync discussion

Team synchronization connects GitHub teams to identity provider (IdP) groups so that team membership is automatically managed based on IdP group membership. Full configuration requires IdP admin access, so this section is a guided discussion.

1. Navigate to your organization's **Settings** page.
2. In the left sidebar, click **Authentication security**.
3. Locate the **Team synchronization** section. If SAML SSO is configured for the organization, you will see the option to enable team sync.
4. Review the supported identity providers:
   - **Microsoft Entra ID** (formerly Azure Active Directory)
   - **Okta**
5. Discuss the team sync workflow:
   - An organization owner maps a GitHub team to one or more IdP groups.
   - When a user is added to the IdP group, they are automatically added to the corresponding GitHub team.
   - When a user is removed from the IdP group, they are automatically removed from the GitHub team.
   - Manual team membership changes are overwritten at the next sync cycle.
6. Discuss best practices for structuring IdP groups:
   - Mirror your GitHub team hierarchy in your IdP (e.g., `GitHub-engineering`, `GitHub-engineering-frontend`).
   - Use a consistent naming convention with a prefix (e.g., `GH-`) to distinguish GitHub-synced groups from other IdP groups.
   - Keep IdP group membership as the single source of truth — avoid manual edits to synced teams.
   - Plan for nested teams: each child team maps to its own IdP group; the parent/child relationship is managed in GitHub.
7. Discuss governance considerations:
   - Team sync does not automatically provision SAML identities — users still need to authenticate via SAML SSO before they can be added to teams.
   - Audit log events for team sync are recorded under the `team` event category.
   - Removing a user from all IdP groups removes them from all synced teams but does **not** remove them from the organization.
   - Review sync status periodically via **Organization** > **Settings** > **Authentication security** to catch sync failures.

> **Note:** Team synchronization requires SAML single sign-on to be configured and enforced for the organization. If your workshop environment does not have an IdP connected, review the [team sync documentation](https://docs.github.com/en/organizations/organizing-members-into-teams/synchronizing-a-team-with-an-identity-provider-group) and discuss how you would map your organization's existing IdP groups to GitHub teams.

## 9.6 Verify your work

Use the checklist below to confirm that all resources from this lab are in place.

1. Navigate to **Organization** > **Teams** and verify:
   - [ ] The `engineering` parent team exists and is set to **Visible**.
   - [ ] `engineering-frontend` appears as a child team of `engineering`.
   - [ ] `engineering-backend` appears as a child team of `engineering`.
   - [ ] You are listed as a member of `engineering-frontend`.
2. Navigate to your repository's **Settings** > **Collaborators and teams** and verify:
   - [ ] `engineering` has **Read** access.
   - [ ] `engineering-frontend` has **Write** access.
   - [ ] Members of `engineering-frontend` have effective **Write** permission (the higher of Read and Write).
3. Navigate to **Organization** > **Settings** > **Repository roles** and verify:
   - [ ] The `contractor` custom role exists with base role **Read** and additional issue-management permissions.
   - [ ] The `security-reviewer` custom role exists with base role **Triage** and additional security-alert permissions.
4. Review the permission inheritance you tested in section 9.4 and confirm that the child team's higher permission took effect.
5. Confirm you discussed team synchronization concepts and IdP group mapping strategies in section 9.5.

> **Note:** In a production environment, team synchronization with Microsoft Entra ID or Okta is the recommended approach for managing team membership at scale. Manual team management is suitable for small organizations, but as headcount grows, IdP-driven automation reduces administrative overhead and ensures that access changes are consistent with your identity governance policies.
