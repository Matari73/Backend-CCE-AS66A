#!/bin/bash

# Source utils
source "$(dirname "$0")/test_utils.sh"

TEST_SUITE_NAME="Teams API"

log_message "$LOG_LEVEL_INFO" "Starting $TEST_SUITE_NAME Tests"
echo "========================================="
echo "Testing $TEST_SUITE_NAME Endpoints"
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

echo ""

echo -e "${YELLOW}1. Testing Get All Teams${NC}"
echo "GET /teams"
GET_TEAMS_RESPONSE=$(curl -s -X GET "$BASE_URL/teams")

echo "Response: $GET_TEAMS_RESPONSE"
echo ""

echo -e "${YELLOW}2. Testing Create Team${NC}"
echo "POST /teams"
if [ ! -z "$TOKEN" ]; then
    CREATE_TEAM_RESPONSE=$(curl -s --max-time 10 -X POST "$BASE_URL/teams" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d '{
            "name": "Test Team",
            "tag": "TST",
            "logo_url": "https://example.com/logo.png",
            "region": "NA",
            "owner_id": 1,
            "description": "A team created for testing purposes"
        }')
    echo "Response: $CREATE_TEAM_RESPONSE"
    
    # Extract team ID for further tests
    TEAM_ID=$(echo $CREATE_TEAM_RESPONSE | grep -o '"team_id":[0-9]*' | grep -o '[0-9]*$')
    if [ ! -z "$TEAM_ID" ]; then
        echo -e "${GREEN}Created Team ID: $TEAM_ID${NC}"
        echo "$TEAM_ID" > /tmp/team_id.txt
        check_response "$CREATE_TEAM_RESPONSE" "success"
    else
        echo -e "${RED}Failed to extract Team ID${NC}"
        track_test 1
    fi
else
    echo -e "${RED}No token available for this test${NC}"
    track_test 1
fi
echo ""

echo -e "${YELLOW}3. Testing Get Team by ID${NC}"
echo "GET /teams/$TEAM_ID"
if [ ! -z "$TEAM_ID" ]; then
  GET_TEAM_RESPONSE=$(curl -s -X GET "$BASE_URL/teams/$TEAM_ID")
  echo "Response: $GET_TEAM_RESPONSE"
else
  echo -e "${RED}No team ID available for this test${NC}"
fi
echo ""

echo -e "${YELLOW}4. Testing Update Team${NC}"
echo "PUT /teams/$TEAM_ID"
if [ ! -z "$TOKEN" ] && [ ! -z "$TEAM_ID" ]; then
  UPDATE_TEAM_RESPONSE=$(curl -s -X PUT "$BASE_URL/teams/$TEAM_ID" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "name": "Team Alpha Test Updated"
    }')
  echo "Response: $UPDATE_TEAM_RESPONSE"
else
  echo -e "${RED}No token or team ID available for this test${NC}"
fi
echo ""

echo -e "${YELLOW}5. Testing Validate Team${NC}"
echo "GET /teams/$TEAM_ID/validate"
if [ ! -z "$TEAM_ID" ]; then
  VALIDATE_TEAM_RESPONSE=$(curl -s -X GET "$BASE_URL/teams/$TEAM_ID/validate")
  echo "Response: $VALIDATE_TEAM_RESPONSE"
else
  echo -e "${RED}No team ID available for this test${NC}"
fi
echo ""

echo -e "${YELLOW}6. Testing Create Team with Invalid Data${NC}"
echo "POST /teams (Invalid)"
if [ ! -z "$TOKEN" ]; then
  INVALID_TEAM_RESPONSE=$(curl -s -X POST "$BASE_URL/teams" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "name": ""
    }')
  echo "Response: $INVALID_TEAM_RESPONSE"
else
  echo -e "${RED}No token available for this test${NC}"
fi
echo ""

echo -e "${YELLOW}7. Testing Get Non-existent Team${NC}"
echo "GET /teams/99999"
NON_EXISTENT_TEAM_RESPONSE=$(curl -s -X GET "$BASE_URL/teams/99999")

echo "Response: $NON_EXISTENT_TEAM_RESPONSE"
echo ""

echo -e "${YELLOW}8. Testing Update Team with Invalid Data${NC}"
echo "PUT /teams/$TEAM_ID (Invalid)"
if [ ! -z "$TOKEN" ] && [ ! -z "$TEAM_ID" ]; then
  INVALID_UPDATE_TEAM_RESPONSE=$(curl -s -X PUT "$BASE_URL/teams/$TEAM_ID" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "name": ""
    }')
  echo "Response: $INVALID_UPDATE_TEAM_RESPONSE"
else
  echo -e "${RED}No token or team ID available for this test${NC}"
fi
echo ""

echo -e "${YELLOW}9. Testing Unauthorized Access${NC}"
echo "POST /teams (No token)"
UNAUTHORIZED_TEAM_RESPONSE=$(curl -s -X POST "$BASE_URL/teams" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Unauthorized Team"
  }')

echo "Response: $UNAUTHORIZED_TEAM_RESPONSE"
echo ""

echo -e "${YELLOW}10. Testing Delete Team${NC}"
echo "DELETE /teams/$TEAM_ID"
if [ ! -z "$TOKEN" ] && [ ! -z "$TEAM_ID" ]; then
  echo -e "${RED}WARNING: This will delete the team. Uncomment the line below to execute:${NC}"
  echo "# DELETE_TEAM_RESPONSE=\$(curl -s -X DELETE \"$BASE_URL/teams/$TEAM_ID\" -H \"Authorization: Bearer $TOKEN\")"
  echo "# echo \"Response: \$DELETE_TEAM_RESPONSE\""
else
  echo -e "${RED}No token or team ID available for this test${NC}"
fi
echo ""

echo "========================================="
echo "Teams API Tests Completed"
echo "========================================="
