// TODO: 简化版
import { compile } from '@vue/compiler-dom'

export function parse(source: string) {
  const templateMatch = source.match(/<template>([\s\S]*?)<\/template>/)
  const scriptMatch = source.match(/<script[^>]*>([\s\S]*?)<\/script>/)

  return {
    descriptor: {
      template: templateMatch ? { content: templateMatch[1].trim() } : null,
      script: scriptMatch ? { content: scriptMatch[1].trim() } : null,
    },
  }
}

export function compileTemplate({ source }: { source: string }) {
  return compile(source, {
    mode: 'module',
    runtimeModuleName: 'vue',
  })
}

export function compileSFC(sfcSource: string, filename: string = 'anonymous.vue') {
  const { descriptor } = parse(sfcSource)
  const { template, script } = descriptor

  // 1) 处理 <script>，把 export default defineComponent(...) 变成 const _sfc_main = defineComponent(...)
  let scriptCode = script?.content ?? 'export default {}'
  scriptCode = scriptCode.replace(/export\s+default\s+(defineComponent\s*\()/, 'const _sfc_main = $1')
  // 若不是 defineComponent，也替换成对象形式
  scriptCode = scriptCode.replace(/export\s+default\s+({)/, 'const _sfc_main = $1')
  if (!/const\s+_sfc_main\s*=/.test(scriptCode)) {
    // 兜底：如果没有 default，就补一个
    scriptCode += `\nconst _sfc_main = {}`
  }

  // 2) 处理 <template> → ESM：import + export function render(...)
  let imports = ''
  let renderBody = ''

  if (template) {
    const { code } = compileTemplate({ source: template.content })
    // 期望 code 形如：
    // import { ... } from 'vue'
    // export function render(_ctx, _cache, ...) { ... }
    const importLines = code.match(/^(?:import[\s\S]+?from\s+['"][^'"]+['"];?\s*)+/m)
    if (importLines) imports = importLines[0].trim()

    // 把 "export function render(" 改名为 "function _sfc_render("
    renderBody = code
      .replace(imports, '')
      .replace(/export\s+function\s+render\s*\(/, 'function _sfc_render(')
      .trim()
  }

  // 3) 拼接最终模块
  // 顺序：脚本(import/defineComponent等) → 模板(import + _sfc_render) → export default 挂载 render
  const out = `
${scriptCode}

${imports}
${renderBody}

_sfc_main.__file = ${JSON.stringify(filename)}

export default Object.assign(_sfc_main, { render: _sfc_render })
`.trim()

  return out
}
