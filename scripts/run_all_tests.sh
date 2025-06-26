#!/bin/bash

# Source utils for colors
source "$(dirname "$0")/test_utils.sh"

echo -e "${YELLOW}Starting API Tests${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Make sure all scripts are executable
chmod +x *.sh

# Function to run a test script
run_test() {
    local script=$1
    echo -e "\n${YELLOW}Running $script...${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Ensure the script exists and is executable
    if [ ! -f "$script" ]; then
        echo -e "${RED}Error: Script $script not found${NC}"
        return 1
    fi
    
    if [ ! -x "$script" ]; then
        chmod +x "$script"
    fi
    
    if [ "$script" = "test_auth.sh" ]; then
        # For auth test, we want to ensure we get a fresh token
        rm -f /tmp/api_token.txt
    fi
    
    # Run test with timeout handling
    timeout 300 "$script"
    result=$?

    end_time=$(date +%s)
    duration=$((end_time - start_time))

    if [ $result -eq 0 ]; then
        echo -e "${GREEN}✓ $script completed successfully in ${duration}s${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    elif [ $result -eq 124 ]; then
        echo -e "${RED}✗ $script timed out after 300s${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    else
        echo -e "${RED}✗ $script failed (exit code: $result) after ${duration}s${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    # Add a small delay between tests
    sleep 2
}

# Main execution
echo "========================================="
echo "Running All API Tests"
echo "========================================="

# Make all test scripts executable
chmod +x test_*.sh

# Run tests in the correct order
SCRIPTS=(
    "./test_auth.sh"             # Authentication (generates token)
    "./test_users.sh"            # User management
    "./test_agents.sh"           # Game agents
    "./test_teams.sh"            # Teams
    "./test_championships.sh"     # Championships
    "./test_participants.sh"      # Participants
    "./test_subscriptions.sh"    # Subscriptions
    "./test_matches.sh"          # Matches
    "./test_participant_statistics.sh"  # Statistics
)

# Run each test
for script in "${SCRIPTS[@]}"; do
    if [ -f "$script" ]; then
        run_test "$script"
        
        # If auth test fails, stop testing
        if [ "$script" = "./test_auth.sh" ] && [ $? -ne 0 ]; then
            echo -e "\n${RED}Authentication test failed. Stopping tests.${NC}"
            exit 1
        fi
        
        # Small pause between tests
        sleep 1
    else
        echo -e "${RED}Warning: $script not found${NC}"
    fi
done

# Print summary
echo -e "\n${YELLOW}Test Summary${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "Total Tests Run: ${BLUE}$TOTAL_TESTS${NC}"
echo -e "Tests Passed:    ${GREEN}$PASSED_TESTS${NC}"
echo -e "Tests Failed:    ${RED}$FAILED_TESTS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Exit with failure if any tests failed
[ $FAILED_TESTS -eq 0 ]
