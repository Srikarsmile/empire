#!/bin/bash
# Empire Cars — one-command deploy to VPS
# Usage: ./deploy.sh
# Make executable: chmod +x deploy.sh

set -e

VPS="root@82.180.154.75"
SSH_KEY="$HOME/.ssh/empire_vps"
APP_DIR="/root/empire-app"

echo "🚀 Deploying Empire Cars to $VPS ..."

echo "📦 Syncing files..."
rsync -az --delete \
  -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no" \
  --exclude=node_modules \
  --exclude=.next \
  --exclude=.git \
  --exclude=.env.local \
  --exclude=.env \
  --exclude="*.pem" \
  --exclude=public/uploads \
  ./ $VPS:$APP_DIR/

echo "🔧 Installing dependencies..."
ssh -i $SSH_KEY -o StrictHostKeyChecking=no $VPS \
  "cd $APP_DIR && npm install --legacy-peer-deps --silent"

echo "🗄️  Syncing database schema..."
ssh -i $SSH_KEY -o StrictHostKeyChecking=no $VPS \
  "cd $APP_DIR && npx prisma db push --accept-data-loss 2>&1 | tail -3"

echo "🏗️  Building..."
ssh -i $SSH_KEY -o StrictHostKeyChecking=no $VPS \
  "cd $APP_DIR && npm run build 2>&1 | tail -10"

echo "♻️  Restarting PM2..."
ssh -i $SSH_KEY -o StrictHostKeyChecking=no $VPS \
  "pm2 restart empire && pm2 save"

echo "⏰ Setting up cron jobs..."
ssh -i $SSH_KEY -o StrictHostKeyChecking=no $VPS bash << 'REMOTE_CRON'
  (crontab -l 2>/dev/null | grep -v 'empirerentcar.com/api/admin/cron') | crontab - 2>/dev/null || true
  (crontab -l 2>/dev/null; echo "0 2 * * * curl -s -X POST https://empirerentcar.com/api/admin/cron/auto-complete -H \"Authorization: Bearer \$CRON_SECRET\" >> /root/cron.log 2>&1") | crontab -
  (crontab -l 2>/dev/null; echo "0 9 * * * curl -s -X POST https://empirerentcar.com/api/admin/cron/reminders -H \"Authorization: Bearer \$CRON_SECRET\" >> /root/cron.log 2>&1") | crontab -
  echo "  Cron jobs registered (requires CRON_SECRET in VPS environment)."
REMOTE_CRON

echo ""
echo "✅ Deploy complete! https://empirerentcar.com"
