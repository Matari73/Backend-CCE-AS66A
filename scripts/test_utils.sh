#!/bin/bash

# Colors for output - for better readability
export RED='\033[0;31m'
export GREEN='\033[0;32m'
export YELLOW='\033[1;33m'
export NC='\033[0m' # No Color

# Base URL for the API
export BASE_URL="${API_BASE_URL:-http://localhost:3000/api}"

# Function to make API requests
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local token=$4
    
    # Build headers
    local headers="-H 'Content-Type: application/json'"
    if [ ! -z "$token" ]; then
        headers="$headers -H 'Authorization: Bearer $token'"
    fi
    
    # Make the request
    if [ ! -z "$data" ]; then
        eval "curl -s -X $method $headers -d '$data' $BASE_URL$endpoint"
    else
        eval "curl -s -X $method $headers $BASE_URL$endpoint"
    fi
}

# Function to log messages
log_message() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        "$LOG_LEVEL_INFO")
            echo -e "${BLUE}[$timestamp] [INFO] $message${NC}"
            ;;
        "$LOG_LEVEL_ERROR")
            echo -e "${RED}[$timestamp] [ERROR] $message${NC}"
            ;;
        "$LOG_LEVEL_DEBUG")
            echo -e "${YELLOW}[$timestamp] [DEBUG] $message${NC}"
            ;;
    esac
}

# Function to validate JSON response
validate_json() {
    local json=$1
    echo "$json" | jq . >/dev/null 2>&1
    return $?
}

# Function to track test results
track_test() {
    local status=$1
    local test_name=$2
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    
    if [ $status -eq 0 ]; then
        TESTS_PASSED=$((TESTS_PASSED + 1))
        log_message "$LOG_LEVEL_INFO" "Test '$test_name' passed"
        return 0
    else
        TESTS_FAILED=$((TESTS_FAILED + 1))
        log_message "$LOG_LEVEL_ERROR" "Test '$test_name' failed"
        return 1
    fi
}

# Function to check response and track results
check_response() {
    local response=$1
    local expect_error=${2:-false}
    local test_name=$3
    
    if [ -z "$response" ]; then
        log_message "$LOG_LEVEL_ERROR" "Empty response received"
        track_test 1 "$test_name"
        return 1
    fi
    
    if [[ "$response" =~ "error" ]]; then
        if [ "$expect_error" = true ]; then
            log_message "$LOG_LEVEL_INFO" "Expected error received: $response"
            track_test 0 "$test_name"
            return 0
        else
            log_message "$LOG_LEVEL_ERROR" "Unexpected error: $response"
            track_test 1 "$test_name"
            return 1
        fi
    else
        if [ "$expect_error" = true ]; then
            log_message "$LOG_LEVEL_ERROR" "Expected error but got success: $response"
            track_test 1 "$test_name"
            return 1
        else
            log_message "$LOG_LEVEL_INFO" "Success response: $response"
            track_test 0 "$test_name"
            return 0
        fi
    fi
}

# Function to print test summary
print_summary() {
    local test_suite=$1
    local duration=$2
    
    echo -e "\n${YELLOW}Test Summary for $test_suite${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "Total Tests:     ${BLUE}$TESTS_TOTAL${NC}"
    echo -e "Tests Passed:    ${GREEN}$TESTS_PASSED${NC}"
    echo -e "Tests Failed:    ${RED}$TESTS_FAILED${NC}"
    echo -e "Success Rate:    ${BLUE}$(( (TESTS_PASSED * 100) / TESTS_TOTAL ))%${NC}"
    if [ ! -z "$duration" ]; then
        echo -e "Duration:       ${YELLOW}${duration}s${NC}"
    fi
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Return overall success/failure
    return $((TESTS_FAILED > 0))
}

# Function to make authenticated request
auth_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local test_name=$4
    
    if [ -z "$TOKEN" ]; then
        log_message "$LOG_LEVEL_ERROR" "No token available for authenticated request"
        return 1
    fi
    
    local response
    if [ -z "$data" ]; then
        response=$(curl -s --max-time $REQUEST_TIMEOUT -X "$method" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            "$BASE_URL$endpoint")
    else
        response=$(curl -s --max-time $REQUEST_TIMEOUT -X "$method" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$endpoint")
    fi
    
    # Check for curl errors
    if [ $? -ne 0 ]; then
        log_message "$LOG_LEVEL_ERROR" "Request failed: $?"
        return 1
    fi
    
    # Validate JSON response
    if ! validate_json "$response"; then
        log_message "$LOG_LEVEL_ERROR" "Invalid JSON response"
        return 1
    fi
    
    echo "$response"
    return 0
}

# Function to make a request with retries
make_request() {
    local url=$1
    local method=${2:-GET}
    local data=$3
    local headers=$4
    local attempt=1
    
    while [ $attempt -le $MAX_RETRIES ]; do
        if [ -n "$data" ]; then
            response=$(curl -s -X "$method" $headers -d "$data" "$url")
        else
            response=$(curl -s -X "$method" $headers "$url")
        fi
        
        if [ $? -eq 0 ] && validate_json "$response"; then
            echo "$response"
            return 0
        fi
        
        log_message "$LOG_LEVEL_ERROR" "Request failed (attempt $attempt/$MAX_RETRIES), retrying in $RETRY_DELAY seconds..."
        sleep $RETRY_DELAY
        attempt=$((attempt + 1))
    done
    
    log_message "$LOG_LEVEL_ERROR" "Request failed after $MAX_RETRIES attempts"
    return 1
}

# Function to clean up test artifacts
cleanup_test_files() {
    local keep_token=${1:-false}
    
    # List of files to clean up
    local files=(
        "/tmp/championship_id.txt"
        "/tmp/match_id.txt"
        "/tmp/team_id.txt"
        "/tmp/participant_id.txt"
        "/tmp/subscription_id.txt"
        "/tmp/statistic_id.txt"
    )
    
    # Only remove token if not keeping it
    if [ "$keep_token" != "true" ]; then
        files+=("/tmp/api_token.txt")
    fi
    
    for file in "${files[@]}"; do
        if [ -f "$file" ]; then
            rm -f "$file"
            log_message "$LOG_LEVEL_DEBUG" "Removed $file"
        fi
    done
    
    log_message "$LOG_LEVEL_INFO" "Cleaned up test artifacts"
}

# Function to ensure required tools are installed
check_dependencies() {
    local missing_deps=()
    
    # Check for curl
    if ! command -v curl &> /dev/null; then
        missing_deps+=("curl")
    fi
    
    # Check for jq
    if ! command -v jq &> /dev/null; then
        missing_deps+=("jq")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        log_message "$LOG_LEVEL_ERROR" "Missing dependencies: ${missing_deps[*]}"
        log_message "$LOG_LEVEL_ERROR" "Please install the missing dependencies and try again"
        exit 1
    fi
}

# Function to handle cleanup on exit
cleanup_on_exit() {
    log_message "$LOG_LEVEL_INFO" "Running cleanup on exit"
    cleanup_test_files
}

# Set trap for cleanup
trap cleanup_on_exit EXIT
trap 'exit 2' INT TERM

# Run dependency check when the script is sourced
check_dependencies
