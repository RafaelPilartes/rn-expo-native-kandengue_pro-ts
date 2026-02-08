const { withDangerousMod, withPlugins } = require('@expo/config-plugins')
const fs = require('fs')
const path = require('path')

/**
 * Config plugin to disable CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER
 * This fixes React Native Firebase compatibility issues with useFrameworks: "static"
 */
const withDisableModularHeaders = config => {
  return withDangerousMod(config, [
    'ios',
    async config => {
      const podfilePath = path.join(
        config.modRequest.platformProjectRoot,
        'Podfile'
      )

      let podfileContent = fs.readFileSync(podfilePath, 'utf-8')

      // Check if our modification already exists
      if (
        podfileContent.includes('CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER')
      ) {
        return config
      }

      // Add post_install hook to disable the warning
      const postInstallHook = `
post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER'] = 'NO'
    end
  end
end
`

      // Append at the end of the file if no post_install exists
      if (!podfileContent.includes('post_install')) {
        podfileContent += '\n' + postInstallHook
      } else {
        // If post_install exists, we need to modify it
        // This is more complex, so for now, let's just append a comment
        console.warn(
          '⚠️  post_install hook already exists in Podfile. Please add the following manually:'
        )
        console.warn(
          "config.build_settings['CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER'] = 'NO'"
        )
      }

      fs.writeFileSync(podfilePath, podfileContent)

      return config
    }
  ])
}

module.exports = withDisableModularHeaders
