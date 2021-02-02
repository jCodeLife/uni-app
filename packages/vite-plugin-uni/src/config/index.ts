import { Plugin } from 'vite'

import { VitePluginUniResolvedOptions } from '..'
import { createCss } from './css'
import { createAlias } from './alias'
import { createDefine } from './define'
import { createServer } from './server'
import { createBuild } from './build'
import { createOptimizeDeps } from './optimizeDeps'

export function createConfig(
  options: VitePluginUniResolvedOptions
): Plugin['config'] {
  return () => {
    return {
      define: createDefine(options),
      alias: createAlias(options),
      optimizeDeps: createOptimizeDeps(options),
      server: createServer(options),
      build: createBuild(options),
      css: createCss(options),
    }
  }
}