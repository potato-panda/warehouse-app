$containerId = "your_container_id"
$dbUser = "myuser"
$dbName = "mydatabase"
# Local path for backup files
$backupDir = "./backups"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupArchive = "$backupDir\$timestamp-backup.tar.gz"

# Create the backup directory if it doesn't exist
if ($backupDir -notin (Get-ChildItem -Path . -Directory).FullName) {
  New-Item -ItemType Directory -Path $backupDir
}
docker exec -t $containerId sh -c 'mkdir -p /var/lib/postgresql/data/backup || echo "Directory creation failed."'

# Docker exec command to perform pg_dump
$dockerExecCmdFull = "docker exec -t $containerId pg_dump -U $dbUser -d $dbName -f /var/lib/postgresql/data/backup/$timestamp-full.sql"
$dockerExecCmdDataOnly = "docker exec -t $containerId pg_dump -U $dbUser -d $dbName --data-only -f /var/lib/postgresql/data/backup/$timestamp-data.sql"

# Run full database dump (execute inside the container)
Invoke-Expression $dockerExecCmdFull

# Run data-only dump (execute inside the container)
Invoke-Expression $dockerExecCmdDataOnly

# Copy the backup files from the container to host system
docker cp "${containerId}:/var/lib/postgresql/data/backup/$timestamp-full.sql" "$backupDir"
docker cp "${containerId}:/var/lib/postgresql/data/backup/$timestamp-data.sql" "$backupDir"

# Optionally, remove backup files from the container after copying them to the host
docker exec -t $containerId rm "/var/lib/postgresql/data/backup/$timestamp-full.sql"
docker exec -t $containerId rm "/var/lib/postgresql/data/backup/$timestamp-data.sql"

# Archive the backups
$tarCommand = "tar -czf $backupArchive -C $backupDir $timestamp-full.sql $timestamp-data.sql"
Invoke-Expression $tarCommand

# Optionally, remove the individual SQL files after packaging them into the archive
Remove-Item "$backupDir\$timestamp-full.sql"
Remove-Item "$backupDir\$timestamp-data.sql"

Write-Output "Backup completed successfully at $timestamp"
