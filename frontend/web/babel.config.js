module.exports = {
  presets: [
    ['@babel/preset-env', { 
      targets: { 
        browsers: '> 0.25%, not dead' 
      },
      modules: false,
      useBuiltIns: 'usage',
      corejs: 3
    }],
    ['@babel/preset-react', { runtime: 'automatic' }]
  ],
  plugins: [
    '@babel/plugin-transform-runtime',
    '@babel/plugin-proposal-optional-chaining'
  ]
};
