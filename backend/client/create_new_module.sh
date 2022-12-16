#!/bin/bash  
  
# Read the module name
echo "Enter the module name:  "  
read module_name

# creating module,services,controller
echo "Creating Module, Services and Controller for module $module_name"  
nest g module ${module_name} --no-spec
nest g controller ${module_name} --no-spec
nest g service ${module_name} --no-spec