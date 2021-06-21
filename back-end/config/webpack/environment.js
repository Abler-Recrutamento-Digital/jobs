const { environment } = require('@rails/webpacker')

//This will point Rails towards Webpacker and your new dependencies.
const webpack = require('webpack')
environment.plugins.append('Provide',
    new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        Popper: ['popper.js', 'default']
    })
    )
module.exports = environment
