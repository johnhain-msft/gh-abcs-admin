# 17 - Enterprise Managed Settings for Copilot
In this lab you will create your enterprise's Copilot governance repository, add a `copilot/managed-settings.json` file that blocks bypass ("allow all") mode, check it with the in-product validator, give one enterprise team an exception, and confirm enforcement in Copilot CLI and VS Code.
> Duration: 20-30 minutes

> **Prerequisites:** Enterprise owner access to a **training** GitHub Enterprise Cloud enterprise that assigns Copilot Business or Copilot Enterprise licenses through the enterprise or its organizations, plus a test user who holds one of those licenses. Section 17.5 needs Copilot CLI or VS Code 1.122 or later, signed in as that test user. Section 17.6 needs an enterprise team named `ai-pioneers` that contains the test user (see [Lab 16](lab16.md)).

> **Environment note:** This is an optional extension lab; it isn't part of the timed agenda. The hands-on steps need **enterprise owner** access. Participants with organization admin access only can follow the collapsible **Organization admin path** in each section: they draft and review the same files in a scratch repository and can test file-based delivery on a workstation where they have administrator rights.

> **⚠️ Warning:** Server-managed settings apply, within about an hour, to every user who receives a Copilot license from the enterprise or its organizations. Run this lab in a training enterprise, not in production, and remove the settings when you finish (section 17.7).

References:
- [Getting started with enterprise-managed settings](https://docs.github.com/en/enterprise-cloud@latest/copilot/how-tos/administer-copilot/manage-for-enterprise/use-managed-settings/get-started)
- [Enterprise managed settings (reference)](https://docs.github.com/en/enterprise-cloud@latest/copilot/reference/enterprise-administrators/enterprise-managed-settings)
- [Overriding enterprise-managed settings for teams](https://docs.github.com/en/enterprise-cloud@latest/copilot/how-tos/administer-copilot/manage-for-enterprise/use-managed-settings/override-settings-for-teams)
- [Choosing how to deploy enterprise-managed settings to users](https://docs.github.com/en/enterprise-cloud@latest/copilot/how-tos/administer-copilot/manage-for-enterprise/use-managed-settings/deploy-managed-settings)
- [Creating a `.github-private` repository](https://docs.github.com/en/enterprise-cloud@latest/copilot/how-tos/administer-copilot/manage-for-enterprise/manage-agents/create-github-private-repo)
- [Creating rulesets for a repository](https://docs.github.com/en/enterprise-cloud@latest/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/creating-rulesets-for-a-repository)
- [Enterprise Managed Settings for GitHub Copilot (workshop doc)](../docs/29-enterprise-managed-settings.md)

## What You'll Learn

- Choose a configuration source organization and create the `.github-private` governance repository
- Change `copilot/managed-settings.json` through a protected pull request and check it with the in-product validator
- Give one enterprise team an exception with `team-mappings.json`, and confirm enforcement in Copilot CLI and VS Code

## 17.1 Create the governance repository

1. Navigate to your enterprise (for example `https://github.com/enterprises/YOUR-ENTERPRISE`), click **AI Controls** at the top of the page, then click the **Agents** tab and find the **Configuration source** section.
   - **Expected result:** the section shows a **Select organization** dropdown. If it already shows an organization, the enterprise already has a configuration source (for example, for custom agents). Use that organization's `.github-private` repository for the rest of the lab instead of creating a second one, and agree the change with its owners first.
2. Open the governance template repository at `https://github.com/docs/custom-agents-template`, click **Use this template**, then click **Create a new repository**.
   - **Expected result:** the **Create a new repository** page opens with the template selected.
3. Set **Owner** to the organization that will host your settings, set **Repository name** to `.github-private`, choose **Internal** visibility, and click **Create repository**.
   - **Expected result:** `YOUR-ORG/.github-private` exists with internal visibility. It contains an empty `copilot/managed-settings.json` and an `agents/` folder with a commented-out example agent.
4. Return to **AI Controls** → **Agents**. In **Configuration source**, open the **Select organization** dropdown and click your organization.
   - **Expected result:** your organization is shown as the configuration source. After you add settings in 17.3, the **Configuration summary** on this tab lists them.
5. _(Optional)_ Confirm the source with the REST API. Reading it needs a token with the `admin:enterprise` scope:

   ```bash
   gh auth refresh -h github.com -s admin:enterprise
   gh api -H "X-GitHub-Api-Version: 2026-03-10" /enterprises/YOUR-ENTERPRISE/copilot/custom-agents/source
   ```

   - **Expected result:** JSON in which `organization.login` is your organization and `repository.full_name` is `YOUR-ORG/.github-private`.

<details>
<summary>🏢 Organization admin path — draft the settings without enterprise access</summary>

1. In an organization where you're an owner, create a **private** repository named `copilot-settings-draft` with a README. Use a name other than `.github-private` so the draft can't be mistaken for an enterprise governance repository.
   - **Expected result:** `YOUR-ORG/copilot-settings-draft` exists. In the following sections, create each file under `copilot/` in this repository instead of `.github-private`.
2. Clone it so you can check the files locally:

   ```bash
   gh repo clone YOUR-ORG/copilot-settings-draft
   ```

   - **Expected result:** a local `copilot-settings-draft` folder.

</details>

## 17.2 Protect the repository with a ruleset

1. In `YOUR-ORG/.github-private`, click **Settings**. In the left sidebar, under **Code, planning, and automation**, click **Rulesets**, then click **New ruleset** → **New branch ruleset**.
   - **Expected result:** the new branch ruleset form opens.
2. Set **Ruleset name** to `protect-copilot-settings` and set **Enforcement status** to **Active**.
   - **Expected result:** the form shows the name and the **Active** status.
3. Under **Target branches**, click **Add a target** → **Include default branch**.
   - **Expected result:** the default branch is listed as a target.
4. In the **Branch protections** section, select **Require a pull request before merging**. For this lab, set **Required approvals** to `0` so you can merge your own pull requests. In production, require at least one approval and select **Require review from Code Owners**.
   - **Expected result:** the rule is selected with `0` required approvals.
5. In the same section, make sure **Block force pushes** is selected, then click **Create**.
   - **Expected result:** `protect-copilot-settings` appears in the rulesets list as **Active**. Every later change to the default branch goes through a pull request, which gives you a reviewable record of each settings change.

<details>
<summary>🏢 Organization admin path — protect the draft repository</summary>

Repeat steps 1–5 in `YOUR-ORG/copilot-settings-draft`. Repository admins can create repository rulesets.

- **Expected result:** the draft repository has an **Active** `protect-copilot-settings` ruleset.

</details>

## 17.3 Block bypass mode with managed-settings.json

1. In `YOUR-ORG/.github-private`, open `copilot/managed-settings.json` and click the pencil icon (**Edit file**). Replace the contents with:

   ```json
   {
     "permissions": {
       "disableBypassPermissionsMode": "disable"
     }
   }
   ```

   - **Expected result:** the editor shows the replacement contents. The reference nests `disableBypassPermissionsMode` under `permissions`; some 2026 changelog posts show it at the top level, but use the nested form.
2. Click **Commit changes...**, choose to create a new branch for the commit, name the branch `block-bypass-mode`, and click **Propose changes**.
   - **Expected result:** the pull request form opens with a one-file diff.
3. Click **Create pull request**, review the diff, then click **Merge pull request** → **Confirm merge**.
   - **Expected result:** the pull request is merged, and `copilot/managed-settings.json` on the default branch contains the setting. Users licensed through the enterprise receive it within about an hour, or when they restart their client or sign in again.

<details>
<summary>🏢 Organization admin path — draft and check the file</summary>

1. Add the same `copilot/managed-settings.json` to `copilot-settings-draft` through a pull request, merge it, and pull it locally:

   ```bash
   cd copilot-settings-draft
   git pull
   python3 -m json.tool copilot/managed-settings.json
   ```

   - **Expected result:** the formatted JSON is printed. A syntax error prints a message with the line and column instead. On Windows, use `python` if `python3` isn't available.

</details>

## 17.4 Check the settings with the validator

1. Go to **AI Controls** → **Agents** and look for the **Copilot settings validation** section.
   - **Expected result:** there is no **Copilot settings validation** section. The validator shows the section only when it finds issues.
2. Check the **Configuration summary** on the same tab.
   - **Expected result:** it shows the bypass setting read from `YOUR-ORG/.github-private`.
3. _(Optional, training enterprise only)_ Watch the validator catch an error. Errors like this can stop policies from being enforced, so don't do this in production. Through a pull request, add a `copilot/team-mappings.json` file with a missing closing brace, merge it, and reload the **Agents** tab:

   ```text
   {
     "pioneers.json": ["ai-pioneers"]
   ```

   - **Expected result:** the **Copilot settings validation** section appears and lists an issue that names `copilot/team-mappings.json`.
4. If you did step 3, delete `copilot/team-mappings.json` through another pull request (you add a valid one in 17.6) and reload the **Agents** tab.
   - **Expected result:** the **Copilot settings validation** section is gone.

<details>
<summary>🏢 Organization admin path — catch errors before they merge</summary>

The in-product validator only checks the enterprise's configuration source, so a draft repository needs its own check.

1. Add the pull request JSON check from [docs/29 — Stage the change](../docs/29-enterprise-managed-settings.md#stage-the-change) as `.github/workflows/check-copilot-settings.yml` in `copilot-settings-draft`.
   - **Expected result:** the workflow file is on the default branch.
2. Open a pull request that adds the broken `copilot/team-mappings.json` from step 3 above, and don't merge it.
   - **Expected result:** the **Check Copilot managed settings** check fails and its log shows `Invalid JSON: copilot/team-mappings.json`. Close the pull request without merging.

</details>

## 17.5 Confirm enforcement in Copilot CLI and VS Code

Use the test user, whose Copilot license comes from the enterprise.

1. Quit any running Copilot CLI session and start a new one so the settings are fetched at startup, then type `/allow-all`:

   ```bash
   copilot
   ```

   - **Expected result:** `/allow-all` is blocked and allow-all mode stays off. The `/yolo` command and the `--yolo`, `--allow-all` and `--allow-all-tools` command-line options can't grant elevated permissions either.
2. Ask Copilot to run a harmless shell command, such as `git --version`.
   - **Expected result:** Copilot asks for approval before it runs the command, because allow-all mode is unavailable (unless you saved an approval for that command in your own settings earlier).
3. Restart VS Code, open **Settings**, and search for `chat.tools.global.autoApprove`.
   - **Expected result:** the setting is off and can't be turned on.
4. If nothing is enforced, check that the test user's license comes from your enterprise and, if they hold licenses from more than one billing entity, that your enterprise is selected under **Usage billed to** at `https://github.com/settings/copilot/features`. Then restart the client again.
   - **Expected result:** after the restart, the checks in steps 1–3 pass.

<details>
<summary>🏢 Organization admin path — test file-based delivery on your own workstation</summary>

File-based settings apply to **every** Copilot user on the machine, whatever their license. Do this only on a workstation where you have administrator rights, and remove the file afterwards. If your Copilot license comes from an enterprise that also uses managed settings, its server-managed values take precedence over this file for the same key.

1. From your `copilot-settings-draft` folder, copy the draft file to the file-based location for your operating system.

   macOS:

   ```bash
   sudo mkdir -p "/Library/Application Support/GitHubCopilot"
   sudo cp copilot/managed-settings.json "/Library/Application Support/GitHubCopilot/managed-settings.json"
   sudo chown root:wheel "/Library/Application Support/GitHubCopilot/managed-settings.json"
   sudo chmod 644 "/Library/Application Support/GitHubCopilot/managed-settings.json"
   ```

   Linux:

   ```bash
   sudo mkdir -p /etc/github-copilot
   sudo cp copilot/managed-settings.json /etc/github-copilot/managed-settings.json
   sudo chown root:root /etc/github-copilot/managed-settings.json
   sudo chmod 644 /etc/github-copilot/managed-settings.json
   ```

   Windows (PowerShell, run as administrator):

   ```powershell
   New-Item -ItemType Directory -Force -Path "$env:ProgramFiles\GitHubCopilot" | Out-Null
   Copy-Item .\copilot\managed-settings.json "$env:ProgramFiles\GitHubCopilot\managed-settings.json"
   ```

   - **Expected result:** the file exists at the platform path. On macOS and Linux it is owned by `root` and isn't group-writable or world-writable, which Copilot CLI requires.
2. Restart Copilot CLI and type `/allow-all`.
   - **Expected result:** `/allow-all` is blocked, exactly as in step 1 of the enterprise path.
3. Remove the file, then restart Copilot CLI:
   - macOS: `sudo rm "/Library/Application Support/GitHubCopilot/managed-settings.json"`
   - Linux: `sudo rm /etc/github-copilot/managed-settings.json`
   - Windows (PowerShell, run as administrator): `Remove-Item "$env:ProgramFiles\GitHubCopilot\managed-settings.json"`
   - **Expected result:** after the restart, `/allow-all` works again.

</details>

## 17.6 Give an enterprise team an exception

Let the `ai-pioneers` enterprise team manage bypass mode themselves while everyone else stays blocked.

1. In `YOUR-ORG/.github-private`, edit `copilot/managed-settings.json` so the enterprise value becomes an overridable default. Commit it to a new branch named `pioneers-exception` and create the pull request, but don't merge it yet:

   ```json
   {
     "permissions": {
       "disableBypassPermissionsMode": { "overridable": "disable" }
     }
   }
   ```

   - **Expected result:** an open pull request from `pioneers-exception` with a one-file diff.
2. Switch to the `pioneers-exception` branch, click **Add file** → **Create new file**, name it `copilot/teams/pioneers.json`, click **Commit changes...**, and commit it to the `pioneers-exception` branch:

   ```json
   {
     "permissions": {
       "disableBypassPermissionsMode": "unmanaged"
     }
   }
   ```

   - **Expected result:** the pull request shows two changed files.
3. Add `copilot/team-mappings.json` to the same branch the same way. The key is the team settings file name, and the value lists enterprise team slugs:

   ```json
   {
     "pioneers.json": ["ai-pioneers"]
   }
   ```

   - **Expected result:** the pull request shows three changed files.
4. Merge the pull request, then reload **AI Controls** → **Agents**.
   - **Expected result:** no **Copilot settings validation** section. If one appears, it names the file and JSON path to fix; check the team slug first.
5. As a member of `ai-pioneers`, restart Copilot CLI and type `/allow-all`.
   - **Expected result:** allow-all mode can be turned on, because the team value `unmanaged` removes the enterprise control for that team. If you have a second licensed test user outside the team, `/allow-all` stays blocked for them.
6. Discuss with your table: a user who belongs to `ai-pioneers` and to a second mapped team whose file keeps `"disable"` gets the **least restrictive** value. What does that mean for how you design exception teams?
   - **Expected result:** you can explain that the user can use bypass mode, and why exception teams should stay small.

<details>
<summary>🏢 Organization admin path — design the team overrides</summary>

1. In `copilot-settings-draft`, add the three files from steps 1–3 through one pull request, then check them locally:

   ```bash
   for f in copilot/managed-settings.json copilot/team-mappings.json copilot/teams/pioneers.json; do
     python3 -m json.tool "$f" > /dev/null && echo "OK $f"
   done
   ```

   - **Expected result:** three `OK` lines.
2. Using the overridable keys listed in [docs/29](../docs/29-enterprise-managed-settings.md#enterprise-team-specialization), write down which keys your company would keep enterprise-wide and which it would let teams override.
   - **Expected result:** a short list you can bring to your enterprise owners.

</details>

## 17.7 Verify your work

1. Confirm the configuration source (17.1): **AI Controls** → **Agents** → **Configuration source** shows your organization, and `YOUR-ORG/.github-private` is internal.
2. Confirm the ruleset (17.2): `protect-copilot-settings` is **Active** on the default branch of `.github-private`.
3. Confirm the files (17.3 and 17.6): the default branch has `copilot/managed-settings.json` with the overridable bypass setting, `copilot/team-mappings.json` and `copilot/teams/pioneers.json`, each added through a merged pull request.
4. Confirm validation (17.4): the **Agents** tab shows no **Copilot settings validation** section.
5. Confirm enforcement (17.5 and 17.6): `/allow-all` is available in Copilot CLI to a member of `ai-pioneers`. For any licensed user outside the team, `/allow-all` stays blocked and `chat.tools.global.autoApprove` can't be turned on in VS Code.
6. Organization admin path: `copilot-settings-draft` holds the three files, each prints `OK` in the local check, and any file you placed for the file-based test has been removed.
7. Discuss with your table: **"Which restrictions must hold even when Copilot CLI can't reach GitHub, and how would you deliver them?"** Consider MDM-managed or file-based delivery for those keys.
8. Discuss with your table: **"Who should approve pull requests that change `copilot/`?"** Consider a `CODEOWNERS` entry for the team that owns Copilot governance and at least one required approval.
9. Clean up the training enterprise. Through one pull request, delete `copilot/team-mappings.json` and `copilot/teams/pioneers.json` and set `copilot/managed-settings.json` back to `{}`. Clients drop the settings within about an hour, or when users restart or sign in again. Keep the repository and ruleset if you'll reuse them.
   - **Expected result:** after the merge and a client restart, `/allow-all` works again for every test user.

> **Note:** If the enterprise had no configuration source before this lab, you can remove the one you selected with `gh api -X DELETE /enterprises/YOUR-ENTERPRISE/copilot/custom-agents/source`. This removes the reference to the repository and disables enterprise custom agents and Copilot CLI client settings for the enterprise; it doesn't delete the repository.
