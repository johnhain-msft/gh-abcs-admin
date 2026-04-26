---
render_with_liquid: false
---

# 5 - GitHub API - REST API & GraphQL API
In this lab you will create a workflow that calls GitHub APIs using REST API and GraphQL API.
> Duration: 15-20 minutes

References:
- [GitHub GraphQL API - GitHub Docs](https://docs.github.com/en/graphql)
- [GitHub REST API - GitHub Docs](https://docs.github.com/en/rest)
- [Migrating from REST to GraphQL - GitHub Docs](https://docs.github.com/en/graphql/guides/migrating-from-rest-to-graphql)
- [actions/github-script](https://github.com/actions/github-script)
- [octokit/graphql-action](https://github.com/octokit/graphql-action)
- [See octokit/rest.js for the API client documentation](https://octokit.github.io/rest.js/v22)

## What You'll Learn

- Build GitHub Actions workflows that call REST APIs using `actions/github-script`
- Query repository data with GraphQL for efficient, nested API requests
- Compare REST and GraphQL approaches for admin automation

## 5.1 Develop a GitHub Action workflow that calls REST APIs

1. Open the workflow file [use-github-apis.yml](/.github/workflows/use-github-apis.yml)
2. Edit the file and copy the following YAML content at the end of the `rest-api-create-and-close-issue` job:

> **Note:** The `actions/github-script` action provides the authenticated `github` client (Octokit) and `context` object automatically. You do not need to create a personal access token — the action uses the workflow's `GITHUB_TOKEN`.

```YAML
      - uses: actions/github-script@v8
        id: close-issue
        with:
          script: |
            try {
              const result = await github.rest.issues.update({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: ${{fromJSON(steps.create-issue.outputs.result).number}},
                state: 'closed'
              })
              console.log(result)
            } catch (error) {
              core.setFailed(`Failed to close issue: ${error.message}`)
            }
```
3. Commit the changes into the `main` branch
4. Go to `Actions` and see the details of your running workflow

## 5.2 Develop a GitHub Action workflow that calls GraphQL APIs

1. Open the workflow file [use-github-apis.yml](/.github/workflows/use-github-apis.yml)
2. Edit the file and copy the following YAML content at the end of the file:

> **Tip:** GraphQL queries are more efficient than REST for retrieving nested data. A single GraphQL query can fetch labels and their associated issues in one API call, whereas REST would require multiple paginated requests.

```YAML
  graphql-api-query-labels:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/github-script@v8
        id: labels-result
        with:
          script: |
            try {
              const query = `query($owner:String!, $name:String!) {
                repository(owner:$owner, name:$name){
                  labels (last:100) {
                    nodes {
                      name,
                      color,
                      issues(last:100) {
                        nodes {
                          number
                        }
                      }
                    }
                  }
                }
              }`;
              const variables = {
                owner: context.repo.owner,
                name: context.repo.repo
              }
              const result = await github.graphql(query, variables)
              console.log(result.repository.labels.nodes)
            } catch (error) {
              core.setFailed(`GraphQL query failed: ${error.message}`)
            }
```
3. Commit the changes into the `main` branch
4. Go to `Actions` and see the details of your running workflow

> **Note:** If the workflow fails with a permissions error, check that the `GITHUB_TOKEN` has write access to issues. This workflow explicitly declares `permissions: issues: write` to ensure the necessary access, regardless of your repository's default token settings.

## ✅ Verification Checklist

Before moving on, confirm:

- [ ] The REST API job successfully created and closed an issue in your repository
- [ ] The GraphQL API job queried repository labels and printed the results
- [ ] Both workflow jobs completed with a green checkmark in the Actions tab
