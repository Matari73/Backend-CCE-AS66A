#!/bin/bash

# Source utils
source "$(dirname "$0")/test_utils.sh"

TEST_SUITE_NAME="Participants API"

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

# Load team ID if available
if [ -f "/tmp/team_id.txt" ]; then
  TEAM_ID=$(cat /tmp/team_id.txt)
  echo -e "${GREEN}Using team ID from /tmp/team_id.txt: $TEAM_ID${NC}"
else
  echo -e "${YELLOW}No team ID file found. Some tests may not work properly.${NC}"
fi

echo ""

echo -e "${YELLOW}1. Testing Get All Participants${NC}"
echo "GET /participants"
if [ ! -z "$TOKEN" ]; then
  GET_PARTICIPANTS_RESPONSE=$(curl -s -X GET "$BASE_URL/participants" \
    -H "Authorization: Bearer $TOKEN")
  echo "Response: $GET_PARTICIPANTS_RESPONSE"
else
  echo -e "${RED}No token available for this test${NC}"
fi
echo ""

echo -e "${YELLOW}2. Testing Create Participant${NC}"
echo "POST /participants"
if [ ! -z "$TOKEN" ] && [ ! -z "$TEAM_ID" ]; then
    CREATE_PARTICIPANT_RESPONSE=$(curl -s --max-time 10 -X POST "$BASE_URL/participants" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d '{
            "team_id": '"$TEAM_ID"',
            "name": "John Doe",
            "nickname": "JDoe",
            "role": "PLAYER",
            "main_agent": "Jett",
            "rank": "IMMORTAL"
        }')
    echo "Response: $CREATE_PARTICIPANT_RESPONSE"
    
    # Extract participant ID for further tests
    PARTICIPANT_ID=$(echo $CREATE_PARTICIPANT_RESPONSE | grep -o '"participant_id":[0-9]*' | grep -o '[0-9]*$')
    if [ ! -z "$PARTICIPANT_ID" ]; then
        echo -e "${GREEN}Created Participant ID: $PARTICIPANT_ID${NC}"
        echo "$PARTICIPANT_ID" > /tmp/participant_id.txt
        check_response "$CREATE_PARTICIPANT_RESPONSE" "success"
    else
        echo -e "${RED}Failed to extract Participant ID${NC}"
        track_test 1
    fi
else
    echo -e "${RED}No token or team ID available for this test${NC}"
    track_test 1
fi
echo ""

echo -e "${YELLOW}3. Testing Create Coach Participant${NC}"
echo "POST /participants (Coach)"
if [ ! -z "$TOKEN" ]; then
  CREATE_COACH_RESPONSE=$(curl -s -X POST "$BASE_URL/participants" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "name": "Maria Santos",
      "nickname": "coach_maria",
      "birth_date": "1985-03-20",
      "phone": 11888888888,
      "team_id": '$TEAM_ID',
      "is_coach": true,
      "user_id": 1
    }')
  echo "Response: $CREATE_COACH_RESPONSE"
else
  echo -e "${RED}No token available for this test${NC}"
fi
echo ""

echo -e "${YELLOW}4. Testing Get Participant by ID${NC}"
echo "GET /participants/$PARTICIPANT_ID"
if [ ! -z "$PARTICIPANT_ID" ]; then
  GET_PARTICIPANT_RESPONSE=$(curl -s -X GET "$BASE_URL/participants/$PARTICIPANT_ID")
  echo "Response: $GET_PARTICIPANT_RESPONSE"
else
  echo -e "${RED}No participant ID available for this test${NC}"
fi
echo ""

echo -e "${YELLOW}5. Testing Update Participant${NC}"
echo "PUT /participants/$PARTICIPANT_ID"
if [ ! -z "$TOKEN" ] && [ ! -z "$PARTICIPANT_ID" ]; then
  UPDATE_PARTICIPANT_RESPONSE=$(curl -s -X PUT "$BASE_URL/participants/$PARTICIPANT_ID" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "name": "João Silva Updated",
      "nickname": "joaoplayer_pro",
      "birth_date": "1995-05-15",
      "phone": 11999999999,
      "team_id": '$TEAM_ID',
      "is_coach": false,
      "user_id": 1
    }')
  echo "Response: $UPDATE_PARTICIPANT_RESPONSE"
else
  echo -e "${RED}No token or participant ID available for this test${NC}"
fi
echo ""

echo -e "${YELLOW}6. Testing Create Participant with Invalid Data${NC}"
echo "POST /participants (Invalid)"
if [ ! -z "$TOKEN" ]; then
  INVALID_PARTICIPANT_RESPONSE=$(curl -s -X POST "$BASE_URL/participants" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "name": "",
      "nickname": "x",
      "birth_date": "invalid-date",
      "phone": "invalid-phone",
      "is_coach": "not-boolean"
    }')
  echo "Response: $INVALID_PARTICIPANT_RESPONSE"
else
  echo -e "${RED}No token available for this test${NC}"
fi
echo ""

echo -e "${YELLOW}7. Testing Get Non-existent Participant${NC}"
echo "GET /participants/99999"
NON_EXISTENT_PARTICIPANT_RESPONSE=$(curl -s -X GET "$BASE_URL/participants/99999")

echo "Response: $NON_EXISTENT_PARTICIPANT_RESPONSE"
echo ""

echo -e "${YELLOW}8. Testing Create Multiple Participants for Team${NC}"
echo "POST /participants (Multiple players)"
if [ ! -z "$TOKEN" ]; then
  # Player 2
  CREATE_PLAYER2_RESPONSE=$(curl -s -X POST "$BASE_URL/participants" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "name": "Pedro Lima",
      "nickname": "pedrolima",
      "birth_date": "1997-08-10",
      "phone": 11777777777,
      "team_id": '$TEAM_ID',
      "is_coach": false,
      "user_id": 1
    }')
  echo "Player 2 Response: $CREATE_PLAYER2_RESPONSE"
  
  # Player 3
  CREATE_PLAYER3_RESPONSE=$(curl -s -X POST "$BASE_URL/participants" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "name": "Carlos Medeiros",
      "nickname": "carlos_pro",
      "birth_date": "1996-12-05",
      "phone": 11666666666,
      "team_id": '$TEAM_ID',
      "is_coach": false,
      "user_id": 1
    }')
  echo "Player 3 Response: $CREATE_PLAYER3_RESPONSE"
else
  echo -e "${RED}No token available for this test${NC}"
fi
echo ""

echo -e "${YELLOW}9. Testing Unauthorized Access${NC}"
echo "POST /participants (No token)"
UNAUTHORIZED_PARTICIPANT_RESPONSE=$(curl -s -X POST "$BASE_URL/participants" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Unauthorized Player",
    "nickname": "unauthorized",
    "birth_date": "1995-01-01",
    "phone": 11555555555,
    "is_coach": false,
    "user_id": 1
  }')

echo "Response: $UNAUTHORIZED_PARTICIPANT_RESPONSE"
echo ""

echo -e "${YELLOW}10. Testing Delete Participant${NC}"
echo "DELETE /participants/$PARTICIPANT_ID"
if [ ! -z "$TOKEN" ] && [ ! -z "$PARTICIPANT_ID" ]; then
  echo -e "${RED}WARNING: This will delete the participant. Uncomment the line below to execute:${NC}"
  echo "# DELETE_PARTICIPANT_RESPONSE=\$(curl -s -X DELETE \"$BASE_URL/participants/$PARTICIPANT_ID\" -H \"Authorization: Bearer $TOKEN\")"
  echo "# echo \"Response: \$DELETE_PARTICIPANT_RESPONSE\""
else
  echo -e "${RED}No token or participant ID available for this test${NC}"
fi
echo ""

echo "========================================="
echo "Participants API Tests Completed"
echo "========================================="
