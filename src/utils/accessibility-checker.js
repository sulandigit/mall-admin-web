/**
 * 无障碍性检查工具
 * 用于自动检测常见的无障碍问题
 */

export class AccessibilityChecker {
  constructor() {
    this.issues = []
    this.rules = {
      // 图片alt文本检查
      images: {
        name: '图片替代文本',
        check: this.checkImages.bind(this)
      },
      // 表单标签检查
      formLabels: {
        name: '表单标签',
        check: this.checkFormLabels.bind(this)
      },
      // 颜色对比度检查
      colorContrast: {
        name: '颜色对比度',
        check: this.checkColorContrast.bind(this)
      },
      // 键盘可访问性检查
      keyboardAccess: {
        name: '键盘可访问性',
        check: this.checkKeyboardAccess.bind(this)
      },
      // 标题结构检查
      headingStructure: {
        name: '标题结构',
        check: this.checkHeadingStructure.bind(this)
      },
      // ARIA标签检查
      ariaLabels: {
        name: 'ARIA标签',
        check: this.checkAriaLabels.bind(this)
      }
    }
  }

  // 检查整个页面
  async checkPage(container = document) {
    this.issues = []
    
    for (const [ruleId, rule] of Object.entries(this.rules)) {
      try {
        await rule.check(container)
      } catch (error) {
        this.addIssue({
          rule: ruleId,
          type: 'error',
          message: `检查${rule.name}时发生错误: ${error.message}`,
          element: null
        })
      }
    }
    
    return this.getResults()
  }

  // 检查特定元素
  checkElement(element) {
    this.issues = []
    
    for (const [ruleId, rule] of Object.entries(this.rules)) {
      try {
        rule.check(element)
      } catch (error) {
        this.addIssue({
          rule: ruleId,
          type: 'error',
          message: `检查${rule.name}时发生错误: ${error.message}`,
          element: element
        })
      }
    }
    
    return this.getResults()
  }

  // 检查图片alt文本
  checkImages(container) {
    const images = container.querySelectorAll('img')
    
    images.forEach(img => {
      const alt = img.getAttribute('alt')
      const ariaHidden = img.getAttribute('aria-hidden')
      const role = img.getAttribute('role')
      
      // 装饰性图片应该有空alt或aria-hidden="true"
      if (ariaHidden === 'true' || role === 'presentation') {
        return // 装饰性图片，跳过检查
      }
      
      // 内容图片必须有alt文本
      if (alt === null) {
        this.addIssue({
          rule: 'images',
          type: 'error',
          message: '图片缺少alt属性',
          element: img
        })
      } else if (alt.trim() === '' && ariaHidden !== 'true') {
        this.addIssue({
          rule: 'images',
          type: 'warning',
          message: '图片alt属性为空，如果是装饰性图片，建议添加aria-hidden="true"',
          element: img
        })
      } else if (alt.length > 100) {
        this.addIssue({
          rule: 'images',
          type: 'warning',
          message: 'alt文本过长（超过100字符），建议使用aria-describedby引用详细描述',
          element: img
        })
      }
    })
  }

  // 检查表单标签
  checkFormLabels(container) {
    const formControls = container.querySelectorAll('input, select, textarea')
    
    formControls.forEach(control => {
      const type = control.type
      const id = control.id
      const ariaLabel = control.getAttribute('aria-label')
      const ariaLabelledby = control.getAttribute('aria-labelledby')
      
      // 跳过隐藏元素
      if (control.type === 'hidden') return
      
      // 检查是否有关联的label
      let hasLabel = false
      
      if (id) {
        const label = container.querySelector(`label[for="${id}"]`)
        if (label) hasLabel = true
      }
      
      if (ariaLabel && ariaLabel.trim()) hasLabel = true
      if (ariaLabelledby) hasLabel = true
      
      // 检查父元素是否为label
      if (control.closest('label')) hasLabel = true
      
      if (!hasLabel) {
        this.addIssue({
          rule: 'formLabels',
          type: 'error',
          message: `${type}表单控件缺少标签`,
          element: control
        })
      }
    })
  }

  // 检查颜色对比度（简化版本）
  checkColorContrast(container) {
    const textElements = container.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, a, button, label')
    
    textElements.forEach(element => {
      const styles = window.getComputedStyle(element)
      const fontSize = parseFloat(styles.fontSize)
      const fontWeight = styles.fontWeight
      
      // 判断是否为大文本（18pt以上或14pt粗体）
      const isLargeText = fontSize >= 24 || (fontSize >= 18 && (fontWeight === 'bold' || parseInt(fontWeight) >= 700))
      
      // 这里只做基本检查，实际对比度计算需要更复杂的算法
      const color = styles.color
      const backgroundColor = styles.backgroundColor
      
      if (color === backgroundColor) {
        this.addIssue({
          rule: 'colorContrast',
          type: 'error',
          message: '文本颜色与背景颜色相同',
          element: element
        })
      }
      
      // 简单的颜色检查
      if (color.includes('gray') && backgroundColor.includes('gray')) {
        this.addIssue({
          rule: 'colorContrast',
          type: 'warning',
          message: '可能存在对比度不足的问题，建议使用对比度检查工具验证',
          element: element
        })
      }
    })
  }

  // 检查键盘可访问性
  checkKeyboardAccess(container) {
    const interactiveElements = container.querySelectorAll('a, button, input, select, textarea, [onclick], [role="button"], [role="link"], [tabindex]')
    
    interactiveElements.forEach(element => {
      const tabIndex = element.getAttribute('tabindex')
      const role = element.getAttribute('role')
      
      // 检查负tabindex
      if (tabIndex && parseInt(tabIndex) < -1) {
        this.addIssue({
          rule: 'keyboardAccess',
          type: 'warning',
          message: 'tabindex值小于-1可能导致键盘导航问题',
          element: element
        })
      }
      
      // 检查高tabindex值
      if (tabIndex && parseInt(tabIndex) > 0) {
        this.addIssue({
          rule: 'keyboardAccess',
          type: 'warning',
          message: '建议避免使用正值tabindex，依赖自然的DOM顺序',
          element: element
        })
      }
      
      // 检查onclick但没有键盘支持的元素
      if (element.hasAttribute('onclick') && element.tagName.toLowerCase() === 'div' && !role) {
        this.addIssue({
          rule: 'keyboardAccess',
          type: 'error',
          message: '可点击的div元素缺少适当的role属性和键盘支持',
          element: element
        })
      }
    })
  }

  // 检查标题结构
  checkHeadingStructure(container) {
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6')
    let previousLevel = 0
    
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1))
      
      if (index === 0 && level !== 1) {
        this.addIssue({
          rule: 'headingStructure',
          type: 'warning',
          message: '页面第一个标题应该是h1',
          element: heading
        })
      }
      
      if (level - previousLevel > 1) {
        this.addIssue({
          rule: 'headingStructure',
          type: 'error',
          message: `标题层级跳跃过大，从h${previousLevel}直接跳到h${level}`,
          element: heading
        })
      }
      
      if (heading.textContent.trim() === '') {
        this.addIssue({
          rule: 'headingStructure',
          type: 'error',
          message: '标题内容为空',
          element: heading
        })
      }
      
      previousLevel = level
    })
  }

  // 检查ARIA标签
  checkAriaLabels(container) {
    const elementsWithAria = container.querySelectorAll('[aria-labelledby], [aria-describedby]')
    
    elementsWithAria.forEach(element => {
      const labelledby = element.getAttribute('aria-labelledby')
      const describedby = element.getAttribute('aria-describedby')
      
      if (labelledby) {
        const ids = labelledby.split(' ')
        ids.forEach(id => {
          if (!container.querySelector(`#${id}`)) {
            this.addIssue({
              rule: 'ariaLabels',
              type: 'error',
              message: `aria-labelledby引用的元素#${id}不存在`,
              element: element
            })
          }
        })
      }
      
      if (describedby) {
        const ids = describedby.split(' ')
        ids.forEach(id => {
          if (!container.querySelector(`#${id}`)) {
            this.addIssue({
              rule: 'ariaLabels',
              type: 'error',
              message: `aria-describedby引用的元素#${id}不存在`,
              element: element
            })
          }
        })
      }
    })
    
    // 检查必需的ARIA属性
    const elementsWithRoles = container.querySelectorAll('[role]')
    elementsWithRoles.forEach(element => {
      const role = element.getAttribute('role')
      
      switch (role) {
        case 'button':
          if (!element.getAttribute('aria-label') && !element.textContent.trim() && !element.getAttribute('aria-labelledby')) {
            this.addIssue({
              rule: 'ariaLabels',
              type: 'error',
              message: 'role="button"的元素需要可访问的名称',
              element: element
            })
          }
          break
        case 'img':
          if (!element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby')) {
            this.addIssue({
              rule: 'ariaLabels',
              type: 'error',
              message: 'role="img"的元素需要aria-label或aria-labelledby',
              element: element
            })
          }
          break
      }
    })
  }

  // 添加问题
  addIssue(issue) {
    this.issues.push({
      ...issue,
      timestamp: new Date().toISOString()
    })
  }

  // 获取检查结果
  getResults() {
    const summary = {
      total: this.issues.length,
      errors: this.issues.filter(issue => issue.type === 'error').length,
      warnings: this.issues.filter(issue => issue.type === 'warning').length
    }
    
    return {
      summary,
      issues: this.issues,
      passed: summary.errors === 0
    }
  }

  // 生成报告
  generateReport() {
    const results = this.getResults()
    
    let report = `无障碍检查报告\n`
    report += `===================\n`
    report += `检查时间: ${new Date().toLocaleString()}\n`
    report += `总问题数: ${results.summary.total}\n`
    report += `错误: ${results.summary.errors}\n`
    report += `警告: ${results.summary.warnings}\n\n`
    
    if (results.issues.length === 0) {
      report += `恭喜！没有发现无障碍问题。\n`
    } else {
      const errorsByRule = {}
      results.issues.forEach(issue => {
        if (!errorsByRule[issue.rule]) {
          errorsByRule[issue.rule] = []
        }
        errorsByRule[issue.rule].push(issue)
      })
      
      Object.entries(errorsByRule).forEach(([rule, issues]) => {
        report += `${this.rules[rule].name}:\n`
        issues.forEach((issue, index) => {
          report += `  ${index + 1}. [${issue.type.toUpperCase()}] ${issue.message}\n`
        })
        report += `\n`
      })
    }
    
    return report
  }

  // 高亮问题元素
  highlightIssues() {
    // 移除之前的高亮
    document.querySelectorAll('.a11y-issue-highlight').forEach(el => {
      el.classList.remove('a11y-issue-highlight')
    })
    
    // 添加样式
    if (!document.querySelector('#a11y-highlight-styles')) {
      const style = document.createElement('style')
      style.id = 'a11y-highlight-styles'
      style.textContent = `
        .a11y-issue-highlight {
          outline: 3px solid #ff0000 !important;
          outline-offset: 2px !important;
          background-color: rgba(255, 0, 0, 0.1) !important;
        }
      `
      document.head.appendChild(style)
    }
    
    // 高亮问题元素
    this.issues.forEach(issue => {
      if (issue.element) {
        issue.element.classList.add('a11y-issue-highlight')
      }
    })
  }

  // 清除高亮
  clearHighlights() {
    document.querySelectorAll('.a11y-issue-highlight').forEach(el => {
      el.classList.remove('a11y-issue-highlight')
    })
  }
}

export default AccessibilityChecker