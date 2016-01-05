# ...remove default ChromeDriver for safety
sudo rm -rf /usr/local/bin/chromedriver* || true

# ...update to the latest chrome if the version is v38x (TODO need a better grep)

sudo rm -rf /tmp/update-chrome || true

/opt/google/chrome/chrome --version | grep '38' &> /dev/null

if [ $? == 0 ]; then echo UPDATE_CHROME > /tmp/update-chrome; fi

# ...check if we already have a tarred version and untar that
if [ -e /tmp/update-chrome ] && [ -e ~/_opt/google-chrome.tar ]; then sudo tar -xvf ~/_opt/google-chrome.tar -C /; fi
# ...otherwise download chrome and tar it

if [ -e /tmp/update-chrome ] && [ ! -e ~/_opt/google-chrome.tar ]; then wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo apt-key add -; fi

if [ -e /tmp/update-chrome ] && [ ! -e ~/_opt/google-chrome.tar ]; then sudo sh -c 'echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'; fi

if [ -e /tmp/update-chrome ] && [ ! -e ~/_opt/google-chrome.tar ]; then sudo apt-get update; fi

if [ -e /tmp/update-chrome ] && [ ! -e ~/_opt/google-chrome.tar ]; then sudo apt-get install google-chrome-stable; fi

if [ -e /tmp/update-chrome ] && [ ! -e ~/_opt/google-chrome.tar ]; then mkdir ~/_opt; tar -cvf ~/_opt/google-chrome.tar /opt/google/chrome/; fi