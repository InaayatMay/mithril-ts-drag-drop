//const webpack = require('webpack');
const path = require('path');

module.exports = (env, argv) => {

    return {
        context: path.resolve(__dirname, './src'),
        entry: {
            app: './app.ts'
        },


        output: {
            filename: '[name].[contenthash].bundle.js',
            chunkFilename: '[name].[contenthash].bundle.js',
            path: path.resolve(__dirname, 'dist'),
        },

        devtool: 'source-map',

        resolve: { extensions: ['.ts', '.tsx', '.js', '.jsx'] },

        module: {
            rules: [
                { 
                    test: /\.tsx?$/, 
                    loader: 'ts-loader', 
                    options: { transpileOnly: true } 
                }     
            ],
        }
    }
}