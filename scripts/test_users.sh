#!/bin/bash

# Source utils
source "$(dirname "$0")/test_utils.sh"

TEST_SUITE_NAME="Users API"

log_message "$LOG_LEVEL_INFO" "Starting $TEST_SUITE_NAME Tests"
echo "========================================="
echo "Testing Users API Endpoints"
echo "========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Load token from file or prompt for manual input
if [ -f "/tmp/api_token.txt" ]; then
  TOKEN=$(cat /tmp/api_token.txt)
  echo -e "${GREEN}Using token from /tmp/api_token.txt${NC}"
else
  echo -e "${RED}No token file found. Please run test_auth.sh first or enter token manually:${NC}"
  read -p "Enter JWT token: " TOKEN
fi

if [ -z "$TOKEN" ]; then
  echo -e "${RED}No token provided. Cannot test authenticated endpoints.${NC}"
  exit 1
fi

echo ""

echo -e "${YELLOW}1. Testing Get All Users${NC}"
echo "GET /users"
GET_USERS_RESPONSE=$(curl -s -X GET "$BASE_URL/users" \
  -H "Authorization: Bearer $TOKEN")

echo "Response: $GET_USERS_RESPONSE"
echo ""

# Extract user ID from the response for further tests
USER_ID=$(echo $GET_USERS_RESPONSE | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*$')
echo "Extracted User ID for tests: $USER_ID"
echo ""

echo -e "${YELLOW}2. Testing Get User by ID${NC}"
echo "GET /users/$USER_ID"
if [ ! -z "$USER_ID" ]; then
  GET_USER_RESPONSE=$(curl -s -X GET "$BASE_URL/users/$USER_ID" \
    -H "Authorization: Bearer $TOKEN")
  echo "Response: $GET_USER_RESPONSE"
else
  echo -e "${RED}No user ID available for this test${NC}"
fi
echo ""

echo -e "${YELLOW}3. Testing Update User${NC}"
echo "PUT /users/$USER_ID"
if [ ! -z "$USER_ID" ]; then
  UPDATE_USER_RESPONSE=$(curl -s -X PUT "$BASE_URL/users/$USER_ID" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "name": "João Silva Updated",
      "email": "joao.updated@teste.com"
    }')
  echo "Response: $UPDATE_USER_RESPONSE"
else
  echo -e "${RED}No user ID available for this test${NC}"
fi
echo ""

echo -e "${YELLOW}4. Testing Update User with Invalid Data${NC}"
echo "PUT /users/$USER_ID (Invalid)"
if [ ! -z "$USER_ID" ]; then
  INVALID_UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/users/$USER_ID" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "name": "",
      "email": "invalid-email"
    }')
  echo "Response: $INVALID_UPDATE_RESPONSE"
else
  echo -e "${RED}No user ID available for this test${NC}"
fi
echo ""

echo -e "${YELLOW}5. Testing Get Non-existent User${NC}"
echo "GET /users/99999"
NON_EXISTENT_USER_RESPONSE=$(curl -s -X GET "$BASE_URL/users/99999" \
  -H "Authorization: Bearer $TOKEN")

echo "Response: $NON_EXISTENT_USER_RESPONSE"
echo ""

echo -e "${YELLOW}6. Testing Unauthorized Access${NC}"
echo "GET /users (No token)"
UNAUTHORIZED_RESPONSE=$(curl -s -X GET "$BASE_URL/users")

echo "Response: $UNAUTHORIZED_RESPONSE"
echo ""

echo -e "${YELLOW}7. Testing Delete User${NC}"
echo "DELETE /users/$USER_ID"
if [ ! -z "$USER_ID" ]; then
  echo -e "${RED}WARNING: This will delete the user. Uncomment the line below to execute:${NC}"
  echo "# DELETE_USER_RESPONSE=\$(curl -s -X DELETE \"$BASE_URL/users/$USER_ID\" -H \"Authorization: Bearer $TOKEN\")"
  echo "# echo \"Response: \$DELETE_USER_RESPONSE\""
else
  echo -e "${RED}No user ID available for this test${NC}"
fi
echo ""

echo "========================================="
echo "Users API Tests Completed"
echo "========================================="
