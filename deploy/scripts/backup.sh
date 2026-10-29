#!/bin/bash
# ==============================================================================
# NEX CMMS - Automated PostgreSQL Daily Backup Script
# Scheduled via cron: 0 2 * * * /var/www/nash-cmms/deploy/scripts/backup.sh >> /var/log/nex-backup.log 2>&1
# ==============================================================================
set -e

BACKUP_DIR="/var/backups/nex-cmms"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/nex_cmms_$TIMESTAMP.sql.gz"
RETENTION_DAYS=7

mkdir -p "$BACKUP_DIR"

echo "📦 [$(date)] Starting NEX CMMS automated PostgreSQL backup..."

# Execute pg_dump and compress on the fly
PGPASSWORD="NashCmmsSecure2026!" pg_dump -h localhost -U nash_admin -d nash_cmms | gzip > "$BACKUP_FILE"

# Secure permissions
chmod 600 "$BACKUP_FILE"

FILESIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "✅ [$(date)] Backup completed successfully: $BACKUP_FILE (Size: $FILESIZE)"

# Clean up dumps older than RETENTION_DAYS
find "$BACKUP_DIR" -type f -name "nex_cmms_*.sql.gz" -mtime +$RETENTION_DAYS -delete
echo "🧹 [$(date)] Rotation completed. Storing last $RETENTION_DAYS days of snapshots."
