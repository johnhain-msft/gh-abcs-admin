# 13 - Scripts and gh CLI Automation
In this lab you will use the GitHub CLI (`gh`) and the GitHub REST/GraphQL APIs to perform enterprise administration tasks, build automation scripts for common workflows, and learn when to use GraphQL versus REST for efficient admin operations.
> Duration: 20-25 minutes

> **Instructor Note:** For the 15-minute in-session time slot, focus on sections 13.1–13.3. Sections 13.4–13.6 are optional extensions if time permits.

References:
- [GitHub CLI manual](https://cli.github.com/manual/)
- [Using the GitHub CLI in workflows](https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/using-github-cli-in-workflows)
- [REST API overview](https://docs.github.com/en/rest/about-the-rest-api/about-the-rest-api)
- [Forming calls with GraphQL](https://docs.github.com/en/graphql/guides/forming-calls-with-graphql)
- [Using the audit log API for your enterprise](https://docs.github.com/en/enterprise-cloud@latest/admin/monitoring-activity-in-your-enterprise/reviewing-audit-logs-for-your-enterprise/using-the-audit-log-api-for-your-enterprise)
- [Rate limits for the REST API](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api)
- [Managing teams with the REST API](https://docs.github.com/en/rest/teams/teams)

## What You'll Learn

- Use `gh api` to query organization data, manage teams, and search audit logs
- Write automation scripts for recurring admin tasks like access reporting
- Compare REST and GraphQL APIs for enterprise administration efficiency

## 13.1 Explore gh CLI admin commands

1. Verify that `gh` is installed and check your authentication status:

   ```bash
   gh --version
   gh auth status
   ```

   You should see your active GitHub account, the protocol in use (HTTPS or SSH), and the token scopes. On GitHub-hosted runners, `gh` is preinstalled and automatically authenticated via the `GITHUB_TOKEN` environment variable.

> **Troubleshooting:** If `gh api` returns a 403 Forbidden error, run `gh auth status` to verify your token scopes include `admin:org` and `repo`. You can refresh your token with `gh auth refresh -s admin:org,repo`. See the [Instructor Guide](../docs/INSTRUCTOR-GUIDE.md) for additional help.

2. List repositories in your organization, formatted as tab-separated values:

   ```bash
   gh repo list YOUR-ORG --limit 20 --json name,visibility,isArchived \
     --jq '.[] | [.name, .visibility, .isArchived] | @tsv'
   ```

   Review the output. Each line shows a repository name, its visibility (`public`, `private`, or `internal`), and whether it is archived.

3. View key organization settings using the REST API through `gh api`:

   ```bash
   gh api /orgs/YOUR-ORG --jq '{
     name: .name,
     default_permission: .default_repository_permission,
     two_factor: .two_factor_requirement_enabled,
     members_can_create_repos: .members_can_create_repositories
   }'
   ```

4. List the first 10 members of your organization. The `--paginate` flag automatically follows pagination links so you receive all results:

   ```bash
   gh api /orgs/YOUR-ORG/members --paginate \
     --jq '.[] | .login' | head -10
   ```

5. Consider how `gh api` compares to plain `curl`. With `gh api` you do not need to manage authentication headers, construct full URLs, or handle link-based pagination — `gh` does all of this for you. Authenticated REST requests are rate-limited to **5,000 requests per hour**.

## 13.2 Manage teams with gh CLI

1. List the existing teams in your organization:

   ```bash
   gh api /orgs/YOUR-ORG/teams --jq '.[] | [.name, .slug, .privacy] | @tsv'
   ```

2. Create a new team for this lab exercise (use your GitHub handle as a prefix to avoid naming conflicts in a shared workshop org):

   ```bash
   gh api /orgs/YOUR-ORG/teams -X POST \
     -f name="YOUR-HANDLE-lab13-team" \
     -f description="Created in Lab 13" \
     -f privacy="closed"
   ```

> **Troubleshooting:** If team creation returns a 422 Unprocessable Entity error, the team name may already exist in the organization. Try a different name prefix, or check existing teams with `gh api /orgs/YOUR-ORG/teams --jq '.[].name'`. See the [Instructor Guide](../docs/INSTRUCTOR-GUIDE.md) for additional help.

   A **closed** team is visible to all organization members but its membership is managed by team maintainers. A **secret** team is only visible to its members and organization owners.

3. Add yourself (or a test user) as a member of the team:

   ```bash
   gh api /orgs/YOUR-ORG/teams/YOUR-HANDLE-lab13-team/memberships/YOUR-USERNAME \
     -X PUT -f role="member"
   ```

4. Grant the team **Write** access to a repository:

   ```bash
   gh api /orgs/YOUR-ORG/teams/YOUR-HANDLE-lab13-team/repos/YOUR-ORG/YOUR-REPO \
     -X PUT -f permission="push"
   ```

   The permission values map to repository roles as follows:
   - `pull` = **Read**
   - `triage` = **Triage**
   - `push` = **Write**
   - `maintain` = **Maintain**
   - `admin` = **Admin**

5. Verify the team was created and the membership is correct:

   ```bash
   gh api /orgs/YOUR-ORG/teams/YOUR-HANDLE-lab13-team/members \
     --jq '.[] | .login'
   ```

## 13.3 Query the audit log via API

1. Query recent audit log events filtered to team creation actions. The `-F` flag sends form parameters:

   ```bash
   gh api /orgs/YOUR-ORG/audit-log \
     -F phrase='action:team.create' \
     -F per_page=5 \
     --jq '.[] | {action, actor, created_at}'
   ```

   You should see the `team.create` event generated by step 13.2.

2. Find recent repository creation events across the organization:

   ```bash
   gh api /orgs/YOUR-ORG/audit-log \
     -F phrase='action:repo.create' \
     -F per_page=10 \
     --jq '.[] | [.actor, .repo, .created_at] | @tsv'
   ```

3. Search for all actions performed by a specific user in the last 7 days:

   ```bash
   gh api /orgs/YOUR-ORG/audit-log \
     -F phrase='actor:YOUR-USERNAME' \
     -F per_page=20 \
     --jq '.[] | [.created_at, .action, .actor] | @tsv'
   ```

4. Consider how you could combine audit log queries with standard bash utilities (`sort`, `uniq -c`, `awk`) to produce admin reports — for example, counting how many events each actor has generated or summarizing actions by type.

## 13.4 Write an automation script

1. Create a file named `admin-report.sh` in your working directory with the following content:

   ```bash
   #!/usr/bin/env bash
   # Admin script: List all repos with their team access
   # Usage: ./admin-report.sh YOUR-ORG

   set -euo pipefail

   ORG="${1:?Usage: $0 <org-name>}"

   echo "=== Repository Access Report for $ORG ==="
   echo ""

   gh repo list "$ORG" --limit 50 --json name -q '.[].name' | while read -r repo; do
     echo "Repository: $ORG/$repo"
     gh api "/repos/$ORG/$repo/teams" --jq '.[] | "  Team: \(.name) — \(.permission)"' 2>/dev/null
     echo ""
   done

   echo "=== Report complete ==="
   ```

2. Make the script executable and run it:

   ```bash
   chmod +x admin-report.sh
   ./admin-report.sh YOUR-ORG
   ```

3. Review the output. For each repository you should see the teams that have access and their permission level.

4. Consider improvements for production use:
   - **Error handling** — the `set -euo pipefail` line causes the script to exit on any error, unset variable, or pipeline failure.
   - **Rate limiting** — for organizations with hundreds of repositories, each iteration makes an API call. You may need to add a `sleep` between calls or use GraphQL to reduce the total number of requests.
   - **Pagination** — `gh repo list` accepts `--limit` but for very large organizations you should verify all repositories are included.
   - **Scheduled automation** — this script can run unattended in a **GitHub Actions** workflow because `gh` is pre-authenticated on GitHub-hosted runners via the `GITHUB_TOKEN`.

## 13.5 Use gh api for GraphQL

1. Run a single GraphQL query that returns both repository and team data in one request:

   ```bash
   gh api graphql -f query='
     query($org: String!) {
       organization(login: $org) {
         repositories(first: 5, orderBy: {field: UPDATED_AT, direction: DESC}) {
           nodes {
             name
             isArchived
             defaultBranchRef { name }
             collaborators { totalCount }
           }
         }
         teams(first: 5) {
           nodes {
             name
             members { totalCount }
           }
         }
       }
     }
   ' -f org="YOUR-ORG"
   ```

   This single request replaces multiple REST calls — one to list repositories and one to list teams — demonstrating the efficiency of GraphQL for complex admin queries.

2. Filter the GraphQL response with `--jq` to extract only team names and member counts:

   ```bash
   gh api graphql -f query='
     query($org: String!) {
       organization(login: $org) {
         teams(first: 10) {
           nodes {
             name
             members { totalCount }
           }
         }
       }
     }
   ' -f org="YOUR-ORG" --jq '.data.organization.teams.nodes[] | "\(.name): \(.members.totalCount) members"'
   ```

3. Consider when to use **GraphQL** versus **REST**:
   - Use **GraphQL** when you need data from multiple related resources in a single request, or when you want to select only specific fields to reduce payload size.
   - Use **REST** for simple create, update, and delete operations, or when you need to work with endpoints that have no GraphQL equivalent (such as the audit log).
   - GraphQL is rate-limited at **5,000 points per hour**, where each query costs a calculated number of points based on the nodes and connections requested.

## 13.6 Post commit statuses and check runs

Third-party CI/CD systems integrate with GitHub by posting **commit statuses** and **check runs**. As an admin, understanding these APIs helps you troubleshoot integration issues and verify that required status checks are working correctly.

1. Create a commit status on the latest commit of your repository. This is how external CI tools (Jenkins, CircleCI, etc.) report test results back to GitHub:

   ```bash
   LATEST_SHA=$(gh api /repos/YOUR-ORG/YOUR-REPO/commits/main --jq '.sha')

   gh api /repos/YOUR-ORG/YOUR-REPO/statuses/$LATEST_SHA -X POST \
     -f state="success" \
     -f target_url="https://example.com/build/42" \
     -f description="Lab 13 — CI passed" \
     -f context="lab13/external-ci"
   ```

2. Verify the status appears on the commit:

   ```bash
   gh api /repos/YOUR-ORG/YOUR-REPO/commits/$LATEST_SHA/statuses \
     --jq '.[] | [.context, .state, .description] | @tsv'
   ```

3. The `context` field acts as a unique identifier for a status check. Multiple CI systems can each post their own context (e.g., `ci/jenkins`, `security/snyk`). Repository rulesets and branch protection rules use these contexts to enforce **required status checks** before merging.

4. Discuss with your group: how would you configure a repository ruleset to require the `lab13/external-ci` status check before merging to `main`? What happens if the external system goes offline and never posts a status?

## 13.7 Verify your work

1. Confirm you have completed each section by running through this checklist:

   - [ ] Verified `gh` is installed and authenticated (13.1)
   - [ ] Listed organization repos and members via `gh api` (13.1)
   - [ ] Created the **YOUR-HANDLE-lab13-team** team (13.2)
   - [ ] Added a member and a repository to the team (13.2)
   - [ ] Queried the audit log for `team.create` and `repo.create` events (13.3)
   - [ ] Created and ran the `admin-report.sh` automation script (13.4)
   - [ ] Executed a GraphQL query returning repos and teams (13.5)
   - [ ] Posted a commit status via the Statuses API (13.6)

2. Clean up the resources created during this lab. Delete the demo team:

   ```bash
   gh api /orgs/YOUR-ORG/teams/YOUR-HANDLE-lab13-team -X DELETE
   ```

   Verify the team was removed:

   ```bash
   gh api /orgs/YOUR-ORG/teams/YOUR-HANDLE-lab13-team 2>&1 || echo "Team deleted successfully"
   ```

3. Remove the script file if you no longer need it:

   ```bash
   rm -f admin-report.sh
   ```

4. Discussion question: **What admin task in your organization would you automate first with the `gh` CLI?** Consider recurring tasks such as onboarding new team members, generating compliance reports, rotating repository secrets, or cleaning up stale branches.

> **Note:** The `gh` CLI supports [extensions](https://cli.github.com/manual/gh_extension) that add specialized admin commands. Community extensions exist for tasks such as bulk repository management, license auditing, and migration tooling. Run `gh extension search` to explore available extensions.
