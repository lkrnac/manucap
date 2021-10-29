#!/bin/bash
$TOKEN=$CODECOV_TOKEN

# One-time step
curl https://keybase.io/codecovsecurity/pgp_keys.asc | gpg --no-default-keyring --keyring trustedkeys.gpg --import

# download uploader and checksum
curl -Os https://uploader.codecov.io/latest/linux/codecov
curl -Os https://uploader.codecov.io/latest/linux/codecov.SHA256SUM
curl -Os https://uploader.codecov.io/latest/linux/codecov.SHA256SUM.sig

# check uploader integrity
gpgv codecov.SHA256SUM.sig codecov.SHA256SUM
shasum -a 256 -c codecov.SHA256SUM

# make uploader executable
chmod +x codecov

# run uploader
echo "Running codecov!";
./codecov -t $TOKEN -v -s ./coverage/
echo "Done!";
