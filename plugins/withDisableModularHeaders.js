const { withDangerousMod } = require('@expo/config-plugins')
const fs = require('fs')
const path = require('path')

/**
 * Config plugin to fix React Native Firebase modular header warnings
 * Injects build setting into existing post_install hook
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
        console.log('✅ Podfile already patched for modular headers')
        return config
      }

      console.log('🔧 Patching Podfile to disable modular header warnings...')

      const lines = podfileContent.split('\n')
      const patchedLines = []
      let foundPostInstall = false
      let indentation = '  '

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        patchedLines.push(line)

        // Find the post_install hook
        if (line.includes('post_install do |installer|') && !foundPostInstall) {
          foundPostInstall = true

          // Detect indentation from next line
          if (i + 1 < lines.length && lines[i + 1].trim() !== '') {
            const nextLine = lines[i + 1]
            const match = nextLine.match(/^(\s+)/)
            if (match) {
              indentation = match[1]
            }
          }

          // Inject our code right after post_install declaration
          patchedLines.push('')
          patchedLines.push(
            indentation +
              '# Fix for React Native Firebase with useFrameworks: "static"'
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
          patchedLines.push(indentation + '  end')
          patchedLines.push(indentation + 'end')

          console.log(
            `✅ Injected code into post_install hook with indentation: "${indentation}"`
          )
        }
      }

      if (!foundPostInstall) {
        // No post_install found, create one at the end
        console.log('📝 No post_install found, creating new hook...')
        patchedLines.push('')
        patchedLines.push(
          '# Fix for React Native Firebase with useFrameworks: "static"'
        )
        patchedLines.push('post_install do |installer|')
        patchedLines.push('  installer.pods_project.targets.each do |target|')
        patchedLines.push('    target.build_configurations.each do |config|')
        patchedLines.push(
          "      config.build_settings['CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER'] = 'NO'"
        )
        patchedLines.push('    end')
        patchedLines.push('  end')
        patchedLines.push('end')
      }

      const patchedContent = patchedLines.join('\n')
      fs.writeFileSync(podfilePath, patchedContent)

      console.log('✅ Podfile successfully patched!')

      return config
    }
  ])
}

module.exports = withDisableModularHeaders
