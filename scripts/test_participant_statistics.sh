#!/bin/bash

# Source utils
source "$(dirname "$0")/test_utils.sh"

# Run auth test to get TOKEN
source "$(dirname "$0")/test_auth.sh"
TOKEN=$(cat /tmp/api_token.txt)

echo -e "${YELLOW}Testing Participant Statistics API${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test: Get all participant statistics
echo -e "${YELLOW}1. Get all participant statistics${NC}"
make_request "GET" "/participant-statistics"

# Test: Get participant statistics by ID
echo -e "${YELLOW}2. Get participant statistics by ID (e.g., ID 1)${NC}"
make_request "GET" "/participant-statistics/1"

# Test: Get all players stats
echo -e "${YELLOW}3. Get all players stats${NC}"
make_request "GET" "/participant-statistics/players/all"

# Test: Get all teams stats
echo -e "${YELLOW}4. Get all teams stats${NC}"
make_request "GET" "/participant-statistics/teams/all"

# Test: Get player agent stats
echo -e "${YELLOW}5. Get player agent stats (Player ID 1)${NC}"
make_request "GET" "/participant-statistics/player/1/agents"

# Test: Get player map stats
echo -e "${YELLOW}6. Get player map stats (Player ID 1)${NC}"
make_request "GET" "/participant-statistics/player/1/maps"

# Test: Get team agent stats
echo -e "${YELLOW}7. Get team agent stats (Team ID 1)${NC}"
make_request "GET" "/participant-statistics/team/1/agents"

# Test: Get team map stats
echo -e "${YELLOW}8. Get team map stats (Team ID 1)${NC}"
make_request "GET" "/participant-statistics/team/1/maps"

# Test: Get team championship history
echo -e "${YELLOW}9. Get team championship history (Team ID 1)${NC}"
make_request "GET" "/participant-statistics/team/1/history"

# Test: Get top players in a championship
echo -e "${YELLOW}10. Get top players in a championship (Championship ID 1)${NC}"
make_request "GET" "/participant-statistics/top-players/1"

# Test: Get stats by player
echo -e "${YELLOW}11. Get stats by player (Player ID 1)${NC}"
make_request "GET" "/participant-statistics/player/1"

# Test: Get stats by match
echo -e "${YELLOW}12. Get stats by match (Match ID 1)${NC}"
make_request "GET" "/participant-statistics/match/1"

# Test: Get stats by team
echo -e "${YELLOW}13. Get stats by team (Team ID 1)${NC}"
make_request "GET" "/participant-statistics/team/1"

echo "================================================"
echo "Participant Statistics API Tests Completed"
echo "================================================"
