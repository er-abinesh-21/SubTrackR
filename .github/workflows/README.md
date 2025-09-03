# GitHub Workflows for Supabase

This directory contains GitHub Actions workflows to keep your Supabase project active and monitor its health.

## Workflows

### 1. `supabase-keep-alive.yml`
**Purpose:** Prevents Supabase from pausing due to inactivity on the free tier.

- **Schedule:** Runs every 6 hours (00:00, 06:00, 12:00, 18:00 UTC)
- **Actions:**
  - Pings database endpoint
  - Keeps Edge Functions warm
  - Tests Auth endpoint
- **Manual Trigger:** Available via GitHub Actions tab

### 2. `supabase-monitor.yml`
**Purpose:** Comprehensive health monitoring of Supabase services.

- **Schedule:** Runs every 12 hours
- **Triggers:**
  - Scheduled (twice daily)
  - On push to main branch (when Supabase files change)
  - Manual trigger
- **Checks:**
  - Database connection
  - Auth service
  - Storage service
  - Realtime service

## Setup Instructions

### 1. Add GitHub Secrets

Go to your repository's Settings → Secrets and variables → Actions, and add:

```
SUPABASE_URL        # Your Supabase project URL (e.g., https://xxxxx.supabase.co)
SUPABASE_ANON_KEY   # Your Supabase anonymous/public key
```

You can find these values in:
- Supabase Dashboard → Settings → API
- Or in your `.env` file

### 2. Enable GitHub Actions

1. Go to your repository's Actions tab
2. Enable workflows if prompted
3. The workflows will run automatically based on their schedules

### 3. Manual Execution

To run workflows manually:
1. Go to Actions tab
2. Select the workflow
3. Click "Run workflow"
4. Select branch and click "Run workflow" button

## Monitoring

- Check the Actions tab for workflow run history
- Green checkmark ✅ = successful run
- Red X ❌ = failed run (check logs for details)

## Cost Considerations

- GitHub Actions provides 2,000 free minutes/month for private repos
- These workflows use minimal minutes (~1-2 minutes per run)
- With current schedules: ~240 minutes/month (well within free tier)

## Customization

### Adjust Frequency
Modify the cron schedule in the workflow files:
```yaml
schedule:
  - cron: '0 */6 * * *'  # Current: every 6 hours
  # Examples:
  # - cron: '0 */4 * * *'  # Every 4 hours
  # - cron: '0 */12 * * *' # Every 12 hours
  # - cron: '0 0 * * *'    # Once daily at midnight
```

### Add Notifications
You can extend the workflows to send notifications on failure:
- Email notifications
- Slack webhooks
- Discord webhooks
- SMS via Twilio

## Troubleshooting

### Workflow not running?
- Check if Actions are enabled in repository settings
- Verify secrets are correctly set
- Check workflow syntax in Actions tab

### Authentication errors?
- Verify SUPABASE_URL format (should include https://)
- Check SUPABASE_ANON_KEY is correct
- Ensure keys haven't been regenerated in Supabase

### Rate limiting?
- Supabase free tier has rate limits
- Consider reducing workflow frequency if hitting limits

## Notes

- These workflows are especially useful for free-tier Supabase projects
- Paid Supabase plans don't pause due to inactivity
- The keep-alive workflow ensures your database stays warm for better performance
