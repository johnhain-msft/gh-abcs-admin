# 6 - Advanced Repository Rulesets
In this lab you will build on Lab 03 by creating organization-level rulesets, tag rulesets, and exploring advanced features like bypass permissions, ruleset import/export, and evaluate mode — all unique to GitHub Enterprise Cloud.
> Duration: 20-25 minutes

> **Instructor Note:** For the 15-minute in-session time slot, focus on sections 6.1–6.3. Sections 6.4 and 6.5 are optional extensions if time permits.

References:
- [Managing rulesets for an organization](https://docs.github.com/en/organizations/managing-organization-settings/managing-rulesets-for-repositories-in-your-organization)
- [About rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)
- [Available rules for rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets)
- [Ruleset recipes](https://github.com/github/ruleset-recipes)
- [Managing rulesets for a repository](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/managing-rulesets-for-a-repository)
- [About protected tags](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/configuring-tag-protection-rules)

## What You'll Learn

- Create organization-level rulesets to enforce policies across multiple repositories
- Configure tag rulesets to protect release tags from unauthorized changes
- Explore evaluate mode, bypass permissions, and ruleset import/export

## 6.1 Create an organization-level ruleset

In Lab 03, you created a basic branch ruleset scoped to a single repository. Organization-level rulesets let you enforce policies across many repositories at once — a critical capability for enterprise governance.

1. Navigate to your **organization** page on GitHub.com
2. Click **Settings** in the organization navigation bar
3. In the left sidebar under **"Code, planning, and automation"**, click **Rules**, then click **Rulesets**

> **Troubleshooting:** If you don't see the **Rules** option in the sidebar, verify you have organization **Owner** permissions. Members and non-admin roles cannot create org-level rulesets.
4. Click **New ruleset**, then select **New branch ruleset**
5. Set the **Ruleset name** to `YOUR-HANDLE-org-branch-standards` (replace `YOUR-HANDLE` with your GitHub username to avoid naming conflicts in a shared workshop org)
6. Set **Enforcement status** to **Evaluate** — this is a GHEC-only feature that lets you dry-run the ruleset against real traffic without blocking anyone. You will see results in Rule Insights.
7. Under **Target repositories**, click **Add target** and select **"All repositories"** to apply this ruleset across the entire organization
    - _(Optional)_ If you prefer a narrower scope, select **"Dynamic list by name"** and enter a pattern such as `production-*`
8. Under **Target branches**, click **Add a target** and select **"Include all branches"** — this uses the `~ALL` shortcut to match every branch in the targeted repositories
9. In the **"Branch protections"** section, enable these rules:
    - ✅ **Require signed commits** — enforces that all commits pushed to matching branches carry a verified GPG, SSH, or S/MIME signature
    - ✅ **Require linear history** — prevents merge commits, requiring rebase or squash merges only
10. Click **Create** to save the ruleset in **Evaluate** mode
11. Verify the ruleset appears in the organization Rulesets list with status **"Evaluate"**

> **Note: Layering behavior** — Organization rulesets layer on top of any repository-level rulesets. When both exist, the most restrictive combination applies. For example, if your Lab 03 repo-level ruleset requires 1 approval and this org ruleset requires signed commits, contributors must satisfy both. Neither ruleset can relax a rule imposed by the other.

## 6.2 Create a tag ruleset

Tag rulesets protect your release tags from accidental or unauthorized changes. This is especially important for teams that use semantic versioning tags (`v1.0.0`, `v2.3.1`) as deployment triggers.

1. Navigate back to your **organization Settings > Repository > Rulesets**
2. Click **New ruleset**, then select **New tag ruleset**
3. Set the **Ruleset name** to `YOUR-HANDLE-release-tag-protection`
4. Set **Enforcement status** to **Active**
5. Under **Target repositories**, click **Add target** and select **"All repositories"**
6. Under **Target tags**, click **Add a target**, select **"Include by pattern"**, and enter `v*` — this matches all tags starting with `v`, covering patterns like `v1.0.0`, `v2.0.0-beta.1`, etc.
7. In the **"Bypass list"** section, click **Add bypass**:
    - Search for and select the **"Maintain"** role — this grants release managers the ability to bypass the tag rules
    - Leave the bypass mode as **"Always"**
    - Click **Add Selected**
8. In the **"Tag protections"** section, enable the following:
    - ✅ **Restrict creations** — only bypass actors (Maintain role) can create matching tags
    - ✅ **Restrict updates** — prevents force-updating or moving existing tags
    - ✅ **Restrict deletions** — prevents anyone except bypass actors from deleting tags
9. Click **Create** to save the tag ruleset
10. Verify the ruleset appears with status **"Active"** in the Rulesets list

## 6.3 Test bypass permissions

Understanding bypass behavior is essential for designing rulesets that balance security with team velocity. In this section you will test both the org-level branch ruleset and the tag ruleset.

1. Navigate to one of the repositories targeted by your org-level ruleset
2. Try to push a commit directly to the `main` branch (edit a file via the GitHub UI on the default branch):
    - Because the org ruleset is in **Evaluate** mode, the push should **succeed** — but the evaluation will be recorded in Rule Insights
3. Now return to **Organization Settings > Repository > Rulesets** and edit the `YOUR-HANDLE-org-branch-standards` ruleset
4. Change the **Enforcement status** from **Evaluate** to **Active**, then click **Save changes**
5. Return to the repository and attempt to edit a file directly on `main` again:
    - This time, GitHub should **block** the direct push and force you to create a branch and pull request
6. Test the tag ruleset as a user who does **not** have the Maintain role:
    - In the repository, go to **Code > Tags** (or use the Git CLI: `git tag v0.0.1-test && git push origin v0.0.1-test`)
    - The tag creation should be **blocked** with a message indicating the ruleset restriction
7. Now test as a user with the **Maintain** role (or ask a teammate with that role):
    - The same tag creation should **succeed** because Maintain is in the bypass list
8. Observe the difference between bypass modes:
    - **"Always"** — the bypass actor can push directly and merge PRs without satisfying the rules
    - **"For pull requests only"** — the bypass actor can merge PRs that don't satisfy all rules, but direct pushes are still blocked. This is the mode you configured for admins in Lab 03.

> **Note: Bypass audit trail** — Every time a bypass actor overrides a ruleset, GitHub records the event in Rule Insights. This provides a clear audit trail for compliance reviews.

## 6.4 Import and export rulesets _(if time permits)_

> **⏱️ Timing note:** Sections 6.4 and 6.5 are optional during in-session delivery. If the workshop is running behind schedule, skip to section 6.6 (Verification) and complete these sections as self-paced practice.

Rulesets can be exported as JSON and imported into other organizations or repositories, enabling you to standardize policies across your enterprise.

1. Navigate to **Organization Settings > Repository > Rulesets**
2. Find the `YOUR-HANDLE-org-branch-standards` ruleset you created in section 6.1
3. Click the **···** (three-dot menu) to the right of the ruleset, then click **Export**
4. GitHub downloads a JSON file representing the complete ruleset configuration. Open the file — its structure looks like this:

```json
{
  "id": 12345,
  "name": "YOUR-HANDLE-org-branch-standards",
  "target": "branch",
  "source_type": "Organization",
  "source": "your-org-name",
  "enforcement": "active",
  "conditions": {
    "ref_name": {
      "include": [
        "~ALL"
      ],
      "exclude": []
    },
    "repository_name": {
      "include": [
        "~ALL"
      ],
      "exclude": [],
      "protected": true
    }
  },
  "rules": [
    {
      "type": "required_signatures"
    },
    {
      "type": "required_linear_history"
    }
  ],
  "bypass_actors": []
}
```

5. To import a ruleset, navigate to **Organization Settings > Repository > Rulesets**
6. Click **New ruleset**, then click **Import a ruleset** at the top of the page

> **Troubleshooting:** If the **Import a ruleset** option is not visible, verify you are on the organization-level **New ruleset** page (not a repository-level page). Ruleset import requires the organization Owner role. See the [Instructor Guide](../docs/INSTRUCTOR-GUIDE.md) for additional help.

7. Select the JSON file — GitHub pre-populates all fields from the file. The ruleset is created in **Disabled** status by default so you can review before activating.
8. _(Optional)_ Browse the [github/ruleset-recipes](https://github.com/github/ruleset-recipes) repository for pre-built ruleset JSON files covering common patterns (e.g., signed commits, status checks, code review). Download one and import it into your organization.
9. Review the imported ruleset, adjust settings as needed, and change the enforcement status to **Active** or **Evaluate**

## 6.5 Compare rulesets with branch protection _(if time permits)_

In Lab 03 you learned that rulesets are the modern replacement for branch protection rules. This section provides a direct comparison to help you make migration decisions.

1. Navigate to your repository **Settings > Branches**
2. Observe the **"Branch protection rules"** section — this is the legacy interface. If you have any rules configured here, they still function alongside rulesets.
3. Review the key differences between rulesets and legacy branch protection:

| Capability | Legacy Branch Protection | Rulesets |
|---|---|---|
| Scope | Single repository | Repository **or** organization-wide |
| Enforcement modes | On / Off | **Active** / **Disabled** / **Evaluate** (dry-run) |
| Multiple rules | One rule per branch pattern | Multiple rulesets can layer and stack |
| Visibility | Admins only | All contributors can see active rulesets |
| Bypass controls | Limited (admin override) | Granular bypass actors with Always / PR-only modes |
| Tag protection | Separate "tag protection rules" | Unified under rulesets |
| Audit trail | Limited | **Rule Insights** with full evaluation history |
| Import / Export | Not supported | JSON export / import |

4. Navigate to **Settings > Rules > Rulesets** in the repository. Note that any repo-level rulesets you created in Lab 03 appear here alongside the org-level rulesets inherited from section 6.1.
5. Key decision point: **When should you migrate from branch protection to rulesets?**
    - Migrate if you need org-wide enforcement, evaluate mode, layering, or tag rulesets
    - Keep legacy rules if you rely on features not yet in rulesets (check [available rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets) for the latest list)
    - Both coexist safely — the most restrictive combination of all rules applies

> **Note: Coexistence** — You do not need to delete branch protection rules before creating rulesets. Both are evaluated on every push and PR. However, having both active can cause confusion for contributors who may not know which rule is blocking them. For clarity, consider consolidating into rulesets over time.

## 6.6 Verify your work

Use this checklist to confirm everything is configured correctly.

1. Navigate to **Organization Settings > Repository > Rulesets** and verify:
    - [ ] `YOUR-HANDLE-org-branch-standards` ruleset exists with status **Active** (you changed it from Evaluate in 6.3)
    - [ ] `YOUR-HANDLE-release-tag-protection` tag ruleset exists with status **Active**
2. To view **Rule Insights** (April 2026 redesign): open the `YOUR-HANDLE-org-branch-standards` ruleset, then click its **Insights** tab. Verify:
    - [ ] You see evaluation entries from when `YOUR-HANDLE-org-branch-standards` was in **Evaluate** mode (section 6.3, step 2)
    - [ ] You see enforcement entries from after you switched to **Active** mode
    - [ ] Tag ruleset events appear if you tested tag creation
3. Navigate to any targeted repository's **Settings > Rules > Rulesets**:
    - [ ] The org-level `YOUR-HANDLE-org-branch-standards` ruleset appears alongside any repo-level rulesets from Lab 03
    - [ ] The tag ruleset `YOUR-HANDLE-release-tag-protection` appears in the list
4. Confirm bypass behavior:
    - [ ] Non-bypass users cannot push directly to `main` (blocked by org-level ruleset)
    - [ ] Non-bypass users cannot create `v*` tags (blocked by tag ruleset)
    - [ ] Users with the Maintain role can create `v*` tags
5. _(Optional)_ If you imported a ruleset from `github/ruleset-recipes` in section 6.4, verify it appears in the Rulesets list with the correct enforcement status

> **Note: Evaluate mode in production** — A recommended practice for enterprise rollouts is to deploy new rulesets in **Evaluate** mode for one to two weeks, monitor Rule Insights for unexpected blocks, then switch to **Active**. This reduces disruption and gives teams time to adjust their workflows before enforcement begins.
