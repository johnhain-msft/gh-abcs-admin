# 4 - GitHub Templates
In this lab you will create issue and pull request templates and make an existing repository a template.
> Duration: 5-10 minutes

> **Note:** Templates are a key governance tool for enterprise admins. By standardizing issue and PR templates across your organization, you enforce consistent reporting formats, ensure required information is captured (e.g., change checklists, impact assessments), and reduce friction during code review. Template repositories take this further by providing pre-configured `.github` directories, CI/CD workflows, and security policies that every new repository inherits automatically — ensuring organizational standards are applied at scale from day one.

References:
- [Issue & pull request templates](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests)
- [Configuring issue templates for your repository](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/configuring-issue-templates-for-your-repository)
- [Creating a pull request template for your repository](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/creating-a-pull-request-template-for-your-repository)
- [Creating a template repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-template-repository)
- [Creating a repository from a template](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template)

## What You'll Learn

- Create issue and pull request templates to standardize contribution workflows
- Configure a template repository for consistent project scaffolding
- Verify templates auto-populate when contributors open issues and PRs

## 4.1 Create issue templates

1. Navigate to the `Settings > General` page of your repository
2. In the `Features > Issues` section, click `Set up templates` button

> **Note:** If you do not see the `Set up templates` button, ensure that Issues are enabled for your repository under **Settings > General > Features**.

3. Select a template from the list
4. Review the template by clicking on `Preview and edit`
5. Edit the issue if needed to add your changes
6. Click on `Propose changes` to commit the templates to your repository.
7. Repeat steps 3) to 6) to add more issue templates

## 4.2 Create pull request templates

1. Navigate to the `main` branch of your repository
2. Click `Add file` to create a new file
3. Name the file `.github/pull_request_template.md`

> **Tip:** The file must be named exactly `pull_request_template.md` (case-insensitive) and placed in the `.github/` directory, the repository root, or a `docs/` directory. GitHub checks these locations in order and uses the first template found.

4. In the body of the file, add your template:
5. `Propose new file` and commit it directly to the `main` branch
```markdown
Fixes #

### Changes proposed with this pull request:
-  
- 
- 

### Checklist
- [ ] Check the commit's or even all commits' message styles matches our requested structure.
- [ ] Check your code additions will fail neither code linting checks nor unit test.

```

## 4.3 Create a template repository _(Optional)_

1. Navigate to the `Settings > General` page of your repository
2. Select `Template repository` checkbox
3. Navigate to your repository list and click `New repository`
4. The `repository template` list should contain your new repository template
5. _(Optional)_ Create a new repository from one of the templates
6. _(Optional)_ Navigate to your repository template and click on the `Use this template` button

## ✅ Verification Checklist

Before moving on, confirm:

- [ ] At least one issue template is configured and visible when creating a new issue
- [ ] A pull request template file exists at `.github/pull_request_template.md`
- [ ] New pull requests automatically display the template content in the description field

## 4.4 Create a Pull Request _(Optional)_

1. Navigate to the `main` branch of your repository
2. Update the [README.md](/README.md) file with checking the completed activities [x]
3. Commit the changes into a new `feature/lab04` branch
4. Open a new pull request from `Pull requests`
5. The template you created will be displayed and used when creating a new PR
