const _ = require('lodash')
const prompts = require('prompts')
const configDefaults = require('./config-defaults')
const connectors = require('./connectors')

const _initialDevHostname = (_prev, values) => {
  return `dev.${values.prodHostname}`
}

const _initialDevUpstream = (_prev, values) => {
  const tokens = values.devHostname.split('.')
  tokens[0] = `${tokens[0]}-origin`
  return tokens.join('.')
}

const _initialProdUpstream = (_prev, values) => {
  return `origin.${values.prodHostname}`
}

const _requireInput = value => {
  if (!value || value.trim().length === 0) {
    return 'This field is required.'
  } else {
    return true
  }
}

const questions = [
  {
    name: 'appName',
    message: 'Enter a name for your app:',
    type: 'text',
  },
  {
    name: 'connector',
    message: 'Which ecommerce platform will you be using?',
    type: 'select',
    choices: [...connectors, { title: 'Other', value: null }],
  },
  {
    name: 'xdn',
    message: 'Will you be deploying your app on the Moovweb XDN?',
    type: 'toggle',
    initial: false,
    active: 'yes',
    inactive: 'no',
  },
  {
    name: 'createDirectory',
    type: 'toggle',
    message: 'Create a directory for this app?',
    initial: true,
    active: configDefaults.createDirectory ? 'yes' : 'no',
    inactive: 'no',
  },
]

/**
 * Prompt user for React Storefront configuration options.
 */
const promptForConfig = async options => {
  console.log(
    `\nLet's create a new React Storefront app! First, I need you to provide some information for package.json...\n`
  )

  if (options.appName) {
    questions.shift()
  }

  const answers = {
    appName: options.appName,
    ...(await prompts(questions)),
  }

  // If the user has not provided all input, abort.
  if (Object.keys(answers).length !== questions.length) {
    throw new Error('User configuration is incomplete. Aborting.')
  }

  // If upstream responses were given, they have been merged into this object.
  return answers
}

module.exports = {
  _initialDevHostname,
  _initialDevUpstream,
  _initialProdUpstream,
  _requireInput,
  promptForConfig,
}
