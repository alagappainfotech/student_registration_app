#!/bin/bash

# Log file paths
BACKEND_LOG="/Users/acharyathiyagarajan/CascadeProjects/student_registration_app/logs/backend/server.log"
FRONTEND_LOG="/Users/acharyathiyagarajan/CascadeProjects/student_registration_app/logs/frontend/server.log"

# Ensure logs exist
touch "$BACKEND_LOG" "$FRONTEND_LOG"

# Function to analyze backend logs
analyze_backend_logs() {
    echo "=== Backend Log Analysis ==="
    
    # Count of errors
    echo "Total Errors:"
    grep -c "ERROR" "$BACKEND_LOG"
    
    # Most common error types
    echo -e "\nMost Common Errors:"
    grep "ERROR" "$BACKEND_LOG" | sort | uniq -c | sort -nr | head -n 5
    
    # Authentication-related issues
    echo -e "\nAuthentication Errors:"
    grep -E "Authentication|Login|Unauthorized" "$BACKEND_LOG"
    
    # Database-related warnings
    echo -e "\nDatabase Warnings:"
    grep -E "database|query|connection" "$BACKEND_LOG"
}

# Function to analyze frontend logs
analyze_frontend_logs() {
    echo "=== Frontend Log Analysis ==="
    
    # Count of errors
    echo "Total Errors:"
    grep -c "error" "$FRONTEND_LOG"
    
    # Most common error types
    echo -e "\nMost Common Errors:"
    grep "error" "$FRONTEND_LOG" | sort | uniq -c | sort -nr | head -n 5
    
    # Webpack or build-related issues
    echo -e "\nBuild Warnings:"
    grep -E "warning|failed" "$FRONTEND_LOG"
}

# Main log analysis
echo "Log Analysis Report"
echo "==================="
echo "=== Full Backend Log ==="
cat "$BACKEND_LOG"

echo -e "\n\n=== Full Frontend Log ==="
cat "$FRONTEND_LOG"

echo -e "\n\n=== Detailed Backend Analysis ==="
analyze_backend_logs
echo -e "\n\n=== Detailed Frontend Analysis ==="
analyze_frontend_logs
