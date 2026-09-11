echo "==========================================================================================="

echo "removing existing '/var/www/trade' & '~/trading/trade/public' folder"

rm -rf /var/www/trade
ls
echo "==========================================================================================="
rm -rf public
echo "==========================================================================================="
ls

mkdir /var/www/trade
echo "This is a single line of text.." > /var/www/trade/index.html