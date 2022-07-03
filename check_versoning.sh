#! /bin/bash

# Given string 
version="1.0.1-beta+1"
IFS='+'
read -ra arr <<< "$version"
printf "name = ${arr[1]}"
S_VERSION=${arr[1]}