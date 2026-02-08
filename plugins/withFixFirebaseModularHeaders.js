const { withDangerousMod } = require('@expo/config-plugins')
const fs = require('fs')
const path = require('path')

/**
 * DEFINITIVE FIX for React Native Firebase modular headers with useFrameworks: static
 *
 * This plugin modifies the Podfile's post_install hook to apply build settings
 * to ALL pod targets, not just the main app. This is critical because the
 * Firebase errors come from the RNFBApp pod itself.
 */
const withFixFirebaseModularHeaders = config => {
  return withDangerousMod(config, [
    'ios',
    async config => {
      const podfilePath = path.join(
        config.modRequest.platformProjectRoot,
        'Podfile'
      )

      if (!fs.existsSync(podfilePath)) {
        console.warn('[Firebase Fix] Podfile not found, skipping')
        return config
      }

      let content = fs.readFileSync(podfilePath, 'utf-8')

      // Check if already patched
      if (content.includes('FIREBASE_MODULAR_HEADERS_FIX')) {
        console.log('[Firebase Fix] ✅ Already patched')
        return config
      }

      console.log('[Firebase Fix] 🔧 Patching Podfile...')

      const lines = content.split('\n')
      let postInstallFound = false
      let insertIndex = -1

      // Find post_install hook
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith('post_install do |installer|')) {
          postInstallFound = true
          insertIndex = i + 1
          break
        }
      }

      const fixCode = [
        '',
        '  # FIREBASE_MODULAR_HEADERS_FIX',
        '  # Fix for React Native Firebase + C99 issues on Xcode 15 / EAS',
        '  installer.pods_project.targets.each do |target|',
        '    target.build_configurations.each do |config|',
        "      config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'",
        "      config.build_settings['CLANG_WARN_NON_MODULAR_INCLUDE_IN_FRAMEWORK_MODULE'] = 'NO'",
        "      config.build_settings['CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER'] = 'NO'",
        "      config.build_settings['CLANG_WARN_MODULE_INCLUDE_IN_FRAMEWORK_HEADER'] = 'NO'",
        "      config.build_settings['CLANG_WARN_IMPLICIT_INT'] = 'NO'",
        "      config.build_settings['GCC_TREAT_WARNINGS_AS_ERRORS'] = 'NO'",
        '    end',
        '  end',
        ''
      ]

      if (postInstallFound && insertIndex > 0) {
        // Inject into existing post_install
        console.log('[Firebase Fix] 📝 Injecting into existing post_install')
        lines.splice(insertIndex, 0, ...fixCode)
      } else {
        // Create new post_install at end
        console.log('[Firebase Fix] 📝 Creating new post_install hook')
        lines.push('')
        lines.push('# FIREBASE_MODULAR_HEADERS_FIX')
        lines.push('post_install do |installer|')
        lines.push(
          ...fixCode.map(line => (line.startsWith('  ') ? line : '  ' + line))
        )
        lines.push('end')
      }

      fs.writeFileSync(podfilePath, lines.join('\n'))
      console.log('[Firebase Fix] ✅ Podfile patched successfully!')

      return config
    }
  ])
}

module.exports = withFixFirebaseModularHeaders
