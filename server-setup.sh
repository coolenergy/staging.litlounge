#!/bin/bash

apt-get update
apt-get --yes install \
  curl \
  gnupg

sys_arch=$(dpkg --print-architecture)
sys_code=$(lsb_release --codename --short)

apt_keys=/etc/apt/keyrings
apt_srcs=/etc/apt/sources.list.d

mkdir -p $apt_keys

# DOCKER INSTALLATION
docker_version=5:20.10.22~3-0~ubuntu-$sys_code
# Add Docker repository:
docker_ubuntu_uri=https://download.docker.com/linux/ubuntu
docker_key=$apt_keys/docker.gpg
curl -fsSL $docker_ubuntu_uri/gpg | gpg --dearmor -o $docker_key
echo "deb [arch=$sys_arch signed-by=$docker_key] $docker_ubuntu_uri $sys_code stable" > $apt_srcs/docker.list
apt-get update
# Install Docker:
apt-get --yes install \
  docker-ce=$docker_version \
  docker-ce-cli=$docker_version \
  containerd.io \
  docker-compose-plugin
