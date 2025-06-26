#!/bin/bash

# Source utils
source "$(dirname "$0")/test_utils.sh"

TEST_SUITE_NAME="Participant Statistics API"

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

echo -e "${YELLOW}1. Testing Get All Participant Statistics${NC}"
echo "GET /participant-statistics"
GET_STATS_RESPONSE=$(curl -s -X GET "$BASE_URL/participant-statistics")

echo "Response: $GET_STATS_RESPONSE"
echo ""

echo -e "${YELLOW}2. Testing Create Participant Statistic${NC}"
echo "POST /participant-statistics"
if [ ! -z "$TOKEN" ]; then
    CREATE_STAT_RESPONSE=$(curl -s --max-time 10 -X POST "$BASE_URL/participant-statistics" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d '{
            "participant_id": 1,
            "match_id": 1,
            "kills": 25,
            "deaths": 15,
            "assists": 8,
            "combat_score": 285,
            "econ_rating": 75,
            "first_bloods": 3,
            "plants": 2,
            "defuses": 1,
            "agent_name": "Jett"
        }')
    echo "Response: $CREATE_STAT_RESPONSE"
    
    # Extract statistic ID for further tests
    STATISTIC_ID=$(echo $CREATE_STAT_RESPONSE | grep -o '"statistic_id":[0-9]*' | grep -o '[0-9]*$')
    if [ ! -z "$STATISTIC_ID" ]; then
        echo -e "${GREEN}Created Statistic ID: $STATISTIC_ID${NC}"
        echo "$STATISTIC_ID" > /tmp/statistic_id.txt
        check_response "$CREATE_STAT_RESPONSE" "success"
    else
        echo -e "${RED}Failed to extract Statistic ID${NC}"
        track_test 1
    fi
else
    echo -e "${RED}No token available for this test${NC}"
    track_test 1
fi
echo ""

echo -e "${YELLOW}3. Testing Get Statistic by ID${NC}"
echo "GET /participant-statistics/$STATISTIC_ID"
if [ ! -z "$STATISTIC_ID" ]; then
  GET_STAT_RESPONSE=$(curl -s -X GET "$BASE_URL/participant-statistics/$STATISTIC_ID")
  echo "Response: $GET_STAT_RESPONSE"
else
  echo -e "${RED}No statistic ID available for this test${NC}"
fi
echo ""

echo -e "${YELLOW}4. Testing Update Participant Statistic${NC}"
echo "PUT /participant-statistics/$STATISTIC_ID"
if [ ! -z "$TOKEN" ]  [ ! -z "$STATISTIC_ID" ]; then
  UPDATE_STAT_RESPONSE=$(curl -s -X PUT "$BASE_URL/participant-statistics/$STATISTIC_ID" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "kills": 12,
      "assists": 6,
      "deaths": 3
    }')
  echo "Response: $UPDATE_STAT_RESPONSE"
else
  echo -e "${RED}No token or statistic ID available for this test${NC}"
fi
echo ""

echo -e "${YELLOW}5. Testing Create Statistic with Invalid Data${NC}"
echo "POST /participant-statistics (Invalid)"
if [ ! -z "$TOKEN" ]; then
  INVALID_STAT_RESPONSE=$(curl -s -X POST "$BASE_URL/participant-statistics" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "participant_id": "invalid",
      "match_id": -1,
      "agent_id": "wrong",
      "kills": -5
    }')
  echo "Response: $INVALID_STAT_RESPONSE"
else
  echo -e "${RED}No token available for this test${NC}"
fi
echo ""

echo -e "${YELLOW}6. Testing Get Non-existent Statistic${NC}"
echo "GET /participant-statistics/99999"
NON_EXISTENT_STAT_RESPONSE=$(curl -s -X GET "$BASE_URL/participant-statistics/99999")

echo "Response: $NON_EXISTENT_STAT_RESPONSE"
echo ""

echo -e "${YELLOW}7. Testing Unauthorized Access${NC}"
echo "POST /participant-statistics (No token)"
UNAUTHORIZED_STAT_RESPONSE=$(curl -s -X POST "$BASE_URL/participant-statistics" \
  -H "Content-Type: application/json" \
  -d '{
    "participant_id": 1,
    "match_id": 1,
    "agent_id": 1,
    "kills": 10
  }')

echo "Response: $UNAUTHORIZED_STAT_RESPONSE"
echo ""

echo -e "${YELLOW}8. Testing Delete Participant Statistic${NC}"
echo "DELETE /participant-statistics/$STATISTIC_ID"
if [ ! -z "$TOKEN" ]  [ ! -z "$STATISTIC_ID" ]; then
  echo -e "${RED}WARNING: This will delete the statistic. Uncomment the line below to execute:${NC}"
  echo "# DELETE_STAT_RESPONSE=\$(curl -s -X DELETE \"$BASE_URL/participant-statistics/$STATISTIC_ID\" -H \"Authorization: Bearer $TOKEN\")"
  echo "# echo \"Response: \$DELETE_STAT_RESPONSE\""
else
  echo -e "${RED}No token or statistic ID available for this test${NC}"
fi
echo ""

echo "========================================="
echo "Participant Statistics API Tests Completed"
echo "========================================="
