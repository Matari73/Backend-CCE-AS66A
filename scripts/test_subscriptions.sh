#!/bin/bash

# Source utils
source "$(dirname "$0")/test_utils.sh"

TEST_SUITE_NAME="Subscription API"

log_message "$LOG_LEVEL_INFO" "Starting $TEST_SUITE_NAME Tests"

echo "========================================="
echo "Testing Subscription API Endpoints"
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

# Load championship ID if available
if [ -f "/tmp/championship_id.txt" ]; then
  CHAMPIONSHIP_ID=$(cat /tmp/championship_id.txt)
  echo -e "${GREEN}Using championship ID from /tmp/championship_id.txt: $CHAMPIONSHIP_ID${NC}"
else
  echo -e "${YELLOW}No championship ID file found. Some tests may not work properly.${NC}"
fi

# Load team ID if available
if [ -f "/tmp/team_id.txt" ]; then
  TEAM_ID=$(cat /tmp/team_id.txt)
  echo -e "${GREEN}Using team ID from /tmp/team_id.txt: $TEAM_ID${NC}"
else
  echo -e "${YELLOW}No team ID file found. Some tests may not work properly.${NC}"
fi


echo ""

echo -e "${YELLOW}1. Testing Get All Subscriptions${NC}"
echo "GET /subscriptions"
GET_SUBSCRIPTIONS_RESPONSE=$(curl -s -X GET "$BASE_URL/subscriptions")

echo "Response: $GET_SUBSCRIPTIONS_RESPONSE"
echo ""

echo -e "${YELLOW}2. Testing Create Subscription${NC}"
echo "POST /subscriptions"
if [ ! -z "$TOKEN" ] && [ ! -z "$CHAMPIONSHIP_ID" ] && [ ! -z "$TEAM_ID" ]; then
    CREATE_SUBSCRIPTION_RESPONSE=$(curl -s --max-time 10 -X POST "$BASE_URL/subscriptions" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d '{
            "championship_id": '"$CHAMPIONSHIP_ID"',
            "team_id": '"$TEAM_ID"',
            "payment_status": "PENDING",
            "subscription_date": "2025-06-26T00:00:00Z",
            "payment_amount": 100.00
        }')
    echo "Response: $CREATE_SUBSCRIPTION_RESPONSE"
    
    # Extract subscription ID for further tests
    SUBSCRIPTION_ID=$(echo $CREATE_SUBSCRIPTION_RESPONSE | grep -o '"subscription_id":[0-9]*' | grep -o '[0-9]*$')
    if [ ! -z "$SUBSCRIPTION_ID" ]; then
        echo -e "${GREEN}Created Subscription ID: $SUBSCRIPTION_ID${NC}"
        echo "$SUBSCRIPTION_ID" > /tmp/subscription_id.txt
        check_response "$CREATE_SUBSCRIPTION_RESPONSE" "success"
    else
        echo -e "${RED}Failed to extract Subscription ID${NC}"
        track_test 1
    fi
else
    echo -e "${RED}No token, championship ID, or team ID available for this test${NC}"
    track_test 1
fi
echo ""

echo -e "${YELLOW}3. Testing Get Subscription by ID${NC}"
echo "GET /subscriptions/$SUBSCRIPTION_ID"
if [ ! -z "$SUBSCRIPTION_ID" ]; then
  GET_SUBSCRIPTION_RESPONSE=$(curl -s -X GET "$BASE_URL/subscriptions/$SUBSCRIPTION_ID")
  echo "Response: $GET_SUBSCRIPTION_RESPONSE"
else
  echo -e "${RED}No subscription ID available for this test${NC}"
fi
echo ""

echo -e "${YELLOW}4. Testing Update Subscription${NC}"
echo "PUT /subscriptions/$SUBSCRIPTION_ID"
if [ ! -z "$TOKEN" ] && [ ! -z "$SUBSCRIPTION_ID" ]; then
  UPDATE_SUBSCRIPTION_RESPONSE=$(curl -s -X PUT "$BASE_URL/subscriptions/$SUBSCRIPTION_ID" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "championship_id": $CHAMPIONSHIP_ID,
      "team_id": $TEAM_ID,
      "subscription_date": "2025-01-15T10:00:00.000Z"
    }')
  echo "Response: $UPDATE_SUBSCRIPTION_RESPONSE"
else
  echo -e "${RED}No token or subscription ID available for this test${NC}"
fi
echo ""

echo -e "${YELLOW}5. Testing Create Subscription with Invalid Data${NC}"
echo "POST /subscriptions (Invalid)"
if [ ! -z "$TOKEN" ]; then
  INVALID_SUBSCRIPTION_RESPONSE=$(curl -s -X POST "$BASE_URL/subscriptions" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "championship_id": -1,
      "team_id": "invalid"
    }')
  echo "Response: $INVALID_SUBSCRIPTION_RESPONSE"
else
  echo -e "${RED}No token available for this test${NC}"
fi
echo ""

echo -e "${YELLOW}6. Testing Get Non-existent Subscription${NC}"
echo "GET /subscriptions/99999"
NON_EXISTENT_SUBSCRIPTION_RESPONSE=$(curl -s -X GET "$BASE_URL/subscriptions/99999")

echo "Response: $NON_EXISTENT_SUBSCRIPTION_RESPONSE"
echo ""

echo -e "${YELLOW}7. Testing Unauthorized Access${NC}"
echo "POST /subscriptions (No token)"
UNAUTHORIZED_SUBSCRIPTION_RESPONSE=$(curl -s -X POST "$BASE_URL/subscriptions" \
  -H "Content-Type: application/json" \
  -d '{
    "championship_id": "$CHAMPIONSHIP_ID",
    "team_id": "$TEAM_ID",
    "subscription_date": "2025-01-01T10:00:00.000Z"
  }')

echo "Response: $UNAUTHORIZED_SUBSCRIPTION_RESPONSE"
echo ""

echo -e "${YELLOW}8. Testing Delete Subscription${NC}"
echo "DELETE /subscriptions/$SUBSCRIPTION_ID"
if [ ! -z "$TOKEN" ] && [ ! -z "$SUBSCRIPTION_ID" ]; then
  echo -e "${RED}WARNING: This will delete the subscription. Uncomment the line below to execute:${NC}"
  echo "# DELETE_SUBSCRIPTION_RESPONSE=\$(curl -s -X DELETE \"$BASE_URL/subscriptions/$SUBSCRIPTION_ID\" -H \"Authorization: Bearer $TOKEN\")"
  echo "# echo \"Response: \$DELETE_SUBSCRIPTION_RESPONSE\""
else
  echo -e "${RED}No token or subscription ID available for this test${NC}"
fi
echo ""

echo "========================================="
echo "Subscription API Tests Completed"
echo "========================================="
