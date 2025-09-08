import typescript from '@rollup/plugin-typescript'

/**
 * 为某个子包生成 Rollup 配置
 *
 * @param pkg 子包的 package.json 对象
 * @returns RollupOptions 数组（包含 esm + cjs 输出）
 */
export function createConfig(pkg) {
  return [
    {
      // 入口文件（所有子包约定 src/index.ts）
      input: 'src/index.ts',

      // 输出产物：同时生成 ESM 和 CJS 格式
      output: [
        {
          file: pkg.module, // 对应 package.json.module
          format: 'esm', // ES Module
          sourcemap: true, // 开启 source map
        },
        {
          file: pkg.main, // 对应 package.json.main
          format: 'cjs', // CommonJS
          sourcemap: true,
        },
      ],

      // 插件：使用 TypeScript 插件处理 .ts 文件
      plugins: [
        typescript({
          tsconfig: './tsconfig.json', // 指定子包的 tsconfig.json
        }),
      ],

      // external 表示不打包进 bundle 的依赖
      // dependencies + peerDependencies 一律外部化
      external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})],
    },

    // 可以启用 rollup-plugin-dts 打包 .d.ts 文件：
    // vue 官方采用 tsc --declaration 来生成声明文件，兼具 rollup-plugin-dts 合并
    // rollup-plugin-dts 为社区插件，生成 .d.ts 文件的能力不行
    // {
    //   input: 'src/index.ts',
    //   output: { file: pkg.types, format: 'esm' },
    //   plugins: [dts()],
    // },
  ]
}
