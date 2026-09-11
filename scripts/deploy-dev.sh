echo "==========================================================================================="

echo "removing existing '/var/www/trade' & '~/trading/trade/public' folder"

rm -rf /var/www/trade
rm -rf public

# Load Node.js environment (uncomment/modify if using nvm)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

npm run build

echo "Copying build html output directory to '/var/www/trade'"

cp -r public /var/www/trade