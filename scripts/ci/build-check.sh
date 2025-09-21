#!/bin/bash

# ========================================
# GENESIS LUMINAL - BUILD CHECK SCRIPT
# Valida builds de backend e frontend
# ========================================

echo "🏗️ Validating builds for Genesis Luminal"

# Function to check build
check_build() {
    local service=$1
    echo "🔍 Checking $service build..."
    
    cd $service
    
    # Install dependencies
    echo "📦 Installing dependencies..."
    npm ci --silent
    
    # Run build
    echo "🏗️ Running build..."
    if npm run build; then
        echo "✅ $service build successful"
        
        # Check if build artifacts exist
        if [ -d "dist" ] || [ -d "build" ]; then
            echo "✅ Build artifacts found"
        else
            echo "⚠️ Build artifacts not found"
        fi
    else
        echo "❌ $service build failed"
        return 1
    fi
    
    cd ..
    return 0
}

# Check backend
if ! check_build "backend"; then
    echo "❌ Backend build failed"
    exit 1
fi

# Check frontend
if ! check_build "frontend"; then
    echo "❌ Frontend build failed"
    exit 1
fi

echo "🎉 All builds successful!"
