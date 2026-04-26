# 3 - Repository Rulesets
In this lab you will create a repository ruleset to govern how people interact with branches — the modern replacement for branch protection rules.
> Duration: 15-20 minutes

References:
- [About rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)
- [Creating rulesets for a repository](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/creating-rulesets-for-a-repository)
- [Available rules for rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets)
- [About code owners](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
- [Ruleset recipes](https://github.com/github/ruleset-recipes)

## What You'll Learn

- Configure a branch ruleset to enforce pull request and status check requirements
- Set up bypass actors and target branch patterns for flexible governance
- Test and verify ruleset enforcement on your repository

## 3.1 Create a branch ruleset

1. Navigate to your repository on GitHub.com
2. Click **Settings** in the repository navigation bar
3. In the left sidebar under **"Code and automation"**, click **Rules**, then click **Rulesets**
4. Click **New ruleset**, then select **New branch ruleset**
5. Set the **Ruleset name** to `default-branch-protection`
6. Leave **Enforcement status** as **Active**

> **Note:** If you do not see the **Rulesets** option under **Rules**, ensure you are on GitHub Enterprise Cloud or a repository in an organization. Rulesets are not available on personal free-tier repositories.

## 3.2 Configure bypass actors

1. In the **"Bypass list"** section, click **Add bypass**
2. Search for and select **"Repository admin"**
3. Change the bypass mode from **"Always"** to **"For pull requests only"** — this ensures admins must open PRs but can merge without waiting for all checks, creating an audit trail
4. Click **Add Selected**

## 3.3 Set target branches

1. In the **"Target branches"** section, click **Add a target**
2. Select **"Include default branch"** — this uses the `~DEFAULT_BRANCH` shortcut, which automatically targets `main` or `master`
3. _(Optional)_ Add another target: click **Add a target** > **Include by pattern** and enter `release/**` to also protect release branches

## 3.4 Configure branch protection rules

In the **"Branch protections"** section, enable the following rules:

1. **Restrict deletions** — ✅ Already selected by default. Leave enabled.
2. **Require a pull request before merging** — ✅ Check this box, then configure:
    - Set **Required approvals** to `1`
    - ✅ Check **"Dismiss stale pull request approvals when new commits are pushed"**
    - ✅ Check **"Require review from Code Owners"**
    - ✅ Check **"Require conversation resolution before merging"**
3. **Require status checks to pass before merging** — ✅ Check this box, then:
    - In the search box, type `build` and select the status check. If no `build` check appears, you need to create a workflow first — follow the quick setup below, then return to this step.
    - ✅ Check **"Require branches to be up to date before merging"**

> **Quick Workflow Setup** (only if you don't already have a `build` status check):
>
> 1. Navigate to your repository's **Code** tab
> 2. Click **Add file** → **Create new file**
> 3. Name the file `.github/workflows/ci.yml`
> 4. Paste this content:
>
> ```yaml
> name: CI
> on: [push, pull_request]
> jobs:
>   build:
>     runs-on: ubuntu-latest
>     steps:
>       - uses: actions/checkout@v6
>       - run: echo "Build passed"
> ```
>
> 5. Commit directly to `main` and wait for the workflow to complete (check the **Actions** tab)
> 6. Return to the ruleset configuration and the `build` check will now appear in the search
4. **Block force pushes** — ✅ Already enabled by default. Leave enabled.

> **Tip:** If the `build` status check does not appear in the search results, verify that you have a workflow with a job named `build` and that it has run at least once. Status checks only appear in the list after they have been reported at least once on the repository. See the Quick Workflow Setup in section 3.4 if needed.

## 3.5 Create and verify the ruleset

1. Click **Create** at the bottom of the page
2. Verify the ruleset appears in the Rulesets list with status **"Active"**
3. Click on the ruleset name to review the configured rules

## 3.6 Test the ruleset

1. Navigate to the repository's **Code** tab
2. Try to edit a file directly on the default branch via the GitHub UI
3. Observe that GitHub forces you to create a new branch and open a pull request
4. Create a new branch `feature/lab03` and commit the change
5. Open a pull request from `feature/lab03` to `main`
6. Observe the merge box shows:
    - ❌ Review required (code owner approval needed)
    - ❌ Status check `build` pending/required
7. Wait for the `build` check to pass (or trigger it if needed)

> **Note:** If you are the only participant in the workshop, you may not be able to fully test the code owner approval requirement. In that case, you can use the admin bypass configured in section 3.2 to merge the PR, or temporarily reduce the required approvals to 0.

8. Ask the code owner to review and approve your PR
9. Once all checks pass and the review is approved, merge the PR

## 3.7 _(Optional)_ View Rule Insights

1. Go to **Settings → Rules → Rulesets**, then click the name of the ruleset you want to inspect
2. On the ruleset's detail page, click the **Insights** tab (redesigned April 2026) to open the dashboard — you can filter by actor, time period, and result (pass / fail / bypass)
3. Review the timeline of rule evaluations — you should see your recent PR activity with pass/fail/bypass events
4. _(Note)_ On GitHub Enterprise Cloud, you can set rulesets to **Evaluate** mode to dry-run rules against real traffic before activating them

> **Note: Legacy branch protection** — Prior to rulesets (GA July 2023), branch protection rules were the only way to protect branches. They are found at **Settings > Branches** and still function today. Rulesets are the recommended modern approach because they support layering multiple rules, provide an Active/Disabled/Evaluate status, give visibility to all contributors (not just admins), and can be applied at the organization level across multiple repositories. Legacy branch protection rules and rulesets coexist — the most restrictive combination of both applies.

## ✅ Verification Checklist

Before moving on, confirm:

- [ ] A branch ruleset named `default-branch-protection` exists and is active
- [ ] The ruleset targets the default branch and requires pull requests with at least 1 approval
- [ ] Direct commits to `main` are blocked — GitHub forces you to create a branch and PR
- [ ] The `build` status check is required before merging
