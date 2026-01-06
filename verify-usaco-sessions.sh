#!/bin/bash
# Script de Verificación: Gestión de Sesiones USACO
# Este script verifica que todos los archivos y funcionalidades existen

echo "🔍 Verificando Gestión de Sesiones USACO..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

SUCCESS=0
FAILED=0

# Function to check file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
        ((SUCCESS++))
    else
        echo -e "${RED}✗${NC} $2"
        ((FAILED++))
    fi
}

# Function to check content in file
check_content() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $3"
        ((SUCCESS++))
    else
        echo -e "${RED}✗${NC} $3"
        ((FAILED++))
    fi
}

echo "📁 Backend Files:"
check_file "server/src/routes/team.routes.js" "Team Routes"
check_file "server/src/models/TeamConfig.js" "TeamConfig Model"
check_file "server/src/services/usaco-permalink.service.js" "USACO Permalink Service"
check_file "server/src/routes/integrations.routes.js" "Integrations Routes"

echo ""
echo "🎨 Frontend Files:"
check_file "client/src/app/features/team/team-detail.component.ts" "TeamDetail Component"
check_file "client/src/app/features/team/team-detail.component.html" "TeamDetail Template"
check_file "client/src/app/core/services/team.service.ts" "Team Service"
check_file "client/src/app/core/services/integrations.service.ts" "Integrations Service"

echo ""
echo "📖 Documentation:"
check_file "USACO_SESSION_LOCATION_GUIDE.md" "Location Guide"
check_file "USACO_QUICK_INDEX.md" "Quick Index"
check_file "USACO_SESSION_MANAGEMENT.md" "Session Management Guide"
check_file "IMPLEMENTATION_COMPLETE_USACO_SESSIONS.md" "Implementation Summary"
check_file "SECURITY_SUMMARY_USACO_SESSIONS.md" "Security Summary"

echo ""
echo "🔧 Backend Functionality:"
check_content "server/src/routes/team.routes.js" "code-sessions" "API Endpoints for code-sessions"
check_content "server/src/routes/team.routes.js" "teamManagementLimiter" "Rate Limiting"
check_content "server/src/models/TeamConfig.js" "codeSessions" "codeSessions Schema"

echo ""
echo "🎯 Frontend Functionality:"
check_content "client/src/app/features/team/team-detail.component.ts" "addSession" "addSession() method"
check_content "client/src/app/features/team/team-detail.component.ts" "renameSession" "renameSession() method"
check_content "client/src/app/features/team/team-detail.component.ts" "deleteSession" "deleteSession() method"

echo ""
echo "📊 Results:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "Success: ${GREEN}$SUCCESS${NC}"
echo -e "Failed:  ${RED}$FAILED${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ Todas las verificaciones pasaron!${NC}"
    echo ""
    echo "La funcionalidad de gestión de sesiones USACO está completamente implementada."
    echo "Consulta USACO_QUICK_INDEX.md para comenzar."
    exit 0
else
    echo -e "${RED}⚠️  Algunas verificaciones fallaron.${NC}"
    echo ""
    echo "Es posible que estés en el branch incorrecto."
    echo "Ejecuta: git checkout develop"
    echo ""
    echo "Si el problema persiste, consulta USACO_SESSION_LOCATION_GUIDE.md"
    exit 1
fi
