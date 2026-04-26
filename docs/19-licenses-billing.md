---
render_with_liquid: false
---

# Licenses and Billing

**Level:** L300 (Advanced)  
**Objective:** Understand GitHub Enterprise Cloud licensing models, billing mechanics, cost optimization strategies, and reporting capabilities for enterprise administrators

## Overview

GitHub Enterprise Cloud (GHEC) billing has undergone a major transformation since 2024. The legacy model of fixed-seat volume licensing has been superseded by **usage-based (metered) billing** as the default for all new GHEC accounts created after August 1, 2024. Existing volume/subscription customers transition to metered billing at renewal.

Under the new model, enterprises pay monthly for the actual number of licenses consumed, plus metered charges for products like GitHub Actions, Packages, Codespaces, and Copilot premium requests. All metered products follow a fixed billing period from the 1st to the last day of each calendar month.

The billing platform now supports **budgets and alerts**, **cost centers** for departmental chargeback, and deep integration with **Azure subscriptions** for unified cloud billing. GitHub Copilot has evolved into a multi-tier product line with five distinct plans, and Advanced Security has been split into two separately licensable SKUs: **Secret Protection** and **Code Security**.

This guide covers the licensing and billing landscape that enterprise administrators must understand to manage costs effectively across their GitHub estate.

## License Types

### GitHub Enterprise Cloud Plans

GitHub Enterprise Cloud is the primary plan for enterprise organizations. Each member of an enterprise consumes one license (previously called a "seat"). The enterprise account is the central billing point for all organizations it owns.

Two billing models exist for GHEC licenses:

| Model | Description | Availability |
|-------|-------------|--------------|
| **Usage-based (metered)** | Pay monthly for the number of licenses actually consumed. No upfront commitment. | Default for all trials started after Aug 1, 2024. Available at renewal for existing customers. |
| **Volume (subscription)** | Purchase a fixed number of licenses for a defined period (typically annual). | Legacy model for existing invoiced customers until renewal. |

> **Note:** Usage-based billing is now the recommended model for all new GHEC deployments. It eliminates the need for license forecasting and enables true pay-as-you-go economics.

### Who Consumes a License

Understanding license consumption is critical for cost management. The following roles and statuses determine whether a user counts against your enterprise license total:

#### Users Who Consume a License

- Enterprise owners who are members or owners of at least one organization
- Organization members (including owners)
- Outside collaborators on private or internal repositories (excluding forks)
- Dormant users who are members of at least one organization
- Users with pending organization invitations (non-EMU enterprises only)

#### Users Who Do NOT Consume a License

- Suspended Enterprise Managed User accounts
- Enterprise owners who are not members of any organization
- Enterprise billing managers and organization billing managers
- Guest collaborators who are not organization members or repository collaborators
- Unaffiliated users (added to enterprise but not members of any organization)
- Users with failed invitations

> **Important:** In non-EMU enterprises, pending invitations consume a license immediately. Plan your invitation workflows accordingly to avoid unnecessary license charges.

### Unique-User Licensing

With GitHub Enterprise, users are entitled to both GitHub Enterprise Cloud and GitHub Enterprise Server (GHES). A single user consumes only **one license** regardless of how many GHES instances or GHEC organizations they belong to.

License synchronization between GHES and GHEC environments prevents double-counting. This is particularly important for hybrid deployments where developers may access both cloud and on-premises instances.

| Scenario | Licenses Consumed |
|----------|-------------------|
| User in 1 GHEC org | 1 |
| User in 3 GHEC orgs (same enterprise) | 1 |
| User in GHEC + 2 GHES instances | 1 |
| User in 2 separate enterprises | 2 (one per enterprise) |

### Enterprise Managed Users and Licensing

Enterprise Managed Users (EMU) have distinct licensing behavior compared to standard GHEC enterprises:

| Scenario | EMU | Non-EMU |
|----------|-----|---------|
| Pending org invitations | Do NOT consume license | DO consume license |
| Suspended accounts | Do NOT consume license | N/A (suspension is EMU-only via SCIM) |
| Identity provisioning | Via SCIM/IdP | Manual or SAML SSO |
| Outside collaborator invites | N/A (restricted in EMU) | Pending invites consume license for 7 days |

> **Note:** With EMU, identity lifecycle is managed through your IdP via SCIM provisioning. This means suspended or deprovisioned users stop consuming licenses immediately, providing tighter cost control.

### Managing Enterprise Licenses

License management varies based on your billing model:

| Customer Type | How to Manage Licenses |
|--------------|------------------------|
| **Usage-based billing** | No manual seat management required — billed automatically for consumed licenses |
| **Volume billing (invoiced)** | Contact GitHub Sales team to adjust license count |
| **Volume billing (self-serve)** | Manage via GitHub UI: Enterprise → Billing & licensing → Licensing → Manage licenses |

### License Reports

Enterprise admins can download CSV license reports from the Billing & Licensing → Licensing page. Report fields include:

- `GitHub com login` and `GitHub com name`
- `GitHub com enterprise roles`
- `License type` (`Visual Studio subscription` or `Enterprise`)
- `GitHub com code security license user`
- `GitHub com secret protection license user`
- `GitHub com cost center`
- `Total user accounts`

> **Note:** License reports are essential for periodic audits. Schedule monthly downloads or automate retrieval via the REST API for continuous compliance monitoring.

## Billing Models

### Usage-Based (Metered) Billing

Usage-based billing is the default model for all GHEC accounts created after August 1, 2024. Key characteristics:

- **No upfront commitment** — pay only for what you consume each month
- **Automatic scaling** — licenses expand and contract with your workforce
- **Unified billing** — all metered products bill on the same monthly cycle
- **Azure integration** — metered charges can route through Azure invoicing

This model eliminates the challenges of license forecasting and unused seat waste that were common with volume licensing.

### Volume (Subscription) Billing

Volume billing is the legacy model for existing invoiced customers:

- **Fixed license count** — purchase a predetermined number of seats
- **Annual commitment** — typically billed on an anniversary date
- **Overage restrictions** — exceeding purchased seats may require contacting Sales
- **Transition path** — existing customers move to metered billing at renewal

### Three Billing Categories

GitHub charges for three distinct categories of products:

| Category | Type | Examples |
|----------|------|----------|
| **Plans** | Fixed monthly per-user | GitHub Pro, GitHub Team, GitHub Enterprise Cloud ($21/user/month) |
| **Subscriptions** | Fixed monthly per-user | GitHub Secret Protection, GitHub Code Security |
| **Metered usage** | Variable / consumption-based | GitHub Actions, Packages, Codespaces, Copilot premium requests, Git LFS |

```mermaid
flowchart TD
    A[Enterprise Billing] --> B[Plans]
    A --> C[Subscriptions]
    A --> D[Metered Usage]

    B --> B1[GHEC License<br/>$21/user/month]

    C --> C1[Secret Protection<br/>$19/committer/month]
    C --> C2[Code Security<br/>$30/committer/month]
    C --> C3[Copilot Business<br/>$19/user/month]
    C --> C4[Copilot Enterprise<br/>$39/user/month]

    D --> D1[Actions Minutes]
    D --> D2[Packages Storage]
    D --> D3[Codespaces Hours]
    D --> D4[Copilot Premium Requests<br/>$0.04/request overage]
    D --> D5[Git LFS Bandwidth]

    style A fill:#0969da,color:#fff
    style B fill:#1a7f37,color:#fff
    style C fill:#9a6700,color:#fff
    style D fill:#cf222e,color:#fff
```

### Free Usage Included with GHEC

GitHub Enterprise Cloud includes generous free-tier allowances for metered products:

| Product | Usage Type | GHEC Included Amount |
|---------|-----------|----------------------|
| GitHub Actions | Minutes/month | 50,000 |
| GitHub Actions | Storage | 50 GB (shared with Packages) |
| GitHub Packages | Storage | 50 GB (shared with Actions) |
| GitHub Packages | Data transfer/month | 100 GB |
| Git LFS | Storage/month | 250 GB |
| Git LFS | Bandwidth/month | 250 GB |

> **Important:** Codespaces does not have a free organizational or enterprise allowance. Only personal accounts on Free or Pro plans receive free Codespaces hours.

#### GitHub Actions Pricing Highlights

- **Free for**: Public repos (standard runners), self-hosted runners, GitHub Pages, Dependabot
- **Larger runners**: Always billed, even for public repos
- **Storage**: Hourly accrual model (GB-Hours); artifacts, caches, and Packages share the same pooled storage allowance

Baseline runner rates:

| Runner Type | Rate |
|-------------|------|
| Linux 2-core | $0.006/min |
| Windows 2-core | $0.010/min |
| macOS 3/4-core | $0.062/min |

### Billing Cycles

Understanding billing cycles is important for financial planning:

| Billing Type | Cycle |
|-------------|-------|
| **Metered products** | Fixed period: 1st to last day of each month (UTC) |
| **Volume-based licenses** | Anniversary date of subscription |
| **Self-serve CC metered accounts** | Standardized to 1st of month (since Dec 1, 2025) |

#### Mid-Cycle Change Behavior

- **Adding users/licenses**: Prorated charges for the remaining billing period
- **Removing users**: Charges continue through the end of the current cycle
- **Removing organizations/repos**: Charges stop immediately

## GitHub Copilot Licensing

### Copilot Plan Comparison

GitHub Copilot offers five distinct plans across individual and organizational tiers:

| Plan | Target | Price | Premium Requests/Month | Key Features |
|------|--------|-------|------------------------|--------------|
| **Copilot Free** | Individual | $0 | 50 | Limited completions; no cloud agent |
| **Copilot Pro** | Individual | $10/month | 300 | Unlimited completions, cloud agent, premium models |
| **Copilot Pro+** | Individual (power user) | $39/month | 1,500 | All models, higher request allowance |
| **Copilot Business** | Org/Enterprise | $19/user/month | 300/user | Centralized management, policy control, cloud agent |
| **Copilot Enterprise** | Enterprise (GHEC) | $39/user/month | 1,000/user | All Business features + enterprise-grade capabilities |

> **Note:** Verified students and teachers receive free access to Copilot Pro features (including 300 premium requests/month) through [GitHub Education](https://education.github.com/). Enterprise owners can assign Copilot Enterprise or Copilot Business to individual organizations, or mix both across the enterprise. Only the higher-tier seat is billed when a user has both.

### Premium Requests

Premium requests provide access to advanced AI models and features including advanced reasoning, large context windows, Copilot cloud agent, and Spark.

#### Premium Request SKUs

Since November 1, 2025, premium requests are tracked across three dedicated SKUs:

| SKU | Scope |
|-----|-------|
| `copilot_premium_request` | Chat, CLI, Code Review, Extensions, Spaces |
| `spark_premium_request` | Spark app creation |
| `copilot_agent_premium_request` | Copilot cloud agent sessions |

#### Request Multipliers

Some advanced models consume more than one premium request per interaction:

| Model Category | Multiplier | Example Usage |
|----------------|-----------|---------------|
| Standard models | 1× | Routine completions and chat |
| Advanced reasoning | 5× | Complex multi-step analysis |
| Premium reasoning | 20× | Large-scale code generation |

> **Important:** Premium request multipliers can significantly impact costs. Monitor usage closely when enabling advanced reasoning models for your organization.

#### Overage Pricing

Additional premium requests beyond the plan allowance are billed at **$0.04/request** for all paid plans (Free plan does not support overage).

### Copilot Enterprise Controls

Enterprise administrators have several policy levers for managing Copilot costs:

- **Premium request paid usage** policy controls whether members can exceed their allowance
- Separate policy options for Copilot, Spark, and cloud agent
- Budgets can be set to either **monitor** OR **block** overages
- Bundled or individual SKU budget management

### Copilot Billing Behavior

Key billing rules for Copilot in enterprise environments:

| Scenario | Billing Behavior |
|----------|-----------------|
| User has personal Copilot Pro + org seat | Personal plan auto-canceled with prorated refund |
| User in multiple orgs (same enterprise) | Enterprise billed once per billing cycle |
| User has both Business and Enterprise seats | Only Enterprise seat is billed |
| Cloud agent usage | Consumes both Actions minutes AND premium requests |

### Copilot Seat Management

Copilot seats can be managed at the organization level with three assignment modes:

| Setting | Behavior |
|---------|----------|
| `assign_all` | All organization members automatically receive Copilot |
| `assign_selected` | Only specified teams or users receive Copilot |
| `disabled` | Copilot is disabled for the organization |

The seat breakdown response from the API includes: `total`, `added_this_cycle`, `pending_cancellation`, `pending_invitation`, `active_this_cycle`, and `inactive_this_cycle`.

## Advanced Security Licensing

GitHub Advanced Security (GHAS) — now GitHub Secret Protection and GitHub Code Security — has been split into two independently purchasable SKUs since April 1, 2025. This unbundling allows organizations to adopt only the security capabilities they need.

### Secret Protection

**Price:** $19 per unique active committer per month

Secret Protection includes:

- **Secret scanning** — detects exposed secrets in repositories
- **Push protection** — prevents secrets from being committed in the first place
- **Custom secret patterns** — define organization-specific patterns
- **Secret validity checks** — verifies whether detected secrets are still active

> **Note:** All Secret Protection features are free for public repositories on GitHub.com.

### Code Security

**Price:** $30 per unique active committer per month

Code Security includes:

- **Code scanning** — identifies vulnerabilities using CodeQL and third-party tools
- **Premium Dependabot features** — advanced dependency vulnerability management
- **Dependency review** — analyze dependency changes in pull requests
- **Security overview dashboards** — enterprise-wide security posture visibility

> **Note:** All Code Security features are free for public repositories on GitHub.com.

### Active Committer Billing Basis

Both GHAS SKUs are billed based on **unique active committers** — users who have committed to at least one repository with the feature enabled in the last 90 days.

| Billing Model | Behavior |
|--------------|----------|
| **Metered** | Pay monthly per active committer, no pre-defined limit |
| **Volume** | Purchase a fixed number of committer licenses; overage blocks enabling GHAS on new repos |

#### Calculating Active Committers

Active committers are counted uniquely across the enterprise:

- A developer who commits to 5 repos with GHAS enabled counts as **1 committer**
- Only commits within the 90-day rolling window are considered
- GitHub App bot accounts are **excluded** from active committer counts; however, user-type accounts used for automation **do** count

### GHAS Availability by Plan

| GitHub Plan | Secret Protection | Code Security |
|-------------|-------------------|---------------|
| GitHub Free (public repos) | ✅ Free | ✅ Free |
| GitHub Team | ✅ Available ($19/committer/mo) | ✅ Available ($30/committer/mo) |
| GitHub Enterprise Cloud | ✅ Available ($19/committer/mo) | ✅ Available ($30/committer/mo) |

> **Important:** Since April 2025, GHAS features are available on GitHub Team plans — previously they were restricted to Enterprise plans only.

### GHAS Cost Optimization Strategies

To manage Advanced Security costs effectively:

1. **Audit repository coverage** — disable GHAS on archived or inactive repositories
2. **Target high-risk repos** — enable Code Security on repos with production deployments first
3. **Leverage free tiers** — use Secret Protection on public repos at no cost
4. **Monitor the 90-day window** — committers who stop contributing drop off billing automatically
5. **Use Secret Protection independently** — if code scanning is not needed, purchase only Secret Protection at the lower price point

## Billing Management and Cost Optimization

### Azure Subscription Integration

GHEC accounts can connect an Azure subscription for billing, routing all metered usage through Azure invoicing:

- **Required** for GitHub Enterprise Cloud through a Microsoft Enterprise Agreement to use GHAS, Codespaces, Copilot, and to exceed the plan's included Actions, Packages, and LFS amounts
- Once linked, metered costs bill through Azure on the 1st of each month
- Pre-existing GitHub plan charges continue on the legacy billing date
- Azure SPV app requires **tenant-wide admin consent** to list available subscriptions

#### Linking an Azure Subscription

1. Navigate to **Enterprise settings** → **Billing & licensing** → **Payment information**
2. Click **Add Azure subscription**
3. Authenticate with an Azure account that has Contributor access to the target subscription
4. Grant admin consent for the Azure SPV application
5. Select the target Azure subscription from the dropdown
6. Confirm the billing linkage

> **Note:** Once linked, metered charges for Actions, Packages, Codespaces, Copilot, and GHAS will appear on your Azure invoice. Plan-based charges (GHEC licenses) may remain on the GitHub invoice depending on your agreement type.

### Billing Managers

GitHub provides dedicated billing manager roles that do not consume licenses:

| Role | Scope | Permissions |
|------|-------|-------------|
| **Enterprise billing manager** | Enterprise-wide | View and manage billing settings, payment info, budgets, and usage reports |
| **Organization billing manager** | Single organization | View organization billing details and payment information |

> **Important:** Billing managers cannot access code, repositories, or organization settings beyond billing. This makes the role ideal for finance team members who need cost visibility without code access.

### Spending Limits and Controls

Enterprise administrators can set spending limits to control metered usage costs:

#### Actions and Packages Spending Limits

| Setting | Behavior |
|---------|----------|
| **$0 (default)** | Only included free minutes/storage used; workflows fail when exhausted |
| **Fixed amount** | Usage stops when spending limit is reached |
| **Unlimited** | No cap on metered charges (requires Azure subscription or credit card) |

#### Copilot Spending Controls

| Control | Scope |
|---------|-------|
| Premium request paid usage policy | Controls overage at enterprise level |
| Per-SKU budgets | Separate limits for Copilot, Spark, and cloud agent |
| Organization-level assignment | Restrict which orgs have Copilot enabled |

### Cost Optimization Strategies

Effective cost management requires ongoing monitoring and adjustment:

#### License Optimization

- **Remove dormant users** — audit users inactive for 30+ days and remove from organizations
- **Review outside collaborators** — each outside collaborator on a private repo consumes a license
- **Leverage EMU** — suspended EMU accounts immediately stop consuming licenses

#### Actions Cost Reduction

- **Use self-hosted runners** — no per-minute charges for self-hosted infrastructure
- **Optimize workflow triggers** — use `paths` filters and `concurrency` groups to reduce unnecessary runs
- **Cache dependencies** — reduce build times with `actions/cache`
- **Right-size runners** — use smaller runners for lightweight jobs

#### Copilot Cost Management

- **Audit seat activity** — use the API to identify users with no Copilot activity in 30+ days
- **Assign by team** — use team-based assignment instead of `assign_all`
- **Monitor premium requests** — track per-SKU usage to identify cost drivers

## Budget Alerts and Cost Centers

### Budgets and Alerts

GitHub's billing platform supports configurable budgets at multiple levels:

#### Budget Scopes

| Scope | Description |
|-------|-------------|
| **Enterprise** | Aggregate budget across all organizations |
| **Organization** | Budget for a single organization's usage |
| **Cost center** | Budget for a logical grouping of resources |

#### Budget Types

| Type | Behavior |
|------|----------|
| **Alert-only** | Sends notifications when thresholds are reached; usage continues |
| **Stop-usage** | Halts metered consumption when the budget is exhausted |

#### Included Usage Alerts

GitHub automatically monitors included free usage allowances with notifications at:

- **90% threshold** — warning that free allocation is nearly exhausted
- **100% threshold** — alert that free allocation is fully consumed

#### Creating a Budget via API

```bash
# Create a budget for Copilot premium requests at the enterprise level
gh api \
  --method POST \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2026-03-10" \
  /enterprises/{enterprise}/settings/billing/budgets \
  -f target_type='enterprise' \
  -f target_id='{enterprise_id}' \
  -f product='copilot' \
  -f sku='copilot_premium_request' \
  -F limit_in_dollars=500 \
  -f budget_type='alert_only'
```

### Cost Centers

Cost centers enable departmental chargeback by grouping resources and allocating costs to business units:

#### Cost Center Capabilities

- Group organizations, repositories, and users into logical cost units
- Allocate metered and license-based charges to specific departments
- Route Azure subscription billing per cost center
- Generate per-cost-center usage reports

#### Cost Center Limits

| Constraint | Limit |
|-----------|-------|
| Maximum cost centers per enterprise | 250 |
| Maximum resources per cost center | 25,000 |

### Cost Center Allocation Rules

How charges are allocated depends on the product type:

| Product Type | Allocation Basis | Example |
|-------------|-----------------|---------|
| **Usage-based products** | By repository or organization | Actions minutes are allocated to the cost center of the repository where the workflow runs |
| **License-based products** | By user | Copilot seats are allocated to the cost center of the assigned user |

#### Creating a Cost Center via API

```bash
# Create a cost center for the Engineering department
gh api \
  --method POST \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2026-03-10" \
  /enterprises/{enterprise}/settings/billing/cost-centers \
  -f name='Engineering' \
  -f description='Engineering department resources'
```

#### Assigning Resources to a Cost Center

```bash
# Add an organization to a cost center
gh api \
  --method POST \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2026-03-10" \
  /enterprises/{enterprise}/settings/billing/cost-centers/{cost_center_id}/resources \
  -f resource_type='organization' \
  -f resource_id='{org_id}'
```

### Design Patterns for Cost Center Hierarchies

Choosing the right cost center structure is foundational. An ill-fitting hierarchy creates ongoing friction with finance teams and makes chargeback reports unreliable. The table below summarizes the three most common patterns:

| Pattern | Structure | Best For | Trade-offs |
|---------|-----------|----------|------------|
| **Single-department** | One cost center per business unit (BU) | Enterprises with clear BU ownership of repos and teams | Simple to manage; limited granularity within a BU |
| **Matrix** | Cost centers by project AND department | Enterprises where cross-functional teams share repos | Accurate project-level costing; more complex resource assignment |
| **Multi-tier** | Enterprise → Division → Department → Team | Large enterprises (5,000+ developers) with deep org charts | Full chargeback precision; requires disciplined onboarding processes |

#### Multi-Tier Hierarchy Example

```mermaid
graph TD
    E[Enterprise: Contoso Corp] --> D1[Division: Cloud Platform]
    E --> D2[Division: Consumer Apps]
    E --> D3[Division: Internal Tools]

    D1 --> CC1[Cost Center: Platform – Infrastructure]
    D1 --> CC2[Cost Center: Platform – Data]
    D2 --> CC3[Cost Center: Consumer – Mobile]
    D2 --> CC4[Cost Center: Consumer – Web]
    D3 --> CC5[Cost Center: Internal – DevOps]
    D3 --> CC6[Cost Center: Internal – Security]

    CC1 --> R1[org: contoso-infra]
    CC2 --> R2[org: contoso-data]
    CC3 --> R3[org: contoso-mobile]
    CC4 --> R4[org: contoso-web]
    CC5 --> R5[org: contoso-devops]
    CC6 --> R6[org: contoso-security]
```

> **Tip:** GitHub cost centers are a flat list (no parent-child relationships in the API). To model a hierarchy, use a naming convention that encodes the tier — e.g., `platform-infra`, `platform-data`, `consumer-mobile`. This allows you to group by prefix when generating reports.

#### Organizations vs. Cost Centers for Cost Tracking

Enterprises often ask whether they should create separate organizations or use cost centers for cost isolation. The answer depends on the separation you need:

| Dimension | Organization-Based Tracking | Cost Center-Based Tracking |
|-----------|----------------------------|---------------------------|
| **Access boundaries** | Full access isolation between orgs | No access boundaries — cost centers are billing-only |
| **Policy isolation** | Separate security policies, rulesets, Copilot settings | Shared policies; cost allocation only |
| **Billing granularity** | Usage-based products auto-allocate by repo's org | Can group repos and users from multiple orgs |
| **Overhead** | Higher — each org needs owners, settings, team structure | Lower — cost centers are metadata on existing resources |
| **Recommended when** | Regulatory, compliance, or vendor isolation required | Chargeback reporting across shared infrastructure |

In practice, most enterprises use a **hybrid approach**: organizations for access and policy boundaries, cost centers layered on top for financial reporting.

### Tracking GitHub Copilot via Cost Centers

Copilot is typically the fastest-growing line item in an enterprise GitHub bill. Cost centers provide the mechanism to ensure each department pays for the Copilot seats it actually uses.

#### How Copilot Costs Allocate to Cost Centers

Copilot is a **license-based product**, so costs are allocated based on the **assigned user**, not the repository:

- Each Copilot seat is charged to the cost center of the user who holds the assignment
- If a user is not assigned to any cost center, their Copilot seat falls into the **Unassigned** bucket
- Premium request overages follow the same user-based allocation
- When a user changes cost centers mid-month, charges are allocated based on the active assignment at the time of billing

#### Monitoring Copilot Premium Requests per Cost Center

Premium requests (Claude, GPT-4o, and other premium models used by Copilot Chat, Copilot agent mode, and GitHub Spark) can generate significant variable costs. Filter usage data by cost center to identify which departments drive premium request consumption:

```bash
# Get Copilot premium request usage for a specific cost center
# (Uses the usage reporting endpoint — see Billing API and Reporting for full parameter reference)
gh api \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2026-03-10" \
  "/enterprises/{enterprise}/settings/billing/usage?product=copilot&sku=copilot_premium_request&cost_center_id={cost_center_id}&year=2026&month=4"
```

#### Setting Copilot-Specific Budgets per Department

Create per-cost-center budgets scoped to Copilot to prevent any single department from generating uncapped premium request charges:

```bash
# Create an alert-only budget for Copilot premium requests on a cost center
gh api \
  --method POST \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2026-03-10" \
  /enterprises/{enterprise}/settings/billing/budgets \
  -f target_type='cost_center' \
  -f target_id='{cost_center_id}' \
  -f product='copilot' \
  -f sku='copilot_premium_request' \
  -F limit_in_dollars=2000 \
  -f budget_type='alert_only'
```

> **Warning:** Think carefully before using `stop-usage` budgets for Copilot. Halting Copilot mid-sprint disrupts developer productivity. For most enterprises, `alert-only` budgets combined with monthly review cycles are the safer choice.

#### Copilot ROI Reporting per Cost Center

Finance teams frequently ask: *"Is Copilot worth it for Department X?"* Combine cost center billing data with Copilot activity metrics to build ROI reports:

| Metric | Source | Purpose |
|--------|--------|---------|
| Copilot seat cost per cost center | Billing usage API (filtered by `cost_center_id`) | Total investment per department |
| Premium request spend per cost center | Billing usage API (sku: `copilot_premium_request`) | Variable cost per department |
| Active users per cost center | Copilot seat API + cost center membership | Utilization rate |
| Suggestions accepted / lines of code | Copilot metrics API | Productivity signal |
| PR cycle time delta | Repository metrics (before/after Copilot rollout) | Velocity impact |

The ROI calculation becomes: `(Productivity gains × developer hourly cost) / (Seat cost + Premium request cost)` per cost center.

### Tracking GitHub Advanced Security via Cost Centers

GHAS — now split into **Secret Protection** and **Code Security** — charges based on **active unique committers** to repositories where the feature is enabled. Like Copilot, GHAS is a license-based product, so cost center allocation is based on the **user** (active committer), not the repository.

#### How GHAS Costs Allocate to Cost Centers

Like Copilot, GHAS is a **license-based product** allocated by **user**:

- Each active committer license is charged to exactly **one** cost center, regardless of how many GHAS-enabled repos they contribute to
- An active committer is anyone who has pushed at least one commit to a GHAS-enabled repo in the last 90 days
- Allocation follows a precedence order: **direct user assignment → oldest organization membership → enterprise fallback**

> **Important:** Because GHAS license costs follow the user's cost center assignment (not the repository), a committer's GHAS charge may land in a cost center that the developer's manager doesn't expect. Review allocation precedence rules with your finance team before enabling GHAS broadly.

#### Active Committer Tracking per Cost Center

```bash
# Get GHAS active committer counts filtered by cost center
# (Uses the usage reporting endpoint — see Billing API and Reporting for full parameter reference)
gh api \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2026-03-10" \
  "/enterprises/{enterprise}/settings/billing/usage?product=ghas&cost_center_id={cost_center_id}&year=2026&month=4"
```

#### Budget Considerations for GHAS

GHAS is a license-based product, so **only alert-only budgets apply** — `stop-usage` budgets do not work for license-based products like GHAS:

| Budget Type | Effect on GHAS | Recommendation |
|-------------|---------------|----------------|
| **Alert-only** | Notifications sent; scanning continues | ✅ The only budget type available for GHAS |
| **Stop-usage** | **Not applicable** — does not apply to license-based products | ❌ Cannot be used for GHAS |

Because budgets cannot automatically cap GHAS spend, cost control requires **manual governance**: monitor budget alerts, review active committer counts, and selectively disable GHAS on repos if costs exceed targets.

#### Avoiding Cost Surprises with GHAS Rollouts

GHAS costs can spike unexpectedly when teams enable the feature on repositories with many contributors. Follow this phased approach:

1. **Inventory first** — before enabling GHAS on a repo, query the committer count for the last 90 days
2. **Pilot phase** — enable on 2-3 representative repos per cost center; measure actual committer-based costs
3. **Forecast** — extrapolate pilot costs to the full repo portfolio for each cost center
4. **Budget** — create alert-only budgets based on forecasted costs plus a 20% buffer
5. **Roll out** — enable GHAS progressively, monitoring cost center spend weekly during the first month

```bash
# Estimate active committers for a repo before enabling GHAS
# NOTE: This is an approximation based on contributor stats. For exact active
# committer counts on GHAS-enabled repos, use the Enhanced Billing Platform's
# usage report API (see "Billing API and Reporting" below).
gh api \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2026-03-10" \
  "/repos/{owner}/{repo}/stats/contributors" \
  --jq '[.[] | select(
    (.weeks | last | .w) > (now - 90*86400 | floor)
  )] | length'
```

### Cost Center to Azure Billing Mapping

> For initial setup of Azure subscription billing, see **Azure Subscription Integration** in the *Billing Management and Cost Optimization* section above.

Once an Azure subscription is linked to your enterprise, cost centers enable fine-grained billing routing through Azure Cost Management.

#### Linking Cost Centers to Azure Billing

Each cost center can be associated with a different Azure subscription or resource group, enabling separate invoicing:

| Configuration | How It Works |
|--------------|-------------|
| **Single Azure subscription** | All cost centers bill to one subscription; use Azure cost tags to differentiate |
| **Multiple Azure subscriptions** | Each cost center routes charges to a dedicated Azure subscription |
| **Azure resource groups** | Map cost centers to Azure resource groups for consolidated cloud billing |

#### Azure Billing Tags and Cost Center Correlation

GitHub cost center names and IDs appear in Azure Cost Management as billing metadata. To correlate:

1. Use consistent naming between GitHub cost centers and Azure cost tags (e.g., `platform-infra` in both systems)
2. Export Azure Cost Management data filtered by the GitHub billing publisher
3. Join on cost center name to produce unified cloud spend reports

#### Consolidated Cloud Billing Workflow

For enterprises managing both Azure and GitHub spend, the consolidated billing flow is:

1. GitHub usage accrues against cost centers throughout the billing period
2. At month-end, charges are routed through the linked Azure subscription(s)
3. Azure Cost Management aggregates GitHub charges with other Azure services
4. Finance teams pull unified reports from Azure Cost Management, filtered by cost tags that match GitHub cost center names

### Real-World Chargeback Scenarios

The following scenarios illustrate common cost center configurations in enterprise environments.

#### Scenario 1: Fully Decentralized — Each BU Pays Its Own Way

A financial services company with 5 business units, each with its own P&L, requires full cost transparency:

| Cost Center | Orgs Assigned | Products Charged | Monthly Budget |
|-------------|--------------|-----------------|----------------|
| `wealth-mgmt` | wealth-mgmt-eng | GHEC licenses, Copilot, Actions, GHAS | $45,000 |
| `retail-banking` | retail-eng, retail-qa | GHEC licenses, Copilot, Actions, GHAS | $62,000 |
| `capital-markets` | capmarkets-core | GHEC licenses, Copilot, Actions | $38,000 |
| `insurance` | insurance-platform | GHEC licenses, Copilot, GHAS | $28,000 |
| `corporate-tech` | corp-infra, corp-security | GHEC licenses, Actions, GHAS | $15,000 |

**Key decisions:**
- Each BU controls its own Copilot seat assignments
- GHAS is mandatory for `wealth-mgmt` and `retail-banking` (regulated); optional for others
- Alert-only budgets with CFO notification at 90% threshold

#### Scenario 2: Central IT Funds Copilot, BUs Fund Actions

A technology company treats Copilot as a strategic productivity investment funded centrally, while BUs pay for their own CI/CD consumption:

| Cost Center | Scope | Products Charged | Funded By |
|-------------|-------|-----------------|-----------|
| `central-copilot` | All Copilot users (enterprise-wide) | Copilot Enterprise seats, premium requests | Central IT budget |
| `platform-eng` | platform-eng org repos | Actions, Packages, Codespaces | Platform BU |
| `product-eng` | product-eng org repos | Actions, Packages | Product BU |
| `data-eng` | data-eng org repos | Actions, Packages, Codespaces | Data BU |

**Key decisions:**
- Users are assigned to `central-copilot` for Copilot billing, but their repos are assigned to BU cost centers for Actions
- A single user may generate charges in two cost centers: Copilot (user-based) in `central-copilot` and Actions (repo-based) in their BU's cost center
- Central IT sets a global Copilot budget; BUs set their own Actions budgets

#### Scenario 3: GHAS Cost Allocation for Regulated vs. Non-Regulated Repositories

A healthcare company must enable GHAS on all repos handling PHI data but wants to make it opt-in for internal tooling:

| Cost Center | Repos | GHAS Policy | Budget Type |
|-------------|-------|-------------|-------------|
| `phi-applications` | patient-portal, claims-api, ehr-sync | GHAS mandatory (Secret Protection + Code Security) | Alert-only (security cannot be halted) |
| `internal-tools` | dev-portal, build-scripts, docs | GHAS optional (teams opt in) | Alert-only with lower threshold |
| `open-source` | community projects, SDKs | Secret Protection only (public repos get code scanning free) | Alert-only |

**Key decisions:**
- `phi-applications` has a higher budget ceiling because compliance requires continuous scanning
- Each active committer's GHAS license is charged to exactly **one** cost center based on their user assignment, regardless of which repos they contribute to
- Committers not directly assigned to a cost center fall back to their oldest org membership, then the enterprise default

### Cost Center Reporting and Governance

#### Generating Cost Center Reports via API

Use the billing usage endpoint with the `cost_center_id` filter to produce per-department reports. This uses the same endpoint documented in *Billing API and Reporting* below, filtered to a specific cost center:

```bash
# Generate a cost center usage report for the current month
gh api \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2026-03-10" \
  "/enterprises/{enterprise}/settings/billing/usage/summary?cost_center_id={cost_center_id}&year=2026&month=4" \
  --jq '.usageItems[] | {product, sku, quantity, grossAmount, netAmount}'
```

#### Monthly Chargeback Report Automation

Extend the automated billing workflow (see *Automating Usage Reports* in the Billing API section below) by iterating over all cost centers to produce a per-department CSV:

```bash
# Fetch all cost centers, then generate a per-cost-center chargeback report
COST_CENTERS=$(gh api \
  --paginate \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2026-03-10" \
  /enterprises/{enterprise}/settings/billing/cost-centers \
  --jq '.[].id')

YEAR=$(date -d "last month" +%Y)
MONTH=$(date -d "last month" +%-m)

echo "cost_center,product,sku,quantity,net_amount" > chargeback-report.csv

for CC_ID in $COST_CENTERS; do
  CC_NAME=$(gh api \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2026-03-10" \
    "/enterprises/{enterprise}/settings/billing/cost-centers/${CC_ID}" \
    --jq '.name')

  gh api \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2026-03-10" \
    "/enterprises/{enterprise}/settings/billing/usage/summary?cost_center_id=${CC_ID}&year=${YEAR}&month=${MONTH}" \
    --jq ".usageItems[] | [\"${CC_NAME}\", .product, .sku, .quantity, .netAmount] | @csv" \
    >> chargeback-report.csv
done
```

#### Budget Monitoring Workflow

```mermaid
flowchart TD
    A[Monthly billing cycle starts] --> B[Usage accrues per cost center]
    B --> C{Budget threshold reached?}
    C -->|75%| D[Notification to cost center owner]
    C -->|90%| E[Escalation to department head + finance]
    C -->|100% alert-only| F[Alert sent; usage continues]
    C -->|100% stop-usage| G[Metered product usage halted]
    D --> B
    E --> H{Approve overage?}
    H -->|Yes| I[Increase budget via API]
    H -->|No| J[Cost center owner reduces usage]
    I --> B
    J --> B
    F --> K[Monthly reconciliation]
    G --> K
    K --> L[Chargeback report generated]
    L --> M[Finance reviews and invoices BUs]
```

#### Common Mistakes and Gotchas

| Mistake | Impact | Prevention |
|---------|--------|-----------|
| Not assigning all resources to cost centers | Costs land in **Unassigned** bucket; invisible to chargeback reports | Run a monthly audit of unassigned resources |
| Assuming budget alerts will cap GHAS spend | They won't — GHAS budgets are alert-only. Cost control requires manual governance | Implement manual review processes triggered by budget alert notifications |
| Unexpected GHAS cost center allocation | GHAS license cost may be allocated to a cost center that the developer's manager doesn't expect due to the allocation precedence rules (user assignment → oldest org → enterprise fallback) | Review and explicitly assign users to cost centers before enabling GHAS |
| Creating cost centers after enabling products | Historical costs cannot be retroactively re-allocated | Create cost centers and assign resources before enabling paid features |
| Exceeding the 250 cost center limit | Cannot model fine-grained hierarchy | Use naming conventions to encode hierarchy; keep cost centers at department level |
| Not linking Azure subscriptions | Billing goes to default payment method; no Azure Cost Management visibility | Link Azure subscriptions as part of enterprise onboarding |

### Cost Center Best Practices

#### Naming Conventions

Use a consistent, hierarchical naming scheme that encodes organizational structure:

| Pattern | Example | When to Use |
|---------|---------|-------------|
| `{division}-{department}` | `platform-infra`, `consumer-mobile` | Most enterprises (2-level hierarchy) |
| `{division}-{department}-{team}` | `platform-infra-sre`, `consumer-mobile-ios` | Large enterprises needing team-level chargeback |
| `{project}-{env}` | `atlas-prod`, `atlas-staging` | Project-based organizations |
| `{region}-{department}` | `us-engineering`, `eu-engineering` | Geographically distributed enterprises |

> **Tip:** Avoid spaces and special characters in cost center names. Use lowercase with hyphens for consistency with GitHub naming conventions.

#### Resource Assignment Strategy

| Resource Type | Assignment Guidance |
|--------------|-------------------|
| **Organizations** | Assign to cost center based on primary owning department |
| **Repositories** | Assign cross-team repos to the cost center of the primary maintainer |
| **Users** | Assign based on reporting structure (HR department code) |
| **Unassigned resources** | Audit monthly; default to a `shared-services` cost center |

#### Budget Threshold Recommendations

| Threshold | Action | Audience |
|-----------|--------|----------|
| **50%** | Manual governance checkpoint (not a platform alert — configure this as a calendar-based review) | Cost center owner |
| **75%** | Platform alert fires by default; review and forecast remaining month spend | Cost center owner + engineering lead |
| **90%** | Platform alert fires by default; escalation; evaluate whether budget increase or usage reduction is needed | Department head + finance |
| **100%** | Platform alert fires by default. Alert-only: continue with overage tracking. Stop-usage (metered products only): halt non-critical metered products | Finance + enterprise admin |

#### Review Cadence

| Activity | Frequency | Owner |
|----------|-----------|-------|
| Review cost center assignment completeness | Monthly | Enterprise admin |
| Review budget utilization across cost centers | Monthly | Finance + enterprise admin |
| Audit for unassigned resources | Monthly | Enterprise admin |
| Reconcile chargeback reports with finance | Monthly | Finance team |
| Review cost center hierarchy and naming | Quarterly | Enterprise admin + department heads |
| Evaluate Copilot ROI per cost center | Quarterly | Engineering leadership |
| Full cost center structure review | Annually | CTO/CIO + finance leadership |

## Billing API and Reporting

### Usage Reporting Endpoints

The GitHub REST API provides comprehensive billing usage data at user, organization, and enterprise levels:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/organizations/{org}/settings/billing/usage` | GET | Detailed usage report for all paid products (org level) |
| `/organizations/{org}/settings/billing/usage/summary` | GET | Summary usage report (org level) — **public preview** |
| `/organizations/{org}/settings/billing/premium_request/usage` | GET | Premium request usage report (org level) |
| `/users/{username}/settings/billing/usage` | GET | Detailed usage report (user level) |
| `/users/{username}/settings/billing/usage/summary` | GET | Summary usage report (user level) — **public preview** |
| `/users/{username}/settings/billing/premium_request/usage` | GET | Premium request usage report (user level) |
| `/enterprises/{enterprise}/settings/billing/usage/summary` | GET | Summary usage report (enterprise level) |
| `/orgs/{org}/settings/billing/advanced-security` | GET | GHAS active committers per repository |

#### Authentication Requirements

- **Personal access tokens (classic)** with billing permissions are required
- **Fine-grained PATs are NOT supported** for billing usage endpoints
- API version header: `X-GitHub-Api-Version: 2026-03-10`

#### Common Query Parameters

| Parameter | Description |
|-----------|-------------|
| `year`, `month`, `day`, `hour` | Filter by time period |
| `cost_center_id` | Filter by cost center (enterprise only) |
| `repository` | Filter by repository |
| `product` | Filter by product name |
| `sku` | Filter by SKU name |

### Querying Usage Data

#### Enterprise Usage Summary

```bash
# Get enterprise-level billing usage summary for the current month
gh api \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2026-03-10" \
  /enterprises/{enterprise}/settings/billing/usage/summary \
  -f year=2026 \
  -f month=4
```

#### Organization Premium Request Usage

```bash
# Get Copilot premium request usage for an organization
gh api \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2026-03-10" \
  /organizations/{org}/settings/billing/premium_request/usage \
  -f year=2026 \
  -f month=4
```

#### GHAS Active Committer Report

```bash
# Get GHAS active committers per repository
gh api \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2026-03-10" \
  /orgs/{org}/settings/billing/advanced-security
```

### Copilot Seat Management API

Key REST API endpoints for managing Copilot seat assignments:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/orgs/{org}/copilot/billing` | GET | Get Copilot seat info and settings |
| `/orgs/{org}/copilot/billing/seats` | GET | List all seat assignments with last activity data |
| `/orgs/{org}/copilot/billing/selected_teams` | POST | Add teams to Copilot subscription |
| `/orgs/{org}/copilot/billing/selected_teams` | DELETE | Remove teams from Copilot subscription |
| `/orgs/{org}/copilot/billing/selected_users` | POST | Add individual users to Copilot |
| `/orgs/{org}/copilot/billing/selected_users` | DELETE | Remove individual users (pending cancellation) |
| `/orgs/{org}/members/{username}/copilot` | GET | Get seat details for a specific user |

**Required scopes**: `manage_billing:copilot` or `read:org` (for GET), `manage_billing:copilot` or `admin:org` (for POST/DELETE).

#### Identifying Inactive Copilot Users

```bash
# List all Copilot seats and filter for inactive users (no activity in 30+ days)
gh api \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2026-03-10" \
  /orgs/{org}/copilot/billing/seats \
  --paginate \
  --jq '.seats[] | select(.last_activity_at != null) |
    select(
      (now - (.last_activity_at | fromdateiso8601)) > (30 * 86400)
    ) | {login: .assignee.login, last_activity: .last_activity_at}'
```

### Product and SKU Identifiers

For programmatic budget creation and usage queries, use these product and SKU identifiers:

#### Product IDs

| Product ID | Product Name |
|-----------|--------------|
| `actions` | GitHub Actions |
| `packages` | GitHub Packages |
| `codespaces` | GitHub Codespaces |
| `copilot` | GitHub Copilot |
| `ghas` | GitHub Advanced Security (now Secret Protection + Code Security) |
| `ghec` | GitHub Enterprise Cloud |

#### Key SKU Identifiers

| SKU | Product |
|-----|---------|
| `ghec_licenses` | GHEC license seats |
| `copilot_enterprise` | Copilot Enterprise seats |
| `copilot_for_business` | Copilot Business seats |
| `copilot_premium_request` | Copilot premium requests |
| `copilot_agent_premium_request` | Cloud agent premium requests |
| `copilot_standalone` | Copilot standalone (individual) |
| `spark_premium_request` | Spark premium requests |
| `ghas_licenses` | GHAS bundled licenses (legacy) |
| `ghas_code_security_licenses` | Code Security licenses |
| `ghas_secret_protection_licenses` | Secret Protection licenses |

### Downloadable CSV Reports

Three report types are available from the GitHub web UI:

| Report | Max Period | Key Fields |
|--------|-----------|------------|
| **Summarized usage** | 1 year | date, sku, repository, cost_center_name, quantity, gross_amount, discount_amount, net_amount |
| **Detailed usage** | 31 days | Adds username, workflow_path |
| **Premium requests usage** | 31 days | date, model, username, quantity, exceeds_quota, total_monthly_quota |

> **Important:** The detailed usage report with `username` and `workflow_path` fields is only available via the GitHub web UI download, NOT via the REST API `/usage` endpoint.

### Automating Usage Reports

Build automated billing pipelines using the REST API and GitHub Actions:

```yaml
# .github/workflows/billing-report.yml
name: Monthly Billing Report
on:
  schedule:
    - cron: '0 6 2 * *'  # Run on the 2nd of each month at 6:00 UTC

jobs:
  generate-report:
    runs-on: ubuntu-latest
    steps:
      - name: Fetch enterprise usage summary
        env:
          GH_TOKEN: ${{ secrets.BILLING_PAT }}
        run: |
          YEAR=$(date -d "last month" +%Y)
          MONTH=$(date -d "last month" +%-m)
          gh api \
            -H "Accept: application/vnd.github+json" \
            -H "X-GitHub-Api-Version: 2026-03-10" \
            "/enterprises/${{ vars.ENTERPRISE }}/settings/billing/usage/summary?year=${YEAR}&month=${MONTH}" \
            > usage-summary.json

      - name: Process and upload report
        run: |
          # Parse JSON and generate summary
          jq -r '.usageItems[] |
            [.product, .sku, .quantity, .grossAmount] |
            @csv' usage-summary.json > report.csv
          echo "Report generated for ${YEAR}-${MONTH}"
```

## License Compliance

### Audit and Reporting Capabilities

Enterprise administrators must maintain visibility into license usage to ensure compliance with contractual obligations and internal policies.

#### Enterprise License Audit Checklist

| Area | Action | Frequency |
|------|--------|-----------|
| **Seat count** | Verify consumed licenses match expectations | Monthly |
| **Dormant users** | Identify and remove users inactive 90+ days | Quarterly |
| **Outside collaborators** | Review external users consuming licenses | Monthly |
| **Copilot seats** | Audit seat assignments against active usage | Monthly |
| **GHAS committers** | Review active committer counts per repo | Monthly |
| **Visual Studio subscribers** | Verify VS subscription license entitlements | Quarterly |

### Compliance Monitoring

#### Proactive Monitoring Strategies

1. **Set up budget alerts** — configure alerts at 75%, 90%, and 100% thresholds for all metered products
2. **Automate seat audits** — schedule monthly GitHub Actions workflows to query the billing API and flag anomalies
3. **Track cost center allocation** — ensure all organizations and repositories are assigned to appropriate cost centers
4. **Monitor GHAS expansion** — track when new repos enable GHAS to anticipate committer count increases

#### Compliance Dashboards

Use the billing API to build custom dashboards that provide:

- **Real-time license utilization** — current consumed vs. available licenses
- **Cost trend analysis** — month-over-month spending by product and SKU
- **Per-department allocation** — cost center breakdowns for chargeback
- **Copilot adoption metrics** — active users, premium request consumption, inactive seats

### License Synchronization

For hybrid GHEC + GHES deployments, license synchronization ensures accurate counting:

#### Synchronization Process

1. GHES instances upload license usage to GitHub.com
2. GitHub matches users across GHEC and GHES by verified email or linked identity
3. Deduplicated counts are reflected in the enterprise billing dashboard
4. License reports include both cloud and server usage data

#### Troubleshooting Sync Issues

| Issue | Resolution |
|-------|-----------|
| Duplicate user counts | Ensure users have the same verified email in both GHEC and GHES |
| Missing GHES data | Verify GHES instance has connectivity to GitHub.com for license sync |
| Stale counts | License sync runs periodically; allow 24 hours for updates |

### Regulatory Considerations

Enterprise administrators should be aware of compliance requirements that may affect licensing decisions:

- **Data residency** — understand where billing data is stored and processed
- **Procurement policies** — align GitHub billing models with organizational procurement workflows
- **Contract terms** — review volume vs. metered billing implications for multi-year agreements
- **Audit trails** — maintain records of license changes for internal and external audits

## References

1. [How GitHub billing works](https://docs.github.com/en/enterprise-cloud@latest/billing/get-started/how-billing-works)
2. [Billing for GitHub Enterprise](https://docs.github.com/en/enterprise-cloud@latest/billing/concepts/enterprise-billing/billing-for-enterprises)
3. [Usage-based billing for enterprise licenses](https://docs.github.com/en/enterprise-cloud@latest/billing/concepts/enterprise-billing/usage-based-licenses)
4. [GitHub Actions billing](https://docs.github.com/en/enterprise-cloud@latest/billing/concepts/product-billing/github-actions)
5. [GitHub Advanced Security (now Secret Protection + Code Security) license billing](https://docs.github.com/en/enterprise-cloud@latest/billing/concepts/product-billing/github-advanced-security)
6. [Billing cycles](https://docs.github.com/en/enterprise-cloud@latest/billing/concepts/billing-cycles)
7. [Cost centers](https://docs.github.com/en/enterprise-cloud@latest/billing/concepts/cost-centers)
8. [Azure subscription payments](https://docs.github.com/en/enterprise-cloud@latest/billing/concepts/azure-subscriptions)
9. [People who consume a license](https://docs.github.com/en/enterprise-cloud@latest/billing/reference/github-license-users)
10. [Plans for GitHub Copilot](https://docs.github.com/en/enterprise-cloud@latest/copilot/about-github-copilot/plans-for-github-copilot)
11. [GitHub Copilot premium requests](https://docs.github.com/en/enterprise-cloud@latest/billing/concepts/product-billing/github-copilot-premium-requests)
12. [Product usage included with each plan](https://docs.github.com/en/enterprise-cloud@latest/billing/reference/product-usage-included)
13. [REST API endpoints for billing usage](https://docs.github.com/en/enterprise-cloud@latest/rest/billing/usage)
14. [REST API endpoints for Copilot user management](https://docs.github.com/en/enterprise-cloud@latest/rest/copilot/copilot-user-management)
15. [Managing user licenses](https://docs.github.com/en/enterprise-cloud@latest/billing/how-tos/manage-plan-and-licenses/manage-user-licenses)
16. [License reports reference](https://docs.github.com/en/enterprise-cloud@latest/billing/reference/license-reports)
17. [GitHub Product and SKU names](https://docs.github.com/en/enterprise-cloud@latest/billing/reference/product-and-sku-names)
18. [Billing reports reference](https://docs.github.com/en/enterprise-cloud@latest/billing/reference/billing-reports)
19. [GitHub Copilot licenses](https://docs.github.com/en/enterprise-cloud@latest/billing/concepts/product-billing/github-copilot-licenses)
20. [Budgets and alerts](https://docs.github.com/en/enterprise-cloud@latest/billing/concepts/budgets-and-alerts)
21. [Automating usage reporting with the REST API](https://docs.github.com/en/enterprise-cloud@latest/billing/tutorials/automate-usage-reporting)
22. [REST API endpoints for billing](https://docs.github.com/en/enterprise-cloud@latest/rest/billing/billing)
