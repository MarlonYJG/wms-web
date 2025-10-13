// @ts-nocheck
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { createHtmlPlugin } from 'vite-plugin-html'
import { visualizer } from 'rollup-plugin-visualizer'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    // 基础路径
    base: '/',
    
    // 插件配置
    plugins: [
      vue(),
      
      // HTML插件配置
      createHtmlPlugin({
        minify: {
          removeComments: true,
          collapseWhitespace: true,
          removeAttributeQuotes: true,
          collapseBooleanAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true,
          minifyCSS: true,
          minifyJS: true
        },
        inject: {
          data: {
            title: env.VITE_APP_TITLE || 'WMS仓库管理系统',
            description: '基于Vue3 + TypeScript + Element Plus的现代化仓库管理系统',
            keywords: 'WMS,仓库管理,库存管理,Vue3,TypeScript,Element Plus'
          }
        }
      }),
      
      // PWA配置
      VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1年
                },
                cacheKeyWillBeUsed: async ({ request }) => {
                  return `${request.url}?v=1.0.0`
                }
              }
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1年
                }
              }
            }
          ]
        },
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
        manifest: {
          name: 'WMS仓库管理系统',
          short_name: 'WMS',
          description: '基于Vue3 + TypeScript + Element Plus的现代化仓库管理系统',
          theme_color: '#409EFF',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        }
      }),
      
      // 打包分析插件（仅在生产环境启用）
      mode === 'production' && visualizer({
        filename: 'dist/stats.html',
        open: false,
        gzipSize: true,
        brotliSize: true
      })
    ].filter(Boolean),
    
    // 路径别名
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@@': resolve(__dirname, 'src/common')
      }
    },
    
    // CSS配置
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/common/assets/styles/variables.scss";`
        }
      },
      postcss: {
        plugins: [
          // 自动添加浏览器前缀
          require('autoprefixer')({
            overrideBrowserslist: [
              'last 2 versions',
              '> 1%',
              'iOS 7',
              'last 3 iOS versions'
            ]
          })
        ]
      }
    },
    
    // 构建配置
    build: {
      // 输出目录
      outDir: 'dist',
      
      // 静态资源目录
      assetsDir: 'assets',
      
      // 资源内联阈值
      assetsInlineLimit: 4096,
      
      // 启用CSS代码分割
      cssCodeSplit: true,
      
      // 生成source map
      sourcemap: false,
      
      // 压缩配置
      // 使用内置 esbuild 压缩，避免 Terser 类型冲突
      minify: 'esbuild',
      
      // 打包配置
      rollupOptions: {
        // 入口文件
        input: {
          main: resolve(__dirname, 'index.html')
        },
        
        // 输出配置
        output: {
          // 静态资源文件名格式
          assetFileNames: (assetInfo) => {
            const name = assetInfo.name || ''
            if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(name)) {
              return `assets/media/[name]-[hash][extname]`
            }
            if (/\.(png|jpe?g|gif|svg)(\?.*)?$/i.test(name)) {
              return `assets/images/[name]-[hash][extname]`
            }
            if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(name)) {
              return `assets/fonts/[name]-[hash][extname]`
            }
            return `assets/[name]-[hash][extname]`
          },
          
          // JS文件名格式
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          
          // 手动分包
          manualChunks: {
            // Vue相关
            vue: ['vue', 'vue-router', 'pinia'],
            // Element Plus
            'element-plus': ['element-plus', '@element-plus/icons-vue'],
            // 工具库
            utils: ['lodash-es', 'axios', 'dayjs'],
            // 图表库
            charts: ['echarts', 'vue-echarts']
          }
        },
        
        // 外部依赖（CDN引入）
        external: [],
        
        // 插件配置
        plugins: []
      },
      
      // 构建目标
      target: 'es2015',
      
      // 启用/禁用 gzip 压缩大小报告
      reportCompressedSize: true,
      
      // 设置chunk大小警告的限制
      chunkSizeWarningLimit: 1000
    },
    
    // 开发服务器配置
    server: {
      host: '0.0.0.0',
      port: 3000,
      open: true,
      cors: true,
      proxy: {
        '/api': {
          target: env.VITE_APP_API_BASE_URL || 'http://localhost:8080',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/api')
        }
      }
    },
    
    // 预览服务器配置
    preview: {
      host: '0.0.0.0',
      port: 4173,
      open: true
    },
    
    // 环境变量配置
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      __APP_ENV__: JSON.stringify(mode)
    },
    
    // 优化配置
    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        'pinia',
        'element-plus',
        '@element-plus/icons-vue',
        'lodash-es',
        'axios',
        'dayjs'
      ],
      exclude: ['@vueuse/core']
    },
    
    // 实验性功能
    experimental: {
      renderBuiltUrl(filename: string) {
        // 自定义资源URL生成
        return `/${filename}`
      }
    }
  }
})
