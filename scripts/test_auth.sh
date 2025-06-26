#!/bin/bash

source "$(dirname "$0")/test_utils.sh"

# Test data
TEST_EMAIL="test_$(date +%s)@example.com"
TEST_PASSWORD="password123"
TEST_NAME="Test User"

echo -e "${YELLOW}Testing Authentication API${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test registration
echo "1. Testing registration"
register_payload="{\"name\":\"$TEST_NAME\",\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}"
register_response=$(make_request "POST" "/auth/register" "$register_payload")
echo "Response: $register_response"

echo -e "${YELLOW}1. Testing User Registration${NC}"
echo "POST /auth/register"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d "{
        \"name\": \"$TEST_NAME\",
        \"email\": \"$TEST_EMAIL\",
        \"password\": \"$TEST_PASSWORD\"
    }")

echo "Response: $REGISTER_RESPONSE"
check_status "$REGISTER_RESPONSE"
echo ""

echo -e "${YELLOW}2. Testing User Login${NC}"
echo "POST /auth/login"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"$TEST_EMAIL\",
        \"password\": \"$TEST_PASSWORD\"
    }")

echo "Response: $LOGIN_RESPONSE"
check_status "$LOGIN_RESPONSE"

# Extract token from login response for further tests
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | grep -o '[^"]*$')
if [ ! -z "$TOKEN" ]; then
    echo -e "${GREEN}Token successfully extracted${NC}"
else
    echo -e "${RED}Failed to extract token${NC}"
    exit 1
fi
echo ""

echo -e "${YELLOW}3. Testing Invalid Login Credentials${NC}"
echo "POST /auth/login (Invalid password)"
INVALID_LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"$TEST_EMAIL\",
        \"password\": \"wrongpassword\"
    }")

echo "Response: $INVALID_LOGIN_RESPONSE"
if [[ "$INVALID_LOGIN_RESPONSE" =~ "error" ]]; then
    echo -e "${GREEN}Test passed (Expected error received)${NC}"
else
    echo -e "${RED}Test failed (Error was expected)${NC}"
fi
echo ""

echo -e "${YELLOW}4. Testing Non-existent User Login${NC}"
echo "POST /auth/login (Non-existent user)"
NONEXISTENT_LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "nonexistent@example.com",
        "password": "password123"
    }')

echo "Response: $NONEXISTENT_LOGIN_RESPONSE"
if [[ "$NONEXISTENT_LOGIN_RESPONSE" =~ "error" ]]; then
    echo -e "${GREEN}Test passed (Expected error received)${NC}"
else
    echo -e "${RED}Test failed (Error was expected)${NC}"
fi
echo ""

echo -e "${YELLOW}5. Testing Registration with Existing Email${NC}"
echo "POST /auth/register (Duplicate email)"
DUPLICATE_REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d "{
        \"name\": \"Another User\",
        \"email\": \"$TEST_EMAIL\",
        \"password\": \"differentpassword\"
    }")

echo "Response: $DUPLICATE_REGISTER_RESPONSE"
if [[ "$DUPLICATE_REGISTER_RESPONSE" =~ "error" ]]; then
    echo -e "${GREEN}Test passed (Expected error received)${NC}"
else
    echo -e "${RED}Test failed (Error was expected)${NC}"
fi
echo ""

echo -e "${YELLOW}6. Testing User Logout${NC}"
echo "POST /auth/logout"
if [ ! -z "$TOKEN" ]; then
    LOGOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/logout" \
        -H "Authorization: Bearer $TOKEN")
    echo "Response: $LOGOUT_RESPONSE"
    check_status "$LOGOUT_RESPONSE"

    # Verify token is invalid after logout
    echo -e "${YELLOW}6.1 Verifying token invalidation${NC}"
    INVALID_TOKEN_RESPONSE=$(curl -s -X GET "$BASE_URL/users" \
        -H "Authorization: Bearer $TOKEN")
    if [[ "$INVALID_TOKEN_RESPONSE" =~ "error" ]]; then
        echo -e "${GREEN}Test passed (Token properly invalidated)${NC}"
    else
        echo -e "${RED}Test failed (Token should be invalid)${NC}"
    fi
else
    echo -e "${RED}No token available for logout test${NC}"
fi
echo ""

# Save token to file for other scripts if logout was not tested
if [ ! -z "$TOKEN" ]; then
    echo "$TOKEN" > /tmp/api_token.txt
    echo -e "${GREEN}Token saved to /tmp/api_token.txt for use in other test scripts${NC}"
fi

echo "========================================="
echo "Authentication API Tests Completed"
echo "========================================="
