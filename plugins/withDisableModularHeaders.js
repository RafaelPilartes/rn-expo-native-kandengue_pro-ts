const { withDangerousMod } = require('@expo/config-plugins')
const fs = require('fs')
const path = require('path')

/**
 * Config plugin to fix React Native Firebase modular header warnings
 * Sets BOTH required build settings to fix the issue
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
        podfileContent.includes(
          'CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER'
        ) &&
        podfileContent.includes(
          'CLANG_WARN_NON_MODULAR_INCLUDE_IN_FRAMEWORK_MODULES'
        )
      ) {
        console.log('✅ Podfile already patched')
        return config
      }

      console.log('🔧 Patching Podfile to fix Firebase modular headers...')

      const lines = podfileContent.split('\n')
      const patchedLines = []
      let foundPostInstall = false
      let indentation = '  '

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        patchedLines.push(line)

        if (line.includes('post_install do |installer|') && !foundPostInstall) {
          foundPostInstall = true

          // Detect indentation
          if (i + 1 < lines.length && lines[i + 1].trim() !== '') {
            const match = lines[i + 1].match(/^(\s+)/)
            if (match) {
              indentation = match[1]
            }
          }

          // Inject BOTH build settings
          patchedLines.push('')
          patchedLines.push(
            indentation + '# Fix React Native Firebase with useFrameworks'
          )
          patchedLines.push(
            indentation + 'installer.pods_project.targets.each do |target|'
          )
          patchedLines.push(
            indentation + '  target.build_configurations.each do |config|'
          )
          patchedLines.push(
            indentation +
              "    config.build_settings['CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER'] = 'NO'"
          )
          patchedLines.push(
            indentation +
              "    config.build_settings['CLANG_WARN_NON_MODULAR_INCLUDE_IN_FRAMEWORK_MODULES'] = 'NO'"
          )
          patchedLines.push(indentation + '  end')
          patchedLines.push(indentation + 'end')

          console.log('✅ Injected Firebase fix into post_install')
        }
      }

      if (!foundPostInstall) {
        console.log('📝 Creating new post_install hook...')
        patchedLines.push('')
        patchedLines.push('# Fix React Native Firebase with useFrameworks')
        patchedLines.push('post_install do |installer|')
        patchedLines.push('  installer.pods_project.targets.each do |target|')
        patchedLines.push('    target.build_configurations.each do |config|')
        patchedLines.push(
          "      config.build_settings['CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER'] = 'NO'"
        )
        patchedLines.push(
          "      config.build_settings['CLANG_WARN_NON_MODULAR_INCLUDE_IN_FRAMEWORK_MODULES'] = 'NO'"
        )
        patchedLines.push('    end')
        patchedLines.push('  end')
        patchedLines.push('end')
      }

      fs.writeFileSync(podfilePath, patchedLines.join('\n'))
      console.log('✅ Podfile patched successfully!')

      return config
    }
  ])
}

module.exports = withDisableModularHeaders
