# 🎤 Presenter Script — Day 1: Enterprise, Organization & Governance

> **Workshop:** GitHub Administration Training
> **Duration:** 180 minutes (3 hours)
> **Audience:** Enterprise owners, organization admins, repository admins (Level 300)
> **Delivery:** Remote, presentation + live demos

---

## 📖 How to Use This Script

You have **two screens**:

| Screen | Content |
|--------|---------|
| **Screen 1 (shared)** | Main PowerPoint deck — "Offering - GitHub Administration Training" |
| **Screen 2 (private)** | This script on your laptop/tablet |

You will also have **Day 1 Supplement slides** (`slides-day1-supplement.html`) open in a **browser tab** on Screen 1. When the script says **"SWITCH TO SUPPLEMENT"**, alt-tab from PowerPoint to the browser. When it says **"SWITCH BACK TO POWERPOINT"**, alt-tab back.

**Visual legend:**

| Icon | Meaning |
|------|---------|
| ⏱️ | Timing cue — elapsed time from workshop start |
| 🖥️ | Slide transition — advance or switch slide source |
| 📋 | Stage direction — action for you (not spoken) |
| 🎤 | Spoken script — read these words aloud |
| 💡 | Discussion prompt — pause and engage participants |
| 🧪 | Live demo transition — presenter drives while attendees watch |
| ☕ | Break |

---

## ⏱️ [0:00] Welcome & Introduction (10 minutes)

> **🖥️ SLIDE SOURCE: Main PowerPoint — Slide 1**

### 📋 Stage Direction

- Share your screen showing PPT Slide 1 (Title slide)
- Start the recording if applicable
- Have the chat window visible for questions
- Ensure participant list is accessible

### 🎤 Script

"Good morning everyone and welcome to the GitHub Administration training, presented by GitHub Professional Services. My name is [YOUR NAME] and I'll be your instructor for the next two days."

"Before we dive in, a few quick logistics. This session is being recorded so you can revisit anything we cover. Please keep your cameras on if you're comfortable — it helps with engagement. Use the chat for questions at any time, and I'll address them at natural pause points. If something is urgent, feel free to unmute."

"Let me do a quick round of introductions. I'd love to hear your name, your role, and one thing you're hoping to get out of this training. Who'd like to go first?"

> **📋 Stage Direction**
> - Allow 3-4 minutes for introductions
> - Take note of participant roles (enterprise owners, org admins, etc.) to tailor examples
> - If the group is large (10+), ask them to put introductions in chat instead

"Great, thank you. It's clear we have a range of experience levels and use cases in the room, which is exactly what makes this training valuable."

> **🖥️ ADVANCE to PPT Slide 2**

"Let me walk you through what we'll cover over these two days. Our objectives are to understand the differences between GitHub Enterprise Cloud and GitHub Enterprise Server, how permissions work across the enterprise hierarchy, enterprise policies and how they cascade, security access including SSO, SCIM, and IP allow-lists, authentication methods for integrations, licensing and billing, organization settings, team structures, repository organization, auditing, and how to find incorrect or risky configurations."

"Today — Day 1 — we'll focus on the enterprise and organization layers: platforms, permissions, enterprise policies, Copilot governance, org structure, teams, identity, and audit logging."

> **🖥️ ADVANCE to PPT Slide 3**

"Here's our Day 1 agenda. We'll start with the GitHub Enterprise overview — platforms, the permission flow, and enterprise administration. Then after our first lab and a break, we'll move into organization overview, administration and settings, teams, and wrap up with audit logging."

> **🖥️ ADVANCE to PPT Slide 4**

"Day 2 will cover everything on the repository side — repository settings, branch protections, rulesets, CODEOWNERS, the API, authentication methods for integrations, Actions, and the marketplace. But that's tomorrow — let's focus on today."

---

## ⏱️ [0:10] Environment Setup (5 minutes)

> **🖥️ SLIDE SOURCE: Main PowerPoint — Stay on Slide 4 (or minimize PPT)**

### 📋 Stage Direction

- Share the setup guide link in chat: point participants to `labs/setup.md`
- You can either keep PPT up or switch to show the setup page briefly

### 🎤 Script

"Before we get into the content, let's make sure everyone's environment is ready. I'm going to drop a link in the chat to our setup guide."

"You should have already forked or templated the workshop repository — `gh-abcs-admin` — into the workshop organization. Take a moment to verify three things:"

"First, run `gh --version` in your terminal and confirm you have the GitHub CLI installed. Second, run `gh auth status` and verify you're logged into github.com with the right account. Make sure your token scopes include `admin:org`, `repo`, and `workflow`. Third, run `git --version` to confirm Git is installed."

"Also, please note your workshop organization name — your instructor will have shared this. You'll use it as `YOUR-ORG` throughout the labs today."

"If you run into any issues — `gh` not found, authentication problems, network issues behind a corporate proxy — check the troubleshooting table in the setup guide or drop a message in chat and I'll help you sort it out."

> **📋 Stage Direction**
> - Give participants 2-3 minutes to verify
> - Watch chat for issues
> - Common problems: not logged in, missing org access, proxy blocking api.github.com
> - If someone is stuck, offer to help them in a breakout room during the first presentation section

"Is everyone set? Great. If you're still working through setup, don't worry — you can finish during the first presentation section. Our first lab isn't until about an hour from now."

---

## ⏱️ [0:15] Enterprise Overview (20 minutes)

> **🖥️ SLIDE SOURCE: Main PowerPoint — Slide 5**

### 📋 Stage Direction

- Advance to PPT Slide 5
- This section covers Slides 5-9
- Pace: approximately 4 minutes per slide

### 🎤 Script

> **🖥️ PPT Slide 5 — "GitHub Enterprise Overview"**

"Let's start with the big picture. This section covers GitHub's enterprise platforms, offerings, billing and plans. By the end, you'll understand the key differences between Cloud and Server, and be able to articulate which platform fits which use case."

> **🖥️ ADVANCE to PPT Slide 6**

"GitHub offers three main platform types. First, **GitHub Enterprise Cloud** — this is the SaaS offering. It's hosted by GitHub, supports both public and open source workflows, and is where most collaboration happens. Second, **GitHub Enterprise Server** — this is self-hosted. You run it on your own infrastructure, whether that's on-prem, in a private cloud, or in a VM. It's designed for organizations that need to keep everything behind their own network perimeter. And third, **GitHub Connect** — this bridges the two. It allows your Server instance to connect back to Cloud for things like unified search, dependency vulnerability updates, and Actions."

"All three platforms are secure. This is a common question — people assume Server is 'more secure' because it's on-premises. That's not necessarily true. Cloud has enterprise-grade security, SOC 2 compliance, encryption at rest and in transit, and dedicated security teams monitoring 24/7. The choice between Cloud and Server is really about data residency requirements, network policy, and operational preferences — not about one being inherently more secure than the other."

> **🖥️ ADVANCE to PPT Slide 7**

"Let's look at Enterprise Cloud in more detail. It's SaaS — meaning fast onboarding, reduced operational overhead, and GitHub handles infrastructure, upgrades, and availability. You don't need to patch servers or manage storage."

"With Cloud, public repositories are viewable by anyone on the internet, and private repositories are restricted to people you explicitly grant access. The key thing to understand is that privacy is configurable at every level of the hierarchy — enterprise, organization, team, and individual."

"User accounts on github.com belong to the individual — they bring their own account. The exception is Enterprise Managed Users, or EMUs, where the enterprise controls the accounts. We'll talk more about that when we get to identity management."

"One important update: GitHub Enterprise Cloud now offers **Data Residency**. The EU region went GA in October 2024, Australia in February 2025, and Japan in December 2025. You can choose to have your data hosted in one of these regions, and data residency customers get a dedicated namespace on `ghe.com` instead of `github.com`. This is a game-changer for organizations with strict data sovereignty requirements — check the docs for the latest region availability."

> **🖥️ ADVANCE to PPT Slide 8**

"Now, GitHub Enterprise Server. This is self-hosted — you can run it on AWS, Azure, GCP, VMware, Hyper-V, or bare metal. Because you're managing the infrastructure, there's additional configuration involved: things like subdomain isolation for security, outbound web proxies if you need Server to reach the internet, and storage management."

"User accounts on Server are isolated — they're corporate accounts that exist only on your instance. They're not tied to github.com accounts."

"Server has almost feature parity with Cloud — Actions, Packages, Secret Protection, Code Security — they're all available. The key difference is that Server requires you to manage upgrades. GitHub releases new versions roughly quarterly, and you need to plan upgrade windows."

"Two important notes about Copilot with Server: First, Copilot IDE features — code completions, chat, agent mode — work for GHES users as long as they're licensed via github.com. The Copilot service runs in the cloud regardless. Second, the Copilot coding agent — the cloud-based agent that works on issues and PRs directly on github.com — that requires Enterprise Cloud. It doesn't work with Server."

"If you need features from both worlds, GitHub Connect lets you bridge them — you can enable unified search across Cloud and Server, synchronize vulnerability alerts, and allow Server users to use GitHub Actions hosted runners."

> **🖥️ ADVANCE to PPT Slide 9**

"Let's talk billing and plans. This is where it gets nuanced, so stay with me."

"GitHub has several plan tiers. The key ones for enterprise customers are **GitHub Enterprise** — which is available as Cloud or Server — and then the add-on products that sit on top."

"It's important to distinguish between **plans** and **add-ons**. Your base plan gives you the platform. Add-ons give you additional capabilities that you pay for separately."

"A big change in early 2025: GitHub Advanced Security has been **unbundled** into two separate products. **Secret Protection** is $19 per committer per month — that gives you secret scanning and push protection. **Code Security** is $30 per committer per month — that gives you CodeQL code scanning, Dependabot security updates, and the security overview dashboard. Previously these were bundled together, so you can now adopt them independently based on your priorities."

"For Copilot, there are five tiers: **Free** at $0 with limited features, **Pro** at $10 per month for individual developers, **Pro+** at $39 per month for power users with expanded context and model selection, **Business** at $19 per user per month for organizations, and **Enterprise** at $39 per user per month which adds enterprise-wide policy enforcement, audit logs, and custom model support."

"The licensing model is per-user, per-month. A user consumes one license per enterprise, regardless of how many organizations they belong to. And many products now support pay-per-use metered billing — especially Actions, Packages, and Codespaces."

> **💡 DISCUSSION PROMPT** (1-2 minutes)
> Ask: "Quick check — is your organization currently on Enterprise Cloud or Server? And are you looking at any of the add-ons we just discussed — Secret Protection, Code Security, or Copilot? Just a quick show of hands or drop it in chat."

> **📋 Stage Direction**
> - Use responses to calibrate your examples for the rest of the day
> - If most are on Cloud, lean into Cloud examples; if Server, acknowledge Server differences as you go

---

## ⏱️ [0:35] Permission Flow (15 minutes)

> **🖥️ SLIDE SOURCE: Main PowerPoint — Slide 10**

### 📋 Stage Direction

- Advance to PPT Slide 10
- This section covers Slides 10-15
- Pace: approximately 2.5 minutes per slide
- This is a conceptual section — use the diagrams to anchor the discussion

### 🎤 Script

> **🖥️ PPT Slide 10 — "GitHub Enterprise — Permission flow"**

"Now let's talk about how permissions actually work across the GitHub hierarchy. This is one of the most important concepts for administrators to internalize, because getting permissions right is the foundation of everything else — security, compliance, collaboration."

"By the end of this section, you'll understand the differences between enterprise, org, team, and repo-level permissions. You'll know how to select the right roles, how repository visibility affects access, and how base permissions create your organization's default access posture."

> **🖥️ ADVANCE to PPT Slide 11**

"Here's the permission flow visualized. It starts at the top with the **enterprise**. Enterprise policies set the boundaries — they define what's allowed and what's enforced across all organizations. Then you have **organizations**, which have their own settings within those enterprise boundaries. Within organizations, you have **teams** that group people and assign permissions. And at the bottom, you have **repositories** where the actual work happens."

"The flow is top-down. Enterprise policies cascade to organizations, org settings cascade to repositories. At each level, you can have different roles — enterprise owners, org owners, team maintainers, repo admins."

"Let me call out a few key concepts. First, **licenses** are managed at the enterprise level. A user consumes one license regardless of how many orgs they're in. Second, **policies** set at the enterprise level can either be enforced — meaning organizations cannot override them — or they can be delegated, meaning organizations get to choose. Third, **outside collaborators** are a special category — they have access to specific repositories but are not organization members. They do consume a license seat if they have access to any private or internal repository, so track them carefully."

> **🖥️ ADVANCE to PPT Slide 12**

"This slide shows what happens when you have multiple organizations. Each organization has its own parallel permission model — its own settings, its own teams, its own repositories. But they all inherit from the same enterprise policies."

"This is why we generally recommend having **as few organizations as possible** — ideally just one. When you have multiple orgs, you create silos. Teams can't easily collaborate across org boundaries, you have to manage settings in multiple places, and your permission model becomes harder to reason about."

"That said, there are valid reasons for multiple orgs — open source vs. internal code, regulatory separation, acquisition integration. Just know that each additional org adds administrative complexity."

> **🖥️ ADVANCE to PPT Slide 13**

"Now let's talk about **repository visibility**. This is one of the most commonly misunderstood settings. There are three visibility levels."

"**Public** — anyone on the internet can see this repository. This is for open source projects and public documentation. **Internal** — this is available only on Enterprise plans. Any member of any organization in your enterprise can see the repository. This is the sweet spot for innersource — code sharing within the company. **Private** — only people with explicit access can see this repository. Access must be granted directly or through a team."

"Internal visibility is one of the key benefits of having an Enterprise plan. It enables innersource without making code public. If you're not using internal repositories yet, I'd encourage you to consider them."

"One thing to note: **Rulesets** — which went GA in July 2023 — are the modern replacement for branch protection rules. We'll dive deep into rulesets tomorrow on Day 2, but I want to plant that seed now. If you're currently using branch protection rules, rulesets give you more flexibility, better inheritance, and the ability to manage protections across repositories from a single location."

> **🖥️ ADVANCE to PPT Slide 14**

"Repository visibility and **base permissions** work together to create your organization's default access posture. Let me walk through this matrix."

"Base permissions define what every organization member gets by default on every repository. Your options are: **No permission**, **Read**, **Write**, or **Admin**."

"Cross that with visibility — Public, Internal, Private — and you get different outcomes. For example, if your base permission is Read and a repository is Internal, every member in the enterprise can read it. If base permission is No Permission and the repository is Private, nobody gets access unless explicitly granted through a team or direct assignment."

"The typical enterprise setup is **No Permission** as the base, with Internal visibility for shared repositories and Private for restricted ones. This follows least privilege — nobody gets access they didn't explicitly receive. Teams then grant the specific access people need."

"If you set base permissions to Write or Admin, you're effectively giving every org member the ability to push code to every repository. That's almost never what you want in an enterprise setting."

> **🖥️ ADVANCE to PPT Slide 15**

"Let's look at the specific **permission roles** available at the repository level. There are five built-in roles, from least to most permissive."

"**Read** — clone, pull, view issues and PRs, comment. This is your baseline for visibility. **Triage** — everything in Read, plus the ability to manage issues and pull requests — label them, close them, reopen them, mark as duplicate. This is great for project managers or support teams who need to organize work but don't need to touch code. **Write** — everything in Triage, plus push to non-protected branches and merge pull requests. This is your standard developer role. **Maintain** — everything in Write, plus some repository settings like managing topics, wikis, Pages, and webhooks. This is for team leads who need to manage repo configuration without full admin access. **Admin** — full control. Manage access, branch protections, destructive actions like deletion. Reserve this for repository owners and leads."

"Choose roles carefully. The most common mistake I see is giving everyone Admin when Write or Maintain would suffice. The principle of least privilege applies here — give people the minimum access they need to do their job."

> **💡 DISCUSSION PROMPT** (1-2 minutes)
> Ask: "What base permission does your organization currently use? And have you mapped out which teams get which role levels? Drop your answers in chat."

---

## ⏱️ [0:50] Enterprise Administration (15 minutes)

> **🖥️ SLIDE SOURCE: Main PowerPoint — Slide 16**

### 📋 Stage Direction

- Advance to PPT Slide 16
- This section uses PPT Slide 16-17 plus Day 1 Supplement Slides 1-6
- You will switch between PowerPoint and the browser during this section

### 🎤 Script

> **🖥️ PPT Slide 16 — "GitHub Enterprise — Enterprise administration"**

"Now we're going to go through enterprise administration in detail. This is where we look at the actual settings and policies you'll be managing as an enterprise administrator. We're going to walk through enterprise policies, how they cascade, and then focus specifically on Copilot governance — because that's a topic on everyone's mind right now."

"The enterprise admin console has several key areas: Organizations, People, Policies, GitHub Connect, Settings, and Compliance. Each of these tabs controls a different aspect of your enterprise."

> **🖥️ ADVANCE to PPT Slide 17 — Enterprise Admin Demo**

"This slide is our anchor point for a live walkthrough. Normally I'd demo this live in the enterprise console, but let me walk you through what you'd see in each tab."

"Under **Organizations**, you see every org in your enterprise. You can create new ones, manage billing, and see member counts. Under **People**, you manage enterprise members, outside collaborators, and pending invitations. The **Policies** tab is where the real power is — this is where you enforce settings across all organizations. **Settings** covers things like authentication, audit log configuration, and billing. And **Compliance** is where you'll find reports like the dormant users report."

> **🖥️ 🔄 TRANSITION: Switch to Day 1 Supplement slides in your browser**
>
> **Open the browser tab with `slides-day1-supplement.html`. Navigate to Slide 1.**

"Now I want to go deeper on two topics that are critical for enterprise admins: policy inheritance and Copilot governance. I have some supplementary slides that go into more detail than what's in the main deck."

> **🖥️ SUPPLEMENT Slide 1 — "Enterprise Policies & Copilot Governance"**

"This section covers enterprise policy inheritance, Copilot plans, organization policies, content exclusions, and seat management."

> **🖥️ ADVANCE to Supplement Slide 2 — "Policy Inheritance"**

"Policy inheritance is the mechanism that makes enterprise governance work at scale. The cascade flows from **Enterprise** to **Organization** to **Repository**."

"There are three modes for any enterprise policy. **Enforced** — this creates a mandatory baseline. Organizations cannot override it. Think of it as a compliance floor — a minimum standard that every org must meet. **No Policy** or **Allowed** — this delegates the decision to organizations. The enterprise says 'I'm not going to mandate this; each org can decide for themselves.' And **Disabled** — this blocks the capability enterprise-wide. No organization can enable it."

"The critical rule to remember: **child entities can only add restrictions, never relax them**. If the enterprise enforces a policy, an organization can make it stricter, but it cannot make it more permissive. This is what creates your compliance floor."

"For example, if the enterprise enforces that repositories cannot be public, no organization can create a public repository — even if the org owners want to. But if the enterprise allows organizations to choose, one org might permit public repos while another blocks them."

> **🖥️ ADVANCE to Supplement Slide 3 — "Copilot Plans Overview"**

"Let's look at the Copilot plans in detail, because this directly affects how you govern AI usage in your enterprise."

"There are five tiers. **Free** at zero cost — this gives individual developers basic access with limited completions. **Pro** at $10 per month — expanded individual access. **Pro+** at $39 per month — power-user individual features. These first three are individual plans — they're not managed by the enterprise."

"The two that matter for enterprise governance are **Business** at $19 per user per month and **Enterprise** at $39 per user per month. Both include IP indemnification — which means GitHub indemnifies you against IP claims related to Copilot suggestions. Both include code review, the cloud coding agent, and agent mode in the IDE."

"The key difference: Enterprise adds **enterprise-wide policy enforcement**, audit logs for Copilot events, and the ability to bring your own LLM keys. If governance and compliance are priorities — and for most organizations they should be — Enterprise is the tier you want."

> **🖥️ ADVANCE to Supplement Slide 4 — "Copilot Organization Policies"**

"Now let's look at the specific policies you can configure at the organization level. These fall into two categories."

"First, **Feature Policies** — these control access to Copilot capabilities. You can enable or disable Copilot access overall, code completions, Copilot Chat, and code review. Each of these has three states: Enabled, Disabled, or Unconfigured."

"Second, **Security-Sensitive Policies** — these are the ones that need careful consideration. **Public code matching** — when enabled, Copilot can suggest code that matches publicly available code on GitHub. My recommendation: **block this** unless you have explicit legal guidance that it's acceptable. **Cloud agent** — this is the coding agent that runs on GitHub.com and can make changes to your repositories. **Disable this until your security team has reviewed it.** **Agent mode** — this is the agentic coding capability in the IDE. Similar guidance: disable until reviewed. **MCP servers** — Model Context Protocol servers allow Copilot to connect to external tools and data sources. Again, disable until reviewed."

"The best practice here is clear: **configure ALL policies explicitly**. Don't leave anything as Unconfigured. An unconfigured policy might default to a state you didn't intend, and it makes your governance posture ambiguous."

> **🖥️ ADVANCE to Supplement Slide 5 — "Content Exclusions"**

"Content exclusions let you prevent Copilot from accessing specific files. You define glob patterns, and Copilot will not read those files for context or generate suggestions based on them."

"Common patterns to exclude: `.env` files — these often contain secrets and connection strings. `secrets/**` — any directory called secrets. `*.pem` and `*.key` — certificate and key files. `terraform.tfvars` — Terraform variable files that often contain sensitive infrastructure configuration."

"Two important operational details. First, exclusions take **up to 30 minutes to propagate** to IDE clients. If you add an exclusion, developers won't see the effect immediately. Second — and this is critical — **content exclusions do NOT apply to Copilot CLI, the coding agent, agent mode, or Edit mode**. This is a known gap. If a developer uses Copilot in the terminal or through the coding agent, the exclusion patterns are not enforced. Make sure your security team understands this limitation — if exclusion compliance is critical, disable those features separately."

"Enterprise-level exclusions apply to ALL users across all organizations. They cannot be overridden at the org level. This is your strongest governance tool for keeping sensitive files out of AI context."

> **🖥️ ADVANCE to Supplement Slide 6 — "Seat Management"**

"Finally, let's talk about managing Copilot seats — because at $19 to $39 per user per month, costs add up quickly."

"You have several assignment methods. **All members** — every org member automatically gets a seat. Simple, but expensive. **Selected members** — you manually assign seats to specific people or teams. This is the right approach for a phased rollout. **Direct enterprise assignment** — assign seats at the enterprise level. And **self-service** — let users request their own seats."

"For cost optimization, the most important lever is **seat reclamation**. GitHub can automatically reclaim seats from users who haven't used Copilot in 30 or more days. Enable this. It prevents you from paying for unused seats."

"My recommendation for a Copilot rollout: start with selected members. Pick two or three pilot teams. Enable automatic seat reclamation. Set up content exclusion rules before you turn Copilot on. Monitor adoption using the Copilot usage metrics API. Then expand based on data."

"You can monitor seat usage programmatically through the API — I'll show you that in the demo."

> **💡 DISCUSSION PROMPT** (1-2 minutes)
> Ask: "How is your organization thinking about Copilot governance? Are you already using Copilot Business or Enterprise? What policies are you most concerned about? Let's hear from a few of you."

> **📋 Stage Direction**
> - Allow 1-2 minutes for discussion
> - Common concerns: public code matching, security of suggestions, cost management
> - Bridge to the lab: "Great questions. Let me show you all of these settings live."

---

## ⏱️ [1:05] Live Demo: Lab 15 — Copilot Governance Configuration (15 minutes)

> **🖥️ SLIDE SOURCE: Day 1 Supplement — Slide 7**

### 📋 Stage Direction
- This is a LIVE DEMO — you are driving, attendees watch your screen
- Have your organization's Copilot settings page open and ready
- Have a terminal window open alongside the browser
- Keep terminal and browser both accessible for quick switches

### 🎤 Script

"Instead of having you all work through this lab individually, I'm going to walk through it live so we can discuss each step together."

> **🖥️ DEMO STEP 1: Copilot Organization Policies**
> Navigate to: **Organization > Settings > Copilot**

"Let me pull up the Copilot settings for our organization. Here under Settings, you'll see the Copilot section. These are the policy toggles we just discussed."

"Here's **Access** — who can use Copilot. **Public code matching** — whether Copilot can suggest code matching public repositories. Notice it's currently set to Blocked — that's the recommendation. **Cloud agent** — the coding agent that runs on GitHub.com. **Code review** — whether Copilot can review pull requests. **Agent mode** — the agentic coding capability in the IDE. And **MCP servers** — Model Context Protocol connections to external tools."

"The key takeaway: configure ALL of these explicitly. Don't leave anything as Unconfigured."

> **🖥️ DEMO STEP 2: Content Exclusions**
> Navigate to: **Copilot > Content exclusion** → Click **Add exclusion**

"Now let's look at content exclusions. I'll click Add exclusion to show you how this works."

"You define glob patterns to prevent Copilot from accessing specific files. Let me add a few common patterns: `**/*.env` — this blocks all `.env` files in any directory. `**/secrets/**` — this blocks anything in a secrets directory. `**/config/production/**` — this blocks production configuration files."

"Remember what I said earlier: these exclusions take up to 30 minutes to propagate to IDE clients, and they do NOT apply to Copilot CLI, the coding agent, or agent mode. That's a critical limitation."

> **🖥️ DEMO STEP 3: Seat Assignment**
> Navigate to: **Copilot > Access**

"Here's the Access page where you manage seat assignments. You can see the assignment options — All members, Selected members, or Disabled. And down here is the usage summary showing how many seats are assigned versus active."

"This is where automatic seat reclamation shows up. If a user hasn't used Copilot in 30 days, the seat can be automatically reclaimed."

> **🖥️ DEMO STEP 4: API — Billing Seats**
> In terminal, run:
> `gh api /orgs/YOUR-ORG/copilot/billing/seats --paginate --jq '.seats[] | [.assignee.login, .last_activity_at, .plan_type] | @tsv'`
>
> **⚠️ Note:** This endpoint requires the `manage_billing:copilot` scope. If you get a 403, re-authenticate with `gh auth login` and ensure the token has billing permissions.

"Now let me switch to the terminal and show you how to query this programmatically. This command lists every Copilot seat — who has it, when they last used it, and their plan type."

"Look at the `last_activity_at` column. Anyone with a date more than 30 days ago is a candidate for seat reclamation. This is the data you'd use to build a monthly usage report."

> **🖥️ DEMO STEP 5: API — Usage Metrics**
> In terminal, run:
> `curl -s "$(gh api "/orgs/YOUR-ORG/copilot/metrics/reports/organization-1-day?day=$(date -d yesterday +%Y-%m-%d)" --jq '.download_links[0]')" | jq '{day, daily_active_users, code_generation_activity_count, code_acceptance_activity_count}'`
>
> **⚠️ Note:** The legacy `/copilot/metrics` endpoint was removed April 2026. The new API returns a download link; the command above fetches it in one step. On macOS, replace `date -d yesterday` with `date -v-1d`.

"This second command pulls usage metrics from the new Copilot metrics reports API. It grabs yesterday's daily report — active users, code generation count, and acceptance count. You can download the full report for detailed per-IDE and per-feature breakdowns. This is what you'd use in an executive dashboard."

> **🖥️ DEMO STEP 6: Audit Log for Copilot Events**
> Navigate to: **Settings > Audit log** → filter by `action:copilot`

"Finally, let me show you the audit log filtered for Copilot events. I'll type `action:copilot` in the search bar. You can see policy changes, seat assignments, and other Copilot-related events all tracked here."

"That's Lab 15. Any questions about Copilot governance before we take our break?"

> **📋 Stage Direction**
> - Take 1-2 questions, then transition to break
> - Don't let the Q&A run long — the break is next

---

## ⏱️ [1:20] Break (10 minutes)

> **🖥️ SLIDE SOURCE: You may minimize slides or show a "Break" holding slide**

### 🎤 Script

"Great work this morning. Let's take a 10-minute break. We'll reconvene at [CLOCK TIME]. When we come back, we'll shift from enterprise-level topics to the organization layer — how orgs are structured, identity and SSO, and team management."

"Grab some coffee, stretch, and I'll see you back in 10."

> **📋 Stage Direction**
> - Mute yourself
> - Prepare PPT Slide 18 for when you return
> - Switch back from the supplement browser tab to PowerPoint
> - Review chat for any unanswered questions from the first half
> - At 9 minutes, unmute: "One minute until we resume."

---

## ⏱️ [1:30] Organization Overview (15 minutes)

> **🖥️ SLIDE SOURCE: Main PowerPoint — Slide 18**
>
> **🔄 TRANSITION: Switch back to Main PowerPoint if you're still on the supplement slides**

### 📋 Stage Direction

- Advance to PPT Slide 18
- This section covers Slides 18-31
- Pace: move briskly — approximately 1 minute per slide for the concept slides
- These slides are highly visual; let the diagrams do the work

### 🎤 Script

> **🖥️ PPT Slide 18 — "Organization — Overview, Administration and settings"**

"Welcome back everyone. We're now shifting from the enterprise layer down to the **organization** layer. We'll cover how organizations fit into the enterprise hierarchy, how users and namespaces work, SSO and identity, and then team structures."

> **🖥️ ADVANCE to PPT Slide 19**

"Let's anchor ourselves. Everything in GitHub exists within the enterprise. Every enterprise customer has an enterprise account at `github.com/enterprises/` followed by your enterprise slug. This is managed by enterprise owners — a small group of administrators who control enterprise-wide settings and policies."

> **🖥️ ADVANCE to PPT Slide 20**

"Users belong to individuals. On github.com, accounts are personal — they belong to the person, not the company. Your developer's GitHub account is theirs. They had it before they joined your company, and they'll have it after they leave."

"The exception is **Enterprise Managed Users** — EMU accounts belong to the enterprise. The enterprise provisions them, controls them, and deprovisions them. EMU accounts cannot interact with public repositories or contribute to open source — they're fully managed corporate identities."

"On GitHub Enterprise Server, accounts are also corporate and isolated — they exist only on your instance."

> **🖥️ ADVANCE to PPT Slide 21**

"Organizations have their own namespace. Your enterprise can have one or more organizations, and each org has its own URL namespace — `github.com/your-org-name`."

"Organizations inherit policies from the enterprise, share the enterprise license pool, bill against the enterprise account, and have access to all enterprise features."

"And here's my first strong recommendation of the day: **have as few organizations as possible**. Ideally, just one. I'll explain why in a moment."

> **🖥️ ADVANCE to PPT Slide 22**

"Users can own repositories directly. User repos live at `github.com/username/repo-name`. Access to user-owned repos is given through the outside collaborator mechanism. These repos are outside of organizational governance — they don't inherit org policies or team permissions."

> **🖥️ ADVANCE to PPT Slide 23**

"Organizations can own repositories. Org repos live at `github.com/org-name/repo-name`. This is where you want your company's code. Org-owned repos benefit from org policies, team-based access, internal visibility, and enterprise governance."

"Organizations are silos — they're isolated from each other. A repository in Org A is not visible to members of Org B, unless the member belongs to both orgs and the repo is accessible."

> **🖥️ ADVANCE to PPT Slide 24**

"Users can be members of organizations. When a user joins an org, they consume one enterprise license. They can be a **member** — which gives them access based on org settings and team membership — or an **outside collaborator** — which gives them access to specific repositories without full org membership."

> **🖥️ ADVANCE to PPT Slide 25**

"Users can be members of multiple organizations. This is common in enterprises with several orgs — for example, one org for open source work and another for private internal projects."

"An important nuance: **enterprise owners are not automatically owners of organizations**. Being an enterprise owner gives you control over enterprise policies and billing, but to manage a specific organization, you need to be an owner of that organization separately."

> **🖥️ ADVANCE to PPT Slide 26**

"When SAML SSO is configured, organization content is protected by double authentication. A user must authenticate to GitHub first, and then authenticate through your identity provider. This applies to web access, API access — everything."

"Here's the key security implication: when SSO is enforced, **personal access tokens and SSH keys must be explicitly authorized** for the organization. A developer can't just create a PAT and access your org's repos — they have to go through an authorization step that links the PAT to their SSO session."

"My recommendation: **enforce SSO and require 2FA**. This gives you two layers of authentication and ensures that your identity provider is the gatekeeper for all access to your organization's code."

> **🖥️ ADVANCE to PPT Slide 27**

"Teams exist within organizations. Teams serve two purposes: they **manage permissions** by granting groups of people access to repositories, and they **facilitate communication** by enabling @mentions to notify groups."

> **🖥️ ADVANCE to PPT Slide 28**

"Teams apply permissions and group repositories. People belong to multiple teams, teams group related projects, and this structure helps with both access management and security auditing."

"For example, a developer might be on the `frontend` team and the `design-system` team. Each team grants access to different repositories with different permission levels. When the developer leaves the company, removing them from their teams revokes all their repository access in one step."

> **🖥️ ADVANCE to PPT Slide 29**

"Teams also facilitate communication through @mentions. When you mention `@org/team-name` in an issue, PR, or comment, every member of that team gets notified. This is incredibly useful for code reviews, incident response, and cross-team collaboration."

"For example, `@blue/java` notifies the Java team in the Blue org, `@purple/js` notifies the JavaScript team in the Purple org. Teams make communication targeted and efficient."

> **🖥️ ADVANCE to PPT Slide 30**

"But here's the challenge. How do users participate in discussions **across** organizations? If your Java developers are spread across three organizations, how do they collaborate?"

"The answer is: it's hard. Organizations are silos. Communication is easy within an org but not across orgs. You can't @mention a team in a different organization. You can't easily share internal repositories across org boundaries."

> **🖥️ ADVANCE to PPT Slide 31**

"This is exactly why we recommend **having as few organizations as possible**. Many large enterprises run with just one organization. We've seen insurance companies with 3,800 users in a single org. Drug manufacturers with 2,000+ users in a single org. It works."

"Within that single org, use **teams** to model your corporate structure. Top-level teams for business units or divisions. Child teams for departments. Grandchild teams for specific project groups."

"Combine that with well-managed permissions, SSO and 2FA enforcement, and you have a governance model that's both secure and manageable. Multiple orgs should be reserved for genuine isolation requirements — regulatory separation, open source vs. proprietary, or M&A integration."

> **💡 DISCUSSION PROMPT** (1-2 minutes)
> Ask: "How many organizations does your enterprise currently have? And if you have more than one, what's driving that decision? Is it a regulatory requirement, or is it something you inherited?"

---

## ⏱️ [1:45] Organization Administration — Teams (15 minutes)

> **🖥️ SLIDE SOURCE: Main PowerPoint — Slide 32**

### 📋 Stage Direction

- Advance to PPT Slide 32
- This section covers Slides 32-38
- This is the last presentation section before Lab 9

### 🎤 Script

> **🖥️ PPT Slide 32 — "Organization — Administration and settings"**

"Now let's go deeper into organization administration, specifically team management. This is the operational heart of how you manage access at scale."

> **🖥️ ADVANCE to PPT Slide 33**

"Here's what the organization page looks like. You have your **Repositories** — the list of all repos. **Packages** — container images and other packages published by the org. **Organization information** — the profile, description, and settings. **People** — members, outside collaborators, pending invitations. And **Teams** — the groups that manage access and communication."

"As an org admin, you'll spend most of your time in People and Teams. These are the levers you use to control who has access to what."

> **🖥️ ADVANCE to PPT Slide 34**

"Why use teams? Four reasons."

"**Collaboration** — teams make it easy to work together on shared projects. Instead of adding individuals to repositories one by one, you add a team. **Innersource** — teams enable code sharing across the organization. A team can @mention another team to ask for reviews or contributions. **Onboarding and offboarding** — when a new developer joins, add them to the right teams and they instantly have the right access. When they leave, remove them from teams and access is revoked everywhere. **Security** — teams give you a clear, auditable view of who has access to what. Instead of checking each repository's collaborator list, you check team membership."

> **🖥️ ADVANCE to PPT Slide 35**

"GitHub supports **nested teams** — parent teams with child teams. This lets you model your org chart directly."

"The rules are simple: parent teams can have multiple children. Children **inherit permissions** from their parents. Notifications flow downward — when you @mention a parent team, all child team members are notified. And users in a child team automatically belong to the parent team."

"So if the `engineering` team has Read access to a repository, and the `engineering-frontend` team has Write access, the frontend developers get Write — the higher of the two. A child team can never have fewer permissions than its parent."

> **🖥️ ADVANCE to PPT Slide 36**

"Here's the inheritance visualized. Permissions flow down from parent to children to grandchildren. If the parent has Read on a repository and a child has Write, the child's members get Write. The grandchild inherits from the child — and if the grandchild has no explicit permission, it inherits the child's Write."

"Notifications also flow down. If you @mention the parent, everyone in the hierarchy gets notified. Use this carefully in large organizations — mentioning a top-level team in a 500-person org means 500 notifications."

> **🖥️ ADVANCE to PPT Slide 37**

"Here are some best practices for structuring teams. Think about four categories."

"**Interest teams** — groups organized around technology or topic areas. A `java` team, a `security-champions` team, a `documentation` team. These are for communication and knowledge sharing. **Organizational unit teams** — mirror your org chart. Engineering, product, design. **Product teams** — organized around specific products or projects. The `payments-api` team, the `mobile-app` team. **All-employees team** — a single team that contains everyone, useful for org-wide announcements and for granting baseline Read access to internal repositories."

> **🖥️ ADVANCE to PPT Slide 38**

"Now let's talk about **Team Sync** — this is how you automate team membership using your identity provider."

"When Team Sync is enabled, you map a GitHub team to an IdP group — like a Microsoft Entra ID group or an Okta group. When a user is added to the IdP group, they're automatically added to the GitHub team. When they're removed from the IdP group, they're automatically removed from the GitHub team."

"This is the recommended approach for managing teams at scale. It makes your IdP the single source of truth for team membership. No more manual team management in GitHub — your HR and IT processes drive access."

"There are a couple of important limitations. Team Sync can't connect synced teams to a parent team — the parent/child relationship has to be managed manually in GitHub. And Team Sync is available for **Microsoft Entra ID** and **Okta**. If you're using PingFederate, Team Sync is available through EMU with SCIM provisioning."

"I'm going to demo all of this next — nested teams, permission assignment, and we'll discuss Team Sync configuration."

> **💡 DISCUSSION PROMPT** (1 minute)
> Ask: "Is your organization using SAML SSO today? Are you considering EMU? And are you using Team Sync or managing teams manually? Quick responses in chat."

---

## ⏱️ [2:00] Live Demo: Lab 9 — User and Team Administration (15 minutes)

> **🖥️ SLIDE SOURCE: Main PowerPoint — Stay on Slide 38 or minimize**

### 📋 Stage Direction
- This is a LIVE DEMO — you are driving, attendees watch your screen
- Have your organization open in the browser
- Have a test repository ready for permission assignment
- Keep terminal accessible for any CLI commands

### 🎤 Script

"Instead of having you all work through this individually, let me walk through it live so we can discuss each step together."

> **🖥️ DEMO STEP 1: Create Parent Team**
> Navigate to: **Organization > Teams > New team**

"I'll start by creating a parent team. I'll click New team, name it `engineering`, give it a description — 'All engineering staff' — and leave the visibility as Visible. I'll click Create team."

"Now we have our top-level engineering team. This is the anchor of our hierarchy."

> **🖥️ DEMO STEP 2: Create Child Teams**
> Navigate to: **Organization > Teams > New team** (repeat for each child)

"Now I'll create two child teams. First, `engineering-frontend` — and here's the key part: I set the Parent team to `engineering`. That creates the nesting. Let me do the same for `engineering-backend`, also nested under `engineering`."

> **🖥️ DEMO STEP 3: View Team Hierarchy**
> Navigate to: **Organization > Teams** tab

"Now look at the Teams tab. You can see `engineering` with an expand arrow. When I expand it, there are the two child teams nested underneath. This hierarchy is how permissions flow — parent to children, just like we discussed."

> **🖥️ DEMO STEP 4: Assign Repository Permissions**
> Navigate to: Repository **Settings > Collaborators and teams** → Add teams

"Now let me show how to assign repository permissions through teams. I'll go to a repository's Settings, then Collaborators and teams. I'll click Add teams."

"First, I'll add the `engineering` team with **Read** access. This gives everyone in engineering baseline Read access to this repository."

"Now I'll add `engineering-frontend` with **Write** access. Notice what happens — members of the frontend team get Write access because it's higher than the Read they inherit from the parent. The child team's permission wins when it's higher."

> **🖥️ DEMO STEP 5: Create Custom Repository Roles**
> Navigate to: **Organization > Settings > Repository roles**

"Now let me show custom repository roles. Under Organization Settings, there's a Repository roles section. I'll click Create a role."

"Let's create a `contractor` role. I'll start with the Read base role and add issue management permissions — create issues, edit issues, manage labels. This is perfect for contractors who need to participate in project management but shouldn't push code."

"And let me create one more — `security-reviewer`. I'll start with the Triage base role and add security alert permissions — view and dismiss security alerts, manage code scanning alerts. This role is for your security team members who need to review vulnerabilities across repositories."

"Each org can have up to **20 custom roles**, so you have plenty of room to model your organization's access patterns."

> **🖥️ DEMO STEP 6: Team Sync Discussion**

"One more topic: Team Sync. I can't demo a full IdP integration here, but let me explain how it works. You map a GitHub team to an IdP group — like a Microsoft Entra ID group. When someone is added to the IdP group, they're automatically added to the GitHub team. When they're removed from the IdP group, they're removed from the GitHub team."

"There's one important limitation: Team Sync can't connect synced teams to a parent team. The parent/child hierarchy has to be managed manually in GitHub. So even with Team Sync, you'll still manage the team structure — but membership is automated."

"That's Lab 9. Any questions about teams, permissions, or custom roles before we move on?"

> **📋 Stage Direction**
> - Take 1-2 questions
> - Key takeaway to emphasize: team-based access is always preferred over individual collaborator access
> - Transition to Audit Log section

---

## ⏱️ [2:15] Audit Log & Dormant User Management (10 minutes)

> **🖥️ 🔄 TRANSITION: Switch to Day 1 Supplement slides in your browser**
>
> **Navigate to Supplement Slide 8**

### 📋 Stage Direction

- Switch from PowerPoint to the browser
- Navigate to Supplement Slide 8
- This section uses Supplement Slides 8-12
- You have 10 minutes for this presentation, then live demos for audit log and dormant user management
- Move at a brisk pace — hit the key points and let the demos reinforce the details

### 🎤 Script

> **🖥️ SUPPLEMENT Slide 8 — "Audit Logging & Dormant User Management"**

"Our last presentation topic for Day 1 is audit logging and dormant user management. These are critical operational topics for any enterprise admin — you need to know what's happening in your environment and who's actually using their licenses."

> **🖥️ ADVANCE to Supplement Slide 9 — "Audit Log Overview"**

"The GitHub audit log captures a wide range of events across your enterprise: settings changes, membership changes, repository management actions, app permissions, Git events, authentication events, and billing events."

"The enterprise audit log aggregates events across ALL child organizations, giving you a single pane of glass for visibility. This is one of the key benefits of having an enterprise account."

"Retention is the critical detail. **Web events** — things like settings changes, membership changes, repo creation — these are retained for **180 days**. You can access them through the UI, the API, streaming, or export. **Git events** — clone, push, fetch operations — these are retained for only **7 days** and are available through the API only. Let me say that again: **Git events have only 7-day retention**. If you need to investigate who cloned a repository 10 days ago, that data is gone unless you're streaming."

"Also note: IP address disclosure is **off by default**. Enterprise owners must explicitly enable it if you want to see source IP addresses in audit log entries. This is a privacy consideration — make sure you have appropriate policies in place before enabling it."

> **🖥️ ADVANCE to Supplement Slide 10 — "Searching the Audit Log"**

"The audit log supports structured search using qualifiers. The key ones are: `action:` to filter by event type — like `action:repo.create` or `action:org.invite_member`. `actor:` to filter by who performed the action. `created:` to filter by date range. `repo:` to filter by specific repository. `operation:` to filter by operation type — create, update, delete. And `country:` to filter by geographic location if IP disclosure is enabled."

"Multiple qualifiers in a single query are AND'd together. So `action:repo.create actor:admin-user created:>2024-01-01` finds repo creation events by the admin user after January 1st."

"The default UI shows about 3 months of events, but remember, the full retention is 180 days. You can access older events through the API or by exporting to CSV or JSON."

> **🖥️ ADVANCE to Supplement Slide 11 — "Audit Log Streaming"**

"For long-term retention and real-time security monitoring, you need **audit log streaming**. This is an enterprise-level feature that forwards events to external systems."

"Supported targets include Amazon S3, Azure Blob Storage, Azure Event Hubs, Splunk, Google Cloud Storage, Datadog, and generic HTTPS endpoints. If you're using Microsoft Sentinel for SIEM, Azure Event Hubs is the ideal streaming target."

"Key operational details: events are delivered in compressed JSON format, with **at-least-once delivery** — meaning your consumer needs to handle potential duplicate events. If streaming is paused, events are buffered for up to 7 days. After 7 days, unbuffered events are dropped. GitHub performs health checks every 24 hours, and you have a 6-day window to fix a misconfigured stream before it's automatically disabled."

"Multi-endpoint streaming is now available in preview — you can send audit data to two destinations simultaneously."

> **🖥️ ADVANCE to Supplement Slide 12 — "Dormant Users"**

"Now let's talk about dormant users. A user is considered dormant after **30 days** without qualifying activity. This 30-day window is fixed — you can't change it."

"What counts as qualifying activity? SAML SSO authentication, creating or deleting repositories, pushing to internal repos via HTTPS, creating or closing issues and pull requests, commenting on issues and PRs, PR review comments, starring repositories, and joining an organization."

"What does NOT count? And this is the important part. **PAT-based access** does not count — including CI/CD pipelines. **SSH key-based Git operations** do not count. **GitHub App-based workflows** do not count. **Git operations on private repositories** do not count. **Reading or browsing without interaction** does not count. **Public repo activity outside the enterprise** does not count."

"This means a developer who pushes code every day via SSH will appear dormant. A CI/CD pipeline that uses a PAT to interact with repos — that activity doesn't count. You need to be aware of these gaps before you start reclaiming licenses based on the dormant users report."

"The dormant users report is available at **Enterprise → Compliance → Reports**. You can download it and identify users who may no longer need their enterprise license."

"My advice: before you remove someone's license based on the dormant report, send them a heads-up first. Give them a week to respond. Some of your 'dormant' users may actually be very active — they're just active in ways that don't register in the report."

> **💡 DISCUSSION PROMPT** (1 minute)
> Ask: "Are any of you currently monitoring dormant users? Have you run into the false-positive issue where active developers appear dormant? Share your experience in chat."

---

## ⏱️ [2:25] Live Demo: Lab 8 — Audit Log Exploration (10 minutes)

> **🖥️ SLIDE SOURCE: Day 1 Supplement — Slide 13**

### 📋 Stage Direction
- This is a LIVE DEMO — you are driving, attendees watch your screen
- Have your organization's audit log open and ready
- Have a terminal window open alongside the browser
- Keep terminal and browser both accessible for quick switches

### 🎤 Script

"Instead of having you work through this individually, let me walk through the audit log live so we can explore it together."

> **🖥️ DEMO STEP 1: Navigate the Audit Log UI**
> Navigate to: **Organization > Settings > Archives > Logs > Audit log**

"Here's the audit log for our organization. You can see the timeline view showing recent events. Each entry has an action, an actor — who did it — a timestamp, and additional context like which repository or team was affected."

"Notice the Export button up here — you can download this as CSV or JSON. For one-time investigations, this is often the fastest approach."

> **🖥️ DEMO STEP 2: Search with Filter Queries**
> In the search bar, type: `action:repo.create`

"Now let me show you the search syntax. I'll type `action:repo.create` — this filters to only repository creation events. You can see who created which repositories and when."

> Clear the search, then type: `actor:YOUR-USERNAME`

"If I search by `actor:` with my username, I can see everything I've done. This is useful for self-auditing or investigating a specific user's actions."

> Clear the search, then type: `created:>2026-03-01`

"And with `created:>2026-03-01`, I can filter by date range. You can combine these: `action:repo.create actor:admin-user created:>2026-03-01` — all repository creation events by a specific user after a certain date."

> **🖥️ DEMO STEP 3: Query the Audit Log API**
> In terminal, run:
> `gh api /orgs/YOUR-ORG/audit-log --method GET -F phrase='action:repo.create' -F per_page=5 --jq '.[] | {action, actor, created_at}'`

"Now let me show you the API. This command queries the audit log programmatically — same data, but you can script it, pipe it, and automate it."

"The `--jq` flag lets you extract specific fields. Here I'm pulling action, actor, and created_at. In production, you'd pipe this into a CSV or feed it to your monitoring system."

> **🖥️ DEMO STEP 4: Streaming and Retention Discussion**

"Two critical points about audit log operations. First, **retention**: web events are kept for 180 days, but Git events — clones, pushes, fetches — only 7 days. If you're not streaming to an external system, you're losing visibility into Git operations after just one week."

"Second, **streaming targets**: you can stream to Amazon S3, Azure Blob Storage, Azure Event Hubs, Splunk, Google Cloud Storage, Datadog, or generic HTTPS endpoints. If you're using Microsoft Sentinel, Azure Event Hubs is the ideal target. Make audit log streaming a priority for your enterprise."

"That's Lab 8. Let me continue with a related topic — dormant user management."

---

## ⏱️ [2:35] Live Demo: Lab 10 — Dormant User Management (10 minutes)

> **🖥️ SLIDE SOURCE: Day 1 Supplement — Stay on Slide 13 or minimize**

### 📋 Stage Direction
- This is a LIVE DEMO — you are driving, attendees watch your screen
- This lab was originally a self-paced extension lab; it now fits naturally after the audit log demo
- Have your organization's People tab and a terminal ready
- Pick a specific member username to use in the demo queries

### 🎤 Script

"While we're on the topic of visibility and monitoring, let me walk through dormant user management live. This is Lab 10 — it was originally a self-paced extension lab, but since we're doing live demos and we have the time, let's cover it now. It ties directly into what we just discussed about audit logging."

> **🖥️ DEMO STEP 1: Organization Members List**
> Navigate to: Organization **People** tab

"Here's the People tab for our organization. You can see every member listed with their role — Owner or Member — and their 2FA status. This is your starting point for understanding who's in your org."

"But the People tab doesn't tell you who's actually *active*. For that, we need to dig deeper."

> **🖥️ DEMO STEP 2: List Members via API**
> In terminal, run:
> `gh api /orgs/YOUR-ORG/members --paginate --jq '.[] | [.login, .id] | @tsv'`

"This command lists every member of the organization with their username and ID. This gives you the master list you'll work from."

> **🖥️ DEMO STEP 3: Check User Activity — Public Events**
> In terminal, run:
> `gh api /users/USERNAME/events/public --jq '.[0:3] | .[] | [.type, .created_at] | @tsv'`

"Now let's check if a specific user is actually active. This command pulls their recent public events — pushes, pull request events, issue comments. I'm showing the last 3 events so we can see what they've been doing and when."

"If this returns empty or shows events from months ago, that's a signal this user may be dormant."

> **🖥️ DEMO STEP 4: Check User Activity — Audit Log**
> In terminal, run:
> `gh api /orgs/YOUR-ORG/audit-log --method GET -F phrase='actor:USERNAME' -F per_page=5 --jq '.[] | {action, created_at}'`

"We can also check the audit log for this user's activity within our organization specifically. This shows their administrative actions — repo creation, team changes, settings modifications. Between public events and audit log entries, you can build a pretty complete picture of whether someone is actually using their account."

> **🖥️ DEMO STEP 5: Dormant User Report**

"In practice, you'd script this. Pull the member list, loop through each user, check their last activity date, and generate a `dormant-report.csv` with columns like username, last public event, last audit action, and a dormant flag for anyone inactive beyond your threshold."

"If you have enterprise access, there's an even easier path."

> **🖥️ DEMO STEP 6: Enterprise Dormant Users Report (Discussion)**

"At the enterprise level, navigate to **Enterprise > People** and use the **Dormant** filter. GitHub provides a built-in dormant users report that identifies anyone with no qualifying activity in the last 30 days. You can download this report directly."

"But remember the gotcha I mentioned earlier: users active via PAT or SSH may appear dormant. The dormant report only tracks certain activity types — SSO authentication, HTTPS pushes, creating repos, issues, PRs, and starring repos. PAT access, SSH operations, and GitHub App workflows do NOT count."

> **🖥️ DEMO STEP 7: Reclamation Workflow**

"So what do you do with dormant users? I recommend a 4-step workflow."

"**Step 1: Report** — Generate or download the dormant users report on a monthly cadence. **Step 2: Filter** — Remove known exceptions: service accounts, seasonal employees, users on leave. Cross-reference with your HR system. **Step 3: Notify** — Send the remaining users a heads-up. 'We noticed you haven't been active. If you still need your license, please respond within 7 days.' **Step 4: Reclaim** — After the notice period, downgrade or remove users who didn't respond."

"Don't skip the notification step. Some of your 'dormant' users are active developers who work entirely via SSH or PAT. Removing their access without warning creates support tickets and frustrated engineers."

"That's Lab 10. Any questions about dormant user management or the reclamation workflow?"

> **📋 Stage Direction**
> - Take 1-2 questions
> - Transition to Day 1 wrap-up

---

## ⏱️ [2:45] Day 1 Wrap-Up & Q&A (15 minutes)

> **🖥️ 🔄 TRANSITION: Switch back to Main PowerPoint**
>
> **You can show PPT Slide 1 (title) or Slide 3 (Day 1 agenda) as a backdrop**

### 📋 Stage Direction

- Switch back to PowerPoint
- Show Slide 3 (Day 1 agenda) as a recap backdrop
- This is your close — summarize, preview, and take questions

### 🎤 Script

"Excellent work today, everyone. Let me recap what we covered."

"We started with the **enterprise hierarchy** — Enterprise Cloud vs. Server, how they differ, and when to use each. We talked about billing, plans, and the unbundling of Advanced Security into Secret Protection and Code Security."

"Then we dove into the **permission flow** — how policies cascade from enterprise to org to repo, the three repository visibility levels, base permissions, and the five built-in permission roles."

"We covered **enterprise administration** in detail — policy inheritance with its three modes of Enforced, Allowed, and Disabled. We spent significant time on **Copilot governance** — plans, organization policies, content exclusions, and seat management. And I walked you through all of that live in the Lab 15 demo."

"After the break, we shifted to **organization structure** — why we recommend a single org, how namespaces work, the importance of SSO and SCIM for identity management. I demonstrated **nested teams**, permission assignment through teams, and custom repository roles in the Lab 9 demo."

"And we closed with **audit logging and dormant user management** — event retention, search syntax, API access, streaming options, and the dormant user identification and reclamation workflow. The Lab 8 and Lab 10 demos gave you a practical view of querying the audit log and identifying dormant users."

"Tomorrow — Day 2 — we'll shift to the repository layer. We'll cover repository governance and templates, **rulesets** in depth, security scanning and push protection, the GitHub API and webhooks, and automation and deployment strategies. There will be live demos tomorrow as well, so it's another interactive day."

> **🖥️ ADVANCE to PPT Slide 4 (Day 2 agenda) — briefly**

"Here's a preview of the Day 2 agenda. Repository overview, administration, branch protections, CODEOWNERS, the API, authentication methods for integrations, Actions, and the marketplace."

"Before we wrap up, I want to mention that there are also **self-paced extension labs** available. These cover topics we don't have time for in the live session — webhooks, Actions settings, GitHub Apps, deployments, and unhealthy repository analysis. I'd encourage you to work through these after the workshop."

> **💡 DISCUSSION PROMPT** (3-4 minutes)
> Ask: "Let me leave you with a question to think about: **What's one thing you learned today that you'll apply immediately when you get back to your organization?** I'd love to hear from a few of you."

> **📋 Stage Direction**
> - Take 3-4 responses
> - Acknowledge each one and add any relevant context
> - Common answers: setting base permissions to None, enabling Copilot content exclusions, implementing the dormant user reclamation workflow, switching to team-based access

"Those are great takeaways. Now let me open it up for any remaining questions. Anything we covered today that you'd like to revisit or get more clarity on?"

> **📋 Stage Direction**
> - Take questions for remaining time
> - If no questions, offer to stay online for 5 minutes after for 1:1 questions
> - Common questions: EMU vs. standard SAML (preview for Day 2 identity section or answer briefly), how to migrate from branch protection to rulesets (Day 2 topic), Copilot Enterprise vs. Business ROI

### 🎤 Closing

"Alright, that's a wrap for Day 1. Thank you all for your engagement and your great questions. The lab files are still available in the repo if you want to work through them on your own to reinforce the concepts, and feel free to explore the extension labs at your own pace."

"We'll start Day 2 at the same time tomorrow. I'll be available in the chat if any questions come up between now and then. Have a great rest of your day, and I'll see you tomorrow."

> **📋 Stage Direction**
> - Stop recording if applicable
> - Stay online for 5 minutes for any 1:1 follow-up questions
> - Note any unanswered questions to address at the start of Day 2
> - Send a follow-up message in the workshop channel with:
>   - Link to lab repo
>   - List of extension labs for self-paced work
>   - Reminder of Day 2 start time

---

## 📎 Appendix: Quick Reference

### Slide Map

| Time | Slide Source | Slides |
|------|-------------|--------|
| 0:00-0:14 | Main PPT | 1-4 |
| 0:15-0:34 | Main PPT | 5-9 |
| 0:35-0:49 | Main PPT | 10-15 |
| 0:50-0:55 | Main PPT | 16-17 |
| 0:55-1:04 | **Supplement (browser)** | Supp 1-6 |
| 1:05-1:19 | **Supplement (browser)** | Supp 7 (Demo Lab 15) |
| 1:20-1:29 | Break | — |
| 1:30-1:59 | Main PPT | 18-38 |
| 2:00-2:14 | Demo Lab 9 | — |
| 2:15-2:24 | **Supplement (browser)** | Supp 8-12 |
| 2:25-2:34 | **Supplement (browser)** | Supp 13 (Demo Lab 8) |
| 2:35-2:44 | Demo Lab 10 | — |
| 2:45-3:00 | Main PPT | 1 or 3-4 |

### Live Demo References

| Demo | Lab File | Duration |
|------|----------|----------|
| Live Demo: Lab 15 — Copilot Governance | `labs/lab15.md` | 15 min |
| Live Demo: Lab 9 — User and Team Admin | `labs/lab09.md` | 15 min |
| Live Demo: Lab 8 — Audit Log Exploration | `labs/lab08.md` | 10 min |
| Live Demo: Lab 10 — Dormant User Management | `labs/lab10.md` | 10 min |

> **📝 Note on PPT Slides 39-45:** These slides cover organization insights (activity, dependencies), security overview, and detailed settings. In this script, those topics are covered via the Day 1 Supplement slides 8-12 (audit log and dormant users) and through the live demos. You do **not** need to present PPT slides 39-45 — skip directly from slide 38 to the supplement slides.

### Emergency Timing Adjustments

| If running behind... | Action |
|---------------------|--------|
| 5 minutes behind | Shorten discussion prompts to 30 seconds |
| 10 minutes behind | Skip Slides 22-25 (user namespace detail) — summarize in one sentence |
| 15+ minutes behind | Shorten Lab 8 demo to UI-only (skip API steps), drop Lab 10 demo and mention it as self-paced, compress wrap-up to 5 minutes |

### Common Participant Questions (Day 1)

| Question | Quick Answer |
|----------|-------------|
| "What's the difference between EMU and standard SAML?" | EMU = enterprise owns accounts, full lifecycle control. Standard SAML = users own accounts, SSO adds authentication layer. Detailed coverage in Day 2 identity section. |
| "Can we migrate from branch protection to rulesets?" | Yes. Rulesets are the modern replacement. They can coexist during migration. Deep dive on Day 2. |
| "How do we handle outside collaborators with SSO?" | Outside collaborators must also authenticate via SSO when it's enforced. They need to authorize their PATs/SSH keys. |
| "What's the cost difference between Copilot Business and Enterprise?" | Business = $19/user/mo. Enterprise = $39/user/mo. Enterprise adds policy enforcement, audit logs, Copilot Spaces, BYOLLM. |
| "How often should we review dormant users?" | Monthly is recommended. Quarterly at minimum. Combine with license renewal cycles. |

### VBD Topic Coverage — Day 1

| Time | Section | VBD Topics |
|------|---------|------------|
| 0:15 | Enterprise Overview | 2.2 |
| 0:35 | Permission Flow | 1.1 |
| 0:50 | Enterprise Admin + Copilot | 2.2 |
| 1:05 | Lab 15 Demo | 2.2 |
| 1:30 | Org Overview (SSO, SAML/SCIM) | 2.1, 2.4 |
| 1:45 | Org Admin (Teams, Team Sync) | 2.5, 2.7 |
| 2:00 | Lab 9 Demo | 2.5, 2.7 |
| 2:15 | Audit Log + Dormant Users | 2.3, 2.6 |
| 2:25 | Lab 8 Demo | 2.3 |
| 2:35 | Lab 10 Demo | 2.6 |
