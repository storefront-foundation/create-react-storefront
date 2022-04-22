const { calculateReactStorefrontPath } = require('./utils')
const { isTargetPathValid } = require('./input-validation')
const {
  copyResources,
  processReactStorefrontConfigJsons,
  processPackageJson,
} = require('./template-processing')
const { retrieveTemplate } = require('./retrieve-template')
const ora = require('ora')
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const path = require('path')
const chalk = require('chalk')
const logo = require('./logo')

/**
 * Create the React Storefront with the user's selected options.
 *
 * @param {Object} options The user's command-line options.
 * @param {Object} userConfig The user's selected configuration options.
 */
const createReactStorefrontInternal = async (options, userConfig) => {
  console.log('')

  const targetPath = calculateReactStorefrontPath(options.appName, userConfig)

  if (userConfig.createDirectory && !isTargetPathValid(targetPath)) {
    console.log(
      `The specified path ("${targetPath}") exists and is not an empty directory. Please move it or try another path.`
    )
    return false
  }

  let spinner

  try {
    const message = `Downloading React Storefront ${userConfig.layer0 ? `${logo} ` : ''}template...`

    spinner = ora(message).start()

    await retrieveTemplate({
      branch: userConfig.layer0 ? 'commercial' : 'master',
      targetPath: targetPath,
    })

    spinner.succeed(`${message} done.`)
  } catch (e) {
    spinner.fail('Download failed')
    console.error(e)
    process.exit(1)
  }

  try {
    spinner = ora('Writing package.json...').start()
    processPackageJson(options.appName, targetPath, userConfig)
    spinner.succeed('Writing package.json... done.')
  } catch (e) {
    spinner.fail('Failed')
    console.error(e)
    process.exit(1)
  }

  if (options.configureUpstream) {
    processReactStorefrontConfigJsons(targetPath, userConfig)
  }

  try {
    spinner = ora('Installing dependencies...').start()
    await exec('npm install --legacy-peer-deps', { cwd: targetPath })
    spinner.succeed('Installing dependencies... done.')
  } catch (e) {
    spinner.fail('npm install failed')
    console.error(e)
    process.exit(1)
  }

  try {
    spinner = ora('Copying resources...').start()
    await copyResources(targetPath, userConfig)
    spinner.succeed('Copying resources... done.')
  } catch (e) {
    spinner.fail('Failed')
    console.error(e)
    process.exit(1)
  }

  ora(`React Storefront app created.`).succeed()

  console.log('')
  console.log('To run your app:')
  console.log('')
  console.log(chalk.green(`  cd ${path.relative(process.cwd(), targetPath)}`))
  console.log(chalk.green(`  npm start`))
  console.log('')
  console.log(`To deploy your app for free on ${logo}, go to:`)
  console.log('')
  console.log(chalk.blueBright('  https://app.layer0.co'))
  console.log('')
  console.log(chalk.italic('Happy coding!'))
  console.log('')
}

module.exports = createReactStorefrontInternal
