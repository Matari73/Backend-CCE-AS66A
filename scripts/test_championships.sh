#!/bin/bash

# Source utils
source "$(dirname "$0")/test_utils.sh"

TEST_SUITE_NAME="Championships API"

log_message "$LOG_LEVEL_INFO" "Starting $TEST_SUITE_NAME Tests"
echo "========================================="
echo "Testing $TEST_SUITE_NAME Endpoints"
echo "========================================="

# Function to track test results
track_test() {
    local status=$1
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    if [ $status -eq 0 ]; then
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
}

# Function to check response
check_response() {
    local response=$1
    local expected_status=$2
    if [[ "$response" =~ "error" ]] && [ "$expected_status" != "error" ]; then
        echo -e "${RED}Test failed! Unexpected error${NC}"
        track_test 1
        return 1
    elif [[ ! "$response" =~ "error" ]] && [ "$expected_status" == "error" ]; then
        echo -e "${RED}Test failed! Error was expected${NC}"
        track_test 1
        return 1
    else
        echo -e "${GREEN}Test passed!${NC}"
        track_test 0
        return 0
    fi
}

echo "========================================="
echo "Testing Championships API Endpoints"
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

echo -e "${YELLOW}1. Testing Get All Championships${NC}"
echo "GET /championships"
GET_CHAMPIONSHIPS_RESPONSE=$(curl -s -X GET "$BASE_URL/championships")

echo "Response: $GET_CHAMPIONSHIPS_RESPONSE"
echo ""

echo -e "${YELLOW}2. Testing Create Championship${NC}"
echo "POST /championships"
if [ ! -z "$TOKEN" ]; then
    CREATE_CHAMPIONSHIP_RESPONSE=$(curl -s --max-time 10 -X POST "$BASE_URL/championships" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d '{
            "name": "Test Championship",
            "start_date": "2025-07-01",
            "end_date": "2025-07-15",
            "format": "SINGLE_ELIMINATION",
            "max_teams": 8,
            "description": "Test championship for API validation",
            "prize_pool": 1000,
            "rules": "Standard tournament rules apply"
        }')
    echo "Response: $CREATE_CHAMPIONSHIP_RESPONSE"
    
    # Extract championship ID for further tests
    CHAMPIONSHIP_ID=$(echo $CREATE_CHAMPIONSHIP_RESPONSE | grep -o '"championship_id":[0-9]*' | grep -o '[0-9]*$')
    if [ ! -z "$CHAMPIONSHIP_ID" ]; then
        echo -e "${GREEN}Created Championship ID: $CHAMPIONSHIP_ID${NC}"
        echo "$CHAMPIONSHIP_ID" > /tmp/championship_id.txt
        check_response "$CREATE_CHAMPIONSHIP_RESPONSE" "success"
    else
        echo -e "${RED}Failed to extract Championship ID${NC}"
        track_test 1
        exit 1
    fi
else
    echo -e "${RED}No token available for this test${NC}"
    track_test 1
fi
echo ""

echo -e "${YELLOW}3. Testing Get Championship by ID${NC}"
echo "GET /championships/$CHAMPIONSHIP_ID"
if [ ! -z "$CHAMPIONSHIP_ID" ]; then
  GET_CHAMPIONSHIP_RESPONSE=$(curl -s -X GET "$BASE_URL/championships/$CHAMPIONSHIP_ID")
  echo "Response: $GET_CHAMPIONSHIP_RESPONSE"
else
  echo -e "${RED}No championship ID available for this test${NC}"
fi
echo ""

echo -e "${YELLOW}4. Testing Update Championship${NC}"
echo "PUT /championships/$CHAMPIONSHIP_ID"
if [ ! -z "$TOKEN" ] && [ ! -z "$CHAMPIONSHIP_ID" ]; then
  UPDATE_CHAMPIONSHIP_RESPONSE=$(curl -s -X PUT "$BASE_URL/championships/$CHAMPIONSHIP_ID" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "name": "VCT Champions 2024 Test Updated",
      "description": "Campeonato mundial de Valorant 2024 - Teste Atualizado",
      "start_date": "2024-03-20",
      "end_date": "2024-04-20",
      "status": "Ativo",
      "prize": 1500000.00,
      "format": "double",
      "location": "Rio de Janeiro, Brasil"
    }')
  echo "Response: $UPDATE_CHAMPIONSHIP_RESPONSE"
else
  echo -e "${RED}No token or championship ID available for this test${NC}"
fi
echo ""

echo -e "${YELLOW}5. Testing Generate Bracket${NC}"
echo "POST /championships/$CHAMPIONSHIP_ID/generate-bracket"
if [ ! -z "$TOKEN" ] && [ ! -z "$CHAMPIONSHIP_ID" ]; then
  GENERATE_BRACKET_RESPONSE=$(curl -s -X POST "$BASE_URL/championships/$CHAMPIONSHIP_ID/generate-bracket" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "format": "single"
    }')
  echo "Response: $GENERATE_BRACKET_RESPONSE"
else
  echo -e "${RED}No token or championship ID available for this test${NC}"
fi
echo ""

echo -e "${YELLOW}6. Testing Get Championship Matches${NC}"
echo "GET /championships/$CHAMPIONSHIP_ID/matches"
if [ ! -z "$CHAMPIONSHIP_ID" ]; then
  GET_MATCHES_RESPONSE=$(curl -s -X GET "$BASE_URL/championships/$CHAMPIONSHIP_ID/matches")
  echo "Response: $GET_MATCHES_RESPONSE"
else
  echo -e "${RED}No championship ID available for this test${NC}"
fi
echo ""

echo -e "${YELLOW}7. Testing Bulk Update Matches${NC}"
echo "PUT /championships/$CHAMPIONSHIP_ID/matches/bulk-update"
if [ ! -z "$TOKEN" ] && [ ! -z "$CHAMPIONSHIP_ID" ]; then
  BULK_UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/championships/$CHAMPIONSHIP_ID/matches/bulk-update" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "matches": [
        {
          "match_id": 1,
          "score": {
            "teamA": 13,
            "teamB": 7
          },
          "map": "Haven",
          "status": "finalizado",
          "date": "2024-03-25T14:00:00.000Z"
        }
      ]
    }')
  echo "Response: $BULK_UPDATE_RESPONSE"
else
  echo -e "${RED}No token or championship ID available for this test${NC}"
fi
echo ""

echo -e "${YELLOW}8. Testing Generate Next Phase${NC}"
echo "POST /championships/$CHAMPIONSHIP_ID/generate-next-phase"
if [ ! -z "$TOKEN" ] && [ ! -z "$CHAMPIONSHIP_ID" ]; then
  GENERATE_NEXT_PHASE_RESPONSE=$(curl -s -X POST "$BASE_URL/championships/$CHAMPIONSHIP_ID/generate-next-phase" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "format": "single"
    }')
  echo "Response: $GENERATE_NEXT_PHASE_RESPONSE"
else
  echo -e "${RED}No token or championship ID available for this test${NC}"
fi
echo ""

echo -e "${YELLOW}9. Testing Create Championship with Invalid Data${NC}"
echo "POST /championships (Invalid)"
if [ ! -z "$TOKEN" ]; then
  INVALID_CHAMPIONSHIP_RESPONSE=$(curl -s -X POST "$BASE_URL/championships" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "name": "",
      "start_date": "invalid-date",
      "end_date": "2024-04-15"
    }')
  echo "Response: $INVALID_CHAMPIONSHIP_RESPONSE"
else
  echo -e "${RED}No token available for this test${NC}"
fi
echo ""

echo -e "${YELLOW}10. Testing Get Non-existent Championship${NC}"
echo "GET /championships/99999"
NON_EXISTENT_CHAMPIONSHIP_RESPONSE=$(curl -s -X GET "$BASE_URL/championships/99999")

echo "Response: $NON_EXISTENT_CHAMPIONSHIP_RESPONSE"
echo ""

echo -e "${YELLOW}11. Testing Delete Championship${NC}"
echo "DELETE /championships/$CHAMPIONSHIP_ID"
if [ ! -z "$TOKEN" ] && [ ! -z "$CHAMPIONSHIP_ID" ]; then
  echo -e "${RED}WARNING: This will delete the championship. Uncomment the line below to execute:${NC}"
  echo "# DELETE_CHAMPIONSHIP_RESPONSE=\$(curl -s -X DELETE \"$BASE_URL/championships/$CHAMPIONSHIP_ID\" -H \"Authorization: Bearer $TOKEN\")"
  echo "# echo \"Response: \$DELETE_CHAMPIONSHIP_RESPONSE\""
else
  echo -e "${RED}No token or championship ID available for this test${NC}"
fi
echo ""

echo "========================================="
echo "Championships API Tests Completed"
echo "========================================="
