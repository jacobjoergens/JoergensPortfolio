/** @type {import('next').NextConfig} */
const CopyPlugin = require("copy-webpack-plugin");

const nextConfig = {
    experimental: {
        mdxRs: true,
        outputFileTracingIncludes: {
          '/api/startServer': ['/app/(categories)/computational-design/min-rect-partition/min-k-partition.py'],
        },
      },
      // reactStrictMode: false, 
      swcMinify: true,
      webpack: (config) => {
    
        config.resolve.fallback = { fs: false };
    
        config.plugins.push(
          new CopyPlugin({
            patterns: [
              { from: "node_modules/rhino3dm/rhino3dm.wasm", to: "./static/chunks/app/(categories)/computational-design/protein-earrings/"},
              { from: "node_modules/rhino3dm/rhino3dm.wasm", to: "./static/chunks/app/(categories)/computational-design/mass-timber-typology/"},
              { from: "node_modules/rhino3dm/rhino3dm.wasm", to: "./static/chunks/app/(categories)/computational-design/min-rect-partition/"},
              { from: "node_modules/rhino3dm/rhino3dm.wasm", to: "./static/chunks/"} //app/(categories)/computational-design/protein-earrings/
            ]
          })
        )
    
        return config;
      }
}

const withMDX = require('@next/mdx')()

const { withContentlayer } = require("next-contentlayer");

module.exports = withContentlayer(withMDX(nextConfig));
