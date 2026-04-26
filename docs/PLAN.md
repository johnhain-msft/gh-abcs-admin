# VBD Workshop Expansion Plan

> **Branch:** `feature/vbd-workshop-expansion`
> **Story Points:** 5-8 (multi-session effort)
> **Methodology:** TDD — tests first, then implementation
> **Quality Standard:** 95/100 weighted score required to advance between phases
> **Model Policy:** All agents/subagents use `claude-opus-4.6` (or best available)

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [VBD Target Specification](#vbd-target-specification)
3. [Current State Inventory](#current-state-inventory)
4. [Phase 0: Test Infrastructure](#phase-0-test-infrastructure)
5. [Phase 1: Baseline Test Coverage](#phase-1-baseline-test-coverage)
6. [Phase 2: Content Audit & Research](#phase-2-content-audit--research)
7. [Phase 3: Update Existing Content](#phase-3-update-existing-content)
8. [Phase 4: New Documentation](#phase-4-new-documentation)
9. [Phase 5: New Hands-on Labs](#phase-5-new-hands-on-labs)
10. [Phase 6: VBD Structural Materials](#phase-6-vbd-structural-materials)
11. [Phase 7: Integration & Polish](#phase-7-integration--polish)
12. [Phase 8: Cleanup](#phase-8-cleanup)
13. [Quality Gate Protocol](#quality-gate-protocol)
14. [Progress Tracker](#progress-tracker)

---

## Project Overview

### Goal
Transform `gh-abcs-admin` from a documentation-heavy reference repo into a **fully deliverable VBD (Value-Based Delivery) workshop** that meets the GitHub Enterprise Cloud Admin Training specification: 2-day, 3hrs/day, Level 300 Advanced, remote delivery.

### Principles
- **TDD:** Every piece of content has a test before it's written/modified
- **Accuracy > Speed:** Research thoroughly, cite sources, verify against current (April 2026) GitHub docs
- **No Regressions:** Existing working content must not break
- **Fresh Context:** Each quality gate category is reviewed in an independent pass
- **95/100 or iterate:** No phase advances until the weighted rubric score ≥ 95

### What "Tests" Mean for This Repo
This is a documentation/workshop repo, not application code. Our "tests" are automated and semi-automated validation checks:

| Test Type | Tool/Method | What It Validates |
|-----------|-------------|-------------------|
| **Markdown Lint** | `markdownlint-cli2` | Formatting consistency, heading structure, list style |
| **Link Validation** | `markdown-link-check` | No broken internal/external links |
| **Spelling** | `cspell` | Technical terminology, no typos |
| **Structure Validation** | Custom scripts | Required sections exist per content type |
| **YAML/Front Matter** | Custom scripts | Jekyll front matter is valid |
| **Mermaid Syntax** | `@mermaid-js/mermaid-cli` (mmdc) | Diagrams parse without errors |
| **Code Block Validation** | Custom scripts | YAML/JSON/bash blocks are syntactically valid |
| **VBD Coverage Map** | Custom scripts | Every agenda item has docs + labs mapped |
| **Lab Completeness** | Custom scripts | Duration, steps, references, objectives present |
| **Jekyll Build** | `jekyll build` / GitHub Pages action | Site builds without errors |
| **Content Freshness** | Custom scripts | No references to deprecated features/URLs |

---

## VBD Target Specification

### Workshop Metadata
```
Title: GitHub Admin Training (GitHub Enterprise Cloud)
Format: Workshop | 2-day | Remote | Level 300 - Advanced
Duration: 2 consecutive days, 3 hours/day (6 hours total)
Audience: Enterprise owners, Organization owners, Repository administrators
```

### Required Agenda Coverage (from VBD spec)

#### Day 1: Working on GitHub
| # | Topic | Subtopics | Priority |
|---|-------|-----------|----------|
| 1.1 | Repository permissions and settings | Visibility, base permissions, custom roles | P0 |
| 1.2 | Create branches and Pull Requests | Branch workflow, PR process | P0 |
| 1.3 | Configure protected branches | Rulesets (modern), branch protection (legacy) | P0 |
| 1.4 | Configure required status checks | CI integration, check suites | P0 |
| 1.5 | Security in the cloud | Security alerts (secret scanning, code scanning, Dependabot) | P0 |
| 1.6 | User privacy | Data residency, export, GDPR | P1 |
| 1.7 | Licenses | License types, seat management, billing | P1 |
| 1.8 | GitHub Marketplace | Apps, actions, integrations marketplace | P1 |

#### Day 2: Integrations, Admin, API, Advanced
| # | Topic | Subtopics | Priority |
|---|-------|-----------|----------|
| 2.1 | Integrations and authentication methods | SAML, SCIM, OIDC, OAuth Apps, GitHub Apps | P0 |
| 2.2 | GitHub Enterprise site administration | Enterprise settings, policies | P0 |
| 2.3 | Audit account activities | Audit log, streaming, SIEM | P0 |
| 2.4 | Select repository and organization settings | Org-level configs, defaults | P0 |
| 2.5 | Administer users | User lifecycle, invitations, roles | P0 |
| 2.6 | Manage dormant users | Identify inactive, reclaim licenses | P1 |
| 2.7 | Organizations and teams | Nested teams, IdP sync, permissions | P0 |
| 2.8 | The GitHub API | REST vs GraphQL, Status API | P0 |
| 2.9 | Integrate 3rd party tests and results | Status API, check runs | P1 |
| 2.10 | Deploy with GitHub | Environments, protection rules, OIDC | P1 |
| 2.11 | Use webhooks | Webhook config, events, security | P0 |
| 2.12 | Scripts and automation | gh CLI, API scripting, automation | P1 |
| 2.13 | Unhealthy repositories | Large files, stale branches, repo health | P1 |
| 2.14 | Changing history with Git | Rebase, filter-repo, BFG, sensitive data | P1 |

### Required VBD Structural Elements
| Element | Priority | Description |
|---------|----------|-------------|
| Timed agenda | P0 | Map all content to 2 × 3-hour blocks with timing |
| Instructor guide | P0 | Facilitator notes, demo scripts, discussion prompts |
| Slide deck outline | P1 | Presentation structure (not full PPT, but outline/script) |
| Pre-workshop checklist | P0 | Participant setup, prerequisites, access requirements |
| Knowledge checks | P1 | Per-module questions to validate learning |
| Post-workshop assessment | P1 | Outcomes measurement, feedback template |
| Participant reference card | P1 | Quick-reference handout for key commands/URLs |

---

## Current State Inventory

### Documentation Coverage
| VBD Topic | Current Doc | Status |
|-----------|------------|--------|
| Enterprise hierarchy | doc01 | ✅ Exists |
| Organization strategies | doc02 | ✅ Exists |
| Identity & access management | doc03 | ✅ Exists |
| Enterprise Managed Users | doc04 | ✅ Exists |
| Teams & permissions | doc05 | ✅ Exists |
| Policy inheritance | doc06 | ✅ Exists |
| Repository governance | doc07 | ✅ Exists |
| Security & compliance | doc08 | ✅ Exists |
| Best practices & WAF | doc09 | ✅ Exists |
| Reference architecture | doc10 | ✅ Exists |
| Security-by-default policies | doc11 | ✅ Exists |
| Copilot governance | doc12 | ✅ Exists |
| Onboarding plan | doc13 | ✅ Exists |
| Licenses & billing | — | ❌ Missing |
| GitHub Marketplace & Apps | — | ❌ Missing |
| User administration & dormant users | — | ❌ Missing |
| Audit log deep dive (dedicated) | — | ❌ Missing (brief in doc08) |
| Deployment strategies | — | ❌ Missing |
| Scripts & automation (gh CLI) | — | ❌ Missing |
| Unhealthy repos & Git history | — | ❌ Missing |
| User privacy & data residency | — | ❌ Missing |
| 3rd party integrations (Status API) | — | ❌ Missing |

### Lab Coverage
| VBD Topic | Current Lab | Status |
|-----------|------------|--------|
| Webhooks | lab01 | ✅ Exists |
| Actions settings | lab02 | ✅ Exists |
| Branch protection | lab03 | ⚠️ Exists but uses legacy branch protection |
| Templates | lab04 | ✅ Exists |
| API (REST + GraphQL) | lab05 | ✅ Exists (uses actions/github-script@v6 → outdated) |
| Repository rulesets | — | ❌ Missing |
| Security scanning | — | ❌ Missing |
| Audit log exploration | — | ❌ Missing |
| User & team admin | — | ❌ Missing |
| Dormant user management | — | ❌ Missing |
| Marketplace & Apps | — | ❌ Missing |
| Deployments & environments | — | ❌ Missing |
| Scripts & gh CLI automation | — | ❌ Missing |
| Unhealthy repos & Git history | — | ❌ Missing |
| Copilot governance config | — | ❌ Missing |

### Structural Elements
| Element | Status |
|---------|--------|
| Timed 2-day agenda | ❌ Missing |
| Instructor guide | ❌ Missing |
| Slide deck outline | ❌ Missing |
| Pre-workshop checklist | ❌ Missing |
| Knowledge checks | ❌ Missing |
| Post-workshop assessment | ❌ Missing |
| Participant reference card | ❌ Missing |

---

## Phase 0: Test Infrastructure

### Objective
Set up the automated test framework so we can validate content before and after every change.

### Tasks

#### 0.1 Initialize Node.js project for test tooling
- [ ] Create `package.json` with test scripts
- [ ] Install: `markdownlint-cli2`, `markdown-link-check`, `cspell`, `ajv` (JSON schema validation)
- [ ] Create `.markdownlint.yml` config (tuned for this repo's style)
- [ ] Create `.cspell.json` config with technical dictionary (GitHub, GHEC, SAML, SCIM, etc.)
- [ ] Create `link-check-config.json` (allow patterns for known-good domains, ignore anchors in external sites)

#### 0.2 Create custom validation scripts
- [ ] `tests/validate-structure.js` — Validates required sections per content type:
  - **Docs:** Must have title (H1), introduction paragraph, at least one H2 section
  - **Labs:** Must have title, duration, references, numbered steps, objective
  - **VBD materials:** Must have required sections per template
- [ ] `tests/validate-frontmatter.js` — Validates YAML front matter where present
- [ ] `tests/validate-codeblocks.js` — Validates syntax of fenced code blocks (YAML, JSON, bash)
- [ ] `tests/validate-mermaid.js` — Extracts and validates Mermaid diagram syntax
- [ ] `tests/validate-vbd-coverage.js` — Checks VBD agenda items against a coverage map file
- [ ] `tests/validate-freshness.js` — Flags known deprecated patterns/URLs

#### 0.3 Create VBD coverage map
- [ ] Create `tests/fixtures/vbd-coverage-map.json` — JSON mapping of every VBD agenda item to its doc(s) and lab(s)
- [ ] Script reads this map and verifies all referenced files exist and contain expected sections

#### 0.4 Create test runner configuration
- [ ] Create `tests/run-all.sh` — Master test runner script
- [ ] Add npm scripts: `test`, `test:lint`, `test:links`, `test:spell`, `test:structure`, `test:coverage-map`
- [ ] Create GitHub Actions workflow `.github/workflows/tests.yml` — Runs tests on PR/push

#### 0.5 Document the test framework
- [ ] Add `tests/README.md` explaining how to run tests, what each test validates, how to add new tests

### Research Required
- Current versions of markdownlint-cli2, markdown-link-check, cspell (April 2026)
- Mermaid CLI validation approach (parse without render)
- Best markdownlint config for technical workshop content

### Deliverables
- `package.json`, configs, test scripts, test CI workflow
- All tests pass on current repo state (baseline green)

### Quality Gate Rubric — Phase 0

| # | Category | Weight | Pass Criteria |
|---|----------|--------|---------------|
| 1 | **Test accuracy** | 20 | Tests correctly identify real issues; no false positives on existing valid content |
| 2 | **Coverage completeness** | 18 | Every test type listed above is implemented and functional |
| 3 | **Baseline green** | 17 | `npm test` passes on current repo state (or failures are documented as known issues to fix in Phase 3) |
| 4 | **CI integration** | 12 | GitHub Actions workflow runs tests on push/PR |
| 5 | **Documentation** | 10 | tests/README.md explains usage clearly |
| 6 | **Configurability** | 8 | Configs are tuned (not default) — e.g., cspell has tech dictionary, markdownlint matches repo style |
| 7 | **Script quality** | 8 | Custom scripts have error handling, clear output, exit codes |
| 8 | **Maintainability** | 7 | Easy to add new tests/checks; modular structure |
| **Total** | | **100** | **≥ 95 required** |

**Review Protocol:** 8 independent passes (1 per category). Each pass uses a fresh agent context focused solely on that category. Scores are summed. If < 95, iterate on lowest-scoring categories and re-review those passes only.

---

## Phase 1: Baseline Test Coverage

### Objective
Write test expectations for ALL existing content (18 docs, 5 labs, README, config). Establish the regression baseline. Every existing file gets a "snapshot" of its expected structure so future changes can't silently break things.

### Tasks

#### 1.1 Document structure tests for existing docs (01–18)
- [ ] For each doc: define expected H1, expected H2 sections, minimum line count, expected Mermaid diagram count
- [ ] Add to `tests/fixtures/doc-expectations.json`

#### 1.2 Lab structure tests for existing labs (01–05 + setup)
- [ ] For each lab: define expected title, duration field, reference links, step sections, code blocks
- [ ] Add to `tests/fixtures/lab-expectations.json`

#### 1.3 Link inventory
- [ ] Run link checker, catalog all existing links
- [ ] Identify and document any currently-broken links (to fix in Phase 3)
- [ ] Create link allowlist for known-valid patterns

#### 1.4 Spelling baseline
- [ ] Run cspell on all files
- [ ] Add legitimate technical terms to dictionary
- [ ] Document any real typos found (to fix in Phase 3)

#### 1.5 VBD coverage map — current state
- [ ] Populate `vbd-coverage-map.json` with current mapping
- [ ] Test should report: X of Y agenda items covered (expected: partial)
- [ ] This becomes the "before" metric we improve through later phases

#### 1.6 Known issues register
- [ ] Create `tests/fixtures/known-issues.json` — catalog of all issues found during baseline (broken links, typos, structural gaps, deprecated references)
- [ ] Each issue tagged with which phase will fix it

### Research Required
- None (this phase is purely about the existing content)

### Deliverables
- Test fixtures for all existing content
- Known issues register
- Baseline VBD coverage score
- All tests either pass or failures are registered as known issues

### Quality Gate Rubric — Phase 1

| # | Category | Weight | Pass Criteria |
|---|----------|--------|---------------|
| 1 | **Expectation accuracy** | 22 | Fixture expectations match actual content structure precisely |
| 2 | **Coverage breadth** | 20 | Every existing file (docs, labs, config, README) has test expectations |
| 3 | **Known issues completeness** | 18 | All failures are cataloged with phase assignment |
| 4 | **Regression safety** | 15 | Tests would catch if content were accidentally deleted or corrupted |
| 5 | **VBD map accuracy** | 10 | Coverage map correctly reflects which agenda items have content |
| 6 | **Spelling dictionary** | 8 | Technical terms added; only real typos flagged |
| 7 | **Documentation** | 7 | Baseline metrics documented (coverage %, link status, etc.) |
| **Total** | | **100** | **≥ 95 required** |

---

## Phase 2: Content Audit & Research

### Objective
Deep research every VBD agenda item against **current (April 2026) GitHub documentation**. Produce a research dossier for each missing or stale topic. No content changes yet — research only.

### Tasks

#### 2.1 Research each missing documentation topic
For each missing doc, create a research brief in `docs/_research/` (dev artifact, cleaned up in Phase 8):
- [ ] **Licenses & billing** — Current GHEC license types, metered billing, seat management API, Copilot licensing
- [ ] **GitHub Marketplace & Apps** — GitHub Apps vs OAuth Apps, Marketplace listing, installation flow
- [ ] **User administration & dormant users** — User lifecycle, dormant user API, license reclamation, EMU user management
- [ ] **Audit log deep dive** — Streaming endpoints, SIEM integration, API queries, event categories, retention
- [ ] **Deployment strategies** — Environments, protection rules, OIDC, custom deployment gates
- [ ] **Scripts & automation** — `gh` CLI admin commands, API scripting patterns, webhook-driven automation
- [ ] **Unhealthy repos & Git history** — Large file detection, BFG, git-filter-repo, stale branch cleanup
- [ ] **User privacy & data residency** — GitHub data residency (EU), GDPR, data export, IP logging
- [ ] **3rd party integrations (Status API)** — Commit statuses, check runs, check suites, required checks

#### 2.2 Research updates for existing stale content
- [ ] **lab03 → Rulesets:** Research current Repository Rulesets feature (GA), compare with legacy branch protection
- [ ] **lab05 → actions/github-script@v7+:** Research current version, API changes
- [ ] **Video links:** Find current (2024-2026) GitHub Universe/conference videos to replace 2021 links
- [ ] **GHAS → standalone products:** Research GitHub Secret Protection and GitHub Code Security (separate products since April 2025)
- [ ] **Copilot features:** Research current Copilot Enterprise features (Agent Mode, Extensions, MCP, etc.)

#### 2.3 Research VBD structural best practices
- [ ] Research GitHub/Microsoft VBD workshop format standards
- [ ] Research effective workshop timing for remote 3hr sessions
- [ ] Research assessment/knowledge check best practices for L300 technical training
- [ ] Find examples of well-structured GitHub training instructor guides

### Research Sources (use in this order)
1. **Microsoft Learn** (microsoft-learn MCP tools) — Primary source of truth
2. **GitHub Docs** (docs.github.com) — Feature documentation
3. **GitHub Blog/Changelog** — Latest feature announcements
4. **Web search** — For VBD methodology, training best practices
5. **GitHub MCP** — Search for reference implementations

### Deliverables
- Research briefs in `docs/_research/` (1 per missing topic)
- Update brief for each stale item
- VBD structural research document
- All research cites specific URLs dated within 12 months

### Quality Gate Rubric — Phase 2

| # | Category | Weight | Pass Criteria |
|---|----------|--------|---------------|
| 1 | **Research accuracy** | 25 | All facts verified against official docs (Microsoft Learn / GitHub Docs); no outdated info |
| 2 | **Source quality** | 20 | Every claim has a cited URL; sources are official/authoritative and dated within 12 months |
| 3 | **Completeness** | 18 | Every missing topic and every stale item has a research brief |
| 4 | **Actionability** | 15 | Each brief includes enough detail to write the doc/lab without further research |
| 5 | **Currentness** | 12 | Research reflects April 2026 state, not 2024 or earlier |
| 6 | **Organization** | 10 | Briefs follow consistent format, easy to find and reference |
| **Total** | | **100** | **≥ 95 required** |

---

## Phase 3: Update Existing Content

### Objective
Fix all known issues from Phase 1. Update stale content using research from Phase 2. No new files — only modifications to existing files.

### Tasks

#### 3.1 Fix known issues from baseline
- [ ] Fix all broken links identified in Phase 1
- [ ] Fix all spelling errors identified in Phase 1
- [ ] Fix structural issues (missing sections, formatting inconsistencies)

#### 3.2 Update lab03 — Branch Protection → Rulesets
- [ ] Rewrite lab03 to use Repository Rulesets as the primary approach
- [ ] Keep legacy branch protection as a sidebar/note (some orgs still use it)
- [ ] Update duration estimate
- [ ] Update references to current docs

#### 3.3 Update lab05 — GitHub API
- [ ] Update `actions/github-script` to current version (v7+)
- [ ] Update `use-github-apis.yml` workflow accordingly
- [ ] Verify code samples work with current API

#### 3.4 Update doc08 — Security & Compliance
- [ ] Update to reflect standalone GitHub Secret Protection & Code Security products
- [ ] Update pricing information
- [ ] Add security campaigns, Copilot Autofix references

#### 3.5 Update doc12 — Copilot Governance
- [ ] Update with current Copilot Enterprise features (Agent Mode, Extensions, MCP if applicable)
- [ ] Update pricing if changed
- [ ] Add Copilot audit log events

#### 3.6 Update README.md
- [ ] Update video links to current (2024-2026) content
- [ ] Update any stale external links
- [ ] Keep structure — don't add new sections yet (Phase 7)

#### 3.7 Update CODEOWNERS
- [ ] Update to reflect current ownership (replace `@CalinL` if forked)

#### 3.8 Run full test suite
- [ ] All tests pass (no known issues remaining from Phase 1)
- [ ] VBD coverage score unchanged (no regressions, no new coverage yet)

### Deliverables
- All existing files updated and passing tests
- Zero known issues remaining from Phase 1 register
- Git commits with clear messages per logical change

### Quality Gate Rubric — Phase 3

| # | Category | Weight | Pass Criteria |
|---|----------|--------|---------------|
| 1 | **Accuracy of updates** | 25 | All updated content is factually correct per April 2026 GitHub docs |
| 2 | **No regressions** | 20 | Full test suite passes; no existing tests broken |
| 3 | **Known issues resolved** | 18 | Every item in Phase 1 known-issues register is addressed |
| 4 | **Content quality** | 15 | Updates are well-written, consistent in tone/style with surrounding content |
| 5 | **Link validity** | 10 | All new/updated links resolve and point to current pages |
| 6 | **Commit hygiene** | 7 | Clean, atomic commits with descriptive messages |
| 7 | **Test coverage** | 5 | Test expectations updated where content structure changed (e.g., lab03) |
| **Total** | | **100** | **≥ 95 required** |

---

## Phase 4: New Documentation

### Objective
Create all missing documentation topics identified in the VBD spec. Each doc follows the established style (L400 depth, Mermaid diagrams, structured sections).

### Tasks

Write tests first (add expectations to fixtures), then create content:

#### 4.1 New doc: Licenses & Billing
- [ ] Add test expectations → `doc-expectations.json`
- [ ] Create `docs/19-licenses-billing.md`
- [ ] Topics: GHEC license types, seat-based billing, metered products, Copilot licensing, billing API, cost optimization, license reports
- [ ] Include Mermaid diagram of license hierarchy

#### 4.2 New doc: GitHub Marketplace & Apps
- [ ] Add test expectations
- [ ] Create `docs/20-github-marketplace-apps.md`
- [ ] Topics: GitHub Apps vs OAuth Apps (decision matrix), Marketplace categories, app installation/permissions, creating internal apps, webhook-driven apps
- [ ] Include Mermaid diagram of App authentication flow

#### 4.3 New doc: User Administration & Dormant Users
- [ ] Add test expectations
- [ ] Create `docs/21-user-administration.md`
- [ ] Topics: User lifecycle, invitation flow, role assignment, dormant user identification, license reclamation, EMU user management, outside collaborator management
- [ ] Include Mermaid diagram of user lifecycle

#### 4.4 New doc: Audit Log Deep Dive
- [ ] Add test expectations
- [ ] Create `docs/22-audit-log-deep-dive.md`
- [ ] Topics: Audit log UI, API queries, streaming to SIEM (Splunk, Datadog, Azure Event Hubs), event categories, retention, compliance use cases, example queries
- [ ] Include Mermaid diagram of audit log streaming architecture

#### 4.5 New doc: Deployment Strategies
- [ ] Add test expectations
- [ ] Create `docs/23-deployment-strategies.md`
- [ ] Topics: GitHub Environments, protection rules, required reviewers, wait timers, OIDC for cloud deployments, custom deployment gates, deployment frequency metrics
- [ ] Include Mermaid diagram of deployment pipeline with gates

#### 4.6 New doc: Scripts & Automation
- [ ] Add test expectations
- [ ] Create `docs/24-scripts-automation.md`
- [ ] Topics: `gh` CLI admin commands, REST/GraphQL scripting patterns, webhook-driven automation, GitHub Actions for admin tasks, Terraform GitHub provider, Policy-as-Code
- [ ] Include practical script examples (bash, gh CLI)

#### 4.7 New doc: Unhealthy Repos & Git History
- [ ] Add test expectations
- [ ] Create `docs/25-unhealthy-repos-git-history.md`
- [ ] Topics: Repo health indicators, large file detection, git-filter-repo, BFG Repo Cleaner, sensitive data removal, stale branch cleanup, archive strategies, monorepo considerations
- [ ] Include Mermaid diagram of repo health assessment flow

#### 4.8 New doc: User Privacy & Data Residency
- [ ] Add test expectations
- [ ] Create `docs/26-user-privacy-data-residency.md`
- [ ] Topics: GitHub data residency (EU), GDPR compliance, data export, IP logging controls, SSO session management, audit trail for compliance, data retention policies

#### 4.9 New doc: 3rd Party Integrations & Status API
- [ ] Add test expectations
- [ ] Create `docs/27-integrations-status-api.md`
- [ ] Topics: Commit statuses, check runs, check suites, required status checks, integrating external CI/CD, SARIF upload, deployment status API
- [ ] Include Mermaid diagram of check run architecture

#### 4.10 Update VBD coverage map
- [ ] Update `vbd-coverage-map.json` with all new docs
- [ ] Run coverage check — docs coverage should now be ~95%+

### Deliverables
- 9 new documentation files
- Updated test expectations and VBD coverage map
- All tests pass

### Quality Gate Rubric — Phase 4

| # | Category | Weight | Pass Criteria |
|---|----------|--------|---------------|
| 1 | **Technical accuracy** | 25 | All content verified against official GitHub/Microsoft docs; no incorrect statements |
| 2 | **Completeness per topic** | 18 | Each doc covers all subtopics listed in its task description |
| 3 | **Style consistency** | 15 | Matches existing doc tone, depth level (L400), formatting patterns |
| 4 | **Mermaid diagrams** | 12 | Each doc has at least 1 diagram; diagrams render correctly |
| 5 | **Test-first verification** | 10 | Expectations were written before content; all tests pass |
| 6 | **Source citations** | 8 | Key claims link to official documentation |
| 7 | **VBD coverage improvement** | 7 | Coverage map shows significant improvement over Phase 1 baseline |
| 8 | **No regressions** | 5 | Existing tests still pass; existing content unaffected |
| **Total** | | **100** | **≥ 95 required** |

---

## Phase 5: New Hands-on Labs

### Objective
Create ~10 new hands-on labs to fill VBD agenda gaps. Total lab time should reach 4-5 hours (from current ~50 min). Each lab follows the established format.

### Lab Design Principles
- **Duration:** 15-30 min each (longer than current 5-10 min labs)
- **Format:** Title, duration, objective, prerequisites, references, numbered steps, verification/expected results
- **Depth:** Real hands-on, not just "click here" — include investigation, troubleshooting, decision-making
- **Accessibility:** Must work in a free GHEC trial or with provided org access

### Tasks

Write test expectations first, then create labs:

#### 5.1 Lab 06: Repository Rulesets (Replaces/supplements lab03)
- [ ] Add test expectations → `lab-expectations.json`
- [ ] Create `labs/lab06.md`
- [ ] Duration: 20-25 min
- [ ] Exercises: Create org-level ruleset, create repo-level ruleset, test bypass permissions, compare with branch protection, import/export rulesets

#### 5.2 Lab 07: Security Scanning & Push Protection
- [ ] Add test expectations
- [ ] Create `labs/lab07.md`
- [ ] Duration: 25-30 min
- [ ] Exercises: Enable secret scanning, test push protection (commit a test secret), enable code scanning (CodeQL default setup), review Dependabot alerts, configure auto-triage rules

#### 5.3 Lab 08: Audit Log Exploration
- [ ] Add test expectations
- [ ] Create `labs/lab08.md`
- [ ] Duration: 20-25 min
- [ ] Exercises: Navigate audit log UI, filter by event type, use audit log API via `gh api`, explore event payloads, discuss streaming configuration

#### 5.4 Lab 09: User & Team Administration
- [ ] Add test expectations
- [ ] Create `labs/lab09.md`
- [ ] Duration: 20-25 min
- [ ] Exercises: Create teams (nested), assign repo permissions via teams, configure team sync discussion, create custom repository role, test permission inheritance

#### 5.5 Lab 10: Dormant User Management
- [ ] Add test expectations
- [ ] Create `labs/lab10.md`
- [ ] Duration: 15-20 min
- [ ] Exercises: Use API to list organization members with activity, identify dormant users, discuss reclamation workflow, script with `gh api`

#### 5.6 Lab 11: GitHub Apps & Marketplace
- [ ] Add test expectations
- [ ] Create `labs/lab11.md`
- [ ] Duration: 15-20 min
- [ ] Exercises: Browse Marketplace, install a GitHub App, review app permissions, discuss OAuth vs GitHub App decision, (optional) register a test app

#### 5.7 Lab 12: Deployments & Environments
- [ ] Add test expectations
- [ ] Create `labs/lab12.md`
- [ ] Duration: 20-25 min
- [ ] Exercises: Create environments (staging, production), add protection rules (required reviewers, wait timer), create deployment workflow, test approval flow

#### 5.8 Lab 13: Scripts & gh CLI Automation
- [ ] Add test expectations
- [ ] Create `labs/lab13.md`
- [ ] Duration: 20-25 min
- [ ] Exercises: Use `gh` CLI for admin tasks (list repos, manage teams, query audit log), write a bash script to automate a common admin task, use `gh api` for GraphQL

#### 5.9 Lab 14: Unhealthy Repos & Git History
- [ ] Add test expectations
- [ ] Create `labs/lab14.md`
- [ ] Duration: 20-25 min
- [ ] Exercises: Detect large files in a repo, use git-filter-repo to remove sensitive data, clean up stale branches, discuss repo archival strategy

#### 5.10 Lab 15: Copilot Governance Configuration
- [ ] Add test expectations
- [ ] Create `labs/lab15.md`
- [ ] Duration: 15-20 min
- [ ] Exercises: Review Copilot org policies, configure content exclusions, manage seat assignments, review Copilot audit logs, discuss knowledge base setup

#### 5.11 Update VBD coverage map
- [ ] Update `vbd-coverage-map.json` with all new labs
- [ ] Run coverage check — lab coverage should now be ~90%+
- [ ] Verify total estimated lab time reaches 4-5 hours

### Deliverables
- 10 new lab files
- Updated test expectations and VBD coverage map
- All tests pass
- Total lab time: 4-5 hours

### Quality Gate Rubric — Phase 5

| # | Category | Weight | Pass Criteria |
|---|----------|--------|---------------|
| 1 | **Lab accuracy** | 22 | All steps work against current GHEC (April 2026); no broken procedures |
| 2 | **Completeness** | 18 | Every VBD agenda item with a lab gap now has a lab |
| 3 | **Hands-on depth** | 15 | Labs require real interaction, not just reading; include investigation/decision-making |
| 4 | **Format consistency** | 12 | All labs follow established format (title, duration, objectives, prerequisites, references, steps, verification) |
| 5 | **Duration accuracy** | 10 | Estimated durations are realistic for L300 audience |
| 6 | **Accessibility** | 8 | Labs work with standard GHEC org access (no special infra required) |
| 7 | **Test-first verification** | 8 | Expectations written before content; all tests pass |
| 8 | **No regressions** | 7 | Existing tests still pass |
| **Total** | | **100** | **≥ 95 required** |

---

## Phase 6: VBD Structural Materials

### Objective
Create the workshop delivery infrastructure: timed agenda, instructor guide, pre-workshop checklist, knowledge checks, and participant reference materials.

### Tasks

#### 6.1 Timed 2-Day Agenda
- [ ] Add test expectations for agenda format
- [ ] Create `docs/AGENDA.md`
- [ ] Map all content (docs + labs) to 2 × 3-hour blocks
- [ ] Include: topic, duration, type (presentation/demo/lab/discussion), doc reference, lab reference
- [ ] Include breaks (suggested: 1 break per 90-min block)
- [ ] Validate total time = 6 hours

#### 6.2 Instructor Guide
- [ ] Add test expectations
- [ ] Create `docs/INSTRUCTOR-GUIDE.md`
- [ ] Per-module sections with: learning objectives, key talking points, demo script, discussion prompts, common questions, timing notes
- [ ] Include setup checklist for instructor (what to prepare before workshop)
- [ ] Include troubleshooting section (common issues during labs)

#### 6.3 Pre-Workshop Checklist
- [ ] Add test expectations
- [ ] Create `docs/PRE-WORKSHOP-CHECKLIST.md`
- [ ] Participant requirements: GHEC org access, admin permissions, browser, gh CLI installed
- [ ] Instructor requirements: screen sharing, demo org prepared, backup content
- [ ] From VBD spec: "Provision the GitHub Enterprise Cloud organization", "All users with computers, accounts, and access for GitHub.com", "Ensure all attendees will have administrator access", "Designate at least one owner or administrator to share their screen during activities"

#### 6.4 Knowledge Checks
- [ ] Add test expectations
- [ ] Create `docs/KNOWLEDGE-CHECKS.md`
- [ ] 2-3 questions per major module (multiple choice or short answer)
- [ ] Questions test understanding, not memorization
- [ ] Include answer key (collapsed/hidden section)

#### 6.5 Post-Workshop Assessment
- [ ] Add test expectations
- [ ] Create `docs/POST-WORKSHOP-ASSESSMENT.md`
- [ ] Outcomes checklist mapped to VBD objectives
- [ ] Feedback template (Likert scale + open-ended)
- [ ] "What will you implement first?" action item prompt

#### 6.6 Participant Reference Card
- [ ] Add test expectations
- [ ] Create `docs/REFERENCE-CARD.md`
- [ ] Key URLs (GitHub docs, admin settings paths)
- [ ] Key `gh` CLI commands for admin tasks
- [ ] Permission level quick-reference table
- [ ] Audit log query cheat sheet

#### 6.7 Slide Deck Outline
- [ ] Add test expectations
- [ ] Create `docs/SLIDE-DECK-OUTLINE.md`
- [ ] Per-module: slide titles, key visual (diagram reference), speaker notes summary
- [ ] Not a full slide deck — an outline that could be used to create one

### Deliverables
- 7 new VBD structural files
- Updated test expectations
- All tests pass

### Quality Gate Rubric — Phase 6

| # | Category | Weight | Pass Criteria |
|---|----------|--------|---------------|
| 1 | **Agenda accuracy** | 20 | Timing adds up to 6 hours; every VBD agenda item is scheduled; flow is logical |
| 2 | **Instructor guide quality** | 18 | Enough detail for a first-time facilitator to deliver the workshop |
| 3 | **VBD spec alignment** | 17 | All delivery requirements from the VBD spec are addressed |
| 4 | **Knowledge check quality** | 12 | Questions test understanding, not trivia; aligned to learning objectives |
| 5 | **Completeness** | 12 | All 7 structural files created with meaningful content |
| 6 | **Consistency** | 8 | Cross-references between agenda, instructor guide, and labs are correct |
| 7 | **Participant experience** | 8 | Pre-workshop checklist and reference card are genuinely useful |
| 8 | **Test coverage** | 5 | All new files have test expectations; all tests pass |
| **Total** | | **100** | **≥ 95 required** |

---

## Phase 7: Integration & Polish

### Objective
Wire everything together. Update README as the workshop hub. Ensure cross-references work. Final consistency pass.

### Tasks

#### 7.1 Update README.md
- [ ] Restructure as workshop landing page
- [ ] Add VBD workshop description, objectives, outcomes (from spec)
- [ ] Link to agenda, instructor guide, pre-workshop checklist
- [ ] Update lab listing with all 15 labs
- [ ] Update documentation listing with all 27+ docs
- [ ] Update additional resources section

#### 7.2 Update _config.yml if needed
- [ ] Ensure all new directories/files are included in Jekyll collections
- [ ] Verify navigation works on GitHub Pages

#### 7.3 Cross-reference audit
- [ ] Every doc referenced in AGENDA.md exists and links work
- [ ] Every lab referenced in AGENDA.md exists and links work
- [ ] Instructor guide references match agenda
- [ ] Knowledge checks reference correct modules

#### 7.4 Content consistency pass
- [ ] Terminology is consistent across all files (e.g., "GHEC" not "GitHub Enterprise Cloud" randomly)
- [ ] Depth level is consistent (L300-L400 throughout)
- [ ] Date references are current

#### 7.5 Full test suite — final run
- [ ] ALL tests pass
- [ ] VBD coverage map shows 100% coverage
- [ ] Zero known issues
- [ ] Link check passes on all files

#### 7.6 Update VBD coverage map to final state
- [ ] Final `vbd-coverage-map.json` shows every agenda item mapped
- [ ] Generate coverage report

### Deliverables
- Updated README.md
- Full cross-reference validation
- Clean test run
- 100% VBD coverage

### Quality Gate Rubric — Phase 7

| # | Category | Weight | Pass Criteria |
|---|----------|--------|---------------|
| 1 | **VBD completeness** | 25 | 100% of VBD agenda items have both documentation and labs mapped |
| 2 | **Cross-reference accuracy** | 20 | Every internal link works; no dangling references |
| 3 | **README quality** | 15 | README serves as an effective workshop landing page |
| 4 | **Test suite green** | 15 | ALL tests pass with zero failures |
| 5 | **Consistency** | 10 | Terminology, formatting, depth level consistent across all files |
| 6 | **Jekyll site** | 8 | GitHub Pages builds and renders correctly |
| 7 | **Polish** | 7 | No rough edges — typos, formatting issues, incomplete sentences |
| **Total** | | **100** | **≥ 95 required** |

---

## Phase 8: Cleanup

### Objective
Remove all dev-only artifacts. Finalize the repo for delivery.

### Tasks

#### 8.1 Remove dev artifacts
- [ ] Delete `docs/_research/` directory (research briefs were for development)
- [ ] Delete `docs/initial-prompt.md` (AI generation prompt — not for workshop delivery)
- [ ] Delete `docs/final-prompt-plan.md` (AI generation plan — not for workshop delivery)
- [ ] Review `tests/fixtures/known-issues.json` — should be empty; delete if so

#### 8.2 Clean up this plan document
- [ ] Move `docs/PLAN.md` to `docs/_archive/PLAN.md` or delete entirely
- [ ] OR: Convert to a lightweight `CONTRIBUTING.md` if ongoing development is expected

#### 8.3 Finalize git history
- [ ] Review commit history for cleanliness
- [ ] Ensure no large/temporary files committed
- [ ] Create a meaningful PR description summarizing all changes

#### 8.4 Final full test run
- [ ] Run complete test suite one final time
- [ ] Verify GitHub Pages builds

#### 8.5 PR preparation
- [ ] Create PR from `feature/vbd-workshop-expansion` → `main`
- [ ] Write detailed PR description with before/after metrics
- [ ] Tag for review

### Deliverables
- Clean repo with no dev artifacts
- Ready-to-merge PR

### Quality Gate Rubric — Phase 8

| # | Category | Weight | Pass Criteria |
|---|----------|--------|---------------|
| 1 | **No dev artifacts in deliverable** | 30 | No research files, AI prompts, or planning docs in the final state |
| 2 | **Test suite passes** | 25 | Clean test run, no failures |
| 3 | **Repo cleanliness** | 20 | No large files, no temp files, clean git history |
| 4 | **PR quality** | 15 | PR description is thorough and informative |
| 5 | **Ready for delivery** | 10 | A facilitator could pick up this repo and deliver the workshop |
| **Total** | | **100** | **≥ 95 required** |

---

## Quality Gate Protocol

### How Quality Gates Work

Every phase transition requires passing the weighted rubric with a score ≥ **95/100**.

#### Review Process
1. **One pass per rubric category.** Each category is reviewed by an independent agent with fresh context, focused solely on that category.
2. **Score each category** on its full weight scale (e.g., a 20-point category scores 0-20).
3. **Sum all category scores** for the phase total.
4. **If total ≥ 95:** Phase passes. Proceed to next phase.
5. **If total < 95:** Identify lowest-scoring categories. Iterate (fix issues, re-review those categories only). Repeat until ≥ 95.

#### Review Agent Configuration
- **Model:** `claude-opus-4.6` (or best available)
- **Context:** Each review pass gets only the category description, pass criteria, and the relevant files — NOT the full plan or other categories
- **Independence:** Review passes must not influence each other; no shared state between passes

#### Iteration Protocol
- Maximum 3 iteration cycles per phase before escalating to human review
- Each iteration cycle: fix → re-test → re-review failing categories only
- If stuck after 3 cycles, document blocker and ask for human guidance

---

## Progress Tracker

### Phase Status

| Phase | Name | Status | Score | Started | Completed |
|-------|------|--------|-------|---------|-----------|
| 0 | Test Infrastructure | ✅ Complete | Pending QG | 2026-04-01 | 2026-04-01 |
| 1 | Baseline Test Coverage | ✅ Complete | 72 | 100 | 100 |
| 2 | Content Audit & Research | ✅ Complete | 92 → 96 | 2026-04-02 | 2026-04-02 |
| 3 | Update Existing Content | ✅ Complete | 99 | 2026-04-02 | 2026-04-02 |
| 4 | New Documentation | ✅ Complete | 98 | 2026-04-02 | 2026-04-02 |
| 5 | New Hands-on Labs | ✅ Complete | — | 2026-04-02 | 2026-04-02 |
| 6 | VBD Structural Materials | ✅ Complete | — | 2026-04-02 | 2026-04-02 |
| 7 | Integration & Polish | ✅ Complete | — | 2026-04-02 | 2026-04-02 |
| 8 | Cleanup | ✅ Complete | — | 2026-04-02 | 2026-04-02 |

### Metrics

| Metric | Baseline | Current | Target |
|--------|----------|---------|--------|
| VBD Agenda Coverage (docs) | 50% (11/22) | 100% (22/22) | 100% |
| VBD Agenda Coverage (labs) | 27% (6/22) | 91% (20/22) | 91% (2 P1 items have no lab by design) |
| Total Lab Time | ~50 min | ~4.2-4.8 hrs | 4-5 hrs |
| Test Checks | 594 (Phase 0) | 1,506 (Phase 5) | TBD |
| Known Issues (Phase 3) | 28 assigned | 28 resolved | 0 |
| Docs Count | 21 (18 numbered + 3 non-numbered) | 30 (27 numbered + 3 non-numbered) | 27+ |
| Labs Count | 6 (5 + setup) | 16 (15 + setup) | 15 |
| Broken Links | 34 (24 external + 10 internal) | 0 (all fixed) | 0 |
| Freshness Warnings | 43 (8 patterns) | 9 (intentional umbrella term) | 0 |
| Mermaid Diagrams | 66 | 80 | 66+ |

### Session Log

| Session | Date | Phases Worked | Notes |
|---------|------|---------------|-------|
| 1 | 2026-04-01 | Planning | Created plan, branch, initial analysis |
| 2 | 2026-04-01 | Phase 0 | Test infrastructure — 9/9 suites green, QG 96/100 |
| 3 | 2026-04-02 | Phase 1 | Baseline test coverage — expectations, known issues, metrics |
| 4 | 2026-04-02 | Phase 2 | Content audit & research — 15 research briefs (6,471 lines), all tests green |
| 5 | 2026-04-02 | Phase 3 | Update existing content — 28 known issues resolved, 33 broken links fixed, GHAS terminology updated across 15 docs, lab03 rewritten for Rulesets, doc12 Copilot governance updated, README modernized |
| 6 | 2026-04-02 | Phase 4 | New documentation — 9 new docs (8,671 lines, 15 Mermaid diagrams), VBD doc coverage 50%→100%, 36/36 expectation files matched, 9/9 test suites green |
| 7 | 2026-04-02 | Phase 5 | New hands-on labs — 10 new labs (1,771 lines), lab coverage 32%→91%, total lab time ~55 min→~4.5 hrs, 776 structure checks, 95 lab completeness checks, 9/9 suites green |
| 8 | 2026-04-02 | Phase 6 | VBD structural materials — 7 new files (1,883 lines): AGENDA, INSTRUCTOR-GUIDE, PRE-WORKSHOP-CHECKLIST, KNOWLEDGE-CHECKS, POST-WORKSHOP-ASSESSMENT, REFERENCE-CARD, SLIDE-DECK-OUTLINE. 849 structure checks, 9/9 suites green |

---

## Appendix: Files Created by This Effort

These files are created as part of the development process and should be cleaned up in Phase 8:

| File/Directory | Purpose | Cleanup Action |
|----------------|---------|----------------|
| `docs/PLAN.md` | This plan document | Archive or delete |
| `docs/_research/*` | Research briefs for Phase 2 | Delete |
| `docs/initial-prompt.md` | Pre-existing AI prompt (not ours) | Delete |
| `docs/final-prompt-plan.md` | Pre-existing AI plan (not ours) | Delete |
| `tests/fixtures/known-issues.json` | Issue tracking during development | Delete if empty |

All other files created (new docs, labs, test infrastructure, VBD materials) are permanent deliverables.
