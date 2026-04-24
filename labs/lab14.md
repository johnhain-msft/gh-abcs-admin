# 14 - Unhealthy Repos and Git History
In this lab you will detect repository health issues, manage large files in Git history, rewrite history to remove sensitive data, clean up stale branches, and plan a repository archival strategy.
> Duration: 20-25 minutes

> **⏱️ Estimated time:** 25 minutes | **Type:** Self-Paced Extension
>
> **What you'll learn:**
> - How to detect large files and assess repository health
> - How to remove sensitive data from Git history using git-filter-repo
> - How to clean up stale branches and plan a repository archival strategy

References:
- [About large files on GitHub](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github)
- [Removing sensitive data from a repository](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [About Git Large File Storage](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-git-large-file-storage)
- [Managing branches in your repository](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-branches-in-your-repository)
- [Archiving repositories](https://docs.github.com/en/repositories/archiving-a-github-repository/archiving-repositories)
- [About push protection](https://docs.github.com/en/code-security/secret-scanning/introduction/about-push-protection)

## 14.1 Detect large files in a repository

GitHub recommends keeping repositories under 1 GB and strongly recommends they stay under 5 GB. Individual files over 50 MiB trigger Git warnings, and files over 100 MiB are blocked entirely. Browser uploads are limited to 25 MiB.

1. Clone your workshop repository as a mirror so you can inspect all objects and refs:

   ```bash
   git clone --mirror https://github.com/YOUR-ORG/YOUR-REPO.git
   cd YOUR-REPO.git
   ```

2. Find the ten largest blobs across the entire history of the repository:

   ```bash
   git rev-list --objects --all | \
     git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | \
     awk '/^blob/ {print $3, $4}' | \
     sort -rn | head -10
   ```

   Review the output. Any file larger than 50 MiB should be flagged for investigation. Consider whether the file belongs in the repository or should be tracked with Git LFS.

> **Troubleshooting:** If the large-file detection command returns no output, ensure you are inside the mirror clone directory (it ends in `.git`). If the repository has very few commits, there may genuinely be no large blobs to report. See the [Instructor Guide](../docs/INSTRUCTOR-GUIDE.md) for additional help.

3. For a more comprehensive health check, use **git-sizer** ([github/git-sizer](https://github.com/github/git-sizer)). It diagnoses repository health across multiple dimensions and assigns severity ratings:

   ```bash
   # If git-sizer is installed:
   git-sizer --verbose
   ```

   Look for results flagged with severity `*` (concerning) or `!` (critical). Common problems include oversized blobs, excessive refs, giant tree entries, and generated or vendored files committed to history.

4. Check the current repository size using the GitHub API:

   ```bash
   gh api /repos/YOUR-ORG/YOUR-REPO --jq '{
     size_kb: .size,
     size_mb: (.size / 1024 | floor)
   }'
   ```

   The `size` field returned by the API is in kilobytes and reflects the on-disk size of the bare repository.

5. Discuss with your group: what makes a repository unhealthy? Consider large binary blobs, generated build artifacts, vendored dependencies, log files, database dumps, and media assets committed directly to the repository. Prevention is always preferable to remediation — a well-configured `.gitignore` and Git LFS for legitimate large files keep repositories healthy from the start.

## 14.2 Remove sensitive data with git filter-repo

> **Warning:** History rewriting is a destructive, irreversible operation. Always work on a fresh clone, ensure you have backups, and coordinate with your team before proceeding.

GitHub officially recommends **git-filter-repo** for rewriting history. It replaces the older `git filter-branch` and third-party BFG Repo-Cleaner tools.

1. Install git-filter-repo:

   ```bash
   pip install git-filter-repo
   ```

> **Troubleshooting:** If `pip install` fails, try `pip3 install git-filter-repo` or `brew install git-filter-repo` (macOS). On Windows, ensure Python is in your PATH. If you get a "command not found" error after installation, verify the pip scripts directory is in your PATH (`pip show git-filter-repo` shows the install location).

2. Clone the repository fresh. Do **not** use `--mirror` when working with git-filter-repo:

   ```bash
   git clone https://github.com/YOUR-ORG/YOUR-REPO.git
   cd YOUR-REPO
   ```

3. Remove a specific file from all commits in the repository history:

   ```bash
   git filter-repo --path secrets.txt --invert-paths
   ```

   The `--invert-paths` flag means "keep everything except the specified path." After this command, `secrets.txt` will no longer appear in any commit.

4. To replace sensitive text (such as an exposed API key) across all files in all commits, create an expressions file and run:

   ```bash
   echo 'literal:AKIAIOSFODNN7EXAMPLE==>REDACTED' > expressions.txt

   git filter-repo --replace-text expressions.txt
   ```

   Each line in the expressions file follows the format `literal:<old>==>replacement`. This rewrites every occurrence across every commit.

5. After rewriting, force-push all branches to GitHub:

   ```bash
   git push --force --all
   git push --force --tags
   ```

6. Understand the aftermath of a history rewrite:

   - All collaborators **must** re-clone the repository or carefully rebase their local work. A simple `git pull` will not work correctly.
   - Forks of the repository are **not** cleaned automatically. Fork owners must perform their own cleanup.
   - GitHub may cache the removed objects temporarily. Contact **GitHub Support** to request a garbage collection if the data is sensitive.
   - Open pull requests referencing rewritten commits will break and may need to be recreated.

7. Discuss prevention with your group. **Push protection** (part of GitHub Secret Protection) catches secrets at `git push` time — before they ever enter history. This is far more effective than retroactive cleanup:

   - Navigate to your repository **Settings** → **Advanced Security** → under the **Secret scanning** section
   - Ensure **Push protection** is enabled
   - Secrets matching known patterns are blocked before they reach the remote

   A strong prevention strategy combines push protection, pre-commit hooks, `.gitignore` rules, and developer education.

## 14.3 Clean up stale branches

Stale branches clutter the repository, confuse contributors, and can accumulate into hundreds or thousands of refs over time — degrading clone performance and making branch management difficult.

1. List all remote branches sorted by the date of their most recent commit:

   ```bash
   git for-each-ref --sort=committerdate refs/remotes/origin \
     --format='%(committerdate:short) %(refname:short)' | head -20
   ```

   Branches at the top of the list (oldest dates) are prime candidates for cleanup.

2. Alternatively, use the GitHub UI to view stale branches. Navigate to your repository → **Branches** tab, then filter by **Stale**. GitHub considers branches with no commits in the last three months as stale.

3. Count the total number of branches using the API:

   ```bash
   gh api /repos/YOUR-ORG/YOUR-REPO/branches --paginate \
     --jq '.[].name' | wc -l
   ```

4. Delete a stale branch that is no longer needed:

   ```bash
   git push origin --delete feature/old-branch
   ```

   Verify the branch no longer appears:

   ```bash
   gh api /repos/YOUR-ORG/YOUR-REPO/branches --paginate \
     --jq '.[].name' | grep "feature/old-branch"
   ```

5. Enable automatic branch deletion after pull request merges to prevent future accumulation:

   - Navigate to your repository **Settings** → **General** → scroll to the **Pull Requests** section
   - Check **Automatically delete head branches**

   This setting deletes the source branch automatically when a pull request is merged. It is a recommended default for all repositories and can also be configured as an organization-level default.

6. Discuss with your group: how would you handle branch cleanup at scale across an organization with hundreds of repositories? Consider writing a script using the `gh` CLI to audit branch counts across all org repos:

   ```bash
   gh repo list YOUR-ORG --limit 50 --json name --jq '.[].name' | while read repo; do
     count=$(gh api "/repos/YOUR-ORG/$repo/branches" --paginate --jq '.[].name' 2>/dev/null | wc -l)
     echo "$repo: $count branches"
   done
   ```

## 14.4 Plan a repository archival strategy

Not every repository needs to live forever in an active state. Archiving provides a clear signal that a project is no longer maintained while preserving its history and content.

1. Identify candidates for archival. A repository may be ready to archive when:

   - No commits have been pushed in 6 or more months
   - The project is complete or has been superseded
   - The owning team has been dissolved or reorganized
   - The code has been migrated to a different repository

2. Use the `gh` CLI to find repositories with no recent push activity:

   ```bash
   gh repo list YOUR-ORG --limit 100 --json name,pushedAt \
     --jq '.[] | select(.pushedAt < "2025-10-01") | .name'
   ```

   Adjust the date threshold to match your organization's archival policy.

3. Archive a repository:

   ```bash
   gh repo archive YOUR-ORG/YOUR-REPO --yes
   ```

4. Understand what archiving does and does not do:

   - **Does:** Makes the repository read-only. No new pushes, issues, pull requests, comments, or releases are allowed. The repository is clearly marked as **Archived** in the GitHub UI.
   - **Does not:** Delete the repository, remove it from search results, or affect existing forks. Archived repositories are still fully visible and cloneable.
   - **Reversible:** Un-archiving is possible at any time through **Settings** → **Danger Zone** → **Unarchive this repository**.

5. Discuss the differences between the three end-of-life options:

   | Action | Effect | Reversible? | Data preserved? |
   |--------|--------|-------------|-----------------|
   | **Archive** | Read-only, clearly marked | Yes | Yes |
   | **Transfer** | Moves to different owner/org | Yes (by new owner) | Yes |
   | **Delete** | Permanently removed | No (90-day grace period) | No |

6. Discuss a communication plan with your group. Before archiving repositories at scale:

   - Notify repository owners and team leads at least two weeks in advance
   - Provide a clear deadline and instructions for objecting
   - Document the archival criteria in your organization's governance documentation
   - Consider adding a final commit or README update explaining why the repository was archived

## 14.5 Verify your work

1. Confirm that you successfully ran the large-file detection commands from section 14.1. Verify you can check repo size via the API:

   ```bash
   gh api /repos/YOUR-ORG/YOUR-REPO --jq '.size'
   ```

2. Confirm that you understand how to install and use `git-filter-repo` to remove files or replace text across history.

3. Confirm that you inspected stale branches in at least one repository using either the CLI or the GitHub UI.

4. Confirm that you discussed an archival strategy appropriate for your organization.

5. Review the following checklist:

   - [ ] Analyzed a repository for large files using `git rev-list` or `git-sizer`
   - [ ] Checked repository size via the GitHub REST API
   - [ ] Discussed `git-filter-repo` for history rewriting and its consequences
   - [ ] Explored stale branches and the automatic deletion setting
   - [ ] Planned a repository archival strategy with your group

6. _"What threshold would you set for automated repository health alerts in your organization? Consider repository size, branch count, and time since last commit."_

> **Note:** Proactive measures — push protection for secrets, Git LFS for large files, `.gitignore` for build artifacts, and automatic branch deletion after merges — are always more effective and less disruptive than reactive cleanup. Build these practices into your organization's repository creation templates and onboarding documentation so every new repository starts healthy.
