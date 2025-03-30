#!/bin/bash

containerId="your_container_id"
dbUser="myuser"
dbName="mydatabase"
# Local path for backup files
backupDir="./backups"
timestamp=$(date +"%Y%m%d_%H%M%S")
backupArchive="$backupDir/$timestamp-backup.tar.gz"

# Create the backup directory if it doesn't exist
if [ ! -d "$backupDir" ]; then
  mkdir -p "$backupDir"
fi

# Create a backup directory inside the container
docker exec -t $containerId sh -c 'mkdir -p /var/lib/postgresql/data/backup || echo "Directory creation failed."'

# Docker exec command to perform pg_dump
dockerExecCmdFull="docker exec -t $containerId pg_dump -U $dbUser -d $dbName -f /var/lib/postgresql/data/backup/$timestamp-full.sql"
dockerExecCmdDataOnly="docker exec -t $containerId pg_dump -U $dbUser -d $dbName --data-only -f /var/lib/postgresql/data/backup/$timestamp-data.sql"

# Run full database dump (execute inside the container)
eval "$dockerExecCmdFull"

# Run data-only dump (execute inside the container)
eval "$dockerExecCmdDataOnly"

# Copy the backup files from the container to host system
docker cp "${containerId}:/var/lib/postgresql/data/backup/$timestamp-full.sql" "$backupDir"
docker cp "${containerId}:/var/lib/postgresql/data/backup/$timestamp-data.sql" "$backupDir"

# Optionally, remove backup files from the container after copying them to the host
docker exec -t $containerId rm "/var/lib/postgresql/data/backup/$timestamp-full.sql"
docker exec -t $containerId rm "/var/lib/postgresql/data/backup/$timestamp-data.sql"

# Archive the backups
tar -czf "$backupArchive" -C "$backupDir" "$timestamp-full.sql" "$timestamp-data.sql"

# Optionally, remove the individual SQL files after packaging them into the archive
rm "$backupDir/$timestamp-full.sql"
rm "$backupDir/$timestamp-data.sql"

echo "Backup completed successfully at $timestamp"
