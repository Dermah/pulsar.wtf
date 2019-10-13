#!/bin/sh

$(aws --profile dermah ecr get-login --no-include-email --region ap-southeast-2)
docker build -t pulsar-vj .
docker tag pulsar-vj:latest 026117886666.dkr.ecr.ap-southeast-2.amazonaws.com/pulsar-vj:latest
docker push 026117886666.dkr.ecr.ap-southeast-2.amazonaws.com/pulsar-vj:latest