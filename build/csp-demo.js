#!/usr/bin/env node

'use strict'

/**
 * CSP策略效果演示脚本
 * 展示不同环境下的CSP策略配置和效果
 */

const { generateCSPForEnvironment } = require('./csp-config')

// 颜色输出工具
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`
}

/**
 * 打印CSP策略详情
 */
function printCSPDetails(env, result) {
  console.log(colorize(`\n╔══════════════════════════════════════╗`, 'cyan'))
  console.log(colorize(`║  ${env.toUpperCase()} ENVIRONMENT CSP POLICY${' '.repeat(Math.max(0, 17 - env.length))}║`, 'cyan'))
  console.log(colorize(`╚══════════════════════════════════════╝`, 'cyan'))
  
  // 策略摘要
  console.log(colorize('\n📋 Policy Summary:', 'bright'))
  console.log(`   • Directives: ${Object.keys(result.policy).length}`)
  console.log(`   • Policy Length: ${result.policyString.length} characters`)
  console.log(`   • Validation: ${result.validation.isValid ? colorize('✓ Valid', 'green') : colorize('✗ Invalid', 'red')}`)
  
  if (result.validation.warnings.length > 0) {
    console.log(`   • Warnings: ${result.validation.warnings.length}`)
  }
  
  // 安全级别分析
  console.log(colorize('\n🔒 Security Analysis:', 'bright'))
  const hasUnsafeInline = result.policyString.includes("'unsafe-inline'")
  const hasUnsafeEval = result.policyString.includes("'unsafe-eval'")
  const hasWildcard = result.policyString.includes('*')
  
  console.log(`   • Unsafe Inline: ${hasUnsafeInline ? colorize('⚠ Allowed', 'yellow') : colorize('✓ Blocked', 'green')}`)
  console.log(`   • Unsafe Eval: ${hasUnsafeEval ? colorize('⚠ Allowed', 'yellow') : colorize('✓ Blocked', 'green')}`)
  console.log(`   • Wildcards: ${hasWildcard ? colorize('⚠ Present', 'yellow') : colorize('✓ None', 'green')}`)
  
  // 关键指令
  console.log(colorize('\n🎯 Key Directives:', 'bright'))
  const keyDirectives = ['default-src', 'script-src', 'style-src', 'img-src', 'connect-src']
  keyDirectives.forEach(directive => {
    if (result.policy[directive]) {
      const value = result.policy[directive]
      const truncated = value.length > 50 ? value.substring(0, 47) + '...' : value
      console.log(`   • ${colorize(directive + ':', 'magenta')} ${truncated}`)
    }
  })
  
  // 完整策略字符串
  console.log(colorize('\n📜 Complete Policy String:', 'bright'))
  console.log(colorize(result.policyString, 'blue'))
  
  // 验证警告
  if (result.validation.warnings.length > 0) {
    console.log(colorize('\n⚠️  Validation Warnings:', 'yellow'))
    result.validation.warnings.forEach(warning => {
      console.log(colorize(`   • ${warning}`, 'yellow'))
    })
  }
}

/**
 * 比较不同环境的策略
 */
function compareEnvironments() {
  console.log(colorize('╔════════════════════════════════════════════════════════════╗', 'cyan'))
  console.log(colorize('║                  ENVIRONMENT COMPARISON                   ║', 'cyan'))
  console.log(colorize('╚════════════════════════════════════════════════════════════╝', 'cyan'))
  
  const environments = ['development', 'testing', 'production']
  const results = {}
  
  // 生成所有环境的策略
  environments.forEach(env => {
    results[env] = generateCSPForEnvironment(env)
  })
  
  // 比较表格
  console.log(colorize('\n📊 Comparison Table:', 'bright'))
  console.log(colorize('┌─────────────┬─────────────┬─────────┬──────────────┬──────────────┐', 'cyan'))
  console.log(colorize('│ Environment │ Directives  │ Length  │ Unsafe-Inline│ Unsafe-Eval  │', 'cyan'))
  console.log(colorize('├─────────────┼─────────────┼─────────┼──────────────┼──────────────┤', 'cyan'))
  
  environments.forEach(env => {
    const result = results[env]
    const directives = Object.keys(result.policy).length.toString().padEnd(11)
    const length = result.policyString.length.toString().padEnd(7)
    const unsafeInline = (result.policyString.includes("'unsafe-inline'") ? 'Yes' : 'No').padEnd(12)
    const unsafeEval = (result.policyString.includes("'unsafe-eval'") ? 'Yes' : 'No').padEnd(12)
    
    console.log(colorize(`│ ${env.padEnd(11)} │ ${directives} │ ${length} │ ${unsafeInline} │ ${unsafeEval} │`, 'cyan'))
  })
  
  console.log(colorize('└─────────────┴─────────────┴─────────┴──────────────┴──────────────┘', 'cyan'))
  
  // 差异分析
  console.log(colorize('\n🔍 Key Differences:', 'bright'))
  
  // 比较开发和生产环境
  const devPolicy = results.development.policy
  const prodPolicy = results.production.policy
  
  Object.keys(prodPolicy).forEach(directive => {
    if (devPolicy[directive] !== prodPolicy[directive]) {
      console.log(colorize(`   • ${directive}:`, 'magenta'))
      console.log(colorize(`     Development: ${devPolicy[directive] || 'Not set'}`, 'yellow'))
      console.log(colorize(`     Production:  ${prodPolicy[directive] || 'Not set'}`, 'green'))
    }
  })
}

/**
 * 展示CSP保护效果
 */
function showProtectionEffects() {
  console.log(colorize('\n╔══════════════════════════════════════════════════════════════╗', 'cyan'))
  console.log(colorize('║                    PROTECTION EFFECTS                       ║', 'cyan'))
  console.log(colorize('╚══════════════════════════════════════════════════════════════╝', 'cyan'))
  
  const protections = [
    {
      threat: 'XSS via inline scripts',
      protection: 'script-src without unsafe-inline',
      status: 'Mitigated',
      note: 'Blocks execution of injected inline scripts'
    },
    {
      threat: 'XSS via eval()',
      protection: 'script-src without unsafe-eval',
      status: 'Mitigated',
      note: 'Prevents dynamic code execution'
    },
    {
      threat: 'Data exfiltration',
      protection: 'connect-src whitelist',
      status: 'Limited',
      note: 'Restricts outbound connections to approved domains'
    },
    {
      threat: 'Plugin-based attacks',
      protection: 'object-src none',
      status: 'Blocked',
      note: 'Disables Flash, Java applets, etc.'
    },
    {
      threat: 'Clickjacking',
      protection: 'frame-ancestors none',
      status: 'Blocked',
      note: 'Prevents page embedding in frames'
    },
    {
      threat: 'Mixed content',
      protection: 'upgrade-insecure-requests',
      status: 'Upgraded',
      note: 'Forces HTTPS for all resources'
    }
  ]
  
  console.log(colorize('\n🛡️  Security Protections:', 'bright'))
  protections.forEach(protection => {
    const statusColor = protection.status === 'Blocked' ? 'green' : 
                       protection.status === 'Mitigated' ? 'yellow' : 'blue'
    
    console.log(colorize(`\n   🎯 ${protection.threat}`, 'magenta'))
    console.log(`      Protection: ${protection.protection}`)
    console.log(`      Status: ${colorize(protection.status, statusColor)}`)
    console.log(colorize(`      Note: ${protection.note}`, 'cyan'))
  })
}

/**
 * 显示实施建议
 */
function showImplementationTips() {
  console.log(colorize('\n╔══════════════════════════════════════════════════════════════╗', 'cyan'))
  console.log(colorize('║                 IMPLEMENTATION TIPS                         ║', 'cyan'))
  console.log(colorize('╚══════════════════════════════════════════════════════════════╝', 'cyan'))
  
  const tips = [
    {
      phase: 'Development',
      recommendations: [
        'Use report-only mode to monitor violations',
        'Test all application features thoroughly',
        'Monitor console for CSP violation reports',
        'Adjust whitelist domains as needed'
      ]
    },
    {
      phase: 'Testing',
      recommendations: [
        'Run full test suite with CSP enabled',
        'Test user workflows end-to-end',
        'Verify third-party integrations work',
        'Check mobile and desktop compatibility'
      ]
    },
    {
      phase: 'Production',
      recommendations: [
        'Start with report-only for monitoring',
        'Gradually enable enforcing mode',
        'Set up violation report collection',
        'Monitor and respond to violations'
      ]
    },
    {
      phase: 'Maintenance',
      recommendations: [
        'Regularly review violation reports',
        'Update policies for new features',
        'Keep domain whitelists current',
        'Test policy changes in staging'
      ]
    }
  ]
  
  tips.forEach(tip => {
    console.log(colorize(`\n📋 ${tip.phase} Phase:`, 'bright'))
    tip.recommendations.forEach(rec => {
      console.log(colorize(`   ✓ ${rec}`, 'green'))
    })
  })
}

/**
 * 主演示函数
 */
function main() {
  const args = process.argv.slice(2)
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(colorize('CSP Policy Demo Usage:', 'bright'))
    console.log('  node csp-demo.js [options]')
    console.log('\nOptions:')
    console.log('  --env <env>     Show specific environment (development|testing|production)')
    console.log('  --compare       Compare all environments')
    console.log('  --protection    Show protection effects')
    console.log('  --tips          Show implementation tips')
    console.log('  --all           Show everything (default)')
    console.log('  --help, -h      Show this help')
    return
  }
  
  const envArg = args.find(arg => arg.startsWith('--env'))
  const env = envArg ? args[args.indexOf(envArg) + 1] : null
  
  console.log(colorize('🔐 Content Security Policy (CSP) Implementation Demo', 'bright'))
  console.log(colorize('====================================================', 'bright'))
  
  if (env && ['development', 'testing', 'production'].includes(env)) {
    // 显示特定环境
    const result = generateCSPForEnvironment(env)
    printCSPDetails(env, result)
  } else if (args.includes('--compare')) {
    // 比较环境
    compareEnvironments()
  } else if (args.includes('--protection')) {
    // 显示保护效果
    showProtectionEffects()
  } else if (args.includes('--tips')) {
    // 显示实施建议
    showImplementationTips()
  } else {
    // 显示所有信息（默认）
    const environments = ['development', 'testing', 'production']
    
    environments.forEach(env => {
      const result = generateCSPForEnvironment(env)
      printCSPDetails(env, result)
    })
    
    compareEnvironments()
    showProtectionEffects()
    showImplementationTips()
  }
  
  console.log(colorize('\n✨ CSP implementation is ready!', 'green'))
  console.log(colorize('Run "npm run csp:test-suite" to validate the implementation.', 'cyan'))
}

// 运行演示
if (require.main === module) {
  try {
    main()
  } catch (error) {
    console.error(colorize(`\n❌ Demo failed: ${error.message}`, 'red'))
    process.exit(1)
  }
}

module.exports = {
  printCSPDetails,
  compareEnvironments,
  showProtectionEffects,
  showImplementationTips
}