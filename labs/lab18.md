# 18 - Workflow Execution Protections
In this lab you will create a workflow execution protection in evaluate mode for your organization, trigger a workflow run that the policy would block, review the result in Policy insights, and decide whether to enforce the policy.
> Duration: 20-30 minutes

> **Type:** Self-paced extension. This lab isn't part of the timed agenda.

> **Prerequisites:** Organization **owner** access on a GitHub Enterprise Cloud organization (evaluate mode is available on GitHub Enterprise Cloud only), and a test repository in that organization where you can commit to `main`. Use a repository that nobody else depends on: an **Active** policy blocks other people's workflow runs too.

> **Environment note:** This lab is written for **organization-level** access. Enterprise-level paths are in collapsible sections for participants who are enterprise owners. For background, read [GitHub Actions Workflow Execution Protections and Runner Governance](../docs/30-actions-workflow-execution-protections.md).

References:
- [About Actions policies](https://docs.github.com/en/enterprise-cloud@latest/actions/concepts/about-actions-policies)
- [Controlling who can execute GitHub Actions workflows](https://docs.github.com/en/enterprise-cloud@latest/actions/how-tos/administer/control-workflow-execution)
- [Securely using pull_request_target](https://docs.github.com/en/enterprise-cloud@latest/actions/reference/security/securely-using-pull_request_target)
- [REST API endpoints for GitHub Actions policies](https://docs.github.com/en/enterprise-cloud@latest/rest/actions/policies)
- [Manually running a workflow](https://docs.github.com/en/enterprise-cloud@latest/actions/how-tos/manage-workflow-runs/manually-run-a-workflow)

## What You'll Learn

- Create an organization-level Actions policy with an event rule in **Evaluate** mode
- Use **Policy insights** to find the workflow runs a policy would block
- Choose between enforcing a policy and allowing an event, and plan for the default `pull_request_target` policy that GitHub enforces from 2026-11-02

## 18.1 Add a test workflow

The workflow below runs on two events: `push` and `workflow_dispatch`. In this lab, the policy allows `push` and leaves `workflow_dispatch` off the allowlist.

1. Navigate to your test repository on GitHub.com.
2. Above the list of files, select the **Add file** dropdown menu, then click **Create new file**.
3. Name the file `.github/workflows/lab18.yml` and paste the following content:

```yaml
name: Lab 18 trigger test

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  hello:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Workflow execution protections lab"
```

4. Click **Commit changes...**, choose to commit directly to `main`, then click **Commit changes**.
5. Click the **Actions** tab and confirm that the **Lab 18 trigger test** run started by the `push` succeeded.

> **Note:** The `push` run happens before any policy exists. For the rest of this lab, `push` stays allowed and `workflow_dispatch` is the event the policy would block.

## 18.2 Create a policy in evaluate mode

Actions policies live in the **Policies** section of the Actions settings, which is separate from the **General** section you used in Lab 02.

1. Navigate to your organization on GitHub.com and click **Settings**.
2. In the left sidebar, under **Actions**, click **Policies**.
3. Start a new policy and name it `YOUR-HANDLE-lab18-events` (replace `YOUR-HANDLE` with your GitHub username to avoid naming conflicts in a shared workshop organization).
4. Set the enforcement status to **Evaluate**. In evaluate mode, runs continue and **Policy insights** records the runs the policy would have blocked.
5. Target only your test repository, and only the workflow file `.github/workflows/lab18.yml`.
6. Under **Restrict events**, allow `push` and `pull_request` only. Leave `workflow_dispatch` off the list.
7. Leave **Restrict actors** unset for this lab, then save the policy.
8. Confirm that the policy is saved with the **Evaluate** enforcement status.

> **Troubleshooting:** If you don't see **Policies** under **Actions** in the sidebar, confirm that you are an organization owner. Evaluate mode requires GitHub Enterprise Cloud. Repository administrators see the same section in the repository's **Settings**, but this lab uses the organization level.

<details>
<summary>🏛️ Enterprise Path: create the policy at the enterprise level (requires enterprise owner access)</summary>

1. Navigate to `https://github.com/enterprises/YOUR-ENTERPRISE` and click the **Policies** tab.
2. In the left sidebar, click **Actions**, then **Policies**.
3. Enterprise policies target organizations (by name, ID or property, or `~ALL` for every organization) combined with repositories (by name or property), and can add a workflow path condition.
4. Use the enterprise level for broad, non-negotiable protections. Organization owners and repository administrators can add restrictions on top of them.

</details>

## 18.3 Trigger a run the policy would block

1. In your test repository, click the **Actions** tab.
2. In the left sidebar, click the **Lab 18 trigger test** workflow.
3. Above the list of workflow runs, click **Run workflow**, keep `main` selected, then click **Run workflow**.
4. Watch the run. Because the policy is in **Evaluate** mode, the run starts and succeeds even though `workflow_dispatch` isn't an allowed event.
5. Optionally, edit `lab18.yml` and commit to `main` to start a `push` run. `push` is on the allowlist, so it isn't a would-be-blocked run.

## 18.4 Review Policy insights

1. Return to your organization's **Settings**.
2. In the left sidebar, under **Actions**, click **Policy insights**. The page sits directly under **Policies**.
3. Find the `workflow_dispatch` run of `.github/workflows/lab18.yml` among the runs that would have been blocked.
4. For each would-be-blocked run in your own work, you would ask three questions:
    - Which repository and workflow file would fail, and who owns it?
    - Is the run legitimate (allow it with a narrower policy or workflow file targeting) or unwanted (keep it blocked)?
    - Did a bot or GitHub App identity trip an actor rule (add it as an allowed actor)?

<details>
<summary>🏛️ Enterprise Path: review enterprise-wide Policy insights (requires enterprise owner access)</summary>

1. Navigate to `https://github.com/enterprises/YOUR-ENTERPRISE` and click the **Policies** tab.
2. In the left sidebar, click **Actions**, then **Policy insights**.
3. Enterprise Policy insights show how policies evaluate and enforce across the enterprise's organizations and repositories. Use them to audit a policy's impact before and after you switch it to **Active**.

</details>

## 18.5 Decide on enforcement

Pick one option and complete it.

**Option A — Enforce the policy**

1. Return to organization **Settings** → **Actions** → **Policies** and open `YOUR-HANDLE-lab18-events`.
2. Change the enforcement status from **Evaluate** to **Active** and save the policy.
3. Run the workflow again from the **Actions** tab with **Run workflow**.
4. Confirm that the run fails with an error like this one:

```text
Event 'workflow_dispatch' is not allowed to trigger Actions workflows. Workflow file: '.github/workflows/lab18.yml'.
```

5. Open **Policy insights** again and confirm that the run is listed as blocked.

**Option B — Allow the event**

1. Open `YOUR-HANDLE-lab18-events` and add `workflow_dispatch` to the allowed events.
2. Run the workflow again with **Run workflow** and confirm that it no longer appears as a would-be-blocked run.
3. Discuss with your table: for a production `deploy.yml`, would you allow `workflow_dispatch` for everyone with write access, or add an actor rule that allows only a release team or the `Maintain` and `Admin` roles?

**Clean up:** set `YOUR-HANDLE-lab18-events` to **Disabled** so that it can't affect other participants' runs. Delete it if your instructor asks you to.

<details>
<summary>🔧 Optional: inspect the same policy with the REST API</summary>

List the policies that apply to your organization, including any set at the enterprise level:

```bash
gh api /orgs/YOUR-ORG/actions/policies -H "X-GitHub-Api-Version: 2026-03-10"
```

The policy you created in the UI corresponds to a body like the following. A platform team would keep this JSON in a repository and apply it with `POST /orgs/{org}/actions/policies`:

```json
{
  "name": "YOUR-HANDLE-lab18-events",
  "enforcement": "evaluate",
  "conditions": {
    "repository_name": {
      "include": ["YOUR-REPO"],
      "exclude": []
    },
    "workflow_path": {
      "include": [".github/workflows/lab18.yml"],
      "exclude": []
    }
  },
  "rules": [
    {
      "type": "restrict_action_events",
      "parameters": {
        "allowed_events": ["push", "pull_request"]
      }
    }
  ]
}
```

</details>

## 18.6 Plan for the default pull_request_target policy

From 2026-09-17, GitHub adds a default event policy that blocks `pull_request_target` in **public** repositories that don't already have an applicable Actions event policy. It doesn't apply to private or internal repositories, and it starts in evaluate mode. **From 2026-11-02, GitHub enforces it** for affected repositories that were using the default `pull_request_target` policy before general availability.

1. Ask your instructor whether your organization has public repositories with workflows that use `pull_request_target`.
2. If it does, review Policy insights for runs of those workflows that would be blocked.
3. For each workflow, choose one path:
    - Move it to `pull_request` if it doesn't need secrets or a write token.
    - Allow `pull_request_target` explicitly in an event policy, limited to that workflow file with workflow file targeting.
    - Leave the default in place, so that the event is blocked after enforcement.

> **Note:** Fork pull request approval settings don't cover `pull_request_target`: those runs use the base branch's context and always run, regardless of approval settings. An event policy is the control that can stop them.

## 18.7 Verify your work

Use this checklist to confirm you have completed the lab:

1. In your test repository, confirm:
    - [ ] `.github/workflows/lab18.yml` exists on `main` and runs on `push` and `workflow_dispatch`
    - [ ] A `workflow_dispatch` run of **Lab 18 trigger test** started while the policy was in **Evaluate** mode
2. In organization **Settings** → **Actions** → **Policy insights**, confirm:
    - [ ] The `workflow_dispatch` run appears as a run that would have been blocked (or, after Option A, as blocked)
3. In organization **Settings** → **Actions** → **Policies**, confirm:
    - [ ] `YOUR-HANDLE-lab18-events` is set to **Disabled** (or deleted) after you finished
4. Be ready to explain:
    - [ ] The difference between the **General** and **Policies** sections of the Actions settings
    - [ ] Why evaluate mode comes before **Active**, and what Policy insights shows in each mode
    - [ ] What happens on 2026-11-02 to public repositories that use `pull_request_target`
