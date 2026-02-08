const { withDangerousMod } = require('@expo/config-plugins')
const fs = require('fs')
const path = require('path')

/**
 * Config plugin to fix React Native Firebase modular header warnings
 * This runs during prebuild and modifies the Podfile
 */
const withDisableModularHeaders = config => {
  return withDangerousMod(config, [
    'ios',
    async config => {
      const podfilePath = path.join(
        config.modRequest.platformProjectRoot,
        'Podfile'
      )

      if (!fs.existsSync(podfilePath)) {
        console.warn('⚠️  Podfile not found, skipping patch')
        return config
      }

      let podfileContent = fs.readFileSync(podfilePath, 'utf-8')

      // Check if already patched
      if (
        podfileContent.includes('CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER')
      ) {
        console.log('✅ Podfile already patched')
        return config
      }

      console.log('🔧 Patching Podfile to fix modular headers...')

      // Add post_install hook
      const postInstallHook = `
# Fix for React Native Firebase with useFrameworks: "static"
post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER'] = 'NO'
    end
  end
end
`

      // Append at the end
      podfileContent += '\n' + postInstallHook
      fs.writeFileSync(podfilePath, podfileContent)

      console.log('✅ Podfile patched successfully!')

      return config
    }
  ])
}

module.exports = withDisableModularHeaders
