#!/bin/bash

# Test script for participant statistics endpoints
# Usage: ./test_endpoints.sh

echo "🚀 Testing Participant Statistics Endpoints"
echo "==========================================="

BASE_URL="http://localhost:3001"
PLAYER_ID="30"
TEAM_ID="5"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_endpoint() {
    local endpoint=$1
    local description=$2
    
    echo -e "\n${YELLOW}Testing: $description${NC}"
    echo "Endpoint: $endpoint"
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$endpoint")
    
    if [ "$response" -eq 200 ]; then
        echo -e "${GREEN}✅ SUCCESS (HTTP $response)${NC}"
        # Show first few characters of actual response
        echo "Sample response:"
        curl -s "$endpoint" | head -c 200
        echo "..."
    else
        echo -e "${RED}❌ FAILED (HTTP $response)${NC}"
        echo "Full response:"
        curl -s "$endpoint"
    fi
}

echo -e "\n${YELLOW}🔍 Testing endpoints that were causing issues in frontend:${NC}"

# Test the endpoints that were failing
test_endpoint "$BASE_URL/statistics/participants/player/$PLAYER_ID" "Player Statistics (Frontend route)"
test_endpoint "$BASE_URL/participant-stats/player/$PLAYER_ID/agents" "Player Agent Statistics"
test_endpoint "$BASE_URL/participant-stats/player/$PLAYER_ID/maps" "Player Map Statistics"

echo -e "\n${YELLOW}🧪 Testing other participant statistics endpoints:${NC}"

# Test other endpoints
test_endpoint "$BASE_URL/participant-stats/player/$PLAYER_ID" "Basic Player Statistics"
test_endpoint "$BASE_URL/participant-stats/team/$TEAM_ID/agents" "Team Agent Statistics"
test_endpoint "$BASE_URL/participant-stats/team/$TEAM_ID/maps" "Team Map Statistics"
test_endpoint "$BASE_URL/participant-stats/team/$TEAM_ID" "Team Statistics"
test_endpoint "$BASE_URL/participant-stats/all-players" "All Players Statistics"
test_endpoint "$BASE_URL/participant-stats/all-teams" "All Teams Statistics"

echo -e "\n${YELLOW}🏆 Summary:${NC}"
echo "All major endpoints tested. Check the results above."
echo "If you see ✅ for the first three endpoints, the frontend issues should be resolved!"

echo -e "\n${YELLOW}📋 Frontend Integration Notes:${NC}"
echo "1. The frontend was using: /statistics/participants/player/30"
echo "2. Backend route is now available at: /statistics/participants/player/30 (alias added)"
echo "3. Original route still works: /participant-stats/player/30"
echo "4. SQL issues in agent and map stats have been fixed"
echo "5. All endpoints should return proper JSON responses"
