const { withDangerousMod } = require('@expo/config-plugins')
const fs = require('fs')
const path = require('path')

/**
 * Config plugin to fix React Native Firebase modular header warnings
 * Modifies existing post_install hook or creates one if it doesn't exist
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

      // Code to inject
      const codeToInject = `    # Fix for React Native Firebase with useFrameworks: "static"
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER'] = 'NO'
      end
    end`

      // Check if post_install already exists
      const postInstallRegex = /post_install do \|installer\|([\s\S]*?)end/
      const match = podfileContent.match(postInstallRegex)

      if (match) {
        // post_install exists, inject our code inside it
        console.log('📝 Found existing post_install hook, injecting code...')
        const existingContent = match[1]
        const newContent = existingContent + '\n\n' + codeToInject + '\n  '
        podfileContent = podfileContent.replace(
          postInstallRegex,
          `post_install do |installer|${newContent}end`
        )
      } else {
        // No post_install, create new one
        console.log('📝 Creating new post_install hook...')
        const newHook = `\n# Fix for React Native Firebase with useFrameworks: "static"\npost_install do |installer|\n${codeToInject}\nend\n`
        podfileContent += newHook
      }

      fs.writeFileSync(podfilePath, podfileContent)
      console.log('✅ Podfile patched successfully!')

      return config
    }
  ])
}

module.exports = withDisableModularHeaders
