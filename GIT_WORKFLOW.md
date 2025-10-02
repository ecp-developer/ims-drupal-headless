# Git Workflow Guide - IMS Drupal Headless

## 📦 Repository Information

- **Repository**: https://github.com/ecp-developer/ims-drupal-headless
- **Organization**: ecp-developer
- **Default Branch**: development

## 🌿 Branch Structure

### Three-Stage Deployment Strategy

```
┌─────────────┐
│ development │ ← Active development (default)
└──────┬──────┘
       │ merge after code review
       ↓
┌─────────────┐
│   testing   │ ← QA/Testing environment
└──────┬──────┘
       │ merge after UAT approval
       ↓
┌─────────────┐
│ production  │ ← Live production environment
└─────────────┘
```

## 🔄 Daily Workflow

### 1. Start Working (Development Branch)

```bash
# Make sure you're on development branch
wsl bash -c "cd /home/syedsana/ims-drupal-headless && git checkout development"

# Pull latest changes
wsl bash -c "cd /home/syedsana/ims-drupal-headless && git pull origin development"
```

### 2. Create Feature Branch (Optional but Recommended)

```bash
# Create and switch to feature branch
wsl bash -c "cd /home/syedsana/ims-drupal-headless && git checkout -b feature/vendor-export"
```

### 3. Make Changes and Commit

```bash
# Check status
wsl bash -c "cd /home/syedsana/ims-drupal-headless && git status"

# Stage specific files
wsl bash -c "cd /home/syedsana/ims-drupal-headless && git add frontend/src/components/VendorExport.tsx"

# Or stage all changes
wsl bash -c "cd /home/syedsana/ims-drupal-headless && git add ."

# Commit with descriptive message
wsl bash -c "cd /home/syedsana/ims-drupal-headless && git commit -m 'feat: Add vendor export functionality'"
```

### 4. Push Changes

```bash
# Push to development
wsl bash -c "cd /home/syedsana/ims-drupal-headless && git push origin development"

# Or push feature branch
wsl bash -c "cd /home/syedsana/ims-drupal-headless && git push origin feature/vendor-export"
```

## 🚀 Deployment Workflow

### Move to Testing Environment

```bash
# Switch to testing branch
wsl bash -c "cd /home/syedsana/ims-drupal-headless && git checkout testing"

# Merge development into testing
wsl bash -c "cd /home/syedsana/ims-drupal-headless && git merge development"

# Push to remote
wsl bash -c "cd /home/syedsana/ims-drupal-headless && git push origin testing"

# Switch back to development
wsl bash -c "cd /home/syedsana/ims-drupal-headless && git checkout development"
```

### Move to Production Environment

```bash
# Switch to production branch
wsl bash -c "cd /home/syedsana/ims-drupal-headless && git checkout production"

# Merge testing into production
wsl bash -c "cd /home/syedsana/ims-drupal-headless && git merge testing"

# Push to remote
wsl bash -c "cd /home/syedsana/ims-drupal-headless && git push origin production"

# Switch back to development
wsl bash -c "cd /home/syedsana/ims-drupal-headless && git checkout development"
```

## 📝 Commit Message Convention

Use semantic commit messages:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

**Examples:**
```bash
git commit -m "feat: Add vendor export to Excel functionality"
git commit -m "fix: Resolve vendor update network error"
git commit -m "docs: Update README with deployment instructions"
git commit -m "style: Format DashboardVendors component"
```

## 🔍 Useful Git Commands

### Check Current Branch
```bash
wsl bash -c "cd /home/syedsana/ims-drupal-headless && git branch"
```

### View Commit History
```bash
wsl bash -c "cd /home/syedsana/ims-drupal-headless && git log --oneline -10"
```

### View Changes Before Commit
```bash
wsl bash -c "cd /home/syedsana/ims-drupal-headless && git diff"
```

### View Staged Changes
```bash
wsl bash -c "cd /home/syedsana/ims-drupal-headless && git diff --staged"
```

### Undo Last Commit (Keep Changes)
```bash
wsl bash -c "cd /home/syedsana/ims-drupal-headless && git reset --soft HEAD~1"
```

### Discard Local Changes
```bash
wsl bash -c "cd /home/syedsana/ims-drupal-headless && git restore ."
```

### Update from Remote
```bash
wsl bash -c "cd /home/syedsana/ims-drupal-headless && git fetch origin"
```

## 🛡️ Best Practices

1. **Always Pull Before Push**
   ```bash
   git pull origin development
   ```

2. **Commit Often, Push Daily**
   - Make small, logical commits
   - Push at end of work day

3. **Write Clear Commit Messages**
   - Be descriptive
   - Explain the "why" if needed

4. **Never Force Push to Shared Branches**
   - Avoid `git push --force` on development/testing/production

5. **Test Before Merging to Testing**
   - Ensure all features work locally
   - Run tests if available

6. **Document Major Changes**
   - Update README.md
   - Add comments to complex code

## 🔐 Branch Protection (Recommended)

On GitHub, set up branch protection rules:

1. Go to Settings → Branches
2. Protect `production` branch:
   - Require pull request reviews
   - Require status checks to pass
3. Protect `testing` branch (optional)

## 📊 Current Repository Status

- ✅ **Development Branch**: Default, active development
- ✅ **Testing Branch**: QA/UAT environment
- ✅ **Production Branch**: Live production code
- ✅ **Remote**: https://github.com/ecp-developer/ims-drupal-headless.git
- ✅ **Initial Commit**: All files committed with Vendor Management Module

## 🆘 Common Issues

### Authentication Failed
Use Personal Access Token instead of password when pushing.

### Merge Conflicts
```bash
# Pull latest changes
git pull origin development

# Fix conflicts in files
# Then stage and commit
git add .
git commit -m "fix: Resolve merge conflicts"
git push origin development
```

### Accidentally Committed to Wrong Branch
```bash
# Create patch of last commit
git format-patch -1 HEAD

# Reset last commit
git reset --hard HEAD~1

# Switch to correct branch
git checkout correct-branch

# Apply patch
git am 0001-*.patch
```

---

**For Support**: Contact ECP IT Department - dev@ecp.gov.pk
