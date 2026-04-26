# Unhealthy Repositories and Git History

**Level:** L300 (Advanced)  
**Objective:** Diagnose and remediate unhealthy repositories, manage large files with Git LFS, rewrite Git history safely, and establish governance policies that prevent repository health issues at enterprise scale

## Overview

Repository health is a critical concern for GitHub Enterprise Cloud administrators managing organizations at scale. Unhealthy repositories—characterized by bloated size, excessive branches, large files embedded in history, or leaked secrets—degrade developer experience through slow clones, sluggish pushes, and wasted storage. GitHub actively monitors repository health signals including size, commit frequency, contents, and structure, and may contact administrators when repositories excessively impact infrastructure.

This guide covers the full lifecycle of repository health management: detecting problems with tools like `git-sizer`, managing large files with Git LFS, rewriting history with `git-filter-repo`, removing sensitive data, cleaning up stale branches, archiving inactive repositories, and handling monorepo-specific challenges. At the enterprise level, proactive measures—push protection for secrets, automatic branch deletion, `.gitattributes` configuration for LFS, and push rulesets—prevent unhealthy repositories from forming in the first place.

## Identifying Repository Health Issues

### Signs of an Unhealthy Repository

Unhealthy repositories exhibit one or more of the following symptoms:

| Symptom | Threshold | Impact |
|---------|-----------|--------|
| Overall repository size | > 1 GB (recommended limit) | Slow clones, increased CI times |
| Individual file size | > 50 MiB (warning) / > 100 MiB (blocked) | Push rejections, history bloat |
| Browser-uploaded files | > 25 MiB | Hard limit, upload fails |
| Excessive references | Thousands of branches/tags | Slow fetches, ref advertisement overhead |
| Giant directory trees | Thousands of entries per directory | Expensive tree object creation on every commit |
| Generated files in history | Build artifacts, JARs, ZIPs | Poor delta compression, wasted storage |
| Repeated large text files | Files that delta-compress well but are large | Expensive reconstruction and diff operations |

**Key size thresholds:**

- **< 1 GB** — Recommended repository size
- **< 5 GB** — Strongly recommended upper limit
- **> 5 GB** — GitHub Support may contact the repository owner
- **50 MiB** — Git warns on push for individual files
- **100 MiB** — Git blocks the push entirely

### Diagnostic Tooling with git-sizer

[`git-sizer`](https://github.com/github/git-sizer) is a GitHub-maintained tool that computes repository size metrics and flags concerning values with asterisk-based severity ratings:

```bash
# Clone as a bare mirror for analysis
git clone --mirror https://github.com/YOUR-ORG/YOUR-REPO.git
cd YOUR-REPO.git

# Run git-sizer with verbose output
git-sizer --verbose
```

**Example output:**

```
Processing blobs: 1652
Processing trees: 3434
Processing commits: 1128
Matching commits to trees: 1128
Processing annotated tags: 15
Processing references: 215

| Name                         | Value     | Level of concern               |
| ---------------------------- | --------- | ------------------------------ |
| Overall repository size      |           |                                |
|   Commits                    |           |                                |
|     Count                    |  1.13 k   |                                |
|   Trees                      |           |                                |
|     Count                    |  3.43 k   |                                |
|   Blobs                      |           |                                |
|     Count                    |  1.65 k   |                                |
|     Total size               |   708 MiB | ***                            |
|   Biggest objects            |           |                                |
|     Trees                    |           |                                |
|       Maximum entries        |    94     |                                |
|     Blobs                    |           |                                |
|       Maximum size           |  89.2 MiB | *****                          |
|   References                 |           |                                |
|     Count                    |   215     |                                |
|       Branches               |   198     | *                              |
```

**Severity indicators:**

| Rating | Meaning |
|--------|---------|
| (none) | No concern |
| `*` | Mild concern |
| `**` | Moderate concern |
| `***` | Elevated concern |
| `****` | High concern |
| `*****` | Very high concern |
| `!` | Extremely high (equivalent to 30+ asterisks) |

### Community Health Profile API

GitHub provides a REST API endpoint to assess community health files for any repository:

```bash
# Check community health profile
curl -L \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer <TOKEN>" \
  https://api.github.com/repos/OWNER/REPO/community/profile
```

The response includes a `health_percentage` score (0–100) based on the presence of:

| Health File | Description |
|-------------|-------------|
| `README.md` | Project overview and getting-started guide |
| `CONTRIBUTING.md` | Contribution guidelines |
| `CODE_OF_CONDUCT.md` | Community behavior expectations |
| `LICENSE` | Software license |
| Issue templates | Structured issue creation |
| Pull request template | Consistent PR descriptions |

**Auditing across an organization with the GitHub CLI:**

```bash
# List all repos and check community health percentage
gh api "/orgs/YOUR-ORG/repos?per_page=100" --paginate \
  --jq '.[].full_name' | while read repo; do
    health=$(gh api "/repos/$repo/community/profile" --jq '.health_percentage')
    echo "$repo: $health%"
done
```

### GitHub Size Limits and Enforcement

| Metric | Limit | Enforcement |
|--------|-------|-------------|
| Individual file size | 50 MiB | Warning from Git |
| Individual file size | 100 MiB | Push rejected |
| Browser-uploaded file | 25 MiB | Hard limit |
| Repository size (recommended) | < 1 GB | Soft guidance |
| Repository size (strongly recommended) | < 5 GB | Soft guidance |
| Repository size (excessive) | Varies | GitHub Support contacts owner |
| Push size per operation | ~2 GB | Hard limit |

### Repository Health Assessment Flow

The following diagram illustrates a systematic approach to diagnosing and remediating repository health issues:

```mermaid
flowchart TD
    A[Repository Health Check] --> B{Run git-sizer}
    B --> C{Any severity ≥ ***?}
    C -->|No| D[Repository is healthy]
    C -->|Yes| E{What is the issue?}

    E -->|Large blobs| F{Files still needed?}
    F -->|Yes| G[Migrate to Git LFS]
    F -->|No| H[Remove with git-filter-repo]

    E -->|Excessive refs| I{Stale branches?}
    I -->|Yes| J[Enable auto-delete\nClean up stale branches]
    I -->|No| K[Review branching strategy]

    E -->|Giant trees| L[Restructure directories\nConsider monorepo split]

    E -->|Sensitive data| M[Rotate credentials immediately]
    M --> N[Remove with git-filter-repo\n--sensitive-data-removal]
    N --> O[Contact GitHub Support\nfor cache invalidation]

    G --> P[Configure .gitattributes\nUpdate governance policy]
    H --> P
    J --> P
    L --> P
    O --> P

    P --> Q[Re-run git-sizer to verify]
    Q --> R{Issues resolved?}
    R -->|Yes| D
    R -->|No| E

    style D fill:#6bcf7f
    style M fill:#ff6b6b
    style P fill:#ffd93d
```

## Git LFS

### How Git LFS Works

Git Large File Storage (LFS) replaces large files in your repository with small **pointer files** while storing the actual file content on a separate server. When you check out a branch, Git LFS automatically downloads the correct version of each tracked file.

**Pointer file anatomy:**

```
version https://git-lfs.github.com/spec/v1
oid sha256:4cac19622fc3ada9c0fdeadb33f88f367b541f38b89de306dce9e39c400ca2c6
size 132878
```

The pointer file contains three fields:

| Field | Purpose |
|-------|---------|
| `version` | LFS specification version |
| `oid` | SHA-256 hash of the actual file content |
| `size` | File size in bytes |

**Key characteristics:**

- Pointer files are small text files (typically ~130 bytes)
- The actual file content is stored on GitHub's LFS server
- Git operations (diff, log, blame) work on pointer files, keeping them fast
- LFS files are downloaded on demand during checkout
- Git LFS cannot be used with GitHub Pages or template repositories

### Maximum File Sizes by Plan

| Plan | Max LFS File Size |
|------|-------------------|
| GitHub Free | 2 GB |
| GitHub Pro | 2 GB |
| GitHub Team | 4 GB |
| GitHub Enterprise Cloud | 5 GB |

### Storage and Bandwidth Quotas

Each GitHub account includes free LFS storage and bandwidth:

| Plan | Monthly Bandwidth | Storage |
|------|-------------------|---------|
| GitHub Free / Pro | 10 GiB | 10 GiB |
| GitHub Team / GHEC | 250 GiB | 250 GiB |

**Important quota details:**

- **Bandwidth** is measured on downloads (clone, fetch, pull of LFS objects)
- **Storage** is measured continuously across all LFS objects in the account
- Exceeding quotas without a payment method on file blocks LFS operations—only pointer files are retrieved on clone
- Additional data packs can be purchased for extra storage and bandwidth
- Forked repositories share the parent repository's LFS quota

### Setup and Configuration

**Step 1: Install Git LFS**

```bash
# macOS
brew install git-lfs

# Ubuntu / Debian
sudo apt-get install git-lfs

# Windows (included with Git for Windows)
# Or: choco install git-lfs

# Initialize Git LFS for your user account
git lfs install
```

**Step 2: Configure tracking via `.gitattributes`**

```bash
# Track specific file extensions
git lfs track "*.psd"
git lfs track "*.zip"
git lfs track "*.iso"
git lfs track "*.mp4"
git lfs track "*.bin"

# Track files in a specific directory
git lfs track "assets/videos/**"

# Track files by size pattern (manual .gitattributes edit)
# Note: git lfs track doesn't support size-based rules
```

The resulting `.gitattributes` file:

```gitattributes
*.psd filter=lfs diff=lfs merge=lfs -text
*.zip filter=lfs diff=lfs merge=lfs -text
*.iso filter=lfs diff=lfs merge=lfs -text
*.mp4 filter=lfs diff=lfs merge=lfs -text
*.bin filter=lfs diff=lfs merge=lfs -text
assets/videos/** filter=lfs diff=lfs merge=lfs -text
```

**Step 3: Commit `.gitattributes` and push**

```bash
# Always commit .gitattributes first
git add .gitattributes
git commit -m "Configure Git LFS tracking"

# Then add and push large files
git add path/to/file.psd
git commit -m "Add design file via LFS"
git push
```

> **Critical:** Always commit `.gitattributes` to the repository so forks and clones inherit LFS tracking automatically.

### Tracking Patterns and Best Practices

Common `.gitattributes` patterns for enterprise repositories:

```gitattributes
# Images
*.png filter=lfs diff=lfs merge=lfs -text
*.jpg filter=lfs diff=lfs merge=lfs -text
*.gif filter=lfs diff=lfs merge=lfs -text
*.svg filter=lfs diff=lfs merge=lfs -text
*.ico filter=lfs diff=lfs merge=lfs -text

# Documents
*.pdf filter=lfs diff=lfs merge=lfs -text
*.docx filter=lfs diff=lfs merge=lfs -text
*.xlsx filter=lfs diff=lfs merge=lfs -text
*.pptx filter=lfs diff=lfs merge=lfs -text

# Archives
*.zip filter=lfs diff=lfs merge=lfs -text
*.tar.gz filter=lfs diff=lfs merge=lfs -text
*.7z filter=lfs diff=lfs merge=lfs -text

# Audio / Video
*.mp3 filter=lfs diff=lfs merge=lfs -text
*.mp4 filter=lfs diff=lfs merge=lfs -text
*.wav filter=lfs diff=lfs merge=lfs -text

# Compiled / Binary
*.dll filter=lfs diff=lfs merge=lfs -text
*.so filter=lfs diff=lfs merge=lfs -text
*.dylib filter=lfs diff=lfs merge=lfs -text
*.exe filter=lfs diff=lfs merge=lfs -text
*.jar filter=lfs diff=lfs merge=lfs -text

# Machine Learning Models
*.h5 filter=lfs diff=lfs merge=lfs -text
*.onnx filter=lfs diff=lfs merge=lfs -text
*.pt filter=lfs diff=lfs merge=lfs -text
```

**Verify LFS tracking status:**

```bash
# List currently tracked patterns
git lfs track

# List all LFS objects in the repository
git lfs ls-files

# Check LFS environment and configuration
git lfs env
```

### Migrating Existing Files to LFS

When large files already exist in repository history, use `git lfs migrate` to retroactively move them to LFS:

```bash
# Analyze the repository to find large files
git lfs migrate info --above=10MB

# Migrate specific file types across all history
git lfs migrate import --include="*.zip,*.jar,*.bin" --everything

# Migrate only recent history (current branch)
git lfs migrate import --include="*.psd"

# Migrate a specific file path
git lfs migrate import --include="data/models/large-model.h5" --everything

# After migration, force push all branches
git push --force --all
git push --force --tags
```

> **Warning:** `git lfs migrate import --everything` rewrites history for all branches and tags. Coordinate with collaborators before running this command.

## Rewriting History with git-filter-repo

### Why git-filter-repo

`git-filter-repo` is the officially recommended tool by both the Git project and GitHub for rewriting repository history. It replaces two older tools:

| Tool | Status | Issues |
|------|--------|--------|
| `git-filter-branch` | **Deprecated** | Extremely slow, known gotchas that can silently corrupt rewrites, officially warned against by the Git project |
| BFG Repo-Cleaner | **Legacy** | Limited to specific rewrite types (large file removal, text replacement), requires Java 11+ |
| `git-filter-repo` | **Recommended** | Fast, handles edge cases correctly (special characters, empty commits), comprehensive feature set |

**Why `git-filter-repo` is superior:**

- Orders of magnitude faster than `git-filter-branch`
- Correctly handles edge cases (special characters in filenames, empty commits, signed commits)
- Single Python script with no dependencies beyond Git and Python 3
- Produces clean history without safety mechanism artifacts
- Provides `--analyze` output for understanding repository structure before rewriting

### Installation

```bash
# macOS via Homebrew
brew install git-filter-repo

# pip (any platform)
pip install git-filter-repo

# Manual installation (single script)
# Download git-filter-repo from https://github.com/newren/git-filter-repo
# Place it in your PATH

# Verify installation
git filter-repo --version
```

**Prerequisites:** Git >= 2.36.0, Python 3 >= 3.6

### Common Operations

**Remove a specific file from all history:**

```bash
git clone https://github.com/YOUR-ORG/YOUR-REPO.git
cd YOUR-REPO

# Remove a single file
git-filter-repo --invert-paths --path path/to/huge-file.bin

# Remove all files matching a glob pattern
git-filter-repo --invert-paths --path-glob '*.iso'

# Remove files larger than a threshold
git-filter-repo --strip-blobs-bigger-than 50M
```

**Move or rename directories:**

```bash
# Rename a directory across all history
git-filter-repo --path-rename old-dir/:new-dir/

# Extract a subdirectory into a standalone repository
git-filter-repo --subdirectory-filter src/module-a/
```

**Rename an author across all history:**

```bash
# Create a mailmap file
cat > ../mailmap.txt << 'EOF'
New Name <new@example.com> <old@example.com>
New Name <new@example.com> Old Name <old-alias@example.com>
EOF

# Apply the mailmap
git-filter-repo --mailmap ../mailmap.txt
```

**Extract a subdirectory into its own repository:**

```bash
git clone https://github.com/YOUR-ORG/MONOREPO.git
cd MONOREPO
git-filter-repo --path src/service-a/ --to-subdirectory-filter service-a
```

### The --analyze Flag

Before rewriting history, use `--analyze` to understand the repository structure:

```bash
git clone --mirror https://github.com/YOUR-ORG/YOUR-REPO.git
cd YOUR-REPO.git

git-filter-repo --analyze
```

This creates a `.git/filter-repo/analysis/` directory containing:

| Report File | Contents |
|-------------|----------|
| `blob-shas-and-paths.txt` | Every blob with its SHA, size, and file paths |
| `path-all-sizes.txt` | Cumulative size of each path across history |
| `path-deleted-sizes.txt` | Size of deleted paths still in history |
| `directories-all-sizes.txt` | Size breakdown by directory |
| `extensions-all-sizes.txt` | Size breakdown by file extension |
| `renames.txt` | Detected file renames |

**Using analysis to identify targets:**

```bash
# Find the largest file extensions in history
head -20 .git/filter-repo/analysis/extensions-all-sizes.txt

# Find the largest individual paths
head -20 .git/filter-repo/analysis/path-all-sizes.txt

# Find deleted files still consuming space
head -20 .git/filter-repo/analysis/path-deleted-sizes.txt
```

### Force Push and Clone Coordination

After rewriting history, all commit hashes change from the point of modification onward. This requires careful coordination:

**Step 1: Force push the rewritten history**

```bash
# Push all rewritten branches and tags
git push --force --all
git push --force --tags

# Or use --mirror for a complete replacement
git push --force --mirror origin
```

**Step 2: Notify all collaborators**

All collaborators must either:

- **Re-clone** the repository (simplest and safest approach)
- **Rebase** their local branches onto the new history:

```bash
# Fetch the rewritten history
git fetch origin

# Rebase local work onto the new history
git rebase origin/main
```

> **Warning:** Collaborators must never `git merge` from old clones into rewritten history—this reintroduces the removed data and creates duplicate history.

**Step 3: Clean up stale clones and CI caches**

- Update CI/CD pipeline caches that may contain old history
- Rebuild any deployment artifacts built from the old history
- Verify that mirror repositories have been updated

## Removing Sensitive Data

### GitHub's Recommended Process

When secrets, credentials, or other sensitive data are discovered in repository history, follow this process:

**1. Rotate the compromised credentials immediately**

This is the most critical step. Once a secret is revoked, it cannot be used regardless of whether it remains in Git history. Never delay rotation while planning history cleanup.

**2. Clone the repository**

```bash
git clone https://github.com/YOUR-ORG/YOUR-REPO.git
cd YOUR-REPO
```

**3. Remove the sensitive data with `git-filter-repo`**

```bash
# Remove a file containing secrets from all history
git-filter-repo --sensitive-data-removal --invert-paths --path path/to/secrets.env

# Replace specific text patterns across all files in history
# Create a replacements file (one pattern per line: literal:PATTERN==>REPLACEMENT)
cat > ../replacements.txt << 'EOF'
literal:AKIAIOSFODNN7EXAMPLE==>REDACTED_AWS_KEY
literal:ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx==>REDACTED_GH_TOKEN
EOF

git-filter-repo --sensitive-data-removal --replace-text ../replacements.txt
```

> **Note:** The `--sensitive-data-removal` flag requires `git-filter-repo` version >= 2.47. It adds extra safety checks and produces metadata needed for GitHub Support.

**4. Check affected pull requests**

```bash
# Count PRs that reference rewritten commits
grep -c '^refs/pull/.*/head$' .git/filter-repo/changed-refs
```

**5. Force push to all branches and tags**

```bash
git push --force --mirror origin
```

**6. Contact GitHub Support for cache invalidation**

Submit a request via the [GitHub Support portal](https://support.github.com) with:

- Repository owner and name
- Number of affected pull requests
- First Changed Commit(s) from `git-filter-repo` output
- Any orphaned LFS objects noted in the output

GitHub Support will remove cached views and ensure the sensitive data is purged from GitHub's servers.

**7. Coordinate with all collaborators**

Instruct all collaborators to re-clone the repository. Merging from old clones will reintroduce the sensitive data.

### Side Effects of History Rewriting

| Side Effect | Description | Mitigation |
|-------------|-------------|------------|
| Changed commit hashes | All commits from the point of introduction onward get new SHAs | Collaborators must re-clone or rebase |
| Recontamination risk | Old clones that merge into new history reintroduce removed data | Require re-clone, not merge |
| Broken PR diffs | Closed pull request diff views are destroyed | Accept as unavoidable |
| Lost signatures | `git-filter-repo` removes commit and tag signatures | Re-sign important tags after rewrite |
| Branch protection conflicts | Force push protections must be temporarily disabled | Plan a maintenance window |
| Fork divergence | Forks retain the old history unless also rewritten | Coordinate with fork owners |
| CI/CD cache invalidation | Cached builds may reference old commit SHAs | Clear all CI caches after rewrite |

### Push Protection as Prevention

The most effective strategy for sensitive data is preventing it from entering the repository in the first place:

**Secret scanning push protection** blocks pushes that contain detected secret patterns:

```
remote: —— Desktop for GitHub ————————————————————
remote:     Push cannot contain secrets
remote:
remote: PUSH BLOCKED
remote: —————————————————————————————————————————
remote:
remote:   — desktop for GitHub —————————————————
remote:   Resolve the following secrets before pushing:
remote:
remote:   (1) GitHub Personal Access Token
remote:        locations:
remote:          — commit: abc1234
remote:            path: config/settings.yml:17
```

**Push protection capabilities:**

- Blocks command-line pushes, GitHub UI commits, and REST API requests
- Detects 200+ secret types from partner providers
- Organizations can define **custom patterns** for proprietary secret formats
- **Delegated bypass** allows specific actors to bypass with audited approval workflows
- Push protection for users is enabled by default on github.com for public repositories

## Stale Branch Cleanup

### Automatic Branch Deletion

The single most effective prevention measure for stale branches is enabling **automatic deletion of head branches** after pull request merge:

**Settings > General > Pull Requests > "Automatically delete head branches" ✓**

This setting ensures that feature branches are cleaned up immediately after their pull request is merged. Combined with a branch-based workflow (GitHub Flow), this prevents the majority of stale branch accumulation.

### Identifying Stale Branches

GitHub's repository branch view categorizes branches into:

| Category | Definition |
|----------|------------|
| **Active** | Branches with commits in the last 3 months |
| **Stale** | Branches with no commits in the last 3 months |
| **Yours** | Branches you've pushed to (for users with push access) |

**Using the REST API to list stale branches:**

```bash
# List all branches with their last commit date
gh api "/repos/OWNER/REPO/branches?per_page=100" --paginate \
  --jq '.[] | [.name, .commit.sha] | @tsv' | while read branch sha; do
    date=$(gh api "/repos/OWNER/REPO/commits/$sha" --jq '.commit.committer.date')
    echo "$branch  $date"
done
```

**Using `git` to identify merged branches:**

```bash
# List remote branches already merged into main
git branch -r --merged origin/main | grep -v 'main\|HEAD'

# List branches with last commit date (sorted)
git for-each-ref --sort=committerdate --format='%(committerdate:short) %(refname:short)' refs/remotes/origin/
```

### Bulk Deletion Scripts

**Delete all merged remote branches (excluding protected patterns):**

```bash
# Preview branches that would be deleted
git branch -r --merged origin/main \
  | grep -v 'main\|HEAD\|release\|develop' \
  | sed 's/origin\///'

# Delete them (use with caution)
git branch -r --merged origin/main \
  | grep -v 'main\|HEAD\|release\|develop' \
  | sed 's/origin\///' \
  | xargs -I{} git push origin --delete {}
```

**GitHub CLI approach for stale branch cleanup:**

```bash
# List branches older than 90 days using the GitHub API
gh api "/repos/OWNER/REPO/branches?per_page=100" --paginate \
  --jq '.[].name' | while read branch; do
    if [ "$branch" != "main" ] && [ "$branch" != "develop" ]; then
      last_commit=$(gh api "/repos/OWNER/REPO/branches/$branch" \
        --jq '.commit.commit.committer.date')
      cutoff=$(date -d '90 days ago' --iso-8601)
      if [[ "$last_commit" < "$cutoff" ]]; then
        echo "Stale: $branch (last commit: $last_commit)"
        # Uncomment to delete: gh api -X DELETE "/repos/OWNER/REPO/git/refs/heads/$branch"
      fi
    fi
done
```

**Prune local tracking references after remote cleanup:**

```bash
# Remove local references to deleted remote branches
git fetch --prune

# Verify pruned branches
git branch -r
```

### Protected Branch Exceptions

When performing bulk branch cleanup, be aware of these exceptions:

- **Protected branches** cannot be deleted via the API unless protections are removed first
- **Default branch** (typically `main`) is always protected from deletion
- **Branches with open pull requests** should be reviewed before deletion
- **Release branches** (`release/*`) should be retained per your release strategy
- **Deleted branches can be restored** via the closed PR page within GitHub's retention window

> **Best practice:** Always perform a dry run (list without deleting) before executing bulk deletion scripts.

## Repository Archival Strategies

### When to Archive

Consider archiving a repository when:

- The project is no longer actively maintained
- The repository is superseded by a new project
- The code is kept for historical or reference purposes only
- Compliance requirements mandate preserving but not modifying code
- The project has been migrated to a different repository or platform

### What Archiving Does

Archiving makes a repository **completely read-only**:

| Action | After Archival |
|--------|---------------|
| View code, issues, PRs | ✅ Allowed |
| Fork the repository | ✅ Allowed |
| Star the repository | ✅ Allowed |
| Clone / fetch | ✅ Allowed |
| Search (with `is:archived`) | ✅ Allowed |
| Secret scanning | ✅ Can still be enabled |
| Create new commits | ❌ Blocked |
| Open new issues or PRs | ❌ Blocked |
| Add comments or reactions | ❌ Blocked |
| Modify labels, milestones, projects | ❌ Blocked |
| Add or remove collaborators | ❌ Blocked |
| Modify wiki content | ❌ Blocked |

### API-Based Archival

**Archive a single repository:**

```bash
# Archive via GitHub CLI
gh repo archive OWNER/REPO --yes

# Archive via REST API
gh api -X PATCH "/repos/OWNER/REPO" -f archived=true
```

**Bulk archive inactive repositories:**

```bash
# Find and archive repos with no pushes in the last year
gh api "/orgs/YOUR-ORG/repos?per_page=100&sort=pushed&direction=asc" \
  --paginate --jq '.[] | select(.pushed_at < "2024-01-01T00:00:00Z") | .full_name' \
  | while read repo; do
    echo "Archiving $repo (last push: $(gh api "/repos/$repo" --jq '.pushed_at'))"
    # Uncomment to execute: gh api -X PATCH "/repos/$repo" -f archived=true
done
```

**Unarchive a repository:**

```bash
# Unarchive via REST API
gh api -X PATCH "/repos/OWNER/REPO" -f archived=false
```

### Archive vs Delete Decision Matrix

| Criterion | Archive | Delete |
|-----------|---------|--------|
| Code may be referenced in the future | ✅ Archive | ❌ |
| Compliance requires audit trail | ✅ Archive | ❌ |
| Forks exist that depend on the repository | ✅ Archive | ❌ |
| Repository contains sensitive data that cannot be purged | ❌ | ✅ Delete |
| Repository was created in error (empty or test) | ❌ | ✅ Delete |
| Storage cost is a concern (legacy billing) | Consider | ✅ Delete |
| Repository is superseded and well-documented | ✅ Archive | ❌ |

**Pre-archival checklist:**

1. Close all open issues and pull requests
2. Update `README.md` with archived status and pointer to successor project
3. Update repository description to indicate archived status
4. Verify no active GitHub Actions workflows depend on the repository
5. Confirm no other repositories depend on it as a submodule or package source

## Monorepo Considerations

### Sparse Checkout

Sparse checkout allows developers to check out only a subset of a monorepo's files, reducing disk usage and improving performance:

```bash
# Clone with sparse checkout enabled
git clone --sparse https://github.com/YOUR-ORG/MONOREPO.git
cd MONOREPO

# Configure cone mode (recommended, faster pattern matching)
git sparse-checkout set --cone

# Check out specific directories
git sparse-checkout add src/service-a
git sparse-checkout add src/shared-libs

# View current sparse-checkout configuration
git sparse-checkout list
```

**Sparse checkout with cone mode restrictions:**

- Only full directory paths are supported (no individual file patterns)
- Parent directories are always included
- Faster than non-cone mode due to optimized pattern matching

### Partial Clone

Partial clone reduces initial clone time by deferring blob downloads:

```bash
# Blobless clone — downloads tree objects but not file contents
# Blobs are fetched on demand during checkout
git clone --filter=blob:none https://github.com/YOUR-ORG/MONOREPO.git

# Treeless clone — downloads only commits initially
# Trees and blobs are fetched on demand
git clone --filter=tree:0 https://github.com/YOUR-ORG/MONOREPO.git

# Combine with sparse checkout for maximum efficiency
git clone --filter=blob:none --sparse https://github.com/YOUR-ORG/MONOREPO.git
cd MONOREPO
git sparse-checkout set --cone src/service-a
```

| Clone Strategy | Initial Download | On-Demand Fetches | Best For |
|---------------|-----------------|-------------------|----------|
| Full clone | Everything | None | Small repositories |
| `--filter=blob:none` | Commits + trees | Blobs on checkout | Large repos, CI pipelines |
| `--filter=tree:0` | Commits only | Trees + blobs on checkout | Very large repos, quick log inspection |
| `--sparse` + `--filter=blob:none` | Minimal | Only needed blobs | Monorepos with focused work |

### Path-Based CODEOWNERS

In monorepos, `CODEOWNERS` enables path-based ownership for code review assignments:

```
# CODEOWNERS for a monorepo structure
# Global owners (fallback)
* @org/platform-team

# Service-specific ownership
/src/service-a/    @org/team-alpha
/src/service-b/    @org/team-beta
/src/service-c/    @org/team-gamma

# Shared libraries require broader review
/src/shared-libs/  @org/platform-team @org/architecture-team

# Infrastructure and deployment
/infra/            @org/devops-team
/.github/          @org/platform-team

# Documentation
/docs/             @org/docs-team
```

**CODEOWNERS considerations for monorepos:**

- Each path pattern matches the most specific rule (last match wins)
- Teams must have at least **write** access to the repository
- Branch protection rules can require CODEOWNERS approval
- Use `CODEOWNERS` at the repository root, `docs/`, or `.github/` directory

### Performance Implications

| Challenge | Impact | Mitigation |
|-----------|--------|------------|
| Clone time | Full clones of large monorepos take minutes to hours | Use partial clone (`--filter=blob:none`) |
| Checkout size | Working directory may contain millions of files | Use sparse checkout |
| CI/CD build time | Builds may trigger for unchanged services | Implement path-based triggers (`paths:` filter in Actions) |
| Git status / diff | Slow with very large working trees | Enable `core.fsmonitor` for file system monitoring |
| Push / fetch overhead | All refs transferred even for partial work | Limit branch creation, enable auto-delete |
| Merge conflicts | Higher likelihood across shared code | Clear CODEOWNERS, communication practices |

**Optimizing CI/CD for monorepos:**

```yaml
# GitHub Actions: Only build service-a when its files change
name: Service A CI
on:
  push:
    paths:
      - 'src/service-a/**'
      - 'src/shared-libs/**'
  pull_request:
    paths:
      - 'src/service-a/**'
      - 'src/shared-libs/**'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
        with:
          sparse-checkout: |
            src/service-a
            src/shared-libs
          sparse-checkout-cone-mode: true
```

## Prevention and Governance

### .gitattributes for LFS

Establish `.gitattributes` as part of every repository template to ensure LFS tracking is configured from the start:

```gitattributes
# Standard binary file tracking for enterprise repositories
# Images
*.png filter=lfs diff=lfs merge=lfs -text
*.jpg filter=lfs diff=lfs merge=lfs -text
*.gif filter=lfs diff=lfs merge=lfs -text

# Documents
*.pdf filter=lfs diff=lfs merge=lfs -text

# Archives
*.zip filter=lfs diff=lfs merge=lfs -text
*.tar.gz filter=lfs diff=lfs merge=lfs -text

# Compiled binaries
*.dll filter=lfs diff=lfs merge=lfs -text
*.exe filter=lfs diff=lfs merge=lfs -text
*.so filter=lfs diff=lfs merge=lfs -text

# Data and models
*.sqlite filter=lfs diff=lfs merge=lfs -text
*.h5 filter=lfs diff=lfs merge=lfs -text
*.onnx filter=lfs diff=lfs merge=lfs -text
```

Include `.gitattributes` in all organization repository templates so new repositories inherit LFS tracking automatically.

### Pre-Receive Hooks

GitHub Enterprise Server and GitHub Enterprise Cloud (with GitHub Connect) support **pre-receive hooks** that run server-side validation before accepting a push:

**Common pre-receive hook checks:**

| Check | Purpose |
|-------|---------|
| File size limit | Reject pushes containing files above a threshold |
| File type restriction | Block specific extensions (`.exe`, `.jar`, `.zip`) |
| Branch naming convention | Enforce `feature/*`, `bugfix/*`, `release/*` patterns |
| Commit message format | Require Jira ticket references or conventional commits |
| Author email validation | Ensure commits use corporate email addresses |

> **Note:** Pre-receive hooks are available on GitHub Enterprise Server. On GHEC, use **push rulesets** for equivalent functionality.

### Push Rulesets

Push rulesets provide declarative, organization-wide enforcement rules without requiring server-side hooks:

**File size restriction ruleset:**

```json
{
  "name": "Block Large Files",
  "target": "push",
  "enforcement": "active",
  "conditions": {
    "ref_name": {
      "include": ["~ALL"]
    },
    "repository_name": {
      "include": ["~ALL"]
    }
  },
  "rules": [
    {
      "type": "file_path_restriction",
      "parameters": {
        "restricted_file_paths": [
          "*.exe",
          "*.msi",
          "*.iso",
          "node_modules/**",
          "vendor/**"
        ]
      }
    },
    {
      "type": "max_file_size",
      "parameters": {
        "max_file_size": 10
      }
    }
  ]
}
```

**Ruleset capabilities for repository health:**

| Rule Type | Purpose |
|-----------|---------|
| `max_file_size` | Block files exceeding a size limit (in MB) |
| `file_path_restriction` | Block pushes containing files matching specified patterns |
| `file_extension_restriction` | Block specific file extensions |
| `max_file_path_length` | Enforce maximum file path length |
| `creation` | Prevent branch/tag creation matching patterns |
| `deletion` | Prevent branch/tag deletion |

### Secret Scanning Push Protection

Enable secret scanning and push protection at the organization level to prevent credentials from entering any repository:

**Organization-level enablement:**

1. Navigate to **Organization Settings > Code security and analysis**
2. Enable **GitHub Advanced Security** (now GitHub Secret Protection and GitHub Code Security) (required for private/internal repos)
3. Enable **Secret scanning**
4. Enable **Push protection**

**Custom secret patterns for proprietary credentials:**

```
# Example: Internal API key format
Pattern: INTERNAL-[A-Z0-9]{32}
Provider: Internal Systems
```

**Delegated bypass configuration:**

- Define a bypass list of teams or roles authorized to push detected secrets
- Require approval from a security team member before bypass
- All bypass events are logged in the audit log

### Repository Templates

Repository templates enforce healthy defaults from the moment a repository is created:

**Template checklist for healthy repositories:**

| Component | Purpose |
|-----------|---------|
| `.gitattributes` | LFS tracking for binary file types |
| `.gitignore` | Exclude build artifacts, dependencies, environment files |
| `README.md` | Project overview with architecture and setup instructions |
| `CONTRIBUTING.md` | Contribution guidelines and code review expectations |
| `LICENSE` | Approved organization license |
| `CODEOWNERS` | Default ownership and review assignments |
| `SECURITY.md` | Vulnerability reporting procedures |
| `.github/dependabot.yml` | Automated dependency updates |
| `.github/workflows/ci.yml` | Baseline CI pipeline |
| `.github/pull_request_template.md` | Consistent PR descriptions |

**Creating a template repository:**

1. Create a repository with all standard files
2. Navigate to **Settings > General > Template repository**
3. Check **"Template repository"**
4. New repositories can be created from this template via the GitHub UI, CLI, or API

```bash
# Create a new repository from a template
gh repo create YOUR-ORG/new-service \
  --template YOUR-ORG/service-template \
  --private \
  --clone
```

## References

1. [About Large Files on GitHub](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github) — File and repository size limits and enforcement
2. [github/git-sizer](https://github.com/github/git-sizer) — Repository analysis tool and health metric indicators
3. [Community Profile REST API](https://docs.github.com/en/rest/metrics/community) — Programmatic community health assessment
4. [About Git Large File Storage](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-git-large-file-storage) — Git LFS overview and per-plan file size limits
5. [About Storage and Bandwidth Usage](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-storage-and-bandwidth-usage) — LFS storage and bandwidth quotas by plan
6. [Configuring Git Large File Storage](https://docs.github.com/en/repositories/working-with-files/managing-large-files/configuring-git-large-file-storage) — LFS setup, `.gitattributes`, and tracking
7. [Moving a File to Git Large File Storage](https://docs.github.com/en/repositories/working-with-files/managing-large-files/moving-a-file-in-your-repository-to-git-large-file-storage) — Migrating existing files to LFS
8. [Removing Sensitive Data from a Repository](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository) — Official sensitive data removal process
9. [newren/git-filter-repo](https://github.com/newren/git-filter-repo) — Recommended history rewriting tool and comparisons
10. [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/) — Legacy alternative for large file and text removal
11. [About Secret Scanning](https://docs.github.com/en/code-security/secret-scanning/introduction/about-secret-scanning) — Automatic secret detection across repositories
12. [About Push Protection](https://docs.github.com/en/code-security/secret-scanning/introduction/about-push-protection) — Blocking secrets before they reach the repository
13. [Viewing Branches in Your Repository](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-branches-in-your-repository/viewing-branches-in-your-repository) — Active, stale, and user branch views
14. [Deleting and Restoring Branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-branches-in-your-repository/deleting-and-restoring-branches-in-a-pull-request) — Branch deletion and restoration after PR merge
15. [Archiving Repositories](https://docs.github.com/en/repositories/archiving-a-github-repository/archiving-repositories) — Repository archival process and effects
16. [About Repository Rulesets](https://docs.github.com/en/enterprise-cloud@latest/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets) — Push rulesets for file size and path restrictions
17. [Sparse Checkout](https://git-scm.com/docs/git-sparse-checkout) — Working with subsets of repository files
18. [Partial Clone](https://github.blog/open-source/git/get-up-to-speed-with-partial-clone-and-shallow-clone/) — Reducing clone size with blob and tree filters
