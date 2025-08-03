ssh root@159.223.186.97

NODE_OPTIONS="--max-old-space-size=4096" npm run build

cp -r dist/* /var/www/react-app/

sudo systemctl restart nginx

pm2 restart server

To check disk space
df -h

list all including empty directories
ls -l /

check backups
ls -lh /backups

open crone
crontab -e

Access DB
Shuhari: PGPASSWORD=Sup3rS3cret psql -U shuhari_admin -h 127.0.0.1 -d shuhari_sales

