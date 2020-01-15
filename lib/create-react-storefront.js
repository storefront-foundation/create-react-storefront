const { calculateReactStorefrontPath } = require('./utils')
const { checkTemplateExistence } = require('./retrieve-template')
const createReactStorefrontInternal = require('./create-react-storefront-internal')
const { promptForConfig } = require('./prompt-for-config')
const configDefaults = require('./config-defaults')

const _calculateStartCommand = () => {
  return 'npm run dev'
}

/**
 * The entry point to creating a React Storefront project.
 */
const createReactStorefront = async options => {
  let userConfig = {
    version: configDefaults.version,
    description: '',
    repoUrl: '',
    author: '',
    license: configDefaults.license,
    private: configDefaults.private,
    createDirectory: configDefaults.createDirectory
  }

  if (!(await checkTemplateExistence(options.branch))) {
    console.log(
      `The ${options.branch} branch of react-storefront-starter-app does not exist. Check your spelling or use the default.`
    )
    return
  }

  if (!options.yes) {
    try {
      userConfig = await promptForConfig({ configUpstream: false })
    } catch (err) {
      console.log(err.message)
      return
    }
  }

  await createReactStorefrontInternal(options, userConfig)
}

module.exports = {
  _calculateStartCommand,
  createReactStorefront
}
