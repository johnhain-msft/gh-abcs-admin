# Workshop Quality Review Rubric

**Workshop:** GitHub Admin Training — GitHub Enterprise Cloud (L300)
**Version:** 1.0 · April 2026
**Purpose:** Structured, weighted evaluation framework for multi-pass accuracy and quality review. Each criterion is designed to be independently verifiable using `/doublecheck` against current GitHub documentation and web sources.

---

## Scoring Guide

| Score | Label | Meaning |
|-------|-------|---------|
| **5** | Excellent | Accurate, comprehensive, current — no changes needed |
| **4** | Good | Minor gaps or wording tweaks; no factual errors |
| **3** | Adequate | Partially correct or missing meaningful detail; needs revision |
| **2** | Weak | Contains inaccuracies, outdated info, or significant gaps |
| **1** | Failing | Fundamentally incorrect, dangerously misleading, or absent |

**Dimension score** = average of its criteria × dimension weight.
**Overall score** = sum of weighted dimension scores (max 100).

---

## Dimension Summary

| # | Dimension | Weight | Criteria | Phase |
|---|-----------|--------|----------|-------|
| 1 | Technical Accuracy & Currency | **25%** | 12 | 1 |
| 2 | Breadth & Depth of Coverage | **20%** | 9 | 2 |
| 3 | Pedagogical Design & Learning Science | **15%** | 8 | 3 |
| 4 | Practical Applicability & Hands-On Quality | **15%** | 8 | 3 |
| 5 | Structural & Editorial Integrity | **10%** | 7 | 4 |
| 6 | Instructor Enablement | **8%** | 5 | 5 |
| 7 | Participant Experience & Post-Workshop Value | **7%** | 5 | 5 |
| | **Total** | **100%** | **54** | |

---

## Phase 1 — Technical Accuracy & Currency (25%)

> **Goal:** Verify every factual claim, feature description, API reference, CLI command, and pricing statement against current GitHub documentation (April 2026). This is the highest-stakes dimension — outdated or incorrect information in a training workshop directly harms learner trust and outcomes.

### Criteria

#### 1.1 GitHub Feature Descriptions (Weight: 3/12)

**What to check:**
- Repository rulesets described accurately (org-level vs repo-level, layering, bypass lists, tag targets, evaluate mode)
- Security features: Secret Protection, Code Security, Dependabot correctly described with current product names and capabilities
- Push protection mechanics (block, bypass request, delegated bypass) match current behavior
- EMU described correctly (IdP integration, naming conventions, limitations, SCIM)
- Copilot governance (enterprise policies, content exclusions, seat management, metrics)
- Custom repository roles (available permissions, creation flow, limits)
- Code security configurations (org-level policy management)

**Files to verify:** `docs/07-repository-governance.md`, `docs/08-security-compliance.md`, `docs/11-security-by-default-policies.md`, `docs/04-enterprise-managed-users.md`, `docs/12-github-copilot-governance.md`, `labs/lab03.md`, `labs/lab06.md`, `labs/lab07.md`, `labs/lab15.md`

**Doublecheck against:** `https://docs.github.com/en/enterprise-cloud@latest`

| Score | Criteria |
|-------|----------|
| 5 | All features described match current GA behavior; nuances and edge cases noted |
| 3 | Core features correct but missing recent changes (e.g., new ruleset rule types, new Copilot settings) |
| 1 | Features described using deprecated names, removed options, or incorrect workflows |

---

#### 1.2 IAM & Authentication Accuracy (Weight: 2/12)

**What to check:**
- SAML SSO configuration flow is current (Entra ID, Okta, PingOne)
- SCIM provisioning steps and supported IdPs are accurate
- OIDC for Actions described correctly (token claims, subject customization)
- EMU vs non-EMU trade-offs are complete and fair
- Fine-grained PATs described with current scope model
- SSH certificate authorities and deploy keys guidance current

**Files to verify:** `docs/03-identity-access-management.md`, `docs/04-enterprise-managed-users.md`, `docs/05-teams-permissions.md`

**Doublecheck against:** GitHub IAM docs, Entra ID SAML/SCIM integration docs

| Score | Criteria |
|-------|----------|
| 5 | All IdP integration steps match current UI/API; EMU limitations list complete |
| 3 | Generally correct but references older Entra ID (Azure AD) naming or misses a new IdP option |
| 1 | Authentication flows described don't match current GitHub behavior |

---

#### 1.3 API & CLI Command Accuracy (Weight: 2/12)

**What to check:**
- REST API endpoints use current paths and response schemas
- GraphQL queries use current schema (no deprecated fields)
- `gh` CLI commands use current syntax and flags
- API version headers mentioned where relevant (`X-GitHub-Api-Version`)
- Rate limiting information accurate (primary, secondary, GraphQL cost)
- Authentication methods for API (PAT, GitHub App, GITHUB_TOKEN scopes) current

**Files to verify:** `docs/24-scripts-automation.md`, `docs/27-integrations-status-api.md`, `labs/lab05.md`, `labs/lab13.md`, `docs/REFERENCE-CARD.md`

**Doublecheck against:** `https://docs.github.com/en/rest`, `https://docs.github.com/en/graphql`, `gh` CLI man pages

| Score | Criteria |
|-------|----------|
| 5 | All commands run successfully; endpoints return expected responses; version-aware |
| 3 | Commands work but miss new flags/options; no version header guidance |
| 1 | Endpoints return 404/410; CLI commands fail with unknown flag errors |

---

#### 1.4 Security Feature Accuracy (Weight: 2/12)

**What to check:**
- GitHub Advanced Security → now "Secret Protection" + "Code Security" (product rename)
- Secret scanning: partner patterns, custom patterns, validity checks, AI detection
- Code scanning: CodeQL, third-party SARIF, default setup vs advanced setup
- Dependabot: alerts, security updates, version updates, auto-triage rules, grouped updates
- Push protection: user-level, org-level, delegated bypass, metrics
- Security overview dashboard features and filters
- Pricing model accurate (per-active-committer pricing for Secret Protection / Code Security)

**Files to verify:** `docs/08-security-compliance.md`, `docs/11-security-by-default-policies.md`, `labs/lab07.md`

**Doublecheck against:** GitHub security feature docs, GitHub pricing page, GitHub changelog

| Score | Criteria |
|-------|----------|
| 5 | Product names, pricing, and capabilities match April 2026 reality; mentions latest features |
| 3 | Core security features correct but uses outdated "GHAS" umbrella term without clarification |
| 1 | Describes deprecated security workflows or incorrect pricing model |

---

#### 1.5 Pricing & Licensing Accuracy (Weight: 1/12)

**What to check:**
- GHEC per-user pricing current
- Secret Protection / Code Security per-active-committer pricing correct
- Copilot seat pricing (Business, Enterprise tiers) current
- Git LFS data pack pricing current
- Actions/Packages included minutes and storage accurate
- License metering and true-up process described correctly

**Files to verify:** `docs/19-licenses-billing.md`, `docs/FAQ-workshop.md`

**Doublecheck against:** `https://github.com/pricing`, GitHub billing docs

| Score | Criteria |
|-------|----------|
| 5 | All pricing figures match current published rates; licensing model described correctly |
| 3 | Prices approximately correct but missing recent tier changes |
| 1 | Pricing figures significantly wrong or describe a discontinued pricing model |

---

#### 1.6 External Link Validity (Weight: 1/12)

**What to check:**
- All 1,077 external links resolve (no 404s, no redirects to wrong pages)
- Links point to enterprise-cloud@latest docs where appropriate (not free/team docs)
- GitHub blog links still resolve (blog URLs sometimes change)
- Microsoft Learn links are current
- No links to sunset products or deprecated pages

**How to verify:** Run `npm run test:links` and spot-check the top 20 most-referenced URLs

| Score | Criteria |
|-------|----------|
| 5 | Zero broken links; all point to correct canonical URLs |
| 3 | < 5 broken links; most redirects are harmless (HTTP→HTTPS, minor path changes) |
| 1 | > 20 broken links or links point to fundamentally wrong pages |

---

#### 1.7 Terminology Currency (Weight: 1/12)

**What to check:**
- "Repository rulesets" used as the primary governance mechanism (not "branch protection rules")
- "Branch protection" mentioned only in legacy/comparison context
- "GitHub Advanced Security" → "Secret Protection" + "Code Security" naming used
- "Azure Active Directory" → "Microsoft Entra ID" naming used
- "OAuth Apps" discussed with GitHub Apps as the recommended path
- "Personal access tokens" discussed with fine-grained PATs as preferred
- "GitHub Enterprise Cloud" (not "GitHub Enterprise" ambiguously)

**Files to verify:** All docs and labs (grep-based scan)

| Score | Criteria |
|-------|----------|
| 5 | Consistently uses current terminology; legacy terms appear only in migration/comparison context |
| 3 | Mostly current but occasional legacy term used as primary without clarification |
| 1 | Pervasively uses deprecated terminology (e.g., "Azure AD", "branch protection" as primary mechanism) |

---

#### 1.8 Actions & Workflows Accuracy (Weight: 0.5/12)

**What to check:**
- Workflow YAML syntax uses current schema
- Runner labels and runner groups described correctly
- Actions permissions model (org-level, repo-level) current
- GITHUB_TOKEN permissions (default restrictive, permissions key) accurate
- Reusable workflows and composite actions described correctly
- Artifact actions use v4 (not deprecated v3)

**Files to verify:** `docs/17-github-actions-security-echo-command-injection.md`, `labs/lab02.md`, relevant sections in other docs

| Score | Criteria |
|-------|----------|
| 5 | All workflow examples run successfully; permissions model matches current defaults |
| 3 | Workflows work but use older patterns that still function |
| 1 | Workflow syntax errors or describes removed features |

---

#### 1.9 Migration Guidance Accuracy (Weight: 0.5/12)

**What to check:**
- GitHub Enterprise Importer (GEI) capabilities and limitations current
- ADO-to-GitHub migration paths accurately described
- What migrates vs. what doesn't (work items, pipelines, test plans)
- Azure Pipelines + GitHub Repos integration accurately described
- Supported source systems for GEI current

**Files to verify:** `docs/14-github-enterprise-importer-ado-guide.md`, `docs/15-azure-pipelines-github-repos-integration.md`, `docs/16-azure-devops-to-github-migration-analysis.md`, `docs/ado-to-github-migration-assessment.md`

**Doublecheck against:** GEI docs, ADO migration docs

| Score | Criteria |
|-------|----------|
| 5 | Migration paths, limitations, and tooling match current GEI capabilities |
| 3 | Core guidance correct but misses recently added migration support |
| 1 | Describes deprecated migration tools or incorrect migration capabilities |

---

#### 1.10 Audit Log & Compliance Accuracy (Weight: 0.5/12)

**What to check:**
- Audit log events catalog current (new event types added regularly)
- Audit log streaming destinations accurate (Azure, S3, Datadog, Splunk, Google Cloud)
- Audit log API endpoints and query syntax correct
- Retention periods accurate
- Git events audit logging described correctly

**Files to verify:** `docs/22-audit-log-deep-dive.md`, `labs/lab08.md`

| Score | Criteria |
|-------|----------|
| 5 | Audit log capabilities, streaming destinations, and retention match current docs |
| 3 | Core audit features correct but missing recently added event types or destinations |
| 1 | Describes incorrect retention periods or removed streaming destinations |

---

#### 1.11 Deployment & Environments Accuracy (Weight: 0.5/12)

**What to check:**
- Environments and protection rules described correctly
- Required reviewers, wait timer, deployment branches/tags current
- Custom deployment protection rules (GitHub Apps integration) mentioned
- OIDC for cloud deployments described accurately
- Environment secrets and variables behavior correct

**Files to verify:** `docs/23-deployment-strategies.md`, `labs/lab12.md`

| Score | Criteria |
|-------|----------|
| 5 | All environment features and protection rules match current capabilities |
| 3 | Core features correct but missing newer protection rule types |
| 1 | Describes removed or significantly changed deployment features |

---

#### 1.12 Copilot Governance Accuracy (Weight: 0.5/12)

**What to check:**
- Copilot Business vs Enterprise feature differences current
- Content exclusion configuration accurate (org-level, repo-level)
- Copilot policies at enterprise level (enable/disable, suggestions, chat, CLI)
- Seat management and assignment flow correct
- Copilot metrics and usage dashboard described accurately
- Copilot in the CLI, IDE, and GitHub.com capabilities current

**Files to verify:** `docs/12-github-copilot-governance.md`, `labs/lab15.md`

**Doublecheck against:** GitHub Copilot docs for business, GitHub changelog for Copilot

| Score | Criteria |
|-------|----------|
| 5 | Copilot governance features match current product; all tiers and policies accurate |
| 3 | Core governance correct but missing recent Copilot features (e.g., agent mode policies, MCP) |
| 1 | Describes Copilot features that don't exist or incorrect policy controls |

---

## Phase 2 — Breadth & Depth of Coverage (20%)

> **Goal:** Evaluate whether the workshop covers the full scope expected of an L300 GHEC admin training, at appropriate depth for the target audience.

### Criteria

#### 2.1 VBD Topic Map Completeness (Weight: 2/9)

**What to check:**
- Every VBD topic number (1.1–1.8, 2.1–2.14) has at least one dedicated doc AND one lab or lab section
- No VBD topic is covered only superficially (< 1 page of content)
- VBD topics are distributed appropriately across the 2-day agenda

**How to verify:** Cross-reference README lab table VBD column against `docs/AGENDA.md` and docs content

| Score | Criteria |
|-------|----------|
| 5 | 100% VBD coverage with meaningful depth on every topic |
| 3 | 90%+ coverage but 1-2 topics only touched on lightly |
| 1 | < 80% VBD coverage; multiple topics missing or stub-only |

---

#### 2.2 Enterprise-Scale Depth (Weight: 2/9)

**What to check:**
- Guidance addresses scale concerns (1000+ users, 500+ repos, multi-org)
- Enterprise-level features emphasized over org-level (enterprise policies, EMU, audit streaming)
- Multi-organization strategy documented
- IP allow lists, enterprise SSO, enterprise-level security discussed
- Runner group management and Actions at scale addressed

**Files to verify:** `docs/01-enterprise-hierarchy.md`, `docs/02-organization-strategies.md`, `docs/06-policy-inheritance.md`, `docs/10-reference-architecture.md`

| Score | Criteria |
|-------|----------|
| 5 | Consistently addresses enterprise-scale; patterns for 1000+ user environments; multi-org strategies detailed |
| 3 | Enterprise features covered but guidance often defaults to org-level thinking |
| 1 | Content feels like GitHub Team-level administration, not Enterprise Cloud |

---

#### 2.3 Security Coverage Depth (Weight: 2/9)

**What to check:**
- Security-by-default policies comprehensive (not just listing features)
- Supply chain security: Dependabot, dependency review, SBOM
- Secret scanning: partner patterns, custom patterns, push protection, validity checks
- Code scanning: CodeQL, default setup, third-party integration, autofix
- Security overview and security campaigns
- Compliance frameworks mapping (SOC 2, FedRAMP mention)

**Files to verify:** `docs/08-security-compliance.md`, `docs/11-security-by-default-policies.md`, `labs/lab07.md`

| Score | Criteria |
|-------|----------|
| 5 | Security coverage is comprehensive enough for a security-focused admin; actionable hardening guidance |
| 3 | Covers main security features but misses advanced topics (campaigns, custom patterns, SBOM) |
| 1 | Security section is shallow; only lists features without configuration guidance |

---

#### 2.4 API & Automation Depth (Weight: 1/9)

**What to check:**
- REST and GraphQL both covered with working examples
- GitHub Apps vs PATs for automation guidance
- Webhook configuration and payload handling
- `gh` CLI scripting patterns (loops, jq, automation)
- Real-world automation scenarios (user provisioning, repo creation, compliance reporting)

**Files to verify:** `docs/24-scripts-automation.md`, `docs/27-integrations-status-api.md`, `labs/lab05.md`, `labs/lab13.md`

| Score | Criteria |
|-------|----------|
| 5 | API section enables admins to build real automation; multiple working examples; Apps vs PAT guidance clear |
| 3 | API basics covered but limited to simple GET examples; no real automation patterns |
| 1 | API coverage is surface-level; no working examples |

---

#### 2.5 Identity & Access Management Depth (Weight: 1/9)

**What to check:**
- SAML SSO configuration depth (not just "enable SSO")
- SCIM provisioning with specific IdP guidance (Entra ID, Okta)
- EMU vs standard enterprise decision framework
- Team sync with IdP groups
- 2FA enforcement and recovery
- Outside collaborator management

**Files to verify:** `docs/03-identity-access-management.md`, `docs/04-enterprise-managed-users.md`, `docs/21-user-administration.md`

| Score | Criteria |
|-------|----------|
| 5 | IAM section is decision-guide quality; admins can choose EMU vs non-EMU with confidence |
| 3 | Good overview but lacks step-by-step IdP configuration detail |
| 1 | IAM is theoretical; no practical configuration guidance |

---

#### 2.6 Migration & Onboarding Coverage (Weight: 0.5/9)

**What to check:**
- ADO-to-GitHub migration covered end-to-end
- GEI tool usage documented
- Onboarding implementation plan is actionable
- Addresses common migration concerns (history preservation, CI/CD, work items)
- Business case materials provided

**Files to verify:** `docs/13-github-onboarding-implementation-plan.md`, `docs/14-github-enterprise-importer-ado-guide.md`, `docs/16-azure-devops-to-github-migration-analysis.md`, `docs/ADO-to-GitHub-Migration-Business-Case.md`

| Score | Criteria |
|-------|----------|
| 5 | Migration section is standalone-useful; could drive a real migration project |
| 3 | Good overview but would need additional research to execute a migration |
| 1 | Migration content is surface-level or absent |

---

#### 2.7 Governance & Compliance Breadth (Weight: 0.5/9)

**What to check:**
- Repository governance spans rulesets, templates, CODEOWNERS, auto-merge, merge queues
- Policy inheritance (enterprise → org → repo) clearly explained
- Compliance audit trail capabilities documented
- Inner source enablement addressed
- Repository archival and lifecycle guidance

**Files to verify:** `docs/07-repository-governance.md`, `docs/06-policy-inheritance.md`, `docs/09-best-practices-waf.md`

| Score | Criteria |
|-------|----------|
| 5 | Governance section addresses the full repository lifecycle with compliance lens |
| 3 | Good governance coverage but focused mainly on branch/merge governance |
| 1 | Governance section is narrow; misses enterprise-scale concerns |

---

#### 2.8 Emerging Features Coverage (Weight: 0.5/9)

**What to check:**
- GitHub Copilot agent mode and enterprise controls mentioned
- Custom properties for repositories
- Repository custom properties-based rulesets
- Copilot metrics API
- Repository rules insights
- Secret scanning AI detection
- Merge queues
- Artifact attestations / supply chain security

**Files to verify:** All docs (scan for mentions of recent features)

**Doublecheck against:** GitHub Changelog (last 12 months)

| Score | Criteria |
|-------|----------|
| 5 | Workshop covers features announced in the last 6 months; feels current and forward-looking |
| 3 | Covers features through mid-2025 but missing recent additions |
| 1 | No coverage of features newer than 2024; feels dated |

---

#### 2.9 Missing Critical Topics (Weight: 0.5/9)

**What to check for absence:**
- IP allow lists
- Enterprise-level Actions runner groups
- Hosted compute (larger runners, GPU runners)
- Pre-receive hooks (GHES only, but worth noting unavailability in GHEC)
- GitHub Connect (for hybrid GHES+GHEC)
- Codespaces administration and policies
- Projects (new) administration
- Required workflows

**Assessment:** Each missing critical topic deducts from score

| Score | Criteria |
|-------|----------|
| 5 | No critical admin topic missing; workshop is comprehensive |
| 3 | 1-2 notable gaps that admins would likely ask about |
| 1 | Multiple critical enterprise admin topics missing |

---

## Phase 3 — Pedagogical Design & Practical Quality (30%)

### 3A. Pedagogical Design & Learning Science (15%)

#### 3A.1 Learning Objectives Alignment (Weight: 2/8)

**What to check:**
- README states 7 learning objectives — does every objective have corresponding content AND assessment?
- Each AGENDA module has clear learning outcomes tied to the objectives
- Post-workshop assessment maps to all 7 objectives
- No orphan content (content that doesn't serve any stated objective)

**Files to verify:** `README.md`, `docs/AGENDA.md`, `docs/POST-WORKSHOP-ASSESSMENT.md`, `docs/KNOWLEDGE-CHECKS.md`

| Score | Criteria |
|-------|----------|
| 5 | Perfect alignment: every objective taught, practiced, and assessed |
| 3 | Most objectives covered but 1-2 lack corresponding lab or assessment |
| 1 | Learning objectives are aspirational; content doesn't actually deliver on them |

---

#### 3A.2 Bloom's Taxonomy Level (Weight: 2/8)

**What to check:**
- L300 = Apply/Analyze/Evaluate level content
- Labs require application (not just "click here, then click there")
- Knowledge checks test analysis and scenario judgment, not just recall
- Docs include decision frameworks, trade-off analysis, and "when to use X vs Y"
- Content goes beyond product documentation summary

**Files to verify:** Sample 5-6 docs and 3-4 labs for depth analysis

| Score | Criteria |
|-------|----------|
| 5 | Consistently at Apply/Analyze level; scenarios require judgment; decision frameworks provided |
| 3 | Mix of Remember/Understand and Apply; some labs are mechanical click-through |
| 1 | Mostly Remember/Understand; content reads like reformatted product docs |

---

#### 3A.3 Progressive Complexity (Weight: 1.5/8)

**What to check:**
- Day 1 starts with enterprise governance and identity (IAM, enterprise policies, teams, audit)
- Day 2 builds on Day 1 foundations with hands-on repo governance (rulesets, security, API, automation)
- Labs increase in complexity (Lab 3 → Lab 6 → Lab 7 shows progression)
- Self-paced extension labs are correctly positioned as more advanced
- No lab assumes knowledge from a later section

**Files to verify:** `docs/AGENDA.md`, lab sequence

| Score | Criteria |
|-------|----------|
| 5 | Clear complexity ramp; each module builds on prior; self-paced labs are genuinely advanced |
| 3 | Generally progressive but some advanced topics appear too early |
| 1 | No discernible progression; topics seem randomly ordered |

---

#### 3A.4 Knowledge Check Quality (Weight: 1/8)

**What to check:**
- 39 questions cover all VBD topic areas (Day 1 and Day 2)
- Questions test scenario-based thinking, not just recall
- Wrong answers are plausible (good distractors)
- Answer key provided with explanations
- Questions are at L300 difficulty

**Files to verify:** `docs/KNOWLEDGE-CHECKS.md`

| Score | Criteria |
|-------|----------|
| 5 | All modules covered; questions are scenario-based; distractors are strong; explanations educate |
| 3 | Good coverage but some questions are trivia-level; weak distractors |
| 1 | Questions are mostly recall-based; poor distractors; missing modules |

---

#### 3A.5 Assessment–Instruction Alignment (Weight: 0.5/8)

**What to check:**
- Post-workshop self-assessment items correspond to actual workshop content
- Knowledge checks ask about what was taught (not tangential topics)
- Lab exercises practice skills that assessments will measure
- No assessment item tests something the workshop never covered

**Files to verify:** Cross-reference `docs/POST-WORKSHOP-ASSESSMENT.md` against `docs/AGENDA.md`

| Score | Criteria |
|-------|----------|
| 5 | Complete alignment: every assessment item traceable to specific content and lab |
| 3 | Mostly aligned but 1-2 assessment items cover topics not practiced in labs |
| 1 | Assessment asks about topics the workshop didn't adequately cover |

---

#### 3A.6 Time Feasibility (Weight: 0.5/8)

**What to check:**
- Day 1: 180 min total → ~75 min presentation, ~75 min labs, ~30 min admin/breaks
- Day 2: 180 min total → similar distribution
- Lab durations are realistic (can be completed within stated time)
- Buffer time exists for Q&A and troubleshooting
- No module is so rushed it can't be effective

**Files to verify:** `docs/AGENDA.md` timing columns

| Score | Criteria |
|-------|----------|
| 5 | Timing is realistic with 10-15% buffer; lab durations validated |
| 3 | Tight but achievable for experienced admins; no buffer for troubleshooting |
| 1 | More content than time allows; participants will feel rushed |

---

#### 3A.7 Engagement Techniques (Weight: 0.25/8)

**What to check:**
- Presentation → Lab → Presentation → Lab rhythm maintained
- Discussion prompts or group activities included
- Knowledge checks integrated at natural breakpoints (not just end of day)
- Variety of activities (not all click-through labs)
- Instructor guide suggests engagement techniques

**Files to verify:** `docs/AGENDA.md`, `docs/INSTRUCTOR-GUIDE.md`

| Score | Criteria |
|-------|----------|
| 5 | Regular rhythm; multiple engagement types; discussion prompts throughout |
| 3 | Good rhythm but all labs are same format; no group discussion built in |
| 1 | Lecture-heavy; labs feel like afterthoughts |

---

#### 3A.8 Accessibility & Inclusivity (Weight: 0.25/8)

**What to check:**
- Mermaid diagrams have text descriptions or are supplemented by tables
- Content doesn't rely solely on visual patterns (color, screenshots)
- Instructions don't assume specific OS (Windows/Mac/Linux alternatives given)
- Prerequisites clearly stated (knowledge level, access requirements)
- Multiple learning modalities addressed (read, watch, do)

**Files to verify:** Labs, docs with Mermaid diagrams, `docs/PRE-WORKSHOP-CHECKLIST.md`

| Score | Criteria |
|-------|----------|
| 5 | Fully accessible; no single-modality dependencies; OS-agnostic instructions |
| 3 | Mostly accessible but some diagrams lack text alternatives |
| 1 | Relies heavily on visual-only content; OS-specific without alternatives |

---

### 3B. Practical Applicability & Hands-On Quality (15%)

#### 3B.1 Lab Step Clarity (Weight: 2/8)

**What to check:**
- Each lab step is unambiguous (exact click path given)
- Expected outcomes described after key steps
- Screenshots or Mermaid diagrams clarify complex UI navigation
- Error handling: what to do if a step doesn't work as expected
- Numbered steps with clear action verbs (Navigate, Click, Enter, Verify)

**Files to verify:** All 15 lab files + setup.md

| Score | Criteria |
|-------|----------|
| 5 | Anyone with base GitHub knowledge can follow every step; expected outcomes always shown |
| 3 | Most steps clear but some assume knowledge not stated in prerequisites |
| 1 | Steps are vague ("configure the settings appropriately") or missing outcomes |

---

#### 3B.2 Lab Relevance to Real-World Admin Tasks (Weight: 2/8)

**What to check:**
- Labs practice tasks admins actually do (not toy exercises)
- Scenarios reflect enterprise patterns (not just single-user repos)
- Labs reference decisions admins face (when to use rulesets vs branch protection, how to structure teams)
- Self-paced labs address real operational tasks (dormant users, unhealthy repos)

**Files to verify:** All labs

| Score | Criteria |
|-------|----------|
| 5 | Every lab practices a skill directly applicable to production enterprise administration |
| 3 | Most labs are relevant but some feel like product demos rather than admin training |
| 1 | Labs are disconnected from real admin work; purely academic exercises |

---

#### 3B.3 Code Examples Quality (Weight: 1.5/8)

**What to check:**
- API examples use realistic data and patterns
- `gh` CLI scripts are production-ready (error handling, pagination, edge cases)
- GraphQL queries are well-formed and use appropriate fields
- Code blocks have language annotations for syntax highlighting
- Examples can be copy-pasted and run (no placeholder-only examples)

**Files to verify:** `labs/lab05.md`, `labs/lab13.md`, `docs/24-scripts-automation.md`, `docs/REFERENCE-CARD.md`

| Score | Criteria |
|-------|----------|
| 5 | Code examples are copy-paste ready; include error handling; real-world patterns |
| 3 | Examples work but are simplified; lack error handling or pagination |
| 1 | Code examples are pseudocode or have syntax errors |

---

#### 3B.4 Decision Frameworks & Trade-Off Guidance (Weight: 1/8)

**What to check:**
- EMU vs non-EMU decision matrix with clear criteria
- Single-org vs multi-org decision framework
- Rulesets vs branch protection comparison table
- GitHub Apps vs PATs guidance for automation
- Enterprise-level vs org-level policy decisions
- Comparison tables or decision trees present

**Files to verify:** `docs/02-organization-strategies.md`, `docs/03-identity-access-management.md`, `docs/04-enterprise-managed-users.md`, `docs/07-repository-governance.md`

| Score | Criteria |
|-------|----------|
| 5 | Clear decision frameworks with criteria, trade-offs, and recommendations for each major choice |
| 3 | Some comparison tables exist but lack weighted criteria or clear recommendations |
| 1 | No decision frameworks; content presents features without helping admins choose |

---

#### 3B.5 Troubleshooting & Common Pitfalls (Weight: 0.5/8)

**What to check:**
- Labs include "if this doesn't work, try..." guidance
- Common mistakes are called out with warning blocks
- FAQ addresses real workshop questions from past deliveries
- Instructor guide has troubleshooting section for common lab issues

**Files to verify:** Labs, `docs/FAQ-workshop.md`, `docs/INSTRUCTOR-GUIDE.md`

| Score | Criteria |
|-------|----------|
| 5 | Every lab has troubleshooting guidance; FAQ addresses real-world issues; callouts for common mistakes |
| 3 | Some troubleshooting guidance but not systematic; FAQ exists but limited |
| 1 | No troubleshooting guidance; participants stuck when things deviate from happy path |

---

#### 3B.6 Reference Materials Quality (Weight: 0.5/8)

**What to check:**
- Reference card is actually useful as a quick-reference (not just a doc rehash)
- Key URLs, CLI commands, API endpoints consolidated
- Cheat sheets or quick-start guides provided
- Post-workshop "what to do next" is actionable

**Files to verify:** `docs/REFERENCE-CARD.md`, `docs/POST-WORKSHOP-ASSESSMENT.md`

| Score | Criteria |
|-------|----------|
| 5 | Reference card is desk-reference quality; participants will actually use it post-workshop |
| 3 | Reference card exists but is either too long or too sparse to be useful |
| 1 | No meaningful reference materials for post-workshop use |

---

#### 3B.7 Setup & Prerequisites Completeness (Weight: 0.25/8)

**What to check:**
- Setup guide lists every tool needed with install links
- Pre-workshop checklist covers participant AND instructor preparation
- Minimum system requirements stated
- Network requirements noted (proxy/firewall considerations)
- Verification steps to confirm setup is complete

**Files to verify:** `labs/setup.md`, `docs/PRE-WORKSHOP-CHECKLIST.md`

| Score | Criteria |
|-------|----------|
| 5 | Zero-confusion setup; every prerequisite listed; verification commands provided |
| 3 | Most prerequisites covered but missing a tool or verification step |
| 1 | Setup is incomplete; participants will hit blockers on Day 1 |

---

#### 3B.8 Self-Paced Extension Value (Weight: 0.25/8)

**What to check:**
- 6 self-paced labs provide genuine extension (not just leftovers)
- Self-paced labs are self-contained (don't require instructor presence)
- Instructions are more detailed than in-session labs (since no instructor help)
- Cover topics that deepen skills from in-session content

**Files to verify:** `labs/lab01.md`, `labs/lab02.md`, `labs/lab10.md`, `labs/lab11.md`, `labs/lab12.md`, `labs/lab14.md`

| Score | Criteria |
|-------|----------|
| 5 | Self-paced labs are standalone-valuable; provide 4+ hours of additional practice |
| 3 | Self-paced labs work but some are thin or require context only available in session |
| 1 | Self-paced labs are incomplete or essentially unusable without an instructor |

---

## Phase 4 — Structural & Editorial Integrity (10%)

### Criteria

#### 4.1 Markdown Formatting Consistency (Weight: 2/7)

**What to check:**
- Heading hierarchy consistent (no skipped levels)
- Code blocks use language annotations
- Tables properly formatted
- Lists use consistent style (dashes vs asterisks)
- No raw HTML in markdown (unless necessary)
- Markdownlint rules pass

**How to verify:** Run `npm run test:lint`

| Score | Criteria |
|-------|----------|
| 5 | Zero markdownlint violations; consistent formatting throughout |
| 3 | < 10 minor violations; no structural formatting issues |
| 1 | Pervasive formatting inconsistencies |

---

#### 4.2 Cross-Reference Integrity (Weight: 1.5/7)

**What to check:**
- Docs reference related docs where appropriate (e.g., security doc links to compliance doc)
- Labs reference the docs that provide context for the lab
- AGENDA.md links to all correct docs and labs
- README table of contents matches actual file structure
- No orphan files (files not referenced from anywhere)

**How to verify:** Check AGENDA.md links, README links, inter-doc references

| Score | Criteria |
|-------|----------|
| 5 | Rich cross-referencing; every lab links to relevant docs; every doc links to related docs |
| 3 | AGENDA and README links work but inter-doc cross-references sparse |
| 1 | Minimal cross-referencing; files feel isolated from each other |

---

#### 4.3 Naming & Numbering Consistency (Weight: 1/7)

**What to check:**
- Doc numbering (01-27) is sequential with no gaps
- Lab numbering (lab01-lab15) is sequential
- VBD topic numbers are used consistently across AGENDA, README, docs, and labs
- File names match content titles
- No duplicate topic coverage (same topic in two docs without distinction)

| Score | Criteria |
|-------|----------|
| 5 | Perfect numbering; VBD mapping consistent across all files |
| 3 | Minor numbering irregularities but navigable |
| 1 | Confusing numbering; VBD mapping inconsistent |

---

#### 4.4 Spelling & Grammar (Weight: 1/7)

**What to check:**
- CSpell passes with workshop-appropriate dictionary
- No grammar errors in instructional text
- Technical terms spelled correctly
- Consistent capitalization of product names (GitHub, Copilot, CodeQL, etc.)

**How to verify:** Run `npm run test:spell`

| Score | Criteria |
|-------|----------|
| 5 | Zero spelling errors; professional grammar throughout |
| 3 | < 5 spelling/grammar issues; no confusing errors |
| 1 | Multiple spelling/grammar errors that undermine credibility |

---

#### 4.5 Mermaid Diagram Quality (Weight: 0.5/7)

**What to check:**
- Mermaid diagrams render correctly
- Diagrams add clarity (not just decorative)
- Consistent styling across diagrams
- Diagram content accurate (matches text description)

**How to verify:** Run `npm run test:mermaid`; visually inspect rendered diagrams

| Score | Criteria |
|-------|----------|
| 5 | All diagrams render; add genuine value; consistent style |
| 3 | Most render but some are hard to read or redundant with text |
| 1 | Diagrams broken, inaccurate, or absent where needed |

---

#### 4.6 Front Matter & Metadata (Weight: 0.5/7)

**What to check:**
- Files have consistent front matter (if used)
- Metadata (titles, descriptions) present and accurate
- Test suite validates front matter structure

**How to verify:** Run `npm run test:frontmatter`

| Score | Criteria |
|-------|----------|
| 5 | All files have valid, complete front matter |
| 3 | Most files have front matter; minor inconsistencies |
| 1 | Front matter missing or invalid across multiple files |

---

#### 4.7 Content Freshness Signals (Weight: 0.5/7)

**What to check:**
- No hardcoded dates that are now in the past
- "As of" statements are current or removed
- Version numbers referenced are still current
- Freshness validation test passes

**How to verify:** Run `npm run test:freshness`

| Score | Criteria |
|-------|----------|
| 5 | No stale date references; all version references current |
| 3 | 1-2 slightly dated references that don't mislead |
| 1 | Multiple hardcoded dates in the past; feels outdated |

---

## Phase 5 — Instructor & Participant Enablement (15%)

### 5A. Instructor Enablement (8%)

#### 5A.1 Instructor Guide Completeness (Weight: 2/5)

**What to check:**
- Every AGENDA module has corresponding instructor guide section
- Talking points are specific (not just "discuss rulesets")
- Demo scripts provide exact steps for instructor demonstrations
- Timing guidance is realistic and accounts for Q&A
- Troubleshooting section covers common lab failures

**Files to verify:** `docs/INSTRUCTOR-GUIDE.md`

| Score | Criteria |
|-------|----------|
| 5 | A new instructor could deliver this workshop successfully using only the guide |
| 3 | Guide covers most modules but some sections are thin; experienced instructor needed |
| 1 | Guide is an outline; instructor must create their own talking points and demos |

---

#### 5A.2 Demo Script Quality (Weight: 1/5)

**What to check:**
- Instructor demos are scripted with exact steps
- Demo repos/data requirements documented
- Expected demo outcomes stated
- Backup plan if demo fails (screenshots, pre-recorded)

**Files to verify:** `docs/INSTRUCTOR-GUIDE.md` demo sections

| Score | Criteria |
|-------|----------|
| 5 | Demos are fully scripted; prerequisites clear; fallback plan exists |
| 3 | Demo outlines exist but lack step-by-step detail |
| 1 | No demo scripts; instructor must improvise |

---

#### 5A.3 Slide Deck Readiness (Weight: 1/5)

**What to check:**
- Slide deck outline covers every presentation module
- Visual suggestions are specific and useful
- Speaker notes provide real value beyond just restating slide content
- Outline is detailed enough to create a slide deck without extensive additional research

**Files to verify:** `docs/SLIDE-DECK-OUTLINE.md`

| Score | Criteria |
|-------|----------|
| 5 | Outline is comprehensive; a designer could produce slides from it directly |
| 3 | Covers most modules but some slides lack visual/content guidance |
| 1 | Outline is skeletal; creating slides requires significant independent work |

---

#### 5A.4 Pre-Workshop Preparation (Weight: 0.5/5)

**What to check:**
- Environment provisioning steps clear
- Participant communication templates or guidance
- Day-of logistics checklist
- Technical requirements verified (GHEC org, licenses, network)

**Files to verify:** `docs/PRE-WORKSHOP-CHECKLIST.md`, `docs/INSTRUCTOR-GUIDE.md` setup section

| Score | Criteria |
|-------|----------|
| 5 | Pre-workshop prep is a complete runbook; nothing left to figure out |
| 3 | Covers main items but instructor must fill in organizational logistics |
| 1 | Minimal prep guidance; instructor must design their own setup process |

---

#### 5A.5 Adaptability Guidance (Weight: 0.5/5)

**What to check:**
- Guidance for shortening the workshop (what to cut if time-constrained)
- Guidance for different audience levels (more/less advanced groups)
- Optional deep-dive sections identified
- Customization points for customer-specific content

**Files to verify:** `docs/INSTRUCTOR-GUIDE.md`, `docs/AGENDA.md`

| Score | Criteria |
|-------|----------|
| 5 | Clear guidance for time-constrained, advanced, and beginner variations |
| 3 | Some optional sections identified but no systematic adaptation guidance |
| 1 | Workshop is rigid; no guidance for adapting to different audiences or time constraints |

---

### 5B. Participant Experience & Post-Workshop Value (7%)

#### 5B.1 Participant Onboarding Experience (Weight: 1.5/5)

**What to check:**
- Pre-workshop checklist is comprehensive and action-oriented
- Setup guide gets participants to "ready" state quickly
- Clear communication about what to expect
- Quick-start path (README → Checklist → Setup → Agenda)

**Files to verify:** `docs/PRE-WORKSHOP-CHECKLIST.md`, `labs/setup.md`, `README.md`

| Score | Criteria |
|-------|----------|
| 5 | Seamless onboarding; participant goes from invite to ready in < 30 min |
| 3 | Onboarding works but requires some back-and-forth or troubleshooting |
| 1 | Onboarding is confusing or incomplete; participants arrive unprepared |

---

#### 5B.2 Post-Workshop Takeaway Value (Weight: 1.5/5)

**What to check:**
- Reference card genuinely useful as ongoing desk reference
- Post-workshop assessment creates a personal action plan
- Additional resources section curated (not just a link dump)
- Self-paced labs provide meaningful extended learning path
- FAQ captures real questions for future reference

**Files to verify:** `docs/REFERENCE-CARD.md`, `docs/POST-WORKSHOP-ASSESSMENT.md`, `README.md` resources section

| Score | Criteria |
|-------|----------|
| 5 | Participants leave with tangible tools they'll use; clear next-steps path |
| 3 | Some post-workshop materials but participants would need to find their own next steps |
| 1 | Workshop ends with no clear takeaway or follow-up path |

---

#### 5B.3 Documentation as Reference Library (Weight: 1/5)

**What to check:**
- 27 docs serve as an ongoing reference library beyond the workshop
- Content is organized for lookup (not just sequential reading)
- Docs are self-contained enough to be useful standalone
- Table of contents / navigation aids provided

**Files to verify:** README doc tables, individual doc structure

| Score | Criteria |
|-------|----------|
| 5 | Docs function as a curated admin reference library; organized for lookup |
| 3 | Docs are useful for reference but organized for sequential workshop delivery |
| 1 | Docs are only useful during the workshop; too coupled to session flow |

---

#### 5B.4 FAQ Quality & Coverage (Weight: 0.5/5)

**What to check:**
- FAQ addresses real questions from past workshop deliveries
- Answers are thorough and cite sources
- FAQ organized by topic
- Covers common participant concerns (pricing, licensing, migration)

**Files to verify:** `docs/FAQ-workshop.md`

| Score | Criteria |
|-------|----------|
| 5 | FAQ is comprehensive; addresses the top 20+ questions any enterprise admin would ask |
| 3 | FAQ exists with real questions but limited scope (< 15 questions) |
| 1 | FAQ is stub or generic; doesn't address real participant concerns |

---

#### 5B.5 Certification / Proof of Completion Path (Weight: 0.5/5)

**What to check:**
- Post-workshop assessment provides a measurable outcome
- Suggested certification paths (GitHub Certifications) mentioned
- Connection to Microsoft Learn collections
- Continuing education recommendations

**Files to verify:** `docs/POST-WORKSHOP-ASSESSMENT.md`, `README.md` resources

| Score | Criteria |
|-------|----------|
| 5 | Clear path from workshop to GitHub/Microsoft certification; learning journey mapped |
| 3 | Mentions certifications but doesn't map workshop content to cert domains |
| 1 | No connection to certification or continuing education paths |

---

## Review Execution Guide

### How to Run This Rubric

**Phase 1 — Technical Accuracy (Estimated: 3-4 hours)**
For each criterion in Phase 1, use `/doublecheck` to verify claims against current GitHub documentation. Focus on:
1. Pick the files listed under each criterion
2. Identify specific factual claims (feature behavior, pricing, API endpoints)
3. Verify each claim against `docs.github.com/en/enterprise-cloud@latest` and GitHub Changelog
4. Score the criterion and note specific issues found

**Phase 2 — Breadth & Depth (Estimated: 2-3 hours)**
Cross-reference the VBD topic map against actual content. Look for depth gaps and missing topics.

**Phase 3 — Pedagogical & Practical (Estimated: 2-3 hours)**
Read through labs sequentially as a participant would. Evaluate learning progression, clarity, and real-world relevance.

**Phase 4 — Structural (Estimated: 1 hour)**
Run the automated test suites (`npm test -- --skip-links`), then manually check cross-references and consistency.

**Phase 5 — Enablement (Estimated: 1-2 hours)**
Read the instructor guide as a first-time facilitator. Evaluate whether you could deliver the workshop.

### Score Calculation

```
Dimension Score = (Sum of criteria scores / Max possible) × 5
Weighted Score  = Dimension Score × Weight × 20

Overall Score   = Sum of all Weighted Scores (max 100)
```

### Quality Thresholds

| Overall Score | Rating | Action |
|---------------|--------|--------|
| **90-100** | ✅ Excellent | Ready for delivery; minor polish only |
| **80-89** | 🟢 Good | Deliver with awareness of noted gaps; schedule updates |
| **70-79** | 🟡 Adequate | Address Phase 1 issues before delivery; other phases can iterate |
| **60-69** | 🟠 Needs Work | Significant revision needed; do not deliver without fixing accuracy issues |
| **< 60** | 🔴 Not Ready | Major revision required across multiple dimensions |

---

## Score Sheet Template

Use this template to record scores during review:

### Phase 1 — Technical Accuracy (25%)

| # | Criterion | Score (1-5) | Notes |
|---|-----------|-------------|-------|
| 1.1 | Feature Descriptions | | |
| 1.2 | IAM & Authentication | | |
| 1.3 | API & CLI Commands | | |
| 1.4 | Security Features | | |
| 1.5 | Pricing & Licensing | | |
| 1.6 | External Links | | |
| 1.7 | Terminology Currency | | |
| 1.8 | Actions & Workflows | | |
| 1.9 | Migration Guidance | | |
| 1.10 | Audit & Compliance | | |
| 1.11 | Deployments & Environments | | |
| 1.12 | Copilot Governance | | |
| | **Dimension Average** | **/5** | |

### Phase 2 — Breadth & Depth (20%)

| # | Criterion | Score (1-5) | Notes |
|---|-----------|-------------|-------|
| 2.1 | VBD Topic Completeness | | |
| 2.2 | Enterprise-Scale Depth | | |
| 2.3 | Security Coverage Depth | | |
| 2.4 | API & Automation Depth | | |
| 2.5 | IAM Depth | | |
| 2.6 | Migration Coverage | | |
| 2.7 | Governance Breadth | | |
| 2.8 | Emerging Features | | |
| 2.9 | Missing Critical Topics | | |
| | **Dimension Average** | **/5** | |

### Phase 3A — Pedagogical Design (15%)

| # | Criterion | Score (1-5) | Notes |
|---|-----------|-------------|-------|
| 3A.1 | Learning Objectives Alignment | | |
| 3A.2 | Bloom's Taxonomy Level | | |
| 3A.3 | Progressive Complexity | | |
| 3A.4 | Knowledge Check Quality | | |
| 3A.5 | Assessment Alignment | | |
| 3A.6 | Time Feasibility | | |
| 3A.7 | Engagement Techniques | | |
| 3A.8 | Accessibility | | |
| | **Dimension Average** | **/5** | |

### Phase 3B — Practical Quality (15%)

| # | Criterion | Score (1-5) | Notes |
|---|-----------|-------------|-------|
| 3B.1 | Lab Step Clarity | | |
| 3B.2 | Real-World Relevance | | |
| 3B.3 | Code Examples Quality | | |
| 3B.4 | Decision Frameworks | | |
| 3B.5 | Troubleshooting Guidance | | |
| 3B.6 | Reference Materials | | |
| 3B.7 | Setup Completeness | | |
| 3B.8 | Self-Paced Extension Value | | |
| | **Dimension Average** | **/5** | |

### Phase 4 — Structural Integrity (10%)

| # | Criterion | Score (1-5) | Notes |
|---|-----------|-------------|-------|
| 4.1 | Markdown Consistency | | |
| 4.2 | Cross-References | | |
| 4.3 | Naming & Numbering | | |
| 4.4 | Spelling & Grammar | | |
| 4.5 | Mermaid Diagrams | | |
| 4.6 | Front Matter | | |
| 4.7 | Content Freshness | | |
| | **Dimension Average** | **/5** | |

### Phase 5A — Instructor Enablement (8%)

| # | Criterion | Score (1-5) | Notes |
|---|-----------|-------------|-------|
| 5A.1 | Guide Completeness | | |
| 5A.2 | Demo Scripts | | |
| 5A.3 | Slide Deck Readiness | | |
| 5A.4 | Pre-Workshop Prep | | |
| 5A.5 | Adaptability | | |
| | **Dimension Average** | **/5** | |

### Phase 5B — Participant Experience (7%)

| # | Criterion | Score (1-5) | Notes |
|---|-----------|-------------|-------|
| 5B.1 | Onboarding Experience | | |
| 5B.2 | Post-Workshop Value | | |
| 5B.3 | Reference Library | | |
| 5B.4 | FAQ Quality | | |
| 5B.5 | Certification Path | | |
| | **Dimension Average** | **/5** | |

### Overall Score

| Dimension | Avg (1-5) | Weight | Weighted |
|-----------|-----------|--------|----------|
| Phase 1: Technical Accuracy | /5 | 25% | /25 |
| Phase 2: Breadth & Depth | /5 | 20% | /20 |
| Phase 3A: Pedagogical Design | /5 | 15% | /15 |
| Phase 3B: Practical Quality | /5 | 15% | /15 |
| Phase 4: Structural Integrity | /5 | 10% | /10 |
| Phase 5A: Instructor Enablement | /5 | 8% | /8 |
| Phase 5B: Participant Experience | /5 | 7% | /7 |
| **TOTAL** | | **100%** | **/100** |
