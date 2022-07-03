#! /bin/bash

# Given string 
version="1.0.1-beta+1"
IFS='+'
read -ra arr <<< "$version"
printf "name = ${arr[1]}"

if (( ${arr[1]} != 0 )); then
     echo "not equal"
fi
