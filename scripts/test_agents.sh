#!/bin/bash

source "$(dirname "$0")/test_utils.sh"

echo -e "${YELLOW}Testing Agents API${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Get auth token if not provided
TOKEN=$(cat /tmp/api_token.txt 2>/dev/null)
if [ -z "$TOKEN" ]; then
    echo "Please run test_auth.sh first to get an auth token"
    exit 1
fi

# Test creating an agent
echo -e "\n1. Create Agent"
agent_payload='{
    "name": "Jett",
    "role": "Duelist",
    "abilities": ["Tailwind", "Cloudburst", "Updraft", "Blade Storm"]
}'
create_response=$(make_request "POST" "/agents" "$agent_payload" "$TOKEN")
echo "Response: $create_response"

# Get the created agent ID
AGENT_ID=$(echo $create_response | grep -o '"id":[^,}]*' | grep -o '[0-9]*')
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

# Initialize test tracking
TESTS_TOTAL=0
TESTS_PASSED=0
TESTS_FAILED=0

echo -e "${YELLOW}1. Testing Get All Agents${NC}"
echo "GET /agents"
GET_AGENTS_RESPONSE=$(curl -s --max-time 10 -X GET "$BASE_URL/agents")
echo "Response: $GET_AGENTS_RESPONSE"
check_status "$GET_AGENTS_RESPONSE"
echo ""

echo -e "${YELLOW}2. Testing Create Agent${NC}"
echo "POST /agents"
CREATE_AGENT_RESPONSE=$(curl -s --max-time 10 -X POST "$BASE_URL/agents" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
        "name": "Jett"
    }')
echo "Response: $CREATE_AGENT_RESPONSE"

# Extract agent ID for further tests
AGENT_ID=$(echo $CREATE_AGENT_RESPONSE | grep -o '"agent_id":[0-9]*' | grep -o '[0-9]*$')
if [ ! -z "$AGENT_ID" ]; then
    echo -e "${GREEN}Created Agent ID: $AGENT_ID${NC}"
else
    echo -e "${RED}Failed to extract Agent ID${NC}"
    exit 1
fi
check_status "$CREATE_AGENT_RESPONSE"
echo ""

echo -e "${YELLOW}3. Testing Get Agent by ID${NC}"
echo "GET /agents/$AGENT_ID"
GET_AGENT_RESPONSE=$(curl -s --max-time 10 -X GET "$BASE_URL/agents/$AGENT_ID")
echo "Response: $GET_AGENT_RESPONSE"
check_status "$GET_AGENT_RESPONSE"
echo ""

echo -e "${YELLOW}4. Testing Update Agent${NC}"
echo "PUT /agents/$AGENT_ID"
UPDATE_AGENT_RESPONSE=$(curl -s -X PUT "$BASE_URL/agents/$AGENT_ID" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
        "name": "Updated Jett"
    }')
echo "Response: $UPDATE_AGENT_RESPONSE"
check_status "$UPDATE_AGENT_RESPONSE"
echo ""

echo -e "${YELLOW}5. Testing Create Agent with Invalid Data${NC}"
echo "POST /agents (Invalid)"
INVALID_AGENT_RESPONSE=$(curl -s -X POST "$BASE_URL/agents" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
        "name": ""
    }')
echo "Response: $INVALID_AGENT_RESPONSE"
if [[ "$INVALID_AGENT_RESPONSE" =~ "error" ]]; then
    echo -e "${GREEN}Test passed (Expected error received)${NC}"
else
    echo -e "${RED}Test failed (Error was expected)${NC}"
fi
echo ""

echo -e "${YELLOW}6. Testing Get Non-existent Agent${NC}"
echo "GET /agents/99999"
NON_EXISTENT_AGENT_RESPONSE=$(curl -s -X GET "$BASE_URL/agents/99999")
echo "Response: $NON_EXISTENT_AGENT_RESPONSE"
if [[ "$NON_EXISTENT_AGENT_RESPONSE" =~ "error" ]]; then
    echo -e "${GREEN}Test passed (Expected error received)${NC}"
else
    echo -e "${RED}Test failed (Error was expected)${NC}"
fi
echo ""

echo -e "${YELLOW}7. Testing Unauthorized Access${NC}"
echo "POST /agents (No token)"
UNAUTHORIZED_AGENT_RESPONSE=$(curl -s -X POST "$BASE_URL/agents" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Unauthorized Jett"
    }')
echo "Response: $UNAUTHORIZED_AGENT_RESPONSE"
if [[ "$UNAUTHORIZED_AGENT_RESPONSE" =~ "error" ]]; then
    echo -e "${GREEN}Test passed (Expected error received)${NC}"
else
    echo -e "${RED}Test failed (Error was expected)${NC}"
fi
echo ""

echo -e "${YELLOW}8. Testing Delete Agent${NC}"
echo "DELETE /agents/$AGENT_ID"
DELETE_AGENT_RESPONSE=$(curl -s -X DELETE "$BASE_URL/agents/$AGENT_ID" \
    -H "Authorization: Bearer $TOKEN")
echo "Response: $DELETE_AGENT_RESPONSE"
if [ -z "$DELETE_AGENT_RESPONSE" ]; then
    echo -e "${GREEN}Test passed (Expected empty response)${NC}"
else
    echo -e "${RED}Test failed (Empty response expected)${NC}"
fi
echo ""

echo "========================================="
echo "Agents API Tests Completed"
echo "========================================="
