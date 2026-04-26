---
render_with_liquid: false
---

# 2 - Managing GitHub Actions settings for a repository
In this lab you will restrict the usage of Actions in your own repository
> Duration: 5-10 minutes

> **⏱️ Estimated time:** 15 minutes | **Type:** Self-Paced Extension
>
> **What you'll learn:**
> - How to restrict which GitHub Actions are allowed to run in a repository
> - How to configure default workflow permissions (GITHUB_TOKEN scope)
> - How to allowlist specific third-party actions

References:
- [Managing GitHub Actions settings for a repository](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository#allowing-specific-actions-to-run)

## 2.1 Update Actions and Workflow permissions

1. Navigate to the `Settings > Actions > General` page of your own repository
2. In the section `Actions permissions` click on the last option to only allow specified actions and reusable workflows
3. Check the setting `Allow actions created by GitHub`
4. Click `Save`

> **Note:** Changing the default `GITHUB_TOKEN` permission to read-only is a security best practice. Workflows that need write access should explicitly declare `permissions:` in the workflow YAML file rather than relying on a broad default.

5. In the section `Workflow permissions` select the option `Read repository contents permission` to change the default permissions granted to the GITHUB_TOKEN when running workflows.
6. Click `Save`
7. Go to `Actions` tab of your repository
8. Create your first `Simple workflow` by clicking `Configure` on the suggested workflow
9. Name you file `ci.yml` and commit the changes to your main branch
10. The workflow will be triggered automatically, wait to finish the execution
11. Open the workflow file [ci.yml](/.github/workflows/ci.yml)
12. Edit the file and copy the following YAML content at the end of the file:
```YAML
name: CI
on: workflow_dispatch
jobs:
  hello_world_job:
    runs-on: ubuntu-latest
    name: A first job to say hello
    steps:
      - id: hello-world
        uses: githubabcs/hello-world-composite-action@v1.0.1
        with:
          who-to-greet: 'Hello from GH ABCs'
      - run: echo random-number ${{ steps.hello-world.outputs.random-number }}
        shell: bash
```
13. Commit the changes into the `main` branch
14. Go to `Actions` and see the details of your running workflow
15. The workflow has the error:

> **Tip:** This error is expected and demonstrates the security control in action. The action was blocked because it was not in the allowlist. In an enterprise setting, this prevents developers from using unapproved third-party actions that may introduce supply-chain risks.

```
[githubabcs/hello-world-composite-action@main] is not allowed to be used in [organization]. 
Actions in this workflow must be: within a repository that belongs to your Enterprise account or created by GitHub.
```
16. Navigate to the `Settings > Actions > General` page of your own repository
17. Allow the action by adding it to the `Allow specified actions and reusable workflows` field:
```
githubabcs/hello-world-composite-action@v1.0.1
```

> **Note:** When allowlisting actions, always pin to a specific version (e.g., `@v1.0.1`) rather than a branch or tag that could change. This prevents supply-chain attacks where a compromised action is updated in place.

## ✅ Verification Checklist

Before moving on, confirm:

- [ ] Actions permissions are set to allow only specified actions and GitHub-created actions
- [ ] The default `GITHUB_TOKEN` permission is set to read-only
- [ ] The `ci.yml` workflow ran successfully after allowlisting the composite action
- [ ] You understand how the allowlist controls which third-party actions can execute
