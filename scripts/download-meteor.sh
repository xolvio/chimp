# Restore meteor symlink when Meteor was restored from the cache
if [ -d ~/.meteor ]; then sudo ln -s ~/.meteor/meteor /usr/local/bin/meteor; fi
# Download Meteor if isn't already installed via the cache
if [ ! -e $HOME/.meteor/meteor ]; then curl https://install.meteor.com | sh; fi