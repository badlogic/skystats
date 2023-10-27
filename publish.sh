#!/bin/bash
set -e
npm run build
rsync -avz --exclude node_modules --exclude .git ./ badlogic@marioslab.io:/home/badlogic/skystats.social/app
cmd="SKYSTATS_BLUESKY_ACCOUNT=$SKYSTATS_BLUESKY_ACCOUNT SKYSTATS_BLUESKY_PASSWORD=$SKYSTATS_BLUESKY_PASSWORD SKYSTATS_MEDIAMASK_KEY=$SKYSTATS_MEDIAMASK_KEY ./reload.sh && docker-compose logs -f"
echo $cmd
ssh -t marioslab.io "cd skystats.social && $cmd"
