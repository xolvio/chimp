echo "Cleaning the bucket $1"

aws s3 rm $1 --recursive

#echo "Syncing gzipped files to bucket $1"
#aws s3 sync ./build/ $1 \
#--include "*" --acl public-read --cache-control max-age=31556926,public --content-encoding gzip \
#--delete \

echo "Syncing non-gzipped files to bucket $1"
aws s3 sync ./build/ $1 --acl public-read --cache-control max-age=31556926,public
