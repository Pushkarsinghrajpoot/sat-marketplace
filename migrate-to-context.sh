#!/bin/bash

# Script to migrate from Zustand to Context API for auth
# This replaces all instances of useAuthStore with useAuth

echo "Migrating from Zustand to Context API..."

# Find all .tsx and .ts files and replace useAuthStore imports
find ./app -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' \
  -e "s/import { useAuthStore } from '@\/lib\/store';/import { useAuth } from '@\/lib\/auth-context';/g" \
  -e "s/const { user, login } = useAuthStore();/const { user, login } = useAuth();/g" \
  -e "s/const { user } = useAuthStore();/const { user } = useAuth();/g" \
  -e "s/const { user, logout } = useAuthStore();/const { user, logout } = useAuth();/g" \
  -e "s/const { user, organization, logout } = useAuthStore();/const { user, organization, logout } = useAuth();/g" \
  -e "s/const { organization } = useAuthStore();/const { organization } = useAuth();/g" \
  -e "s/const { login } = useAuthStore();/const { login } = useAuth();/g" \
  {} \;

echo "Migration complete!"
echo "Please verify the changes and test the application."
