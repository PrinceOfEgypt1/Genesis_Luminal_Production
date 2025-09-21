# Branch Protection Configuration

## Main Branch Protection Rules

Configure the following settings for the `main` branch in GitHub:

### Required Status Checks
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging

**Required Checks:**
- `quality-gates`
- `backend-tests`
- `frontend-tests`
- `build-validation`
- `security-scan`

### Pull Request Requirements
- ✅ Require pull request reviews before merging
- ✅ Require review from code owners
- ✅ Dismiss stale PR approvals when new commits are pushed
- ✅ Require review of the most recent reviewable push

### Additional Restrictions
- ✅ Restrict pushes that create files larger than 100MB
- ✅ Require signed commits
- ✅ Require linear history
- ✅ Allow force pushes: **NO**
- ✅ Allow deletions: **NO**

### Admin Enforcement
- ✅ Do not allow bypassing the above settings
- ✅ Include administrators in restrictions

## How to Apply

1. Go to repository Settings → Branches
2. Add rule for `main` branch
3. Configure all settings above
4. Save changes

This ensures enterprise-grade code quality and security.
