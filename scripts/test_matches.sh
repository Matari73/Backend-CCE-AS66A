#!/bin/bash

# Source utils
source "$(dirname "$0")/test_utils.sh"

TEST_SUITE_NAME="Matches API"

log_message "$LOG_LEVEL_INFO" "Starting $TEST_SUITE_NAME Tests"

echo "========================================="
echo "Testing Matches API Endpoints"
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

echo ""

echo -e "${YELLOW}1. Testing Get All Matches${NC}"
echo "GET /matches"
GET_MATCHES_RESPONSE=$(curl -s -X GET "$BASE_URL/matches")

echo "Response: $GET_MATCHES_RESPONSE"
echo ""

echo -e "${YELLOW}2. Testing Get All Matches with Championship Filter${NC}"
echo "GET /matches?championship_id=$CHAMPIONSHIP_ID"
if [ ! -z "$CHAMPIONSHIP_ID" ]; then
  GET_MATCHES_BY_CHAMPIONSHIP_RESPONSE=$(curl -s -X GET "$BASE_URL/matches?championship_id=$CHAMPIONSHIP_ID")
  echo "Response: $GET_MATCHES_BY_CHAMPIONSHIP_RESPONSE"
  
  # Extract match ID for further tests
  MATCH_ID=$(echo $GET_MATCHES_BY_CHAMPIONSHIP_RESPONSE | grep -o '"match_id":[0-9]*' | head -1 | grep -o '[0-9]*$')
  echo "Extracted Match ID: $MATCH_ID"
  
  # Save match ID for other scripts
  if [ ! -z "$MATCH_ID" ]; then
    echo "$MATCH_ID" > /tmp/match_id.txt
  fi
else
  echo -e "${RED}No championship ID available for this test${NC}"
fi
echo ""

echo -e "${YELLOW}3. Testing Get Match by ID${NC}"
echo "GET /matches/$MATCH_ID"
if [ ! -z "$MATCH_ID" ]; then
  GET_MATCH_RESPONSE=$(curl -s -X GET "$BASE_URL/matches/$MATCH_ID")
  echo "Response: $GET_MATCH_RESPONSE"
else
  echo -e "${RED}No match ID available for this test${NC}"
fi
echo ""

echo -e "${YELLOW}4. Testing Update Match${NC}"
echo "PUT /matches/$MATCH_ID"
if [ ! -z "$TOKEN" ] && [ ! -z "$MATCH_ID" ]; then
    UPDATE_MATCH_RESPONSE=$(curl -s --max-time 10 -X PUT "$BASE_URL/matches/$MATCH_ID" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d '{
            "status": "IN_PROGRESS",
            "team1_score": 13,
            "team2_score": 7,
            "map": "Haven",
            "start_time": "2025-07-01T15:00:00Z",
            "end_time": "2025-07-01T16:30:00Z"
        }')
    echo "Response: $UPDATE_MATCH_RESPONSE"
else
    echo -e "${RED}No token or match ID available for this test${NC}"
fi
echo ""

echo -e "${YELLOW}5. Testing Update Match with Different Score${NC}"
echo "PUT /matches/$MATCH_ID (Different Score)"
if [ ! -z "$TOKEN" ] && [ ! -z "$MATCH_ID" ]; then
  UPDATE_MATCH_SCORE_RESPONSE=$(curl -s -X PUT "$BASE_URL/matches/$MATCH_ID" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "score": {
        "teamA": 10,
        "teamB": 13
      },
      "map": "Ascent",
      "date": "2024-03-26T18:00:00.000Z",
      "status": "finalizado"
    }')
  echo "Response: $UPDATE_MATCH_SCORE_RESPONSE"
else
  echo -e "${RED}No token or match ID available for this test${NC}"
fi
echo ""

echo -e "${YELLOW}6. Testing Update Match with Invalid Data${NC}"
echo "PUT /matches/$MATCH_ID (Invalid)"
if [ ! -z "$TOKEN" ] && [ ! -z "$MATCH_ID" ]; then
  INVALID_UPDATE_MATCH_RESPONSE=$(curl -s -X PUT "$BASE_URL/matches/$MATCH_ID" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "score": {
        "teamA": -1,
        "teamB": "invalid"
      },
      "map": "",
      "date": "invalid-date"
    }')
  echo "Response: $INVALID_UPDATE_MATCH_RESPONSE"
else
  echo -e "${RED}No token or match ID available for this test${NC}"
fi
echo ""

echo -e "${YELLOW}7. Testing Get Non-existent Match${NC}"
echo "GET /matches/99999"
NON_EXISTENT_MATCH_RESPONSE=$(curl -s -X GET "$BASE_URL/matches/99999")

echo "Response: $NON_EXISTENT_MATCH_RESPONSE"
echo ""

echo -e "${YELLOW}8. Testing Update Match Status to Active${NC}"
echo "PUT /matches/$MATCH_ID (Set Active)"
if [ ! -z "$TOKEN" ] && [ ! -z "$MATCH_ID" ]; then
  ACTIVE_MATCH_RESPONSE=$(curl -s -X PUT "$BASE_URL/matches/$MATCH_ID" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "status": "ativo",
      "date": "2024-03-27T20:00:00.000Z"
    }')
  echo "Response: $ACTIVE_MATCH_RESPONSE"
else
  echo -e "${RED}No token or match ID available for this test${NC}"
fi
echo ""

echo -e "${YELLOW}9. Testing Unauthorized Access${NC}"
echo "PUT /matches/$MATCH_ID (No token)"
if [ ! -z "$MATCH_ID" ]; then
  UNAUTHORIZED_MATCH_RESPONSE=$(curl -s -X PUT "$BASE_URL/matches/$MATCH_ID" \
    -H "Content-Type: application/json" \
    -d '{
      "status": "finalizado"
    }')
  echo "Response: $UNAUTHORIZED_MATCH_RESPONSE"
else
  echo -e "${RED}No match ID available for this test${NC}"
fi
echo ""

echo -e "${YELLOW}10. Testing Get Matches with Invalid Championship ID${NC}"
echo "GET /matches?championship_id=99999"
INVALID_CHAMPIONSHIP_MATCHES_RESPONSE=$(curl -s -X GET "$BASE_URL/matches?championship_id=99999")

echo "Response: $INVALID_CHAMPIONSHIP_MATCHES_RESPONSE"
echo ""

echo "========================================="
echo "Matches API Tests Completed"
echo "========================================="
