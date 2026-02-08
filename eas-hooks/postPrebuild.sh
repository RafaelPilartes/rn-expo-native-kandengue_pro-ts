#!/bin/bash
set -e

echo "🔧 [Post-Prebuild] Fixing iOS modular header issue..."

PODFILE_PATH="ios/Podfile"

if [ ! -f "$PODFILE_PATH" ]; then
  echo "❌ Podfile not found at $PODFILE_PATH"
  exit 0
fi

# Check if already patched
if grep -q "CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER" "$PODFILE_PATH"; then
  echo "✅ Podfile already patched"
  exit 0
fi

echo "📝 Patching Podfile..."

# Add post_install hook to disable the warning
cat >> "$PODFILE_PATH" << 'EOF'

# Fix for React Native Firebase with useFrameworks: "static"
# Disables the CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER warning
post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER'] = 'NO'
    end
  end
end
EOF

echo "✅ Podfile patched successfully!"
