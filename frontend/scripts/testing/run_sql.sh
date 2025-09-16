#!/bin/bash

# Secure SQL runner for Supabase
# Usage: ./run_sql.sh <sql_file_path>

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if SQL file argument is provided
if [ $# -eq 0 ]; then
    echo -e "${RED}Error: Please provide the path to the SQL file${NC}"
    echo "Usage: $0 <sql_file_path>"
    echo "Example: $0 find_user.sql"
    exit 1
fi

SQL_FILE="$1"

# Check if SQL file exists
if [ ! -f "$SQL_FILE" ]; then
    echo -e "${RED}Error: SQL file '$SQL_FILE' not found${NC}"
    exit 1
fi

# Load environment variables
ENV_LOCAL='../../.env.local'
if [ -f $ENV_LOCAL ]; then
    source $ENV_LOCAL
else
    echo -e "${RED}Error: .env.local file not found${NC}"
    exit 1
fi

# Extract project reference from Supabase URL
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo -e "${RED}Error: NEXT_PUBLIC_SUPABASE_URL not found in .env.local${NC}"
    exit 1
fi

# Extract project ref from URL (e.g., aapvjcobhebpclfayjlj from https://aapvjcobhebpclfayjlj.supabase.co)
PROJECT_REF=$(echo "$NEXT_PUBLIC_SUPABASE_URL" | sed 's|https://||' | sed 's|\.supabase\.co||')

echo -e "${YELLOW}Connecting to Supabase project: ${PROJECT_REF}${NC}"
echo -e "${YELLOW}Running SQL file: ${SQL_FILE}${NC}"
echo

# Prompt for database password securely (no echo)
echo -n "Enter database password: "
read -s DB_PASSWORD
echo  # New line after password input

# Validate password is not empty
if [ -z "$DB_PASSWORD" ]; then
    echo -e "${RED}Error: Password cannot be empty${NC}"
    exit 1
fi

# Construct the database URL
DB_URL="postgresql://postgres:${DB_PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres"

echo -e "${YELLOW}Executing SQL...${NC}"
echo

# Run the SQL file
if psql "$DB_URL" -f "$SQL_FILE"; then
    echo
    echo -e "${GREEN}✅ SQL executed successfully!${NC}"
else
    echo
    echo -e "${RED}❌ SQL execution failed!${NC}"
    exit 1
fi

# Clear the password from memory (best effort)
unset DB_PASSWORD
unset DB_URL