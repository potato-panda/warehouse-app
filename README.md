# warehouse-app

## Backup
```bash
# 1. Enter shell of the database container:
docker exec -it <container-id> bash
cd /var/lib/postgresql/data
# 2. Take full dump and a data-only dump:
pg_dump -U myuser -d mydatabase -f ./backup/(date +%Y%m%d_%H%M%S)-full.sql
pg_dump -U myuser -d mydatabase --data-only -f ./backup/(date +%Y%m%d_%H%M%S)-data.sql
```

## Restore
```bash
# 1. Copy backup into database container:
docker cp ./backup/<filename>.sql <container-id>:/var/lib/postresql/data/backup
# 2. Enter shell of the database container:
docker exec -it <container-id> bash
cd /var/lib/postgresql/data
# 3. Restore from backup
psql -U myuser -h localhost -f ./backup/<filename>.sql
```