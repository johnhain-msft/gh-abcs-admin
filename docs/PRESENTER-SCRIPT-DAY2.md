# 🎙️ Presenter Script — Day 2: Repository, Security, API & Advanced Topics

> **Total Duration:** 180 minutes (3 hours)
> **Labs Demoed:** 11 (Labs 1–7, 11–14) — combined with Day 1's 4 demos, all 15 labs are covered across both days
> **Slide Sources:**
>
> - **Main PowerPoint** — Slides 46–71 (open on projector/shared screen)
> - **Day 2 Supplement** — `slides-day2-supplement.html` — 27 slides (open in a browser tab; you will switch to this at specific moments)
>
> **📝 Note:** This script includes live demos of 5 extension labs (1, 2, 11, 12, 14) that were originally self-paced. The timing has been adjusted from the AGENDA.md to accommodate demo-only delivery — presentation demos are shorter than hands-on labs, providing the time needed for the additional demos.
>
> **Setup Checklist (before participants arrive):**
>
> - [ ] Main PowerPoint open, advanced to **Slide 46**
> - [ ] Day 2 Supplement HTML open in browser tab (navigate to slide 1, press `O` for overview to verify all slides load, then press `O` again to exit overview)
> - [ ] Lab repository open in browser for live demos
> - [ ] All lab exercises pre-loaded in browser tabs for quick switching
> - [ ] `gh auth status` confirmed on demo machine
> - [ ] Timer visible to you (phone, second monitor, or browser tab)

---

## 📋 Day 2 Schedule At-a-Glance

| # | Time | Duration | Type | Content | Slide Source |
|---|------|----------|------|---------|-------------|
| 1 | 0:00 | 5 min | Welcome | Day 2 kickoff, recap Day 1 | PPT 46 |
| 2 | 0:05 | 15 min | Presentation | Repository governance | PPT 46–49 |
| 3 | 0:20 | 8 min | Live Demo | Lab 4: GitHub Templates | — |
| 4 | 0:28 | 15 min | Presentation | Rulesets deep dive | Day2 Supp 1–8 |
| 5 | 0:43 | 10 min | Live Demo | Lab 3: Repository Rulesets | — |
| 6 | 0:53 | 10 min | Live Demo | Lab 6: Advanced Rulesets | — |
| 7 | 1:03 | 10 min | Break | — | — |
| 8 | 1:13 | 15 min | Presentation | Security & GHAS cost | Day2 Supp 9–23 |
| 9 | 1:28 | 12 min | Live Demo | Lab 7: Security Scanning | — |
| 10 | 1:40 | 10 min | Presentation | GHAS Cost Optimization | Day2 Supp 17–23 |
| 11 | 1:50 | 10 min | Presentation | API and authentication | PPT 50–54 |
| 12 | 2:00 | 8 min | Live Demo | Lab 5: GitHub API | — |
| 13 | 2:08 | 5 min | Live Demo | Lab 1: Webhooks and Events | — |
| 14 | 2:13 | 5 min | Presentation | Auth methods deep dive | PPT 55–61 |
| 15 | 2:18 | 10 min | Presentation | Actions, automation, Marketplace | PPT 62–69 + Day2 Supp 24–27 |
| 16 | 2:28 | 5 min | Live Demo | Lab 2: Actions Settings | — |
| 17 | 2:33 | 8 min | Live Demo | Lab 13: Scripts & gh CLI | — |
| 18 | 2:41 | 5 min | Live Demo | Lab 11: Apps & Marketplace | — |
| 19 | 2:46 | 5 min | Live Demo | Lab 12: Deployments & Environments | — |
| 20 | 2:51 | 5 min | Live Demo | Lab 14: Unhealthy Repos & Git History | — |
| 21 | 2:56 | 4 min | Wrap-up | Assessment, next steps | PPT 70–71 |

---

## ⏱️ [0:00] Welcome & Day 1 Recap (5 minutes)

> **🖥️ SLIDE SOURCE: Main PowerPoint — Slide 46**

### 📋 Stage Direction

- Ensure the main PowerPoint is displayed, showing **Slide 46** — the Repository section title
- Greet participants as they join; wait ~1 minute for stragglers
- Stand or sit where you can see both the slides and this script

### 🎤 Script

"Good morning everyone, and welcome back to Day 2 of the GitHub Administration workshop. I hope you all had a chance to let some of those Day 1 concepts sink in."

"Let's do a quick recap of what we covered yesterday. We talked about the enterprise hierarchy — how enterprise, organizations, and repositories fit together. We covered identity and access management, including SAML SSO and SCIM provisioning. We looked at teams and permissions and how policies cascade from the enterprise level down. And we worked through several hands-on labs to put those concepts into practice."

"Today we're shifting focus from the organizational level down to the **repository level**. We're going to cover repository governance — how you control what happens inside your repos. We'll do a deep dive into rulesets, which are the modern replacement for branch protection rules. We'll look at GitHub's security scanning features. And then we'll get into the API, automation, and how to manage GitHub at scale with scripts and tooling."

"We have eleven labs to demo today — combined with yesterday's four, that covers all fifteen labs across the workshop. I'll be doing live demos of each one so we can discuss the steps together as a group. By the end of today, you should feel confident understanding how to configure repository settings, protecting branches with rulesets, enabling security scanning across your org, and automating admin tasks with the GitHub API and CLI."

"Any questions before we dive in? Great — let's get started."

---

## ⏱️ [0:05] Repository Governance (15 minutes)

> **🖥️ SLIDE SOURCE: Main PowerPoint — Slide 46**

### 📋 Stage Direction

- You should already be on PPT Slide 46
- This section covers PPT slides 46–49
- Pace: ~3–4 minutes per slide

### 🎤 Script

"Let's start with repository administration. This slide gives you the roadmap — we're covering the repository overview, repository administration settings, branch protections — which we're going to reframe as **rulesets** — and CODEOWNERS files."

"A key update from what's shown on this slide: the PowerPoint mentions 'branch protections,' which is the legacy term. GitHub now recommends **rulesets** as the primary governance mechanism. Rulesets can do everything branch protection rules can do, plus they work at the org level, support tag protection, have granular bypass actors, and offer an evaluate mode for dry-run testing. We'll cover rulesets in depth in the next section."

> **🖥️ ADVANCE to PPT Slide 47 — Repository Landing Page**

"This is what a repository landing page looks like. Let me walk you through what's here."

"At the top you have the navigation tabs — Code, Issues, Pull requests, Actions, Projects, Wiki, Security, Settings. An important thing to know as an admin: **the tabs a user sees depend on their permissions**. Only repository admins see the Settings tab. If someone tells you they can't find Settings, check their access level."

"The main area shows the file listing, and below that, the README renders automatically. That README is your repo's front door — it's the first thing people see."

"On the right sidebar you'll see metadata: releases, packages, contributors, and more. Up at the top, you can switch between branches and tags. And here's a quick productivity tip — press the letter **T** on any repository page to jump into the file finder. It's a keyboard shortcut most people don't know about."

> **🖥️ ADVANCE to PPT Slide 48 — Repository Settings**

"Now let's look at where admins spend most of their time — the repository Settings page."

"Only repository admins can access and manage all settings. But here's what's critical to understand: **repository settings inherit from and are constrained by organization and enterprise settings.** If the enterprise enforces a policy — say, no public repositories — then the repo admin cannot override that. The policy cascade flows downward: enterprise enforces, org can add but not weaken, and repo can add but not weaken."

"Let me walk through the key settings tabs. You've got General — for renaming, visibility, features toggles. Manage access — this is where you add teams and individuals and set their permission levels. Branches and Rules — and this is where rulesets live. Security and analysis — code scanning, secret scanning, Dependabot. Webhooks, Deploy keys, Actions settings, Environments, and Secrets."

> **🖥️ ADVANCE to PPT Slide 49 — Repository Settings Deep Dive**

"This is our demo and discussion slide. Let me highlight a few things before we move to the demo."

"For repository visibility — you have three options: **public**, **internal**, and **private**. Internal is unique to GitHub Enterprise Cloud and is the backbone of inner source. Internal repos are visible to all members of the enterprise, regardless of which organization they belong to. This is how you enable cross-team collaboration without making code fully public."

"For base permissions — this is set at the org level, and it determines the **minimum** permission level for all org members on all repos. A common default is **Read**, which means everyone can see all repos but needs explicit access to push. Some organizations use 'No permission' for strict environments where access is granted only through teams."

> **💡 DISCUSSION PROMPT**
> Ask: "What base permission does your organization currently use? And why did you choose that level?"
> Allow 1–2 responses. If someone says "Write" or "Admin," gently note the security trade-offs.

"When the built-in permission levels — Read, Triage, Write, Maintain, Admin — don't give you exactly what you need, you can create **custom repository roles**. For example, a 'Release Manager' role that has Maintain-level access plus the ability to manage releases, but without full Admin privileges."

"One more important point — always prefer **team-based access** over adding individual users directly to repos. Teams scale; individual assignments don't. When someone leaves a team, their access updates automatically."

"Now, a key navigation update: when you go to Settings, look for **Rules → Rulesets**, not Settings → Branches. The Branches page shows the legacy branch protection rules. Rulesets are the modern path, and that's what we're going to focus on after this demo."

---

## ⏱️ [0:20] Live Demo: Lab 4 — GitHub Templates (8 minutes)

### 📋 Stage Direction
- This is a LIVE DEMO — you are driving, attendees watch your screen
- Have your lab repository open in the browser with Settings tab accessible
- Keep terminal and browser both accessible

### 🎤 Script

"Instead of having you all work through this lab individually, I'm going to walk through it live so we can discuss each step together."

"This is Lab 4 — GitHub Templates. Templates are a governance tool — they standardize how people report bugs, request features, and submit pull requests. They're one of those small things that make a big difference at scale."

> **🖥️ DEMO STEP 1: Navigate to issue templates**
> Navigate to: **Repository → Settings → General → Features → Set up templates**

"Here in the repo settings, under Features, we have the 'Set up templates' option. This is where we create issue templates that appear when someone opens a new issue."

> **🖥️ DEMO STEP 2: Create an issue template**
> Select a template type (e.g., Bug report), customize the fields, and commit to the repo

"I'll select 'Bug report' — this gives us a pre-built template with fields for description, steps to reproduce, expected behavior, and screenshots. You can customize every field. Notice the YAML front matter at the top — that controls the template name, description, labels, and assignees. Let me commit this to the repository."

> **🖥️ DEMO STEP 3: Create a pull request template**
> Create `.github/pull_request_template.md` with sample checklist content

"Now let's create a pull request template. Unlike issue templates, PR templates live in a single markdown file: `.github/pull_request_template.md`. I'll add a simple checklist — description of changes, testing steps, reviewer notes. Every PR opened against this repo will auto-populate with this content."

> **🖥️ DEMO STEP 4: Test the issue template**
> Open a new issue to show the template appears in the issue chooser

"Let's test it. I'll go to Issues, then New issue. See how it now gives us the template chooser? There's our Bug Report template. When I click it, all those fields we defined are pre-filled. This saves time and ensures consistency across the org."

> **🖥️ DEMO STEP 5: Test the PR template**
> Open a new pull request to show the PR template auto-populates

"And if I start a new pull request, watch the description field — there's our PR template, auto-populated with the checklist we defined. Contributors don't have to remember what to include."

> **🖥️ DEMO STEP 6 (Optional): Template repository**
> Mark repo as template in Settings → General, show the "Use this template" button

"One more powerful feature — you can mark a repository as a **template repository** in Settings under General. When you do that, a green 'Use this template' button appears on the repo page. Every new repo created from it inherits the full directory structure — templates, workflows, CI/CD config, everything in `.github`. This is how you standardize repo setup across your entire org."

"That's Lab 4. Any questions about templates before we move on?"

---

## ⏱️ [0:28] Rulesets Deep Dive (15 minutes)

> **🖥️ SLIDE SOURCE: Day 2 Supplement — Slides 1–8**
> **🔄 TRANSITION: Switch from Main PowerPoint to the Day 2 Supplement slides in your browser**

### 📋 Stage Direction

- **Switch your shared screen** from the PowerPoint to your browser where `slides-day2-supplement.html` is open
- Navigate to **Slide 1** (use arrow keys or click)
- Tell participants you're switching slide decks
- This section covers Day2 Supp slides 1–8
- Pace: ~2 minutes per slide

### 🎤 Script

"Now we're going to do a deep dive into **rulesets** — the modern way to govern branches and tags in GitHub. I'm switching to our supplemental slide deck for this section because it has more detailed content on rulesets than the main PowerPoint."

> **🖥️ Day 2 Supplement — Slide 1: Section Title**

"Repository Rulesets — Modern Branch and Tag Governance. This is a 15-minute section, and then I'll do live demos of two labs."

> **🖥️ ADVANCE to Day 2 Supplement — Slide 2: Rulesets vs Legacy Branch Protection**

"Let's start with the comparison everyone asks about: rulesets versus legacy branch protection rules. This table shows the key differences."

"**Scope:** Branch protection rules are scoped to a single repository. Rulesets can be created at either the repository level **or** the organization level — meaning you can define a rule once and apply it across hundreds of repos."

"**Enforcement:** Branch protection is binary — on or off. Rulesets give you three modes: **Active** — fully enforced. **Evaluate** — a dry-run mode where rules are checked but not enforced, and results are logged to Rule Insights. And **Disabled** — turned off entirely."

"**Layering:** With branch protection, you get one rule per branch pattern. With rulesets, you can **stack multiple rulesets** on the same target, and the most restrictive combination wins."

"**Targets:** Branch protection only covers branches. Rulesets can protect **branches, tags, and push targets**."

"**Bypass:** With branch protection, admins automatically override. With rulesets, you define **granular bypass actors** — specific teams, apps, or roles — and even then, there are two bypass modes."

> **🖥️ ADVANCE to Day 2 Supplement — Slide 3: Ruleset Anatomy**

"Let's break down the four components of every ruleset."

"First, **Targets** — what branches or tags does this ruleset apply to? You can target by name, by pattern like `main` or `release/*`, or use the 'default branch' shortcut."

"Second, **Rules** — what's enforced? Things like require pull requests, require reviews, require status checks, require signed commits, block force pushes, and more."

"Third, **Bypass Actors** — who can skip these rules? You explicitly define this. It might be the release automation bot, a specific team, or a GitHub App."

"Fourth, **Enforcement status** — is this ruleset Active, Evaluate, or Disabled?"

"Two features I want to highlight: **Evaluate mode** is essentially a dry run. Turn it on when you're testing a new ruleset. It will log what *would* have been blocked without actually blocking anyone. You can see the results in **Rule Insights**, which provides a full audit trail of rule evaluations."

> **🖥️ ADVANCE to Day 2 Supplement — Slide 4: Organization vs Repository Rulesets**

"This is one of the biggest advantages of rulesets over branch protection."

"**Organization rulesets** are defined once by an org owner and cascade down to all repositories — or to a subset of repos targeted by name pattern or custom properties. Only org owners can create these. They're ideal for enforcing baseline governance across your entire org."

"**Repository rulesets** are scoped to a single repo. Repo admins can create them. They stack on top of any org rulesets that apply."

"Here's the critical rule: a repository ruleset **cannot weaken** an org ruleset. If the org requires two reviewers, a repo admin can't override that to require zero. They can only make it *more* restrictive — say, requiring three reviewers."

> **🖥️ ADVANCE to Day 2 Supplement — Slide 5: Key Ruleset Rules**

"Let's walk through the most commonly used rules."

"**Require pull requests** — no direct pushes to the target branch. This is the foundation."

"**Required reviews** — set a minimum number of reviewers. You can also configure: dismiss stale reviews when new commits are pushed, and require CODEOWNERS review, which means the designated code owners for the affected files must approve."

"**Required status checks** — your CI/CD pipeline must pass before merging. You specify checks by name, and naming matters — it has to match exactly what your workflow reports."

"**Require signed commits** — enforce commit signature verification."

"**Require linear history** — no merge commits; forces squash or rebase."

"**Block force pushes** — prevents rewriting history on protected branches."

> **🖥️ ADVANCE to Day 2 Supplement — Slide 6: Bypass Actors & Modes**

"Bypass actors are how you handle legitimate exceptions — like a CI bot that needs to push directly, or a release team that needs to merge without waiting for reviews."

"There are two bypass modes. **Always** means the actor bypasses both direct push restrictions and PR merge rules. **Pull-requests only** means the actor is still blocked from direct pushing but can bypass PR review requirements when merging."

"Who can you set as bypass actors? Repo admins, org admins, specific teams, GitHub Apps, and deploy keys."

"And here's what makes this auditable: **every single bypass is logged in Rule Insights**. So you can always go back and see who bypassed what rule and when."

> **🖥️ ADVANCE to Day 2 Supplement — Slide 7: Tag Rulesets**

"Tags don't get as much attention as branches, but they're critical for governance. Why? Because tags mark releases. Consumers pin to tags. And if someone deletes or overwrites a tag, you lose that release marker — potentially breaking downstream dependencies."

"Common tag patterns to protect: `v*` to catch all version tags, `v[0-9].[0-9].*` for stricter semantic versioning, or `release-*` for release branches."

"The rules you'll typically set on tag rulesets: restrict creation to specific actors, block updates to existing tags, and block deletion."

> **🖥️ ADVANCE to Day 2 Supplement — Slide 8: Hands-on Labs Transition**

"This slide outlines what I'll demo in the next two labs."

"**Lab 3** is the foundational rulesets demo — I'll create a branch ruleset, configure required pull requests and reviews, add required status checks, and test the enforcement."

"**Lab 6** builds on that — I'll create org-level rulesets, try out evaluation mode, explore Rule Insights, and set up tag protection."

> **💡 DISCUSSION PROMPT**
> Ask: "Quick show of hands — how many of you are currently using branch protection rules? And how many have already migrated to rulesets?"
> Note: If most are on legacy, emphasize that migration is manual but worthwhile. If some are on rulesets, ask what they like about them.

---

## ⏱️ [0:43] Live Demo: Lab 3 — Repository Rulesets (10 minutes)

### 📋 Stage Direction
- This is a LIVE DEMO — you are driving, attendees watch your screen
- Have your lab repository open in the browser at **Settings → Rules → Rulesets**
- Keep terminal and browser both accessible

### 🎤 Script

"Let me walk through this one live."

"This is Lab 3 — Repository Rulesets. We're going to create a branch ruleset from scratch, configure the key rules, and test the enforcement."

> **🖥️ DEMO STEP 1: Navigate to Rulesets**
> Navigate to: **Repository → Settings → Rules → Rulesets → New branch ruleset**

"Here in the repo settings, under Rules, we have Rulesets. I'll click 'New branch ruleset' to create one. Notice we could also create a tag ruleset from here — we'll do that in Lab 6."

> **🖥️ DEMO STEP 2: Name and target the ruleset**
> Name it `default-branch-protection`, set target to Default branch

"I'll name this `default-branch-protection` — descriptive names matter when you have multiple rulesets stacked. For the target, I'm selecting 'Default branch' which automatically applies to whatever branch is set as default — usually `main`."

> **🖥️ DEMO STEP 3: Configure bypass actors**
> Add Repository admin as bypass actor with PR-only mode

"Now bypass actors. I'll add 'Repository admin' but set the mode to 'Pull requests only.' This means even admins can't push directly to main — they still need a PR — but they can bypass the review requirement if needed. This is a best practice: admins should still go through the PR process."

> **🖥️ DEMO STEP 4: Enable rules**
> Enable: Require pull request (1 approval), Required status checks (add `build`), Restrict deletions

"For the rules, I'm enabling three things. First, 'Require a pull request before merging' with one required approval. Second, 'Require status checks to pass' — I'll add our `build` check here. Remember, the check name has to exactly match what your workflow reports. Third, 'Restrict deletions' to prevent anyone from deleting the default branch."

> **🖥️ DEMO STEP 5: Test enforcement**
> Show what happens when trying to push directly to main (blocked)

"Now let's test this. I'll try to push a commit directly to main from the terminal. Watch what happens — there's the error. GitHub is blocking the push because our ruleset requires a pull request. That's exactly what we want."

> **🖥️ DEMO STEP 6: Show Rule Insights**
> Navigate to: **Settings → Rules → Rule Insights**

"And here in Rule Insights, we can see the enforcement event we just triggered. It shows the rule that was evaluated, the result, the actor, and the timestamp. This is your audit trail for all ruleset enforcement."

"That's Lab 3. The key takeaway is that rulesets give you granular, auditable control over your branches. Any questions before we move to the advanced rulesets demo?"

---

## ⏱️ [0:53] Live Demo: Lab 6 — Advanced Repository Rulesets (10 minutes)

### 📋 Stage Direction
- This is a LIVE DEMO — you are driving, attendees watch your screen
- Have your **organization** settings open (not repo settings)
- You will create org-level rulesets and tag rulesets
- Keep terminal and browser both accessible

### 🎤 Script

"Let me demo this next lab for you."

"Lab 6 builds on what we just did. We're going to level up to **organization-level rulesets** and **tag protection**."

> **🖥️ DEMO STEP 1: Navigate to org-level rulesets**
> Navigate to: **Organization Settings → Repository → Rulesets → New branch ruleset**

"Notice I'm now in the **organization** settings, not the repository settings. This is a key distinction. Org-level rulesets cascade down to all repos — or to a subset you target."

> **🖥️ DEMO STEP 2: Create org-level ruleset**
> Create a ruleset targeting all repos, all branches

"I'll create a ruleset that targets all repositories and all branches. This is how you establish a baseline governance policy across your entire org with a single configuration."

> **🖥️ DEMO STEP 3: Enable advanced rules**
> Enable: Require signed commits, Require linear history

"For the rules, I'm enabling 'Require signed commits' — this enforces commit signature verification — and 'Require linear history' which prevents merge commits and forces squash or rebase. These are common compliance requirements."

> **🖥️ DEMO STEP 4: Set to Evaluate mode**
> Change enforcement status to **Evaluate** — explain dry-run concept

"Here's one of my favorite features. Instead of setting this to Active, I'm going to set it to **Evaluate**. This is essentially a dry run. The ruleset will check every push and merge against these rules, log what *would* have been blocked, but not actually block anything. This lets you test a new policy without disrupting your teams. When you're confident it won't break workflows, you flip it to Active."

> **🖥️ DEMO STEP 5: Create a tag ruleset**
> Create a new tag ruleset targeting `v*` tags, restrict creation/updates/deletions

"Now let's protect our tags. I'll create a new ruleset — this time selecting 'Tag ruleset.' I'll target the pattern `v*` to catch all version tags. For the rules, I'll restrict who can create tags, block updates to existing tags, and block deletion. This prevents anyone from rewriting or removing your release markers."

> **🖥️ DEMO STEP 6: Show Rule Insights dashboard**
> Navigate to Rule Insights to show the evaluation results

"Let's check Rule Insights. Even in Evaluate mode, every evaluation is logged here. You can see what would have been blocked, which rule triggered, and who was the actor. This dashboard is your go-to for understanding the impact of a new policy before you enforce it."

> **🖥️ DEMO STEP 7 (Optional): Export and import ruleset JSON**
> Show the export ruleset button and the import UI

"One more thing — you can export a ruleset as JSON and import it into another org. This is great for standardizing governance across multiple organizations in your enterprise."

"That's Lab 6. Org-level rulesets are a game-changer for large organizations — define once, enforce everywhere. Any questions about rulesets before we take a break?"

---

## ⏱️ [1:03] Break (10 minutes)

### 📋 Stage Direction

- Announce the break clearly
- Keep your slide deck on the current slide (no need to change)
- Set a timer for yourself — resume at 1:13
- Use this time to prepare the Day 2 Supplement for the security section (navigate to slide 9)

### 🎤 Script

"We've covered a lot of ground in the first hour — repository governance, templates, and a deep dive into rulesets with two live demos. Let's take a **10-minute break**. Stretch, grab a coffee, check your messages."

"When we come back, we're going to shift to **security** — secret scanning, code scanning, push protection, and how to manage the cost of GitHub Advanced Security. See you back here at **[state the clock time]**."

---

## ⏱️ [1:13] Security in the Cloud (15 minutes)

> **🖥️ SLIDE SOURCE: Day 2 Supplement — Slides 9–16**
> **🔄 TRANSITION: Ensure you are on the Day 2 Supplement slides in your browser**

### 📋 Stage Direction

- Switch back to the Day 2 Supplement in your browser (if not already showing)
- Navigate to **Slide 9**
- This section covers slides 9–16 (~15 minutes)
- GHAS cost optimization (slides 17–23) is covered in a separate section after the Lab 7 demo

### 🎤 Script

"Welcome back. Let's talk about security."

> **🖥️ Day 2 Supplement — Slide 9: Section Title**

"Security in the Cloud — Scanning, Protection, and Compliance. This is one of the most important topics for GitHub admins because you're the ones who enable and manage these features for your organization."

> **🖥️ ADVANCE to Day 2 Supplement — Slide 10: GitHub Security Products**

"GitHub offers two paid security products, and it's important to understand the distinction."

"**Secret Protection** — at **19 dollars per active committer per month** — gives you secret scanning with over 200 partner patterns, push protection to block secrets before they land in your repo, custom patterns for your own proprietary secrets, and AI-powered detection for generic credentials."

"**Code Security** — at **30 dollars per active committer per month** — includes CodeQL for static analysis, Copilot Autofix for AI-generated remediation, Dependabot for dependency management, dependency review for pull requests, license compliance checks, and security campaigns for coordinated remediation."

"Combined, that's **49 dollars per committer per month**. We'll talk about cost optimization after the security demo."

> **🖥️ ADVANCE to Day 2 Supplement — Slide 11: Secret Scanning & Push Protection**

"Here's how push protection works in practice. A developer writes code, commits it, and pushes. During the push, GitHub scans the content for patterns that match known secret types — API keys, tokens, connection strings. If a secret is detected, the **push is blocked** right there."

"The developer sees an error message telling them exactly which secret was found. They have a few options: remove the secret and push again, mark it as a test or false positive, or say 'I'll fix it later' — though that one should be rare and is always logged."

"Organizations can also set up **delegated bypass**, where the developer requests a bypass and a designated security reviewer has to approve it."

"Every bypass — regardless of reason — is **audit-logged**. There's full accountability."

"And you can define **custom patterns** for your own proprietary secrets — things like internal API keys with a specific prefix that GitHub wouldn't know about by default."

> **🖥️ ADVANCE to Day 2 Supplement — Slide 12: Code Scanning Admin Enablement**

"Code scanning uses **CodeQL** — GitHub's semantic analysis engine — to find vulnerabilities in your source code. Things like SQL injection, cross-site scripting, insecure deserialization."

"As an admin, the easiest way to enable this is through **Security Configurations** at the org level. You can use the **Default Setup**, which is zero-configuration — GitHub automatically determines the right languages and analysis schedule. It costs 30 dollars per active committer per month."

"You can monitor everything from the **Security Overview dashboard**, which gives you an org-wide view of all code scanning alerts."

> **🖥️ ADVANCE to Day 2 Supplement — Slide 13: Dependabot**

"Dependabot is **free on all repositories** — it doesn't require any paid plan."

"It has three tiers. **Alerts** — passive notifications when a known CVE affects one of your dependencies. **Security updates** — Dependabot automatically opens pull requests to update the vulnerable package to a patched version. And **Version updates** — proactive PRs to keep your dependencies fresh, even when there's no known vulnerability."

"You configure it with a `dependabot.yml` file in your `.github` directory, and you can also enable it org-wide through Security Configurations."

> **🖥️ ADVANCE to Day 2 Supplement — Slide 14: Security Configurations**

"Security Configurations are your tool for enabling security at scale. Think of them as **org-level policy bundles** for security features."

"You can use the **GitHub Recommended** configuration, which turns on sensible defaults, or create a **Custom Configuration** with exactly the toggles you want."

"Each configuration lets you toggle: code scanning, secret scanning with push protection, Dependabot alerts and updates, dependency review for pull requests, and private vulnerability reporting."

"You can apply a configuration to **all repos** in the org or target specific repos. This is how you go from 'security is enabled on a few repos' to 'security is standard across the organization.'"

> **🖥️ ADVANCE to Day 2 Supplement — Slide 15: Security Overview Dashboard**

"The Security Overview dashboard is your **single pane of glass** for security across the entire organization."

"It has three key tabs. **Risk** — which repos have the most alerts, sorted by severity. **Coverage** — which repos have security features enabled and which don't. And **Campaigns** — for coordinated remediation efforts where you assign groups of alerts to teams with deadlines."

"This is the view you'll use in your weekly or monthly security reviews."

> **💡 DISCUSSION PROMPT**
> Ask: "Which security features are you currently using? Are you managing them org-wide or repo-by-repo?"
> Allow 2–3 responses. If someone says "repo-by-repo," point them to Security Configurations as the path to scale.

> **🖥️ ADVANCE to Day 2 Supplement — Slide 16: Lab 7 Transition**

"I'll demo all of this in Lab 7 right now. But after the demo, we'll come back and talk about cost — because GHAS licensing is one of the most common questions I get."

---

## ⏱️ [1:28] Live Demo: Lab 7 — Security Scanning and Push Protection (12 minutes)

### 📋 Stage Direction
- This is a LIVE DEMO — you are driving, attendees watch your screen
- Have your lab repository open with **Settings → Security** ready
- Have a terminal open for the push protection test
- Pre-stage a test file with a fake secret for the push protection demo (the lab uses an AWS-format key as a recognizable test pattern)
- Keep terminal and browser both accessible

### 🎤 Script

"Let me show you this live — it's one of the most impactful demos."

"This is Lab 7 — Security Scanning and Push Protection. This is one of the most impactful demos because you'll see push protection block a secret in real time."

> **🖥️ DEMO STEP 1: Enable secret scanning and push protection**
> Navigate to: **Repository → Settings → Advanced Security** (under the Security section of the sidebar)

"First, let's enable the features. Here in Security settings, I'll turn on Secret scanning and Push protection. These are the two features that prevent secrets from landing in your codebase."

> **🖥️ DEMO STEP 2: Test push protection**
> Create a test file with the fake key from Lab 7 (`AKIAIOSFODNN7EXAMPLE`), attempt to push, show the block message

"Now let's test it. The lab uses a well-known test key — `AKIAIOSFODNN7EXAMPLE` — because it's a pattern GitHub's scanner reliably detects. This isn't about any specific cloud provider; push protection covers over 200 token types including Azure, GCP, Slack, npm, NuGet, and many more. I'll commit this to a branch and push. Watch what happens — there's the block. GitHub detected the secret pattern and stopped the push before it could reach the repository. The error message tells me exactly what was found and where."

> **🖥️ DEMO STEP 3: Show bypass options**
> Walk through the bypass dialog: test/false positive, fix later, delegated bypass

"The developer has a few options here. They can mark it as a test or false positive — which is what we'd do with our example key. They can say 'I'll fix it later' — which is logged and should be rare. Or if your org uses delegated bypass, they'd request approval from a security reviewer. Every choice is audit-logged."

> **🖥️ DEMO STEP 4: Enable CodeQL**
> Enable CodeQL default setup, show the workflow running in the Actions tab

"Next, let's enable code scanning. I'll turn on CodeQL with the default setup — this is the zero-configuration option. GitHub automatically detects the languages in the repo and sets up the analysis. Let me switch to the Actions tab — you can see the CodeQL workflow is now running. The first analysis takes a few minutes."

> **🖥️ DEMO STEP 5: Review code scanning alerts**
> Navigate to: **Security → Code scanning alerts**, review alerts and show Copilot Autofix

"While that's running, let me show you what code scanning alerts look like once they're generated. Here under Security, Code scanning alerts. Each alert shows the vulnerability type, severity, file location, and — this is powerful — **Copilot Autofix** can generate a suggested fix. You can review the fix and merge it directly from the alert."

> **🖥️ DEMO STEP 6: Review Dependabot alerts**
> Navigate to: **Security → Dependabot alerts**, show advisory detail

"Let's also look at Dependabot alerts. These are free on all repos. Each alert links to the CVE advisory, shows which dependency is affected, and in many cases Dependabot has already opened a pull request with the fix."

> **🖥️ DEMO STEP 7: Security Overview dashboard**
> Navigate to: **Organization → Security tab → Overview**, show Risk, Coverage, and Campaigns tabs

"Finally, let's look at the big picture. At the org level, the Security Overview dashboard gives you the full view. The Risk tab shows which repos have the most critical alerts. The Coverage tab shows which repos have security features enabled — this is where you find gaps. And the Campaigns tab is for coordinated remediation across teams."

> **🖥️ DEMO STEP 8: Show Security Overview filters**
> Filter by severity, show the Coverage tab detail

"You can filter by severity, by team, by repository. This is the view you'd use in your monthly security review meeting — 'here are our top 10 most critical alerts, here's which repos still don't have scanning enabled.'"

"That's Lab 7. Push protection alone is worth the investment — it prevents the problem instead of just detecting it after the fact. Any questions about security scanning before we talk about cost optimization?"

---

## ⏱️ [1:40] GHAS Cost Optimization (10 minutes)

> **🖥️ SLIDE SOURCE: Day 2 Supplement — Slides 17–23**

### 📋 Stage Direction

- Stay on the Day 2 Supplement slides
- Navigate to **Slide 17**
- This section covers GHAS cost model and optimization strategies

### 🎤 Script

> **🖥️ Day 2 Supplement — Slide 17: GHAS Cost Section Title**

"GHAS: Best Practices and Cost Optimization."

> **🖥️ ADVANCE to Day 2 Supplement — Slide 18: The GHAS Cost Model**

"Let's break down the numbers. Secret Protection is 19 dollars per committer per month. Code Security is 30 dollars. If you enable both, that's 49 dollars per committer per month, or **588 dollars per committer per year**."

"The key term here is **active committer** — someone who has made at least one commit in the last 90 days to a repo where that feature is enabled. If a developer is active in 10 repos, they're counted **once** per org, not 10 times. That's important for cost modeling."

"At scale, this adds up. A hundred committers is roughly 59,000 dollars a year for both products. That's why a strategy matters."

> **🖥️ ADVANCE to Day 2 Supplement — Slide 19: Phased Rollout Strategy**

"Don't try to turn on GHAS everywhere on day one. Use a phased approach."

"**Phase 1 — Pilot.** Pick 5 to 10 repos. Run for 2 to 4 weeks. Learn the tooling, understand the alert volume, and build your remediation workflow."

"**Phase 2 — Critical and Regulated.** Expand to your most sensitive repos — anything with customer data, PCI or SOC requirements, or regulatory compliance needs. This phase takes 1 to 2 months."

"**Phase 3 — High-Value.** Customer-facing applications, core platform services. Another 1 to 2 months."

"**Phase 4 — Org-Wide.** Ongoing expansion to all remaining repos."

> **🖥️ ADVANCE to Day 2 Supplement — Slide 20: Active Committer Optimization**

"A few tips to keep costs under control."

"Enable only on repos with **active development**. If a repo hasn't had a commit in six months, it doesn't need GHAS."

"Remember the **unique user counting** — one developer active in 10 repos counts as one committer. So enabling GHAS on more repos doesn't necessarily increase your committer count."

"**Bot accounts** — like Dependabot or your CI service account — are excluded from the committer count."

"And the 90-day trailing window means that if a developer stops committing, they fall off the count after 90 days."

> **🖥️ ADVANCE to Day 2 Supplement — Slide 21: Tiered Deployment Strategy**

"Here's a practical framework. Classify your repos into tiers."

"**Tier 1 — Critical:** Both Secret Protection and Code Security. Full coverage. 49 dollars per committer."

"**Tier 2 — Standard:** Secret Protection only. Covers the most common risk — leaked credentials. 19 dollars per committer."

"**Tier 3 — Low Risk:** Use Dependabot only. Zero additional cost — Dependabot is free."

"This lets you allocate your security budget where it matters most."

> **🖥️ ADVANCE to Day 2 Supplement — Slide 22: Budget Controls**

"GitHub lets you set **spending limits independently** for each product. You can also set alert-only budgets so you get notified when spending approaches a threshold."

"One thing to be aware of: GHAS is license-based, not metered, so 'stop usage at limit' doesn't apply the same way it does for Actions minutes or Packages storage. Budget alerts are your main control lever."

> **🖥️ ADVANCE to Day 2 Supplement — Slide 23: Cost Optimization Checklist**

"Here's a quick checklist to take back to your team."

"**Before rollout:** Audit your repos — which are active? Set budgets. Use Security Configurations for consistency. Classify repos into tiers."

"**Ongoing:** Monitor committer growth quarterly. Do periodic audits to remove features from inactive repos. Leverage free features — Dependabot, dependency review — on every repo."

---

## ⏱️ [1:50] API and Authentication (10 minutes)

> **🖥️ SLIDE SOURCE: Main PowerPoint — Slides 50–54**
> **🔄 TRANSITION: Switch from Day 2 Supplement back to the Main PowerPoint**

### 📋 Stage Direction

- **Switch your shared screen** back to the Main PowerPoint
- Navigate to **PPT Slide 50** — Additional Topics section title (brief, advance quickly)
- Then move to **PPT Slide 51** — Core Integration Loop
- This section covers slides 50–54 only (10 minutes)
- Auth methods deep dive (slides 55–61) is covered in a separate section after the API and Webhooks demos

### 🎤 Script

"Now let's shift gears to the **GitHub API and authentication**. I'm switching back to the main PowerPoint for this section."

> **🖥️ Main PowerPoint — Slide 50: Additional Topics Section Title**

> **🖥️ ADVANCE to PPT Slide 51: Core Integration Loop**

"This diagram shows the core integration loop in GitHub. Here's how it works: an operation happens in GitHub — a push, a PR, an issue created. That operation triggers a **webhook** — an HTTP POST to a URL you configure. That webhook is received by an app or service you control. Your service then calls the GitHub **API** — REST or GraphQL — to read data or take action. And that API call can itself trigger new webhooks, creating a continuous loop."

"This is the foundation of all GitHub automation. Webhooks are the trigger, the API is the action."

> **🖥️ ADVANCE to PPT Slide 52: GitHub API Overview**

"GitHub has two APIs. **REST API**, sometimes called v3, uses standard HTTP methods — GET, POST, PUT, DELETE. It's straightforward, well-documented, and great for scripting and one-off requests."

"**GraphQL API**, or v4, lets you query exactly the data you need in a single request. Instead of making five REST calls to get repo info, team members, and recent commits, you write one GraphQL query that returns exactly those fields."

"Both APIs are fully maintained. REST is **not** being deprecated. Choose whichever you're more comfortable with."

"The **Octokit** library — the official SDK for JavaScript/TypeScript — is actively maintained and regularly updated. And if you're using the **gh CLI**, it wraps both APIs with convenient commands like `gh api`."

"One technical note: REST API now uses **date-based versioning** via the `X-GitHub-Api-Version` header. This ensures your integration doesn't break when GitHub rolls out API changes."

> **🖥️ ADVANCE to PPT Slide 53: Authentication Methods Section Title**

> **🖥️ ADVANCE to PPT Slide 54: API Authentication Overview**

"Authentication is where most people get confused, so let's break it down clearly."

"This diagram shows the four main authentication methods and when to use each."

"**Personal Access Tokens — PATs** — classic PATs are prefixed with `ghp_`, fine-grained PATs with `github_pat_`. These authenticate as **you, personally**. Good for personal scripts, one-off API calls, and testing. Fine-grained PATs are now the recommended type — they offer repository-scoped permissions and org approval workflows. Not for production services."

"**GitHub Apps** — generate tokens prefixed with `ghs_` for server-to-server or `ghu_` for user-to-server. These are the **recommended** method for automation and integrations. They have fine-grained permissions, don't consume a license seat, and act as their own identity."

"**OAuth Apps** — tokens prefixed with `gho_`. These impersonate the authenticating user. Used when you need to act on behalf of a user."

"**GITHUB_TOKEN** — prefixed with `ghs_`. Automatically available inside GitHub Actions workflows. Scoped to the repository where the workflow runs."

"As of **March 2025**, fine-grained PATs are generally available and recommended over classic PATs."

"Now let me show you the API in action with two quick demos — one for the API itself, and one for webhooks."

---

## ⏱️ [2:00] Live Demo: Lab 5 — GitHub API (8 minutes)

### 📋 Stage Direction
- This is a LIVE DEMO — you are driving, attendees watch your screen
- Have your lab repository open with an API workflow file ready
- Have a terminal open with `gh` CLI authenticated
- Keep terminal and browser both accessible

### 🎤 Script

"Let me walk through this one on screen."

"This is Lab 5 — the GitHub API in action. We're going to see both the REST and GraphQL APIs, first through GitHub Actions workflows, then from the command line."

> **🖥️ DEMO STEP 1: Show REST API workflow**
> Show the workflow file with a REST API step using `actions/github-script` to create/close issues

"Here's a GitHub Actions workflow that calls the REST API. It uses the `actions/github-script` action, which gives you an authenticated Octokit client inside the workflow. This step creates an issue, logs the issue number, then closes it — all via the REST API. Notice it's using the built-in `GITHUB_TOKEN` for authentication."

> **🖥️ DEMO STEP 2: Show GraphQL job**
> Show the GraphQL job in the same workflow, querying labels and associated issues

"The second job in this workflow uses GraphQL. It's querying for labels and their associated issues in a single request. This is where GraphQL shines — instead of making one API call to list labels, then one call per label to get issues, we get everything in one query."

> **🖥️ DEMO STEP 3: Run the workflow**
> Trigger the workflow and show the output in the Actions logs

"Let me trigger this workflow. While it runs, let's watch the live logs. There — you can see the REST API call creating the issue, logging the issue number, and then closing it. And here's the GraphQL response with labels and their associated issues. All running inside GitHub Actions with zero setup."

> **🖥️ DEMO STEP 4: Use gh CLI for API calls**
> In terminal: `gh api /repos/YOUR-ORG/YOUR-REPO/issues --jq '.[] | [.number, .title, .state] | @tsv'`

"Now let's do the same thing from the command line. The `gh api` command wraps both APIs. Here I'm calling the issues endpoint and using `--jq` to format the output as tab-separated values — issue number, title, and state. This is incredibly powerful for scripting and one-off admin queries."

> **🖥️ DEMO STEP 5: Discuss REST vs GraphQL**
> Brief comparison of when to use each

"So when do you use REST versus GraphQL? REST is simpler, great for scripting, and has excellent documentation. GraphQL is more efficient when you need data from multiple resources in a single call — like getting repos with their teams, recent commits, and branch protection settings all at once. Both are fully supported — pick whichever fits your use case."

"That's Lab 5. Let me quickly show you one more thing — webhooks, which are the other half of the integration loop."

---

## ⏱️ [2:08] Live Demo: Lab 1 — Webhooks and Events (5 minutes)

### 📋 Stage Direction
- This is a LIVE DEMO — you are driving, attendees watch your screen
- Have smee.io open in a browser tab (or pre-create a channel)
- Have your lab repository Settings open
- Keep terminal and browser both accessible

### 🎤 Script

"Let me demo this quickly."

"This is Lab 1 — Webhooks and Events. Remember that core integration loop — an event happens, a webhook fires, your service responds. Let's see that in action."

> **🖥️ DEMO STEP 1: Create a smee.io channel**
> Open smee.io, click "Start a new channel," copy the URL

"I'm going to use smee.io — it's a free webhook proxy from GitHub that lets us inspect webhook payloads in real time. I'll click 'Start a new channel' and copy this URL."

> **🖥️ DEMO STEP 2: Configure the webhook**
> Navigate to: **Repository → Settings → Webhooks → Add webhook**, paste URL, select `application/json`, choose "Send me everything"

"Now in the repo settings, under Webhooks, I'll add a new webhook. I'll paste the smee.io URL as the payload URL, set the content type to `application/json`, and select 'Send me everything' so we see all event types."

> **🖥️ DEMO STEP 3: Show the ping event**
> Check the Recent Deliveries tab for the ping event

"GitHub immediately sends a ping event to verify the webhook is reachable. Here in Recent Deliveries, we can see the ping — and over on smee.io, there's the payload. The ping includes metadata about the webhook configuration."

> **🖥️ DEMO STEP 4: Trigger a real event**
> Create an issue in the repo and show the webhook payload arriving at smee.io

"Now let's trigger a real event. I'll create an issue — and watch smee.io. There it is — the `issues` event with the action `opened`. The payload contains the full issue data — title, body, author, labels, timestamps. This is exactly what your automation service would receive."

> **🖥️ DEMO STEP 5: Discuss webhook security**
> Briefly explain secrets and HMAC verification

"One important security note: in production, you'd set a webhook secret. GitHub uses that secret to generate an HMAC signature in the `X-Hub-Signature-256` header. Your service verifies that signature to confirm the payload genuinely came from GitHub and wasn't tampered with. Never process webhook payloads without verifying the signature."

"That's Lab 1. Any questions about webhooks or the API before we move on to authentication methods?"

---

## ⏱️ [2:13] Auth Methods Deep Dive (5 minutes)

> **🖥️ SLIDE SOURCE: Main PowerPoint — Slides 55–61**
> **�� NOTE: This is a condensed 5-minute version focusing on key decision points**

### 📋 Stage Direction

- Stay on the Main PowerPoint
- Navigate to **PPT Slide 55**
- This section covers slides 55–61 in a condensed format
- Focus on the key decision points — GitHub Apps recommendation and the decision tree
- Move briskly through OAuth, Deploy Keys, and Machine Users

### 🎤 Script

> **🖥️ Main PowerPoint — Slide 55: GitHub Apps**

"GitHub Apps are the recommended authentication method for integrations. Here's why."

"You can register up to 100 GitHub Apps per account, and there's no limit on how many apps can be installed in an org. They act independently of any user — they don't consume a license. They use an installation-based model with fine-grained permissions. You choose exactly which repositories and which permissions the app gets. They can make up to 15,000 API requests per hour on an enterprise plan. And when you change permissions, the org owner has to approve — adding a layer of governance."

> **🖥️ ADVANCE to PPT Slide 56: GitHub Apps Auth Flow**

"The auth flow for GitHub Apps has two paths."

"**Server-to-server**, also called installation authentication: your app uses its App ID and a private key to generate a JWT, then exchanges that JWT for an API token scoped to a specific installation."

"**User-to-server**, also called OAuth flow: your app uses a Client ID and callback URL to get a code from the user, then exchanges that code for an API token that acts on behalf of that user."

> **🖥️ ADVANCE to PPT Slide 57: OAuth Apps**

"OAuth Apps are the older model. They act as the authenticated user, can serve as an identity provider, have a 5,000 request per hour limit, and require the full OAuth flow. Use them when you specifically need access to user resources."

> **🖥️ ADVANCE to PPT Slide 58: Personal Access Tokens**

"PATs — for **personal use only**. I want to emphasize that. Never use a PAT for a team or company-wide service. If you need automation, use a GitHub App."

"PATs have a 5,000 requests per hour limit. They're part of token scanning — GitHub detects them if they leak to public repos. And PATs are now automatically removed after one year without use."

"Use **fine-grained PATs** — they're GA as of March 2025 and let you scope permissions to specific repos."

> **🖥️ ADVANCE to PPT Slide 59: Deploy Keys**

"Deploy keys are SSH keys scoped to a single repository. Read-only by default. They're limited — no passphrase protection, single repo scope. Use them for deployment pipelines that only need to pull code."

> **🖥️ ADVANCE to PPT Slide 60: Machine Users**

"Machine users are a legacy practice — creating a dedicated GitHub user account for automation. GitHub **strongly recommends GitHub Apps** instead. GitHub Apps don't consume licenses, have better permission granularity, and are purpose-built for automation."

> **🖥️ ADVANCE to PPT Slide 61: Which Auth Should You Choose?**

"Here's the decision tree. Ask yourself:"

"**'Am I the only one who'll use this?'** If yes, and it's simple, use a PAT."

"**'Do I need to act as the app itself?'** Use a GitHub App."

"**'Do I need to act as a user?'** OAuth App."

"**'Is this running inside GitHub Actions?'** Use GITHUB_TOKEN."

"When in doubt, default to **GitHub Apps**. They're the most flexible, most secure, and most scalable option."

---

## ⏱️ [2:18] Actions, Automation, and Marketplace (10 minutes)

> **🖥️ SLIDE SOURCE: Main PowerPoint — Slides 62–67, then Day 2 Supplement — Slides 24–27**

### 📋 Stage Direction

- Stay on the Main PowerPoint
- Navigate to **PPT Slide 62**
- You'll cover PPT 62–67 quickly (~5 min), then switch to Day2 Supp 24–27 (~5 min)
- This is a fast section — hit the highlights, don't dwell on details

### 🎤 Script

> **🖥️ Main PowerPoint — Slide 62: Actions Section Title**

"Let's talk about GitHub Actions, automation, and the Marketplace."

> **🖥️ ADVANCE to PPT Slide 63: What is GitHub Actions**

"GitHub Actions automates workflows. Workflows are defined as YAML files stored in your repository under `.github/workflows`. They're fully integrated with GitHub — they respond to GitHub events like pushes, PR opens, issue creation, and more."

"Key features: **live logs** as workflows run, **community-powered actions** from the Marketplace, support for both GitHub-hosted and self-hosted runners, and a built-in secret store for credentials."

> **🖥️ ADVANCE to PPT Slide 64: Actions Policies**

"As an admin, you control **which Actions are allowed** at the enterprise, org, and repo level. You can allow all actions, restrict to local actions only, or select specific actions from verified creators."

"You also control artifact retention periods, whether fork pull requests can run workflows, and the default **GITHUB_TOKEN permissions**. Since February 2023, the default for new repos and orgs is **read-only**. That's a security improvement — workflows need to explicitly request write permissions."

> **🖥️ ADVANCE to PPT Slide 65: Sharing Workflows in an Organization**

"For sharing workflows across your org: use the `.github` repository to host **starter workflow templates**. Use **reusable workflows** via the `workflow_call` trigger — this lets one workflow call another."

"A quick note: 'Required workflows' — the feature that let you force a workflow to run on every repo — was deprecated in October 2023. It's been replaced by **organization rulesets** with required status checks. So if you were using required workflows, migrate to org rulesets."

> **🖥️ ADVANCE to PPT Slide 66: Sharing Private Actions**

"If you have private actions in other repos, you can access them using a GitHub App token. This slide shows a code example using `actions/create-github-app-token` to generate a token, then using `actions/checkout` with that token to clone a private repo containing your shared action."

> **🖥️ ADVANCE to PPT Slide 67: Best Practices on Actions**

"Quick best practices for Actions administration:"

"Use **GITHUB_TOKEN** whenever possible — it's automatically scoped and expires after the workflow run."

"**Limit token permissions** — use the `permissions:` key in your workflow to request only what you need."

"**Run only trusted actions** — pin to a specific commit SHA, not just a version tag, for critical workflows."

"**Protect secrets with environments** — use environment protection rules to require approval before a workflow can access production secrets."

"Create **starter workflows** for your org so teams don't start from scratch."

"And use Actions not just for CI/CD but for **all kinds of ops** — security scanning, compliance checks, onboarding automation, cleanup scripts."

> **🔄 TRANSITION: Switch from Main PowerPoint to Day 2 Supplement slides in your browser**

"Let me switch to our supplemental slides for a few more admin automation patterns."

> **🖥️ Day 2 Supplement — Slide 24: Automation Section Title**

"Automation, gh CLI, and Marketplace — Scripting admin at scale."

> **🖥️ ADVANCE to Day 2 Supplement — Slide 25: gh CLI for Admin**

"The **gh CLI** is your best friend as a GitHub admin. It comes pre-authenticated on GitHub-hosted runners. It wraps both the REST and GraphQL APIs. It supports `--paginate` for large result sets and `--jq` for filtering and transforming JSON output."

"The key commands you'll use most: `gh api` for calling any API endpoint, `gh repo list` for listing repos in your org, `gh api graphql` for running GraphQL queries."

> **🖥️ ADVANCE to Day 2 Supplement — Slide 26: Admin Automation Patterns**

"Here are some practical automation patterns for GitHub admins. Bulk team management — adding or removing users across multiple teams. Audit log export — pulling audit events and sending them to your SIEM. Dormant user reports — identifying users who haven't been active. Repository access audits — verifying who has access to what."

"These are exactly the kinds of scripts I'll demo in Lab 13."

> **🖥️ ADVANCE to Day 2 Supplement — Slide 27: Commit Statuses & Check Runs**

"Two more concepts to understand for rulesets integration."

"The **Status API** — the legacy approach — reports simple statuses: pending, success, failure, or error."

"The **Check Runs API** — the modern approach — provides rich output including annotations, markdown summaries, and line-level detail. It's scoped to GitHub Apps."

"When you configure required status checks in rulesets, you reference these by their **context name**. That's why naming matters and why the check name in your workflow needs to exactly match what you add to the ruleset."

"Now let me show you some live demos — first the Actions settings, then some powerful CLI automation."

---

## ⏱️ [2:28] Live Demo: Lab 2 — Actions Settings (5 minutes)

### 📋 Stage Direction
- This is a LIVE DEMO — you are driving, attendees watch your screen
- Have your lab repository open at **Settings → Actions → General**
- Keep terminal and browser both accessible

### 🎤 Script

"Let me show you this one."

"This is Lab 2 — Actions Settings. As an admin, controlling which Actions can run in your org is a critical governance decision."

> **🖥️ DEMO STEP 1: Navigate to Actions settings**
> Navigate to: **Repository → Settings → Actions → General**

"Here in the Actions settings, you'll see the permissions dropdown at the top. This controls which Actions are allowed to run in this repository."

> **🖥️ DEMO STEP 2: Show permissions options**
> Show the Actions permissions dropdown: Allow all / Allow select / Disable

"There are three options. 'Allow all actions and reusable workflows' — wide open, any action from the Marketplace can run. 'Allow select actions and reusable workflows' — this is the governance sweet spot. And 'Disable' — completely turns off Actions."

> **🖥️ DEMO STEP 3: Configure allowlist**
> Change to "Allow select actions," show the allowlist UI

"Let me switch to 'Allow select actions.' Now I see the allowlist UI. I can allow actions created by GitHub, allow actions by Marketplace verified creators, and specify individual actions by their full path. This is how you prevent teams from using untrusted third-party actions."

> **🖥️ DEMO STEP 4: Show workflow permissions**
> Show the Workflow permissions section: read-only vs read-write GITHUB_TOKEN

"Below that, we have Workflow permissions. Since February 2023, the default for new repos is **read-only**. This means the GITHUB_TOKEN in workflows can only read — it can't push code, create issues, or modify anything unless the workflow explicitly requests write permissions with the `permissions:` key. This is a security best practice."

> **🖥️ DEMO STEP 5: Show blocked action behavior**
> Describe what happens when a workflow uses a non-allowlisted action

"If a workflow tries to use an action that's not on the allowlist, it fails immediately with a clear error message. You'd then decide whether to add that action to the allowlist or find an alternative."

> **🖥️ DEMO STEP 6: Discuss fork PR settings**
> Show the fork pull request workflow settings

"One more setting worth knowing — fork pull request workflows. By default, workflows triggered by PRs from forks run with read-only permissions and no access to secrets. This prevents a malicious fork from extracting your repository secrets. You can adjust this, but be very careful about granting secrets access to fork PRs."

"That's Lab 2. Any questions about Actions governance before we move to CLI automation?"

---

## ⏱️ [2:33] Live Demo: Lab 13 — Scripts and gh CLI Automation (8 minutes)

### 📋 Stage Direction
- This is a LIVE DEMO — you are driving, attendees watch your screen
- Have a terminal open with `gh` CLI authenticated
- Have your admin report script ready to show
- Keep terminal and browser both accessible

### 🎤 Script

"Time for another quick demo."

"This is Lab 13 — Scripts and gh CLI Automation. The `gh` CLI is one of the most underutilized tools in the GitHub admin toolkit. Let me show you what it can do."

> **🖥️ DEMO STEP 1: Verify authentication**
> In terminal: `gh auth status`

"First, let's verify we're authenticated. `gh auth status` shows which account is active and what scopes the token has. You always want to check this before running admin scripts."

> **🖥️ DEMO STEP 2: List repositories**
> Run: `gh repo list YOUR-ORG --limit 5 --json name,visibility,isArchived`

"Now let's list repos. `gh repo list` with `--json` gives us structured output. I'm requesting name, visibility, and whether the repo is archived. This is the foundation for any repo audit script."

> **🖥️ DEMO STEP 3: Query org settings**
> Run: `gh api /orgs/YOUR-ORG --jq '{name, default_repository_permission, two_factor_requirement_enabled}'`

"Here's a direct API call. I'm querying the org endpoint and using `--jq` to extract just the fields I care about — org name, default repository permission, and whether two-factor authentication is required. This is the kind of quick check you'd run during a security audit."

> **🖥️ DEMO STEP 4: List teams**
> Run: `gh api /orgs/YOUR-ORG/teams --jq '.[] | [.name, .slug, .privacy] | @tsv'`

"Let me list all teams in the org. I'm formatting the output as tab-separated values — team name, slug, and privacy setting. You could pipe this to a CSV file for a team access report."

> **🖥️ DEMO STEP 5: Create a team via API**
> Run: `gh api /orgs/YOUR-ORG/teams -X POST -f name="demo-lab13-team" -f privacy="closed"`

"Now let's create a team programmatically. `gh api` with `-X POST` and `-f` flags for the fields. I'm creating a team called 'demo-lab13-team' with closed privacy. In a real scenario, you'd script this to bulk-create teams from a CSV or your identity provider."

> **🖥️ DEMO STEP 6: Query audit log**
> Run: `gh api /orgs/YOUR-ORG/audit-log --method GET -F phrase='action:team.create' --jq '.[] | {action, actor, created_at}'`

"Let's verify our team creation in the audit log. I'm querying for `team.create` events. There it is — the action, who did it, and when. The audit log API is essential for compliance and incident response."

> **🖥️ DEMO STEP 7: Show admin report script**
> Show the contents of admin-report.sh and run it

"Here's a practical admin script that combines multiple API calls into a single report — repo count, team count, member count, and security feature coverage. This is the kind of script you'd run on a schedule and send to your management team."

> **🖥️ DEMO STEP 8: Clean up**
> Run: `gh api /orgs/YOUR-ORG/teams/demo-lab13-team -X DELETE`

"And let me clean up by deleting the demo team. Always clean up after your demos and scripts."

"That's Lab 13. The `gh` CLI turns what would be 20 minutes of clicking through the UI into a single command. Combine it with shell scripting or GitHub Actions, and you can automate your entire admin runbook. Any questions?"

---

## ⏱️ [2:41] Live Demo: Lab 11 — GitHub Apps and Marketplace (5 minutes)

### 📋 Stage Direction
- This is a LIVE DEMO — you are driving, attendees watch your screen
- Have github.com/marketplace open in a browser tab
- Have your organization settings open in another tab
- Keep browser accessible

### 🎤 Script

"Let me walk you through this."

"This is Lab 11 — GitHub Apps and Marketplace. As an admin, you need to understand how to evaluate, install, and govern third-party apps."

> **🖥️ DEMO STEP 1: Browse the Marketplace**
> Open `https://github.com/marketplace`, browse the Apps tab

"Here's the GitHub Marketplace. The Apps tab shows integrations that extend GitHub's functionality — CI/CD tools, project management, code quality, security scanners. There are hundreds of apps available."

> **🖥️ DEMO STEP 2: Show verified creators and pricing**
> Point out verified creator badges, pricing models, categories

"Notice the verified creator badges — these indicate the publisher has been verified by GitHub. You'll also see pricing models — free, free trial, paid monthly. And you can filter by category to find what you need."

> **🖥️ DEMO STEP 3: Inspect app permissions**
> Click into an app, show the permissions it requests

"Let me click into an app. Before you install anything, always review the permissions it requests. This app wants read access to code, write access to issues, and read access to pull requests. Ask yourself: does this app need all of these permissions? The principle of least privilege applies here too."

> **🖥️ DEMO STEP 4: Show installed apps**
> Navigate to: **Organization → Settings → Third-party Access → GitHub Apps**

"In your org settings, under Third-party Access, you can see all installed GitHub Apps and their permissions. This is your audit view — make sure you review this regularly and remove apps you no longer use."

> **🖥️ DEMO STEP 5: Discuss governance**
> Explain GitHub Apps vs OAuth Apps governance differences and admin-only restrictions

"Two important governance points. First, **GitHub Apps vs OAuth Apps**: GitHub Apps have fine-grained permissions and installation-based access. OAuth Apps act as the user who installed them, which is harder to audit. Prefer GitHub Apps."

"Second, you can **restrict app installations to org admins only**. This prevents developers from installing apps without review — no shadow IT. Go to Organization Settings, Third-party Access, and set the policy."

"That's Lab 11. Marketplace governance is all about evaluating permissions, restricting installations, and auditing regularly. Any questions?"

---

## ⏱️ [2:46] Live Demo: Lab 12 — Deployments and Environments (5 minutes)

### 📋 Stage Direction
- This is a LIVE DEMO — you are driving, attendees watch your screen
- Have your lab repository open at **Settings → Environments**
- Have a deployment workflow YAML ready to show
- Keep terminal and browser both accessible

### 🎤 Script

"Let me demo this next."

"This is Lab 12 — Deployments and Environments. Environments are how you add governance to your deployment pipelines — required reviewers, wait timers, and branch policies."

> **🖥️ DEMO STEP 1: Create environments**
> Navigate to: **Repository → Settings → Environments → New environment**

"Here in the repo settings, I'll create two environments. First, `staging` — no protection rules, deployments go through automatically."

> **🖥️ DEMO STEP 2: Configure production protections**
> Create `production` environment with required reviewers, 1-minute wait timer, and main-only branch policy

"Now `production` — this is where the governance comes in. I'll add a required reviewer — this person must approve the deployment before it proceeds. I'll set a 1-minute wait timer — this gives you a window to cancel if something looks wrong. And I'll add a branch policy restricting deployments to the `main` branch only. No deploying from feature branches to production."

> **🖥️ DEMO STEP 3: Show deployment workflow**
> Show a deployment workflow YAML with staging → production dependency

"Here's a deployment workflow with two jobs. The staging job deploys automatically on push to main. The production job has `needs: staging` and references the `production` environment — so it only runs after staging succeeds and requires that manual approval."

> **🖥️ DEMO STEP 4: Show deployment flow**
> Run the workflow, show staging auto-deploying

"Let me trigger this workflow. Watch — the staging job starts immediately and completes. But the production job is paused, waiting for review."

> **🖥️ DEMO STEP 5: Approve production deployment**
> Show the "Review deployments" dialog, approve, show the wait timer

"Here's the review dialog. I can see what's being deployed and to which environment. I'll approve — and now notice the wait timer counting down. This gives the team a last chance to cancel before the deployment proceeds."

> **🖥️ DEMO STEP 6: Show deployment history**
> Navigate to the **Deployments** section showing history

"Once it completes, we can see the deployment history here. Every deployment is tracked — when it happened, who approved it, which commit was deployed. This is your audit trail for production changes."

"That's Lab 12. Environments add a critical governance layer to your CI/CD pipelines. Any questions?"

---

## ⏱️ [2:51] Live Demo: Lab 14 — Unhealthy Repos and Git History (4 minutes)

### 📋 Stage Direction
- This is a LIVE DEMO — you are driving, attendees watch your screen
- Have a terminal open with `gh` CLI and `git` available
- Have your lab repository settings open in the browser
- Keep terminal and browser both accessible

### 🎤 Script

"One more quick demo before we wrap up."

"This is Lab 14 — Unhealthy Repos and Git History. Every admin eventually deals with repos that have grown too large, have stale branches, or contain sensitive data in their history. Let me show you how to diagnose and address these issues."

> **🖥️ DEMO STEP 1: Check repository size**
> In terminal: `gh api /repos/YOUR-ORG/YOUR-REPO --jq '.size'`

"First, how big is this repo? The API returns the size in kilobytes. If this number is in the millions, you've got a problem — usually caused by accidental binary commits or large files that should be in Git LFS."

> **🖥️ DEMO STEP 2: Find large files in history**
> Show: `git rev-list --objects --all | git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | sort -k3 -n -r | head -5`

"This command finds the five largest objects in the entire git history. It lists object type, hash, size in bytes, and the file path. If you see a 500-megabyte ZIP file or a database dump, that's your culprit."

> **🖥️ DEMO STEP 3: Show stale branches**
> Show: `git for-each-ref --sort=committerdate refs/remotes/origin --format='%(committerdate:short) %(refname:short)'`

"This lists all remote branches sorted by last commit date. Branches that haven't been touched in months are candidates for cleanup. Stale branches clutter the repo and make it harder to navigate."

> **🖥️ DEMO STEP 4: Enable auto-delete head branches**
> Navigate to: **Settings → General → Pull Requests**, check "Automatically delete head branches"

"A simple governance setting — 'Automatically delete head branches' after PR merge. This prevents branch accumulation over time. Every admin should turn this on."

> **🖥️ DEMO STEP 5: Discuss git filter-repo**
> Explain the concept of removing sensitive data from history (don't run destructively)

"If you find sensitive data in your git history — a leaked credential, a large file that was committed and then deleted — the file is still in the history. To truly remove it, you'd use `git filter-repo`, which rewrites the git history. This is a destructive operation — it changes commit hashes, so coordinate with your team. I won't run it here, but the documentation is excellent."

> **🖥️ DEMO STEP 6: Show repository archival**
> Navigate to: **Settings → Danger Zone → Archive this repository**, explain the concept

"Finally, for repos that are no longer active — archive them. Archiving makes the repo read-only, adds an 'Archived' badge, and signals to everyone that this codebase is no longer maintained. It doesn't delete anything — you can unarchive later if needed."

> **🖥️ DEMO STEP 7: Show archived repo badge**
> Show what an archived repository looks like with the "Archived" badge

"Here's what an archived repo looks like — the 'Archived' badge is prominently displayed, and all write operations are disabled. It's still fully readable and cloneable."

"That's Lab 14. Repository hygiene is an ongoing admin responsibility — check sizes, clean branches, and archive what you no longer need. Any questions?"

---

## ⏱️ [2:55] Privacy, Licenses, and Wrap-Up (5 minutes)

> **🖥️ SLIDE SOURCE: Main PowerPoint — Slides 68–69 (verbal overview only)**

### 📋 Stage Direction

- Switch back to the Main PowerPoint
- Navigate to **PPT Slide 68** (Marketplace section title)
- This is a very brief verbal-only section — 2 minutes max
- Marketplace and repo health are already covered by Labs 11 and 14

### 🎤 Script

> **🖥️ Main PowerPoint — Slide 68: Marketplace Section Title**

> **🖥️ ADVANCE to PPT Slide 69: Marketplace**

"We already covered Marketplace governance in Lab 11 and repo health in Lab 14, so let me just touch on two quick topics."

"**User privacy and data residency.** GitHub Enterprise Cloud offers data residency options for organizations with regulatory requirements. Profile visibility and contribution graphs are configurable. Your reference card has links to the full documentation."

"**Licenses and billing.** GHEC uses seat-based licensing — every member and outside collaborator consuming a seat counts toward your bill. Actions minutes and Packages storage are metered separately. A quick tip: run dormant user reports regularly and reclaim unused seats."

---

## ⏱️ [2:57] Wrap-Up, Assessment, and Next Steps (3 minutes)

> **🖥️ SLIDE SOURCE: Main PowerPoint — Slides 70–71**

### 📋 Stage Direction

- Navigate to **PPT Slide 70** (Q&A)
- Have the post-workshop assessment link and reference card link ready to paste in chat
- Be ready to close out with energy and clear next steps

### 🎤 Script

> **🖥️ Main PowerPoint — Slide 70: Q&A**

"Before I share next steps, let me pause for any questions. We covered a lot today — repository governance, rulesets, security scanning, push protection, GHAS cost optimization, the API and authentication methods, Actions, automation, and more. We went through eleven live demos together, bringing our total across both days to all fifteen labs."

"Any questions about anything we covered today or yesterday?"

*Pause for questions. Allow 1–2 minutes. If no questions, move on.*

"Great. Let me share some key takeaways and next steps."

"Here are the **top five things to implement this week** when you get back to your organization:"

"**Number one:** Enable organization rulesets for branch protection. Start with your `main` branches. Require pull requests and at least one review."

"**Number two:** Configure secret scanning and push protection org-wide using Security Configurations. This is the single highest-impact security feature you can enable."

"**Number three:** Set up audit log streaming to your SIEM. You covered this in Day 1, and it's critical for compliance and incident response."

"**Number four:** Review and optimize permission levels. Apply the principle of least privilege. Audit who has admin access and whether they need it."

"**Number five:** Automate user provisioning with SCIM. If you're not already using it, this eliminates manual user management and keeps your identity provider in sync with GitHub."

"I'm posting two links in chat right now."

> **📋 ACTION: Post in chat:**
> 1. Post-Workshop Assessment link
> 2. Reference Card link

"The first is the **Post-Workshop Assessment**. It has a confidence checklist for all the Day 2 outcomes — repository governance, rulesets, security, API, automation. Rate yourself on each one. It also has a workshop quality feedback section — your feedback helps us improve this training."

"The second is the **Reference Card** — a quick-reference guide with key URLs, gh CLI commands, permission levels, audit log events, and decision matrices. Bookmark it. It's designed to be the thing you pull up when you need a quick answer."

"All lab files remain available in the repository for self-paced review. I'd encourage you to work through any labs you want to explore further on your own, especially the ones where you'd like to practice the CLI commands yourself."

"I want to leave you with one final exercise."

> **📝 ACTION PLANNING PROMPT**

"Take 60 seconds right now — grab a pen, open a note — and **write down three things you will do in the next 30 days** based on what you learned in this workshop. Be specific. Not 'improve security' but 'enable push protection on all repos in the production org by end of next week.'"

*Pause for 60 seconds.*

"Would anyone like to share one of their action items?"

*Allow 1–2 volunteers to share.*

> **🖥️ ADVANCE to PPT Slide 71: Thank You**

"Thank you all for your time and engagement over these two days. GitHub administration is a big surface area, and you've all made great progress. Remember — everything we covered is in the reference card and lab docs, so you can always come back and review."

"If you have questions after the workshop, reach out to your GitHub account team or post in the GitHub Community Discussions. And don't forget to complete that assessment — your feedback genuinely shapes how we run this training."

"Thank you, and happy administrating!"

---

## 📎 Appendix A: Knowledge Check Questions (Optional Use)

> Use these during transitions, after labs, or during the wrap-up if time allows.
> Pick 2–3 per section. Read the question, pause, and invite answers.

### Repository Permissions

**Q:** "200 developers, all should read any repo, only push with explicit access. What base permission?"
**A:** Read — it provides visibility without write access.

**Q:** "Team lead needs to manage branch protection but not delete the repo. What do you do?"
**A:** Create a custom repository role with "edit repository rules" permission.

### Rulesets

**Q:** "What's the recommended modern approach for branch protection?"
**A:** Repository rulesets — they support org-level scope, bypass actors, layering, and evaluate mode.

**Q:** "Repo ruleset requires 1 review. Org ruleset requires 2. How many reviews are needed?"
**A:** 2 — the most restrictive rule applies.

**Q:** "How do you test a new org ruleset without enforcing it?"
**A:** Set the ruleset status to Evaluate — it logs what would be blocked without blocking.

### Security

**Q:** "How do you prevent developers from pushing secrets like API keys or connection strings to your repos?"
**A:** Secret scanning with push protection — it detects over 200 token types including Azure, GitHub, and third-party provider secrets.

**Q:** "What's the difference between secret scanning alerts and push protection?"
**A:** Alerts notify after the push; push protection blocks before the push.

**Q:** "How would you roll out CodeQL across 300 repos?"
**A:** Default setup at the organization level via Security Configurations.

### API and Authentication

**Q:** "Most efficient API approach to get repos with their last commit?"
**A:** Both GraphQL and `gh repo list` are efficient for this.

**Q:** "How do you verify a webhook payload is genuinely from GitHub?"
**A:** HMAC signature verification via the `X-Hub-Signature-256` header.

### Actions and Automation

**Q:** "What's the advantage of the Check Runs API over the Commit Status API?"
**A:** Rich output with annotations, markdown summaries, and line-level detail.

**Q:** "How would you automate creation of 50 repos with standardized settings?"
**A:** `gh repo create` in a shell script — loop through a config file and create each repo.

---

## 📎 Appendix B: Timing Recovery Guide

| Situation | Action |
|-----------|--------|
| **5+ minutes behind** after rulesets demos | Shorten security presentation by skipping GHAS cost slides (17–23); mention cost optimization verbally in 2 min |
| **5+ minutes behind** after security demo | Shorten API section to slides 51, 52, 54, 61 only (skip OAuth, Deploy Keys, Machine Users detail) |
| **10+ minutes behind** at any point | Abbreviate demo steps — show only the 2–3 most important steps per lab demo instead of the full walkthrough |
| **Ahead of schedule** | Add discussion time after demos; ask knowledge check questions; explore additional features in demos |
| **Participant has a question during demo** | Address briefly during the demo, offer to follow up in break or after the session if it's complex |

---

## 📎 Appendix C: Slide Source Quick Reference

| Time Block | Slides | Source | Topic |
|-----------|--------|--------|-------|
| 0:00–0:05 | PPT 46 | Main PowerPoint | Welcome / Repository section title |
| 0:05–0:20 | PPT 46–49 | Main PowerPoint | Repository governance |
| 0:28–0:43 | Supp 1–8 | Day 2 Supplement (browser) | Rulesets deep dive |
| 1:13–1:28 | Supp 9–16 | Day 2 Supplement (browser) | Security scanning & protection |
| 1:40–1:50 | Supp 17–23 | Day 2 Supplement (browser) | GHAS cost optimization |
| 1:50–2:00 | PPT 50–54 | Main PowerPoint | API and authentication (Part 1) |
| 2:13–2:18 | PPT 55–61 | Main PowerPoint | Auth methods deep dive (Part 2) |
| 2:18–2:25 | PPT 62–67 | Main PowerPoint | Actions and policies |
| 2:25–2:28 | Supp 24–27 | Day 2 Supplement (browser) | gh CLI and automation |
| 2:53–2:56 | PPT 68–69 | Main PowerPoint | Privacy, licenses (brief) |
| 2:56–3:00 | PPT 70–71 | Main PowerPoint | Q&A and Thank You |

**Total slide source switches:** 7 (PPT → Supp → PPT[demo] → Supp → Supp → PPT → Supp → PPT → PPT)

## 📎 Appendix D: VBD Topic Coverage — Day 2

| Time | Section | VBD Topics |
|------|---------|------------|
| 0:05 | Repository Governance | 1.1 |
| 0:20 | Lab 4 Demo (Templates) | 1.1 |
| 0:28 | Rulesets Deep Dive | 1.2, 1.3, 1.4 |
| 0:43 | Lab 3 Demo (Rulesets) | 1.2, 1.3 |
| 0:53 | Lab 6 Demo (Advanced Rulesets) | 1.3, 1.4 |
| 1:13 | Security in the Cloud | 1.5 |
| 1:28 | Lab 7 Demo (Security) | 1.5 |
| 1:50 | API & Authentication | 2.8, 2.11 |
| 2:00 | Lab 5 Demo (API) | 2.8 |
| 2:08 | Lab 1 Demo (Webhooks) | 2.11 |
| 2:18 | Actions, Automation, Marketplace | 1.8, 2.4, 2.9, 2.10, 2.12 |
| 2:28 | Lab 2 Demo (Actions Settings) | 2.4 |
| 2:33 | Lab 13 Demo (Scripts/CLI) | 2.12 |
| 2:41 | Lab 11 Demo (Apps/Marketplace) | 1.8 |
| 2:46 | Lab 12 Demo (Deployments) | 2.10 |
| 2:51 | Lab 14 Demo (Unhealthy Repos) | 2.13, 2.14 |
| 2:55 | Privacy, Licenses | 1.6, 1.7 |
