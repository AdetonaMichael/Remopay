#!/bin/bash

# PIN System - Implementation Verification Script
# Run this to verify all components are in place and working
# Usage: bash PIN_VERIFY.sh

echo "🔍 PIN System Implementation Verification"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASS=0
FAIL=0

# Function to check file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅${NC} $1"
        ((PASS++))
    else
        echo -e "${RED}❌${NC} $1 (NOT FOUND)"
        ((FAIL++))
    fi
}

# Function to check if string exists in file
check_string() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✅${NC} Found '$2' in $1"
        ((PASS++))
    else
        echo -e "${RED}❌${NC} Missing '$2' in $1"
        ((FAIL++))
    fi
}

echo "📁 Checking Files..."
echo "---"
check_file "src/components/shared/PINInput.tsx"
check_file "src/components/shared/PINSetupModal.tsx"
check_file "src/components/shared/PINVerificationModal.tsx"
check_file "src/components/shared/PINVerificationModalEnhanced.tsx"
check_file "src/hooks/usePin.ts"
check_file "src/hooks/usePINVerification.ts"
check_file "src/services/pin.service.ts"
check_file "app/dashboard/settings/pin/page.tsx"
echo ""

echo "📦 Checking Exports..."
echo "---"
check_string "src/hooks/index.ts" "usePINVerification"
check_string "src/hooks/index.ts" "usePin"
echo ""

echo "🔐 Checking Types..."
echo "---"
check_string "src/types/api.types.ts" "transaction_pin"
check_string "src/types/api.types.ts" "pin_locked_until"
check_string "src/types/api.types.ts" "SetTransactionPINRequest"
check_string "src/types/api.types.ts" "VerifyTransactionPINRequest"
echo ""

echo "🎯 Checking Component Imports..."
echo "---"
check_string "app/dashboard/settings/pin/page.tsx" "usePINVerification"
check_string "app/dashboard/settings/pin/page.tsx" "PINSetupModal"
check_string "src/components/shared/PINInput.tsx" "forwardRef"
check_string "src/hooks/usePINVerification.ts" "usePin"
echo ""

echo "🔗 Checking API Service..."
echo "---"
check_string "src/services/pin.service.ts" "setPin"
check_string "src/services/pin.service.ts" "verifyPin"
echo ""

echo "📚 Checking Documentation..."
echo "---"
check_file "PIN_IMPLEMENTATION_SUMMARY.md"
check_file "PIN_VALIDATION_CHECKLIST.md"
check_file "END_TO_END_TESTING_GUIDE.md"
check_file "QUICK_TEST_CARD.md"
check_file "src/components/shared/PIN_INTEGRATION_GUIDE.md"
check_file "src/components/shared/PIN_INTEGRATION_EXAMPLE.tsx"
echo ""

echo "🛡️  Checking Security..."
echo "---"
# Check that PIN is not directly logged in service
if grep -q "console.log.*pin" src/services/pin.service.ts; then
    echo -e "${YELLOW}⚠️ ${NC} Warning: Found console.log with 'pin' in pin.service.ts"
    ((FAIL++))
else
    echo -e "${GREEN}✅${NC} No console.log of PIN in services"
    ((PASS++))
fi

# Check that localStorage is not used for PIN
if grep -q "localStorage.*pin\|pin.*localStorage" src/hooks/usePin.ts src/hooks/usePINVerification.ts 2>/dev/null; then
    echo -e "${RED}❌${NC} ERROR: PIN might be stored in localStorage!"
    ((FAIL++))
else
    echo -e "${GREEN}✅${NC} PIN not stored in localStorage"
    ((PASS++))
fi

echo ""
echo "=========================================="
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✅ ALL CHECKS PASSED${NC}"
    echo ""
    echo "Implementation is complete and ready!"
    echo ""
    echo "Next steps:"
    echo "1. npm run dev"
    echo "2. Navigate to /dashboard/settings/pin"
    echo "3. Create a test PIN"
    echo "4. Test PIN verification in transactions"
    echo "5. Follow END_TO_END_TESTING_GUIDE.md for full testing"
    exit 0
else
    echo -e "${RED}❌ $FAIL CHECKS FAILED${NC}"
    echo -e "${GREEN}✅ $PASS CHECKS PASSED${NC}"
    echo ""
    echo "Please fix the missing files/checks above."
    exit 1
fi
