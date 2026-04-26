---
render_with_liquid: false
---

# Security and Compliance

## Overview

GitHub Enterprise Cloud provides enterprise-grade security capabilities and compliance controls that enable organizations to protect intellectual property, secure software supply chains, and meet regulatory requirements. The GitHub Advanced Security (GHAS) suite — comprising GitHub Secret Protection and GitHub Code Security — delivers integrated security features that operate natively within the development workflow, enabling security teams to shift left while maintaining developer velocity.

Security in GitHub Enterprise Cloud operates across multiple layers: code-level security through static analysis and secret detection, supply chain security through dependency management, access security through identity controls, and operational security through audit logging and compliance monitoring. Each layer integrates with enterprise policy frameworks, enabling centralized governance while allowing organizational autonomy within defined boundaries.

Modern compliance requirements demand not just security controls but also evidence collection, audit trails, and continuous monitoring capabilities. GitHub Enterprise Cloud addresses these requirements through comprehensive audit logging, SIEM integration, security advisories, and certifications aligned with industry standards including SOC 2, ISO 27001, FedRAMP, and GDPR. Understanding these capabilities and their enterprise-scale implementation patterns is essential for security architects and compliance officers.

This document explores the technical architecture, configuration patterns, and operational practices for implementing security and compliance at enterprise scale. It covers GitHub Advanced Security features (Secret Protection and Code Security), vulnerability management workflows, compliance automation, and integration patterns with enterprise security infrastructure.

## GitHub Advanced Security (GHAS) — Secret Protection & Code Security

### Architecture and Components

GitHub Advanced Security (now GitHub Secret Protection + GitHub Code Security) is an integrated security platform built into the GitHub development workflow. GHAS features are embedded in code review, pull request workflows, and repository security tabs. As of 2025, GHAS comprises two standalone products — each available separately on GitHub Team and Enterprise plans:

#### GitHub Secret Protection ($19/active committer/month)

**Secret Scanning** monitors repositories for accidentally committed credentials, API keys, tokens, and other sensitive data. It operates continuously, scanning historical commits, new pushes, and pull requests.

**Push Protection** prevents secrets from being committed in the first place by blocking pushes that contain detected secrets, with a delegated bypass workflow and full audit trail.

**Custom Secret Patterns** allow organizations to define patterns for proprietary or internal secret formats beyond the 200+ built-in partner patterns.

**AI-Powered Generic Detection** uses machine learning to identify non-pattern-based secrets such as passwords and generic credentials.

#### GitHub Code Security ($30/active committer/month)

**Code Scanning (CodeQL)** analyzes source code for security vulnerabilities, coding errors, and quality issues using semantic analysis engines. CodeQL performs deep static analysis by treating code as queryable data, enabling complex security pattern detection that goes beyond simple pattern matching.

**Copilot Autofix** generates AI-powered remediation code for detected code scanning vulnerabilities, dramatically reducing mean time to remediation.

**Dependency Review** through Dependabot identifies vulnerable dependencies in project manifests and lockfiles across multiple ecosystems. It provides automated pull requests for dependency updates, security patches, and version upgrades, enabling proactive vulnerability management.

**Security Campaigns** enable coordinated remediation of specific vulnerability types across hundreds of repositories at enterprise scale.

These two products work together to provide comprehensive security coverage across the software development lifecycle, from initial commit through production deployment.

### Licensing and Enablement

GitHub Advanced Security is licensed per active committer. GitHub Secret Protection costs $19/active committer/month and GitHub Code Security costs $30/active committer/month. Both products are now available on GitHub Team and Enterprise plans (not just Enterprise Cloud). An active committer is defined as any user who has pushed at least one commit to a repository with Secret Protection and/or Code Security enabled in the previous 90 days. This consumption-based licensing model ensures organizations only pay for security coverage on actively developed codebases.

Enablement follows the enterprise policy hierarchy:

```mermaid
graph TD
    A[Enterprise Security Licensing] -->|Allocates Seats| B[Organization Enablement]
    B -->|Enables Products| C[Repository Configuration]
    
    A -->|Policy: Enforced| D[All Orgs Must Use]
    A -->|Policy: Allowed| E[Org Chooses Enable/Disable]
    
    D -->|Automatic| F[Security Active All Repos]
    E -->|Manual| G[Per-Repo Enablement]
    
    F --> SP[Secret Protection]
    F --> CS[Code Security]
    
    SP --> I[Secret Scanning Active]
    SP --> PP[Push Protection Active]
    CS --> H[Code Scanning Active]
    CS --> J[Dependency Review Active]
    CS --> CA[Copilot Autofix Active]
    
    G --> K[Selective Product Enable]
    K --> SP
    K --> CS
    
    style A fill:#e1f5ff
    style F fill:#d4edda
    style K fill:#fff3cd
    style SP fill:#ffeeba
    style CS fill:#b8daff
```

Enterprise administrators can enforce security product enablement through enterprise policies, requiring organizations to enable Secret Protection and Code Security on all repositories, or allow organizations to selectively enable these products on specific repositories based on criticality, compliance requirements, or development maturity.

### Security Configurations at Scale

Implementing Secret Protection and Code Security across enterprise organizations requires standardized security posture management while respecting organizational autonomy. This involves:

**Baseline Security Policies**: Establish minimum security standards across all organizations through enterprise policies. These may include mandatory code scanning on critical repositories, mandatory secret scanning with push protection, and required dependency vulnerability reviews before merge.

**Code Security Configurations**: GitHub provides [code security configurations](https://docs.github.com/en/enterprise-cloud@latest/code-security/securing-your-organization/introduction-to-securing-your-organization-at-scale/about-enabling-security-features-at-scale) as an organization-level feature for applying pre-built or custom security settings across multiple repositories at once. Organizations can use the GitHub-recommended default configuration or create custom configurations that specify which security features (code scanning, secret scanning, Dependabot, etc.) to enable, and then apply them to groups of repositories in a single action — eliminating the need to configure each repository individually.

**Organization Inheritance Hierarchy**: As described in [Policy Inheritance Architecture](./06-policy-inheritance.md), security configurations flow from enterprise to organization to repository levels. Secret Protection and Code Security enablement policies cascade through this hierarchy, with organizations inheriting enterprise mandates while adding organization-specific controls.

**Tiered Implementation Levels**: Organizations should classify repositories into tiers (critical, important, standard) and apply proportionate security scanning configurations. Critical repositories might require all Secret Protection and Code Security features with strict blocking policies, while standard repositories enable core scanning with advisory-only configurations.

**Security Scanning Strategy**: Define scanning frequency (continuous on PR, scheduled full scans), retention policies (how long to keep historical results), and alert management rules. Different repositories may require different strategies based on risk profile and development velocity.

**Compliance-Driven Configuration**: For regulated codebases (healthcare, financial services, government), security configurations must align with compliance frameworks. This includes enabling all scanning features, maintaining complete audit trails, and implementing alerting for compliance-critical vulnerabilities.

## Code Scanning with CodeQL

### Overview and Enablement

CodeQL performs deep semantic analysis of source code to identify security vulnerabilities, code quality issues, and compliance violations. Enterprise administrators enable it via Security Configurations at the org level. For technical details on CodeQL, see [GitHub's CodeQL documentation](https://codeql.github.com/docs/).

### Default Setup vs Advanced Configuration

**Default Setup** is recommended for most repositories. It provides pre-configured CodeQL scanning with GitHub-maintained queries covering OWASP Top 10, CWE Top 25, and common security anti-patterns. Default Setup auto-detects languages and runs on pull requests and on a weekly schedule.

**Advanced Setup** (custom workflow YAML) is available for teams with specific analysis needs, such as multi-language scanning, custom query suites, or granular build mode control. See [Configuring code scanning](https://docs.github.com/en/code-security/code-scanning/creating-an-advanced-setup-for-code-scanning/configuring-advanced-setup-for-code-scanning) for workflow configuration details.

### CodeQL Query Language

CodeQL uses a purpose-built query language for security analysis. GitHub maintains query suites covering OWASP Top 10 and CWE Top 25. Organizations can also run custom queries for internal security standards. For query authoring, see [CodeQL documentation](https://codeql.github.com/docs/writing-codeql-queries/).

### Severity Levels and Alert Management

CodeQL findings are categorized by severity:

| Severity | Definition | Response Time | Example |
|----------|-----------|---|---------|
| **Critical** | Immediate risk to security or data integrity | 1-4 hours | Remote Code Execution, Authentication Bypass, SQL Injection |
| **High** | Significant security exposure requiring urgent remediation | 1-2 days | Hardcoded credentials, Insecure deserialization, Path traversal |
| **Medium** | Important but not immediately exploitable vulnerabilities | 1-2 weeks | Information disclosure, Insecure cryptographic practices |
| **Low** | Coding anti-patterns with indirect security implications | 1-2 months | Use of deprecated APIs, Potential null pointer dereference |
| **Note** | Code quality and maintainability issues | No SLA | Code duplication, Complex logic patterns |

Each security level has an associated Cost of Remediation Index (CRI):
- Critical: CRI = 1 (must fix before merge in critical repos)
- High: CRI = 0.8 (should fix before merge, exceptions allowed with risk acceptance)
- Medium: CRI = 0.5 (fix within sprint, not blocking)
- Low: CRI = 0.2 (accumulate and batch fix)

### Build Mode and Multi-Language Analysis

CodeQL supports multiple languages including JavaScript, Python, Java, C/C++, C#, Go, Ruby, Swift, and Kotlin. Default Setup auto-detects languages and configures analysis automatically.

## Secret Scanning

### Architecture and Detection Pipeline

Secret scanning continuously monitors repositories for accidentally committed credentials, API keys, OAuth tokens, and other sensitive data. It operates at multiple points:

1. **Push Protection**: Blocks pushes containing detected secrets before they reach the repository
2. **Historical Scanning**: Analyzes entire repository history when secret scanning is enabled
3. **Ongoing Monitoring**: Continuously scans new commits and pull requests
4. **Custom Pattern Detection**: Organizations define custom secret patterns matching internal credential formats

### Supported Patterns

Secret scanning supports 200+ token patterns from major cloud providers (AWS, Azure, GCP), SaaS platforms, and common credential formats. For the complete list, see [Supported secret scanning patterns](https://docs.github.com/en/code-security/secret-scanning/introduction/supported-secret-scanning-patterns).

Each detected pattern triggers an alert with:
- Location of the secret in repository history
- Type of credential detected
- Timestamp of commit containing the credential
- Remediation options (revoke, rotate, suppress)

### Push Protection Configuration

Push protection prevents secrets from being committed, enabling inline remediation before exposure:

```mermaid
graph TD
    A[Developer Pushes Code] --> B{Secret Scanning Enabled?}
    B -->|No| C[Push Proceeds]
    B -->|Yes| D{Secret Pattern Detected?}
    
    D -->|No Pattern| C
    D -->|Pattern Found| E[Push Blocked]
    
    E --> F{Allow Push?}
    F -->|Override| G[Secret Logged & Block Bypassed]
    F -->|Remediate| H[Remove Secret from Code]
    
    G --> I[Alert to Security Team]
    H --> J[Re-push Clean Code]
    J --> C
    
    I --> K[Audit Log Entry]
    K --> L[Incident Tracking]
    
    style E fill:#ff9999
    style H fill:#99ff99
    style I fill:#ffcc99
    style K fill:#99ccff
```

Configuration through organization settings:

```yaml
# Enable Push Protection in organization
PUT /orgs/{org}/code_security_and_analysis/push_protection
{
  "enabled": true,
  "threshold": "all_patterns",
  "bypass_allowed": true,
  "bypass_require_pr": true,
  "bypass_log_to_audit": true
}
```

When a secret is detected during push:
1. Push is blocked at the server before reaching the repository
2. Developer receives local error message with secret type and location
3. Developer can choose to remove the secret or request override
4. Override requests are logged to audit trail with business justification
5. Security team receives alert for every override, enabling threat tracking

### Custom Patterns and Enterprise Integration

Organizations can define custom secret patterns for proprietary token formats using regex patterns. Enterprise admins can push custom patterns to all orgs via enterprise-level configuration. See [Defining custom patterns](https://docs.github.com/en/code-security/secret-scanning/using-advanced-secret-scanning-and-push-protection-features/custom-patterns-for-secret-scanning).

## Dependency Management

### Dependabot Overview

Dependabot is an automated dependency management system that:
- Maintains awareness of all project dependencies and their versions
- Identifies vulnerable versions through CVE databases
- Automatically creates pull requests for security updates and version upgrades
- Monitors for outdated dependencies across the entire dependency tree

Dependabot operates at three levels:

**Security Updates**: Automatic PRs when a dependency has a published CVE. These are high-priority and should merge quickly. Enabled by default when Dependabot is active.

**Version Updates**: Periodic PRs for newer versions of dependencies. Frequency configurable (daily, weekly, monthly). Allows batching non-critical updates.

**Digest Updates**: For Docker images and other digested dependencies, updates to latest digest even when version remains the same.

Dependabot is configured via a `dependabot.yml` file in each repository's `.github/` directory. Enterprise admins can enforce Dependabot enablement through Security Configurations at the org level. For configuration options, see [Configuring Dependabot](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuring-dependabot-version-updates).

### Dependency Review and Governance

Dependency review gates pull request merging based on vulnerability criteria:

- **Blocking Criteria**: Automatic block if PR introduces high or critical vulnerabilities
- **Advisory Criteria**: Comment on PR with medium and low severity vulnerabilities for developer awareness
- **License Compliance**: Flag dependencies with incompatible licenses (GPL vs MIT, etc.)
- **Supply Chain Risk**: Flag dependencies with unusual maintainer changes, deprecated status, or unusual activity

GitHub's Dependency Review API enables custom governance policies:

```yaml
- name: Dependency Review
  uses: actions/dependency-review-action@v3
  with:
    fail-on-severity: high
    allow-licenses: |
      MIT
      Apache-2.0
      ISC
    deny-licenses: |
      GPL-2.0
      LGPL-2.1
    vulnerability-check: true
    license-check: true
    comment-summary-in-pr: true
```

### Dependency Graph Architecture

The dependency graph automatically maps all project dependencies from manifest files and lockfiles. It powers Dependabot alerts and dependency review. Enterprise admins can enable or disable the dependency graph at the org level.

## Security Policies and Vulnerability Reporting

### SECURITY.md File

Organizations should create a standardized SECURITY.md file in each repository describing security practices and incident reporting:

```markdown
# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.x | :white_check_mark: |
| 0.x | :x: |

## Reporting a Vulnerability

We take security very seriously. If you discover a security vulnerability, please email
security@organization.com with:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested remediation (if any)

**Do not** open a public GitHub issue for security vulnerabilities.

## Response Expectations

- Initial response within 24 hours
- Triage complete within 3 business days
- Public advisory or patch release within 30 days of report

## Security Contact

- Primary: security@organization.com
- Escalation: ciso@organization.com
- PGP Key: Available at https://organization.com/security.gpg
```

### Private Vulnerability Reporting

Private vulnerability reporting enables external researchers to report security issues through a standardized GitHub flow:

```mermaid
graph TD
    A[Security Researcher] --> B{Has Report Form?}
    B -->|Yes| C[Private Vulnerability Report]
    B -->|No| D[Email Security Contact]
    
    C --> E[Create Draft Advisory]
    D --> E
    
    E --> F[Repository Maintainers Notified]
    F --> G{Acknowledge Receipt?}
    
    G -->|Within SLA| H[Begin Investigation]
    G -->|Missed SLA| I[Escalate to Security Team]
    
    H --> J[Develop Patch]
    J --> K[Coordinate Embargo Period]
    
    K --> L[Public Release]
    L --> M[Advisory Published]
    M --> N[CVE Assigned]
    
    style C fill:#99ccff
    style H fill:#99ff99
    style L fill:#ffcc99
    style N fill:#ff9999
```

Organizations enable private vulnerability reporting through repository settings, allowing external researchers to:
1. Click "Report a vulnerability" in Security tab
2. Provide vulnerability details through guided form
3. Repository maintainers receive notification
4. Discussion occurs in private draft advisory space
5. Patch development proceeds confidentially
6. Public advisory released with CVE upon remediation

### GitHub Security Advisories

GitHub Security Advisories are structured records for vulnerabilities affecting publicly available software:

```json
{
  "cveid": "CVE-2024-12345",
  "ghsa": "GHSA-xxxx-yyyy-zzzz",
  "summary": "Remote Code Execution in package-name",
  "description": "Detailed technical description of vulnerability...",
  "severity": "critical",
  "affected_versions": [
    {
      "range": ">= 1.0.0, < 1.0.5"
    },
    {
      "range": ">= 2.0.0, < 2.0.3"
    }
  ],
  "patched_versions": ["1.0.5", "2.0.3"],
  "identifiers": [
    {
      "type": "GHSA",
      "value": "GHSA-xxxx-yyyy-zzzz"
    },
    {
      "type": "CVE",
      "value": "CVE-2024-12345"
    }
  ],
  "references": [
    "https://nvd.nist.gov/vuln/detail/CVE-2024-12345"
  ],
  "published_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z",
  "withdrawn_at": null,
  "cve_metadata_updated_at": "2024-01-15T10:00:00Z"
}
```

Advisories provide:
- Automatic correlation with repositories using affected versions
- Dependabot integration for automatic update PR creation
- Export to security databases and vulnerability management systems
- Public searchability for vulnerability intelligence gathering

## Audit Logging and SIEM Integration

### Audit Log Architecture

GitHub Enterprise Cloud maintains comprehensive audit logs of security-relevant events across organizations:

```
Audit Log Categories
├── Authentication Events
│   ├── Login/logout
│   ├── Multi-factor authentication events
│   ├── SAML/OIDC authentication
│   └── Token generation/revocation
├── Repository Events
│   ├── Repository creation/deletion
│   ├── Branch protection changes
│   ├── Secret scanning alerts
│   ├── Code scanning findings
│   └── Deployment activity
├── Access Control Events
│   ├── Permission changes
│   ├── Team modifications
│   ├── Organization role changes
│   ├── Deploy key management
│   └── SSH key management
├── Content Events
│   ├── Code pushes
│   ├── Pull request reviews
│   ├── Issue modifications
│   ├── Discussion activity
│   └── Wiki changes
└── Administrative Events
    ├── Organization setting changes
    ├── Enterprise policy modifications
    ├── License changes
    ├── SAML identity provider changes
    └── Third-party app authorizations
```

Audit logs record:
- **Event ID**: Unique identifier for correlation
- **Timestamp**: UTC timestamp with millisecond precision
- **Actor**: User, service account, or application performing action
- **Action**: Specific event type
- **Resource**: Affected repository, organization, or user
- **Result**: Success/failure status with error codes
- **IP Address**: Source IP for network forensics
- **User Agent**: Client information
- **Changes**: Before/after values for modifications
- **Context**: Additional metadata (SAML session ID, API scope, etc.)

### Audit Log Streaming to SIEM

GitHub Enterprise Cloud can stream audit logs in real-time to Security Information and Event Management (SIEM) systems:

**Supported Streaming Protocols**:
- **Syslog over TLS**: Standard syslog protocol with TLS encryption, compatible with most SIEMs
- **Webhook**: HTTPS webhook delivery, best for high-volume environments
- **HTTP API**: Polling API for periodic retrieval

Configuration example:

```yaml
# Syslog Streaming Configuration
name: "Production SIEM"
type: "syslog"
server: "siem.organization.com"
port: 6514
protocol: "tls"
certificate_verification: true
ca_path: "/etc/ssl/certs/organization-ca.pem"
event_batch_size: 500
retry_policy: "exponential_backoff"
max_retries: 3
```

SIEM integration enables:
- **Centralized Log Aggregation**: All GitHub audit events in one searchable location
- **Real-Time Alerting**: Automated alerts for suspicious patterns (mass deletions, privilege escalation)
- **Correlation Analysis**: Cross-referencing GitHub events with other infrastructure events
- **Compliance Reporting**: Automated evidence collection for audit requirements
- **Forensic Investigation**: Historical analysis of security incidents

### SIEM Pattern Examples

**Suspicious Login Pattern Detection**:
```
event.type = "authentication" AND 
event.result = "failure" AND
count(events in 5 minutes) > 10 AND
source.ip NOT IN (known_corporate_networks)
→ Alert: Brute Force Attempt
```

**Unauthorized Privilege Escalation**:
```
event.type = "org.access_change" AND
event.change.permission = "owner" AND
actor.type = "user" AND
actor NOT IN (approved_admins) AND
event.timestamp NOT IN (change_window)
→ Alert: Unauthorized Privilege Change
```

**Code Injection Attempt**:
```
event.type = "push" AND
event.repository.branch = "main" AND
event.files.added > 50 AND
event.files.modified > 100 AND
actor.repository_permissions < "maintain"
→ Alert: Suspicious Mass Commit
```

### Compliance Reporting Workflow

Automated compliance reporting integrates audit logs with reporting systems:

```mermaid
graph TD
    A[GitHub Audit Logs] --> B[SIEM Aggregation]
    B --> C[Log Normalization]
    C --> D[Compliance Analysis]
    
    D --> E{Compliance Framework}
    E -->|SOC 2| F[Access Controls Report]
    E -->|ISO 27001| G[Information Security Report]
    E -->|GDPR| H[Data Processing Report]
    E -->|HIPAA| I[Audit Trail Report]
    
    F --> J[Automated Report Generation]
    G --> J
    H --> J
    I --> J
    
    J --> K[Evidence Collection]
    K --> L[Audit Ready Artifacts]
    L --> M[Compliance Dashboard]
    
    style A fill:#e1f5ff
    style J fill:#99ff99
    style L fill:#ffcc99
    style M fill:#99ccff
```

Monthly compliance reports automatically:
1. **Collect Evidence**: Pull audit log entries matching compliance criteria
2. **Normalize Data**: Convert GitHub events to compliance framework terminology
3. **Analyze Patterns**: Detect anomalies or policy violations
4. **Generate Artifacts**: Create timestamped evidence packages
5. **Store Immutably**: Archive reports for audit retention
6. **Alert on Violations**: Notify compliance team of policy failures

## Compliance Certifications

### SOC 2 Type II

GitHub Enterprise Cloud maintains SOC 2 Type II certification, demonstrating compliance with security, availability, processing integrity, confidentiality, and privacy criteria.

**Controls Addressed**:
- **CC1-CC9**: Control environment and risk management
- **C1-C2**: Logical access controls
- **S1**: Segregation of duties in development and production
- **PI1**: Policies for preventing unauthorized access to user data
- **PV1**: Privacy policies alignment with GDPR, CCPA

**Relevant for Organizations**:
- Processing customer data in software
- Subject to vendor security assessments
- Requiring vendor attestation for compliance programs

### ISO 27001 / 27018

GitHub maintains ISO/IEC 27001 certification (information security management) and 27018 (cloud PII protection).

**Requirements Addressed**:
- **Annex A.5-A.8**: Organization of information security
- **Annex A.9-A.10**: Asset management and access control
- **Annex A.11-A.14**: Physical/technical security, operations, communications
- **Annex A.18**: Compliance with legal and regulatory requirements
- **ISO 27018 Cloud PII**: Specific protections for personally identifiable information processing

**Enterprise Implications**:
- Evidence of information security management system maturity
- Third-party validation of privacy controls for EU organizations
- Compliance with customer requirements for ISO 27001-certified vendors

### FedRAMP

FedRAMP (Federal Risk and Authorization Management Program) provides standardized compliance framework for cloud services used by U.S. government agencies.

GitHub Cloud for Government meets FedRAMP Moderate baseline requirements:
- **Moderate baseline controls**: 325 security controls from NIST SP 800-53
- **Authority to Operate (ATO)**: Issued by JAB (Joint Authorization Board)
- **Continuous monitoring**: Annual reassessment with monthly compliance reviews
- **Government-specific network isolation**: Segregated infrastructure for government customers

**Compliance Domains**:
- Access Control (AC): 22 controls
- Identification and Authentication (IA): 8 controls
- System Communications Protection (SC): 20 controls
- Audit and Accountability (AU): 12 controls
- Security Assessment and Authorization (CA): 8 controls
- Contingency Planning (CP): 13 controls
- Configuration Management (CM): 9 controls

### Additional Certifications

**HIPAA Business Associate Agreement (BAA)**:
- Healthcare organizations can execute Business Associate Agreement with GitHub
- Enables compliance with HIPAA Omnibus Rule for handling Protected Health Information (PHI)
- Includes HIPAA-specific audit log requirements and encryption standards

**PCI DSS**:
- For payment card processing integration
- GitHub data handling meets PCI DSS 3.2.1 requirements
- Suitable for fintech and e-commerce organizations

**GDPR Data Processing Agreement (DPA)**:
- Standard contractual clauses for EU data transfers
- Data Processing Agreement specifies data processor obligations
- Compliance with Article 28 and Article 44 requirements

**CCPA/CPRA**:
- California Consumer Privacy Act and California Privacy Rights Act compliance
- Data deletion capabilities and privacy rights management
- Transparency in data collection and processing

### Security Campaigns

Security campaigns enable coordinated remediation across hundreds of repositories. Enterprise security teams create campaigns from the Security Overview dashboard to prioritize and track vulnerability remediation at scale.

### Software Bill of Materials (SBOM)

GitHub supports generating SBOMs for supply chain transparency and regulatory compliance:

- **Generate via UI:** Repository. Insights. Dependency graph. Export SBOM (SPDX format)
- **Generate via CLI:** `gh api /repos/{owner}/{repo}/dependency-graph/sbom` returns SPDX JSON
- **Supported formats:** SPDX 2.3 (JSON) — the industry standard for software component inventory
- **Scope:** Includes all dependencies detected by the dependency graph (manifest files + lock files)

**Governance recommendation:** Include SBOM generation in CI/CD pipelines for release artifacts. Many compliance frameworks (NIST, EO 14028, EU CRA) now require SBOM documentation for software supply chain transparency.

### Artifact Attestations & Build Provenance

Artifact attestations provide cryptographic proof of where and how a software artifact was built:

- **Generate attestations:** Use `actions/attest-build-provenance@v2` in your GitHub Actions workflow to create a signed attestation for build outputs
- **Verify attestations:** Use `gh attestation verify <artifact> --owner <org>` to verify that an artifact was built in a trusted workflow
- **SLSA compliance:** Attestations conform to SLSA (Supply-chain Levels for Software Artifacts) Build Level 2, providing tamper-evident build provenance

**Enterprise enforcement:** Enterprise owners can require attestation verification before deployment by configuring a deployment protection rule via a GitHub App. This rule gates environment deployments on a successful `gh attestation verify` check, ensuring that only artifacts with valid provenance reach production.

**SLSA Build Level 2 vs Level 3:**
- **Level 2** (what GitHub provides out of the box): The build service automatically generates signed provenance — no changes to your build scripts required beyond adding the attestation action.
- **Level 3**: Requires a hardened, isolated build environment that produces non-falsifiable provenance. Achieving L3 requires additional tooling (e.g., SLSA builders for specific ecosystems) beyond what standard GitHub-hosted runners provide.

**Verification flow:** Use the GitHub CLI to verify an artifact against the Sigstore transparency log:
```bash
gh attestation verify artifact.tar.gz --owner ORG
```
This checks that a valid attestation exists matching the artifact's SHA-256 digest, that it was signed by a trusted GitHub Actions workflow, and that the signature is recorded in Sigstore's public transparency log.

**Sigstore keyless signing:** GitHub Actions uses OpenID Connect (OIDC) to obtain short-lived signing certificates from Sigstore's Fulcio certificate authority. The workflow identity (repo, workflow path, ref) is embedded in the certificate. No long-lived signing keys need to be generated, stored, or rotated — eliminating an entire class of key-management risk.

> **Reference:** [Using artifact attestations to establish provenance for builds](https://docs.github.com/en/actions/security-for-github-actions/using-artifact-attestations)

**Enterprise policy:** Consider requiring attestations for all production deployments. Combine with deployment environment protection rules to enforce that only attested artifacts can be deployed.

## Enterprise-Scale Security Implementation

### Security Architecture at Scale

Implementing comprehensive security across enterprise organizations requires strategic alignment of technical controls with organizational structure:

**Security Posture Pyramid**:

```
                        Advanced Threat Detection
                       (Machine Learning, Behavioral)
                        /
                       /
                  Incident Response
                  (Playbooks, Automation)
                   /
                  /
             Vulnerability Management
             (Scanning, Prioritization, Remediation)
              /
             /
        Access Control & Identity
        (RBAC, MFA, SSO)
         /
        /
    Foundation: Audit Logging & Monitoring
```

**Layer 1 - Foundation**: Comprehensive logging of all security-relevant events, enabling retrospective investigation and compliance evidence gathering.

**Layer 2 - Access Control**: Identity management integration (as described in [Identity and Access Management - Doc 03](./03-identity-access-management.md)) ensures least-privilege access, with enforcement at organization and team levels (as per [Teams and Permissions - Doc 05](./05-teams-permissions.md)).

**Layer 3 - Vulnerability Management**: Secret Protection and Code Security scanning capabilities identify vulnerabilities, which are prioritized and tracked through remediation.

**Layer 4 - Incident Response**: Automated playbooks detect patterns indicating compromise or policy violation, triggering investigation and response workflows.

**Layer 5 - Advanced Detection**: Machine learning models detect behavioral anomalies, zero-day attack patterns, and supply chain compromises.

### Cross-Repository Security Governance

Security governance operates across repository tiers:

**Critical Repositories** (Tier 1):
- Application: Production applications, core platform libraries, security infrastructure
- Security Policy: All Secret Protection and Code Security features enabled, mandatory before merge
- Code Review: Minimum 2 approvals, at least one from security team
- Deployment: Automated security gates, production approval required
- Audit: Daily scanning, weekly comprehensive security review

**Important Repositories** (Tier 2):
- Application: Staging environments, internal tools, development frameworks
- Security Policy: Code scanning (Code Security) and secret scanning (Secret Protection) mandatory, dependency review advisory
- Code Review: Minimum 1 approval
- Deployment: Automated gates with fallback option
- Audit: Weekly scanning, monthly review

**Standard Repositories** (Tier 3):
- Application: Development branches, experimental projects, archived code
- Security Policy: Code scanning (Code Security) and secret scanning (Secret Protection) enabled, not blocking
- Code Review: Self-approval option for non-production work
- Deployment: Minimal gates
- Audit: Monthly scanning

### Security Cross-Functional Alignment

Effective enterprise security requires alignment across teams:

**Development Teams**:
- Responsibility: Fix code scanning findings, resolve secret alerts, keep dependencies current
- Support: 5-day SLA for critical vulnerabilities, 30-day for medium

**Platform/DevOps Teams**:
- Responsibility: Deploy and maintain scanning infrastructure, configure audit log streaming, manage deployment security gates
- Support: Infrastructure hardening, secret rotation automation, incident response coordination
- Tools: GitHub Actions runners, webhook handlers, SIEM integration

**Security Teams**:
- Responsibility: Define vulnerability response policies, review critical findings, monitor audit logs, compliance reporting
- Support: Threat intelligence integration, advanced analysis, policy development
- Tools: Vulnerability management platform, SIEM, threat intelligence feeds

**Compliance Teams**:
- Responsibility: Map controls to compliance requirements, generate audit reports, manage certifications
- Support: Regulatory interpretation, audit preparation, evidence collection
- Tools: Policy management system, audit evidence repository

## Security Operations Workflows

### Vulnerability Remediation Workflow

Vulnerability detection and remediation follows a structured process:

```mermaid
graph TD
    A[Vulnerability Detected] --> B{Auto Categorize}
    B -->|Secret| C[Immediate Revocation]
    B -->|Dependency| D[Dependabot PR Created]
    B -->|Code Issue| E[Code Scanning Alert]
    
    C --> F[Audit Trail Entry]
    D --> G[Developer Review]
    E --> G
    
    G --> H{Reviewer Decision}
    H -->|Fix Required| I[Developer Creates PR]
    H -->|False Positive| J[Suppress Alert]
    H -->|Accept Risk| K[Risk Acceptance Form]
    
    I --> L[Code Review & Approval]
    J --> M[Mark in System]
    K --> M
    
    L --> N{Pass Security Gate?}
    N -->|Yes| O[Merge to Production]
    N -->|No| P[Return to Developer]
    
    P --> I
    O --> Q[Verify Remediation]
    Q --> R[Alert Closed]
    M --> R
    
    style A fill:#ff9999
    style C fill:#99ff99
    style O fill:#99ff99
    style R fill:#cccccc
```

The vulnerability response workflow follows a structured admin process: **Detect** (scanning identifies vulnerability) → **Triage** (security team assesses severity and business impact) → **Assign** (affected team assigned via CODEOWNERS) → **Track** (remediation monitored against SLA) → **Verify** (scanning confirms resolution, alert closed with evidence).

### Incident Response Integration

Security incidents in GitHub trigger coordinated response:

**Detection**: SIEM correlation rules identify suspicious patterns in audit logs:
- Mass deletion of repositories or branches
- Unauthorized authentication attempts
- Privilege escalation without approval
- Unusual API token activity
- Code push to critical repositories outside deployment windows

**Initial Response**:
```yaml
incident_response:
  mass_deletion_detected:
    trigger: "event.action = 'repo.delete' AND count > 5 AND time_window < 5m"
    actions:
      - alert_severity: "critical"
      - notify:
          - security_team
          - soc_team
          - incident_commander
      - auto_response:
          - revoke_actor_tokens: true
          - lock_actor_account: true
          - archive_deleted_repos: true
      - evidence_collection:
          - capture_audit_logs: "24h_before_and_after"
          - snapshot_affected_repos: true
          - preserve_git_history: true
```

**Investigation Phase**:
1. Determine if action was authorized (check change windows, approvals)
2. Review actor's recent activities in audit log
3. Correlate with other infrastructure events (SIEM cross-reference)
4. Interview team members and approvers
5. Review security controls that failed to prevent

**Containment Phase**:
1. Temporarily suspend compromised account
2. Rotate credentials used during incident
3. Review and revoke any suspicious OAuth applications
4. Reset MFA for affected users
5. Force re-authentication for active sessions

**Recovery Phase**:
1. Restore data from backups (deleted repositories, branches)
2. Verify integrity of restored data
3. Review code changes for malicious modifications
4. Patch any exploited vulnerabilities
5. Communicate remediation status to stakeholders

**Post-Incident**:
1. Complete incident report with timeline
2. Identify control failures and process gaps
3. Implement preventive measures
4. Update incident response playbooks
5. Conduct post-mortem with technical team

### Continuous Compliance Monitoring

Continuous monitoring ensures security posture remains compliant:

**Daily Checks**:
- Monitor code scanning alert volume and age (aging alerts escalate in priority)
- Review secret scanning detections (any push protection bypasses)
- Verify audit log streaming to SIEM (detect streaming failures)
- Check for disabled security features

**Weekly Checks**:
- Review vulnerability remediation SLA compliance
- Audit dependency update PRs and merge status
- Verify no critical repositories without branch protection
- Review access control changes for policy violations

**Monthly Checks**:
- Comprehensive security posture assessment
- Compliance control mapping verification
- Generate executive security dashboard
- Security team all-hands review of security metrics

## GHAS Implementation Best Practices and Cost Mitigation

GitHub Advanced Security (Secret Protection and Code Security) delivers significant security value, but its per-committer licensing model requires deliberate financial planning at enterprise scale. Building on the tiered repository classification and security configuration patterns described in [Cross-Repository Security Governance](#cross-repository-security-governance), this section focuses on the financial planning, cost modeling, and optimization strategies that enterprise administrators need to deploy GHAS cost-effectively.

### Understanding the Cost Model

GHAS is licensed per **active committer** across two independently purchasable products:

| Product | Cost | What You Get |
|---------|------|--------------|
| **Secret Protection** | $19/active committer/month | Secret scanning, push protection, custom patterns, AI generic detection |
| **Code Security** | $30/active committer/month | CodeQL code scanning, Copilot Autofix, dependency review, security campaigns |
| **Both products** | $49/active committer/month | Combined cost — no bundle discount; products are purchased separately |

> **Important**: GitHub does not offer a discounted bundle SKU. The $49 figure is the combined cost of purchasing both products independently. The unbundling is intentional — enterprises can select one or both products per their risk profile.

#### Active Committer Definition

An **active committer** is any user who has pushed at least one commit in the previous 90 days to a repository where Secret Protection and/or Code Security is enabled. Key details:

- **Unique user deduplication**: A user who commits to 20 GHAS-enabled repositories counts as **one** active committer, not 20. Billing is per-user across the enterprise, not per-repo.
- **90-day trailing window**: The window is rolling. A committer who stops committing will continue to count for up to 90 days after their last commit to an enabled repo.
- **GitHub App bots are excluded**: Commits made by GitHub App bot identities are automatically excluded from billing. However, commits made via personal access tokens (PATs) tied to user accounts — even for automation purposes — **do count** as active committers. Ensure automation uses GitHub App installations rather than user-account PATs.
- **Fork committers**: Fork committers count toward the upstream repository's active committer total only when their commits are merged into it via pull request. Commits that remain in the fork are not counted for the upstream repo.
- **Cost center allocation**: GHAS is a license-based product — each active committer's cost is allocated to **one** cost center following the precedence order: direct user assignment → oldest organization membership → enterprise fallback. See [Licenses and Billing — Cost Centers](./19-licenses-billing.md#cost-centers) for details on configuring cost center allocation.

```mermaid
graph LR
    subgraph "Enterprise: 5 GHAS-Enabled Repos"
        R1[Repo A]
        R2[Repo B]
        R3[Repo C]
        R4[Repo D]
        R5[Repo E]
    end

    U1[Alice] -->|commits to| R1
    U1 -->|commits to| R2
    U1 -->|commits to| R3
    U2[Bob] -->|commits to| R1
    U2 -->|commits to| R4
    U3[Carol] -->|commits to| R5
    U4[deploy-bot<br/>GitHub App] -->|commits to| R1
    U4 -->|commits to| R2
    U4 -->|commits to| R3
    U4 -->|commits to| R4
    U4 -->|commits to| R5

    subgraph "Billing: 3 Active Committers"
        B1[Alice = 1 committer]
        B2[Bob = 1 committer]
        B3[Carol = 1 committer]
        B4[deploy-bot = excluded]
    end

    style U4 fill:#d4edda,stroke:#28a745
    style B4 fill:#d4edda,stroke:#28a745
    style B1 fill:#fff3cd
    style B2 fill:#fff3cd
    style B3 fill:#fff3cd
```

#### Enhanced Billing Platform Prerequisite

Cost centers, budget alerts, and the Usage Summary API described in this section require the **enhanced billing platform** (metered billing). This model became mandatory for new enterprises in late 2024 and has been rolled out to existing enterprises. Verify your enterprise's billing model:

```bash
# Attempt to access the cost centers API as a proxy check for enhanced billing.
# A successful response indicates enhanced billing is active;
# a 404 indicates the enterprise has not migrated yet.
gh api /enterprises/YOUR-ENTERPRISE/settings/billing/cost-centers --jq '.cost_centers'
```

> **Note**: There is no single API field that directly reports whether enhanced billing is active. The most reliable method is to check **Enterprise Settings → Billing** in the UI and look for the "Budgets" and "Cost centers" options. The REST call above serves as a programmatic proxy — if it returns data, enhanced billing is enabled.

If your enterprise has not migrated to enhanced billing, contact GitHub Sales or your account representative to enable cost center and budget features.

#### Cost Modeling by Organization Size

The following table projects annual costs under three common enablement strategies:

| Org Size (Active Committers) | Secret Protection Only | Code Security Only | Both Products | Tiered Strategy* |
|------------------------------|----------------------|-------------------|--------------|-----------------|
| **100 developers** | $22,800/yr | $36,000/yr | $58,800/yr | $33,600/yr |
| **500 developers** | $114,000/yr | $180,000/yr | $294,000/yr | $168,000/yr |
| **1,000 developers** | $228,000/yr | $360,000/yr | $588,000/yr | $336,000/yr |
| **5,000 developers** | $1,140,000/yr | $1,800,000/yr | $2,940,000/yr | $1,680,000/yr |

\* **Tiered Strategy**: Secret Protection on all committers ($19 × N) + Code Security on ~30% of committers who work on critical/high-risk repos ($30 × 0.3N). Actual percentages vary by enterprise.

> **Key insight**: At 5,000 developers, the difference between blanket enablement of both products ($2.94M/yr) and a tiered strategy ($1.68M/yr) is **$1.26M annually**. Cost modeling before rollout is essential.

### Active Committer Optimization

Controlling the active committer count is the primary lever for managing GHAS costs. Every optimization in this section reduces the number of unique users counted against billing.

#### Enable Features Only on Repos That Need Them

Avoid blanket enablement of GHAS across all repositories. Instead, use the tiered classification from your repository governance framework to selectively enable products:

```bash
# List repos with GHAS features enabled in an organization
gh api --paginate "/orgs/YOUR-ORG/repos" \
  --jq '.[] | select(.security_and_analysis.advanced_security.status == "enabled") | .full_name'

# Check active committer count for billing
gh api "/enterprises/YOUR-ENTERPRISE/settings/billing/advanced-security" \
  --jq '{total_committers: .total_advanced_security_committers, repos: [.repositories[] | {name: .name, committers: .advanced_security_committers}]}'
```

#### Manage the 90-Day Trailing Window

When you disable GHAS on a repository, its committers continue to count toward billing for up to 90 days after their last commit. Plan accordingly:

- **Before disabling**: Check which committers are unique to that repo (not committing to other enabled repos). Only those committers will eventually drop off billing.
- **Timing**: Disable features on repos transitioning to maintenance mode as soon as active development stops — the 90-day clock starts on the last commit, not the disable date.
- **Archival**: Archive inactive repositories to signal they are no longer actively developed. Archived repos do not accept new commits, so committers naturally age out.

#### Use Security Configurations for Targeted Enablement

Security Configurations allow you to define reusable security profiles and apply them to groups of repositories matching specific criteria:

```bash
# List security configurations in an organization
gh api "/orgs/YOUR-ORG/code-security/configurations" \
  --jq '.[] | {name: .name, secret_scanning: .secret_scanning, code_scanning_default_setup: .code_scanning_default_setup}'
```

Create separate configurations for each tier: a "Critical" configuration enabling all features, a "Standard" configuration enabling Secret Protection only, and a "Minimal" configuration for low-risk repos with no paid features.

### Cost Mitigation Strategies

#### Tiered Deployment Model

The highest-impact cost optimization is deploying products selectively:

- **Secret Protection everywhere**: At $19/committer/month, Secret Protection provides universal value — leaked secrets affect any repo regardless of risk tier. Push protection alone justifies the cost across all active repos.
- **Code Security on high-risk repos only**: At $30/committer/month, Code Security (CodeQL + Copilot Autofix) delivers the most value on repos that contain production application code, handle sensitive data, or are subject to compliance requirements. Static marketing sites, documentation repos, and internal tooling may not justify the additional cost.

#### Free Tier Leverage

All GHAS features are **free on public repositories**. For enterprises contributing to open source:

- Do not count public repo committers toward GHAS licensing costs
- Enable full Secret Protection and Code Security on all public repos at no additional cost
- Open-source program offices should audit that all public repos have GHAS enabled

#### Free Secret Risk Assessment

Before purchasing Secret Protection, use GitHub's **free, periodic (available every 90 days) secret risk assessment** — a point-in-time scan of all repositories in an organization that identifies leaked secrets without requiring paid licenses. This assessment helps quantify exposure and prioritize which organizations or repos to enable first, turning a cost decision into a data-driven one.

#### Azure Billing Integration and MACC

Enterprises routing GitHub billing through an Azure subscription can apply GHAS costs toward their **Microsoft Azure Consumption Commitment (MACC)**. This means pre-committed Azure spend can effectively cover GHAS licensing, reducing incremental budget impact. Work with your Microsoft account team to confirm MACC applicability for your GitHub Enterprise agreement.

#### Regular Committer Audits

Schedule monthly audits of active committer counts to detect unexpected growth:

```bash
# Get detailed committer breakdown per repository
gh api "/enterprises/YOUR-ENTERPRISE/settings/billing/advanced-security" \
  --jq '.repositories[] | select(.advanced_security_committers > 0) | {repo: .name, committers: .advanced_security_committers, purchased: .advanced_security_committers_breakdown.user}'

# Export committer list for review
gh api "/enterprises/YOUR-ENTERPRISE/settings/billing/advanced-security" \
  --jq '[.repositories[] | {repo: .name, committers: .advanced_security_committers}] | sort_by(-.committers)'
```

Review the output for:
- Repos with high committer counts but low development activity (candidates for disabling)
- Repos enabled accidentally during onboarding
- New repos auto-enrolled through default security configurations

#### Budget Alerts and Spending Governance

> **Critical distinction**: GHAS budget alerts are **notification-only** — they send email alerts at default thresholds of 75%, 90%, and 100% of the configured budget but **do not block usage**. These thresholds can be customized when creating budgets via the API. Unlike metered products (Actions, Codespaces, Packages), GHAS licensing cannot be capped by a platform-enforced spending limit. Actual cost control requires procedural governance (approval workflows, periodic audits, and enablement policies).

Set budget alerts to provide early warning:

1. Navigate to **Enterprise Settings → Billing → Budgets**
2. Create a budget scoped to GitHub Advanced Security
3. Set the monthly threshold to your planned spend
4. Configure notification recipients (billing admins, security leads, finance contacts)
5. Establish escalation procedures for when alerts fire

#### Cost Center Tracking

Allocate GHAS costs to business units using cost centers on the enhanced billing platform:

1. Create cost centers per business unit or department in **Enterprise Settings → Billing → Cost Centers**
2. Assign organizations to cost centers
3. Use the Usage Summary API to generate per-unit cost reports:

```bash
# Get usage summary for a cost center (enhanced billing platform)
gh api "/enterprises/YOUR-ENTERPRISE/settings/billing/usage" \
  --jq '.usageItems[] | select(.product == "advanced_security") | {org: .organizationName, cost: .grossAmount, quantity: .quantity}'
```

### Cost Governance Framework

Effective GHAS cost management requires ongoing governance — not just initial optimization. Establish the following process:

```mermaid
graph TD
    A[Monthly Cost Review] -->|Pull usage data| B[Usage Summary API]
    B --> C{Cost within budget?}
    C -->|Yes| D[Generate Executive Report]
    C -->|No - Over budget| E[Identify Cost Drivers]
    E --> F[Audit Enabled Repos]
    F --> G{Repos justified?}
    G -->|No| H[Disable on<br/>Low-Value Repos]
    G -->|Yes| I[Request Budget<br/>Increase]
    H --> D
    I --> D
    D --> J[Distribute to<br/>Cost Center Owners]
    J --> K[Business Unit Review]

    L[New Repo GHAS Request] --> M{Approval Workflow}
    M -->|Approved| N[Enable via<br/>Security Config]
    M -->|Denied| O[Document Rationale]

    style A fill:#e1f5ff
    style C fill:#fff3cd
    style D fill:#d4edda
    style H fill:#f8d7da
    style M fill:#fff3cd
```

#### Monthly Review Cadence

| Week | Activity | Owner | Output |
|------|----------|-------|--------|
| Week 1 | Pull committer counts and cost data from Usage API | Platform Engineering | Raw usage report |
| Week 2 | Analyze trends, flag anomalies, audit new enablements | Security Engineering | Annotated cost analysis |
| Week 3 | Review with cost center owners, address overages | Finance + Engineering Leads | Action items |
| Week 4 | Executive summary, update forecasts, adjust budgets | CISO / VP Engineering | Executive dashboard |

#### ROI Measurement

Track these metrics to demonstrate GHAS value against cost:

- **Secrets detected and remediated**: Total secrets caught by push protection (prevented) and scanning (detected post-commit)
- **Vulnerabilities found by CodeQL**: Critical/high severity findings per month, mean time to remediation
- **Copilot Autofix adoption**: Percentage of autofix suggestions accepted, developer hours saved
- **Dependency vulnerabilities patched**: Dependabot PRs merged, average patch latency
- **Cost per vulnerability prevented**: Total GHAS spend ÷ total vulnerabilities caught (target: demonstrate decreasing cost per finding as maturity increases)

### Common Cost Pitfalls

Enterprises frequently encounter these avoidable cost mistakes during GHAS rollout:

1. **Blanket Code Security enablement**: Enabling Code Security on all repositories — including documentation, archived projects, and low-risk internal tools — inflates active committer counts without proportional security value. Use tiered deployment.

2. **Unmonitored committer growth**: During phased rollouts, new repos are enabled incrementally. Without monthly audits, the committer count grows silently, and the first indication is an unexpectedly large invoice.

3. **Ignoring the 90-day trailing window**: Disabling GHAS on a repo does not immediately reduce costs. Committers remain billable for up to 90 days. Plan disablement timing around billing cycles.

4. **Missing free public repo coverage**: All GHAS features are free on public repositories. Enterprises with open-source programs should enable full coverage on public repos without concern for cost impact.

5. **No budget alerts configured**: Without alerts, cost overruns are discovered only at invoice time. Always configure budget alerts at 75% and 90% thresholds — even though they are notification-only.

6. **Automation via user accounts**: CI/CD pipelines and automation that commit using personal access tokens (PATs) tied to user accounts count those users as active committers. Migrate automation to GitHub App identities, which are excluded from billing.

7. **Not leveraging the free secret risk assessment**: Purchasing Secret Protection for the entire enterprise without first running the free assessment to identify which repos actually have secret exposure. Assessment data should inform enablement scope.

### Cost Optimization Checklist

Use this checklist during initial rollout and quarterly reviews:

- [ ] Run the free secret risk assessment before purchasing Secret Protection
- [ ] Classify repositories into tiers (critical, important, standard) per the governance framework
- [ ] Enable Secret Protection on all tiers — universal value at lower cost
- [ ] Enable Code Security only on critical and important tier repos
- [ ] Verify all automation uses GitHub App identities, not user-account PATs
- [ ] Archive inactive repositories to age out committers from the 90-day window
- [ ] Enable all GHAS features on public repositories (free)
- [ ] Configure budget alerts at 75%, 90%, and 100% thresholds
- [ ] Set up cost centers and allocate organizations to business units
- [ ] Schedule monthly committer audits using the billing API
- [ ] Establish an approval workflow for enabling GHAS on new repositories
- [ ] Track ROI metrics (vulnerabilities found, secrets prevented, autofix adoption)
- [ ] Confirm Azure MACC applicability if billing through Azure subscription
- [ ] Review and update cost projections quarterly as committer counts change
- [ ] Generate monthly executive reports with cost-per-finding metrics

## References

### GitHub Advanced Security Documentation (Secret Protection & Code Security)
- [GitHub Code Scanning Documentation](https://docs.github.com/en/enterprise-cloud@latest/code-security/code-scanning)
- [CodeQL Query Language Documentation](https://codeql.github.com/docs/)
- [GitHub Secret Scanning Documentation](https://docs.github.com/en/enterprise-cloud@latest/code-security/secret-scanning)
- [GitHub Dependabot Documentation](https://docs.github.com/en/enterprise-cloud@latest/code-security/dependabot)

### GitHub Enterprise Cloud Security
- [Enterprise Security Documentation](https://docs.github.com/en/enterprise-cloud@latest/admin/enforcing-policies/enforcing-policies-for-your-enterprise/enforcing-policies-for-security-settings-in-your-enterprise)
- [Audit Log API Reference](https://docs.github.com/en/enterprise-cloud@latest/admin/monitoring-activity-in-your-enterprise/reviewing-audit-logs-for-your-enterprise)
- [Private Vulnerability Reporting](https://docs.github.com/en/enterprise-cloud@latest/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability)

### Compliance and Certifications
- [GitHub Trust Center - Security Certifications](https://www.github.com/security)
- [SOC 2 Type II Report](https://github.com/security#compliance)
- [ISO 27001 Certification](https://github.com/security#compliance)
- [FedRAMP Authorization](https://marketplace.fedramp.gov/)

### Integration Patterns
- [GitHub Actions Security](https://docs.github.com/en/enterprise-cloud@latest/actions/security-guides)
- [SIEM Integration Best Practices](https://docs.github.com/en/enterprise-cloud@latest/admin/monitoring-activity-in-your-enterprise/reviewing-audit-logs-for-your-enterprise/streaming-the-audit-log-for-your-enterprise)
- [GitHub Apps for Security Integration](https://docs.github.com/en/developers/apps)

### Policy and Process Documentation
- [Document 03: Identity and Access Management](./03-identity-access-management.md)
- [Document 04: Enterprise-Managed Users](./04-enterprise-managed-users.md)
- [Document 05: Teams and Permissions](./05-teams-permissions.md)
- [Document 06: Policy Inheritance Architecture](./06-policy-inheritance.md)
- [Document 07: Repository Governance](./07-repository-governance.md)

### Industry Standards
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [OWASP Top 10 Web Application Security Risks](https://owasp.org/www-project-top-ten/)
- [CWE/SANS Top 25 Software Weaknesses](https://cwe.mitre.org/top25/)
- [CVE Numbering Authority Information](https://www.cve.org/)
