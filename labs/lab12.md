---
render_with_liquid: false
---

# 12 - Deployments and Environments
In this lab you will configure GitHub environments with protection rules and create deployment workflows that enforce approval gates, wait timers, and branch policies — essential governance controls for enterprise deployment pipelines.

> Duration: 20-25 minutes

> **⏱️ Estimated time:** 25 minutes | **Type:** Self-Paced Extension
>
> **What you'll learn:**
> - How to create and configure deployment environments with protection rules
> - How to enforce approval gates, wait timers, and branch policies
> - How environment protection integrates with GitHub Actions workflows

References:
- [Using environments for deployment](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)
- [Managing environments for deployment](https://docs.github.com/en/actions/deployment/targeting-different-environments/managing-environments-for-deployment)
- [Reviewing deployments](https://docs.github.com/en/actions/managing-workflow-runs-and-deployments/managing-deployments/reviewing-deployments)
- [About security hardening with OpenID Connect](https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
- [Deployment branch and tag policies](https://docs.github.com/en/actions/deployment/targeting-different-environments/managing-environments-for-deployment#deployment-branches-and-tags)
- [Using the REST API to manage environments](https://docs.github.com/en/rest/deployments/environments)
- [Custom deployment protection rules](https://docs.github.com/en/actions/deployment/protecting-deployments/creating-custom-deployment-protection-rules)

## 12.1 Create deployment environments

Environments are named deployment targets configured at the repository level. Each environment can hold its own secrets, variables, and protection rules. Environment names are case-insensitive and can be up to 255 characters long.

> **Note:** For public repositories, environments are available on all GitHub plans. For private and internal repositories, environments require the **Team** or **Enterprise** plan.

1. Navigate to your repository on GitHub.
2. Click **Settings** in the repository navigation bar.
3. In the left sidebar, click **Environments**.
4. Click the **New environment** button.
5. Enter `staging` as the environment name and click **Configure environment**.
6. You will be taken to the environment configuration page. For now, leave all settings at their defaults and click back to the **Environments** list.
7. Click **New environment** again.
8. Enter `production` as the environment name and click **Configure environment**.
9. Click back to the **Environments** list. You should now see both `staging` and `production` listed.

> **Tip:** Establish consistent environment naming conventions across your organization. Common patterns include lowercase names matching deployment targets (e.g., `staging`, `production`, `qa`) or namespaced names (e.g., `aws-production`, `azure-staging`). Environments can also be created programmatically via the [REST API](https://docs.github.com/en/rest/deployments/environments), which is useful for standardizing setup across many repositories.

> **Warning:** If a workflow references an environment name that does not exist, GitHub will auto-create that environment with **no protection rules**. Always pre-create environments with the appropriate protections before referencing them in workflows.

## 12.2 Add environment protection rules

Protection rules enforce governance controls before a deployment can proceed. In this section, you will configure the `production` environment with required reviewers, a wait timer, and a deployment branch policy.

1. Navigate to **Settings** → **Environments** and click on the **production** environment.
2. Under **Deployment protection rules**, check the **Required reviewers** box.
3. In the search field, add yourself (or another workshop participant) as a required reviewer. You can add up to **6 reviewers**, and only **1** must approve for the deployment to proceed.
4. Check the **Prevent self-review** checkbox. This enforces separation of duties by blocking the person who triggered the workflow from approving their own deployment.
5. Check the **Wait timer** box and enter `1` minute. This adds a mandatory delay before the deployment begins after approval. In production scenarios, teams commonly set this to 5–30 minutes to provide a window for rollback decisions.
6. Scroll down to **Deployment branches and tags**. Change the dropdown from **All branches** to **Selected branches and tags**.
7. Click **Add deployment branch or tag rule**, enter the pattern `main`, and save. This ensures only code from the `main` branch can be deployed to production.
8. Scroll up and locate the **Admin bypass** toggle. By default, repository admins can bypass protection rules. For high-compliance environments, consider disabling this toggle so that even admins must follow the approval process.
9. Click **Save protection rules** at the top of the page.
10. Navigate back to **Settings** → **Environments** and click on the **staging** environment.
11. Leave the staging environment with **no protection rules** — this allows automated deployments to staging without manual gates, which is typical for lower environments in a CI/CD pipeline.
12. Click **Save protection rules** if prompted.

> **Governance consideration:** For organizations requiring custom deployment checks (e.g., change-management ticket validation, compliance scans, or external approval systems), GitHub supports **custom deployment protection rules** via GitHub Apps. A GitHub App subscribes to the `deployment_protection_rule` webhook event and can programmatically approve or reject deployments based on external criteria.

## 12.3 Create a deployment workflow

In this section, you will create a GitHub Actions workflow that deploys to both environments in sequence — staging first, then production. The `environment` key on each job links it to the corresponding environment and its protection rules.

1. In your repository, navigate to the **Code** tab.
2. Click **Add file** → **Create new file**.
3. In the file name field, type `.github/workflows/deploy.yml`. GitHub will automatically create the necessary directories.
4. Paste the following workflow content into the editor:

```yaml
name: Deploy to Environments

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v6
      - name: Deploy to staging
        run: |
          echo "Deploying to staging environment..."
          echo "Commit: ${{ github.sha }}"
          echo "Branch: ${{ github.ref_name }}"
          echo "Staging deployment complete!"

  deploy-production:
    runs-on: ubuntu-latest
    needs: deploy-staging
    environment: production
    steps:
      - uses: actions/checkout@v6
      - name: Deploy to production
        run: |
          echo "Deploying to production environment..."
          echo "Commit: ${{ github.sha }}"
          echo "Actor: ${{ github.actor }}"
          echo "Production deployment complete!"
```

5. Review the workflow structure before committing:
   - The `needs: deploy-staging` key on the `deploy-production` job creates a **dependency chain** — production will not start until staging completes successfully.
   - The `environment: production` key triggers **all protection rules** configured on the `production` environment (required reviewers, wait timer, branch policy).
   - The `environment: staging` key links the staging job to the `staging` environment, but since it has no protection rules, it runs immediately.
   - The `workflow_dispatch` trigger allows you to manually run this workflow from the **Actions** tab without pushing a commit.
6. Set the commit message to `Add deployment workflow` and commit directly to the `main` branch.
7. Because the workflow triggers on `push` to `main`, committing this file will immediately start a workflow run.

> **Troubleshooting:** If the deployment workflow doesn't trigger after committing, verify the workflow file is on the default branch (`main`) and the file path is exactly `.github/workflows/deploy.yml`. Also confirm the `environment` name in the YAML matches the environment name you created in section 12.1 — names are case-insensitive but must be spelled correctly. See the [Instructor Guide](../docs/INSTRUCTOR-GUIDE.md) for additional help.

> **Advanced:** In real-world deployments, replace the `echo` commands with actual deployment steps — for example, authenticating to a cloud provider via OIDC federation and deploying infrastructure or application code. To use environment secrets and variables in a build or test job without creating a deployment record, consider using a separate job that reads the secrets from the environment and passes them as outputs, or reference the environment only in jobs that perform actual deployments.

## 12.4 Test the approval flow

Now that the workflow has been triggered, you will observe the deployment pipeline in action, including the manual approval gate on the production environment.

1. Navigate to the **Actions** tab in your repository.
2. Click on the most recent **Deploy to Environments** workflow run.
3. Observe the workflow visualization:
   - The **deploy-staging** job should be running or already completed (green checkmark). Since the `staging` environment has no protection rules, it deploys automatically.
   - The **deploy-production** job should display a **"Waiting for review"** status badge. This is the required reviewer gate in action.

> **Troubleshooting:** If the **deploy-production** job runs immediately without waiting for review, verify the `production` environment has **Required reviewers** enabled in Settings → Environments → production. If the environment was auto-created by the workflow (rather than pre-configured in section 12.1), it will have no protection rules. See the [Instructor Guide](../docs/INSTRUCTOR-GUIDE.md) for additional help.

4. Click the **Review deployments** button that appears next to the production job.
5. In the review dialog:
   - Check the **production** environment checkbox.
   - Optionally add a review comment (e.g., "Staging verified, approving production deploy").
   - Click **Approve and deploy**.
6. If you enabled **Prevent self-review** and you are also the person who triggered the workflow, you will see a message indicating that you cannot approve your own deployment. In that case, ask another workshop participant (or a second account) to approve.
7. After approval, observe the **1-minute wait timer** countdown before the production job begins executing.
8. Once the wait timer expires, the production job will run. Click into the job to expand the **Deploy to production** step and verify the output includes the commit SHA, actor name, and completion message.
9. Navigate to the repository's main page and click the **Deployments** section (visible in the right sidebar or under the **Environments** tab in **Settings**). You should see deployment history for both `staging` and `production`.

> **Note:** If a deployment review is not acted upon within **30 days**, the workflow job will automatically fail. Plan your review processes accordingly and consider setting up notifications for pending approvals.

## 12.5 Verify your work

Use this checklist to confirm you have completed all exercises in this lab:

1. Navigate to **Settings** → **Environments** and verify:
   - [ ] The `staging` environment exists (with no protection rules).
   - [ ] The `production` environment exists with:
     - [ ] At least one required reviewer configured.
     - [ ] **Prevent self-review** enabled.
     - [ ] A wait timer of 1 minute set.
     - [ ] Deployment branch policy restricted to `main`.
2. Navigate to **Code** → `.github/workflows/deploy.yml` and verify the workflow file exists with the correct content.
3. Navigate to **Actions** and verify:
   - [ ] At least one **Deploy to Environments** workflow run has completed.
   - [ ] The staging job completed automatically (no approval required).
   - [ ] The production job required manual review before executing.
4. Navigate to the **Deployments** section and verify:
   - [ ] Both `staging` and `production` show successful deployment records.

5. Consider the following questions as they relate to your organization's deployment governance:

- **OIDC federation:** How would you replace the `echo` commands in this workflow with real cloud deployments using [OIDC-based authentication](https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/about-security-hardening-with-openid-connect)? OIDC eliminates the need to store long-lived cloud credentials as secrets.
- **Custom protection rules:** What custom deployment protection rule would benefit your organization? Examples include requiring an approved change-management ticket, validating that a security scan passed, or checking a feature-flag service before rollout.
- **Admin bypass:** In what scenarios would you disable admin bypass on a production environment? Consider compliance frameworks (SOC 2, FedRAMP) that require consistent enforcement of approval processes.
- **Branch policies:** How would you extend deployment branch policies to support release branches (e.g., `release/*`) alongside `main`?

> **Note:** For real-world cloud deployments, always use **OIDC federation** to authenticate to your cloud provider (AWS, Azure, GCP) instead of storing long-lived credentials as secrets. OIDC provides short-lived, automatically rotated tokens scoped to specific environments and repositories, significantly reducing the blast radius of a credential compromise. See [About security hardening with OpenID Connect](https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/about-security-hardening-with-openid-connect) for setup guides specific to each cloud provider.
