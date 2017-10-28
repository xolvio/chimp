#!/bin/bash

wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo dpkg -i google-chrome-stable_current_amd64.deb # this gives information to apt-get about missing dependencies
sudo apt-get update && sudo apt-get -f -y install
sudo dpkg -i google-chrome-stable_current_amd64.deb
