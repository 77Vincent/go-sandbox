sudo dnf update -y
sudo dnf install -y git docker nginx

# start docker
sudo systemctl start docker
sudo systemctl enable docker

# add ec2-user to docker group
sudo usermod -aG docker ec2-user

# clone the repo
git clone git@github.com:77Vincent/go-sandbox.git

# install docker compose
mkdir -p ~/.docker/cli-plugins
curl -SL https://github.com/docker/compose/releases/download/v2.24.2/docker-compose-linux-aarch64 -o ~/.docker/cli-plugins/docker-compose
chmod +x ~/.docker/cli-plugins/docker-compose
docker compose version

# start the app
cd go-sandbox || exit
docker compose up -d --build

# install certbot
sudo dnf install -y certbot python3-certbot-nginx

# get the certificate
sudo certbot --nginx

# renew the certificate
sudo certbot renew --dry-run
