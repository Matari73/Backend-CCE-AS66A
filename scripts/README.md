# API Test Suite Documentation

This directory contains a comprehensive test suite for testing the Valorant Championship Management API endpoints. The test scripts validate various API functionalities including authentication, CRUD operations, and error handling.

## Prerequisites

- Bash shell environment
- curl command-line tool
- jq (for JSON processing)
- An instance of the API server running

## Test Scripts Overview

1. **test_auth.sh**
   - Tests authentication endpoints
   - Handles login/logout functionality
   - Creates authentication tokens for other tests
   - Run this first to generate the required auth token

2. **test_agents.sh**
   - Tests CRUD operations for Valorant agents
   - Validates agent creation, updates, and deletion
   - Includes error handling tests

3. **test_championships.sh**
   - Tests championship management endpoints
   - Handles tournament creation and management
   - Validates tournament formats and states

4. **test_participants.sh**
   - Tests participant management
   - Handles player registration and team assignments
   - Validates participant roles and permissions

5. **test_matches.sh**
   - Tests match management functionality
   - Handles match creation, updates, and results
   - Validates match scheduling and scoring

6. **test_participant_statistics.sh**
   - Tests player statistics tracking
   - Validates performance metrics and updates
   - Handles statistical calculations

7. **test_subscriptions.sh**
   - Tests tournament subscription functionality
   - Validates team registration for championships
   - Handles subscription status and updates

## Running the Tests

1. Start the API server first:
   ```bash
   cd ..
   docker-compose up -d
   ```

2. Run all tests in sequence:
   ```bash
   ./run_all_tests.sh
   ```

3. Run individual test files:
   ```bash
   ./test_auth.sh        # Run authentication tests first
   ./test_agents.sh      # Run agent tests
   ./test_championships.sh
   # etc...
   ```

## Test Flow and Dependencies

The tests should be run in the following order due to dependencies:

1. test_auth.sh (generates token)
2. test_agents.sh
3. test_championships.sh
4. test_teams.sh
5. test_participants.sh
6. test_subscriptions.sh
7. test_matches.sh
8. test_participant_statistics.sh

## Test Output

Each test script provides:
- Clear test case descriptions
- HTTP request details
- Response data
- Pass/Fail status
- Error messages when applicable

Example output:
```
=========================================
Testing Agents API Endpoints
=========================================
1. Testing Get All Agents
GET /agents
Response: [{"agent_id":1,"name":"Jett"}]
Test passed
```

## Common Issues and Troubleshooting

1. **Authentication Errors**
   - Ensure test_auth.sh has been run first
   - Check if token has expired
   - Verify /tmp/api_token.txt exists and has valid token

2. **Missing Dependencies**
   - Run tests in correct order
   - Check if required IDs are properly saved
   - Verify resource creation in previous tests

3. **Connection Issues**
   - Verify API server is running
   - Check BASE_URL in test_utils.sh
   - Ensure Docker containers are up

## Maintenance

- The test suite uses a shared utilities file (test_utils.sh)
- Common functions and variables are centralized
- Tests are modular and can be run independently
- Each test script follows the same structure pattern

## Adding New Tests

When adding new test scripts:
1. Source the test utilities file
2. Follow the established pattern
3. Use the provided helper functions
4. Include proper error handling
5. Add cleanup procedures
6. Update this documentation

## Environment Variables

- BASE_URL: API endpoint (default: http://localhost:3000/api)
- Other configuration can be found in test_utils.sh

## Exit Codes

- 0: All tests passed
- 1: One or more tests failed
- 2: Setup/configuration error
