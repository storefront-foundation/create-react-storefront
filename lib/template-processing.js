const fs = require('fs-extra')
const handleError = require('./handle-error')
const os = require('os')
const path = require('path')

const _processReactStorefrontConfigJson = (targetPath, environment, hostname, upstream) => {
  const reactStorefrontJsonPath = path.resolve(targetPath, `moov_config-${environment}.json`)
  const reactStorefrontJson = _readConfigJson(reactStorefrontJsonPath)

  reactStorefrontJson.host_map = [`$.${hostname} => ${upstream}`]

  _writeConfigJson(reactStorefrontJsonPath, reactStorefrontJson)
}

const _readConfigJson = targetPath => {
  try {
    return JSON.parse(fs.readFileSync(targetPath))
  } catch (err) {
    handleError(err, `Reading ${targetPath} failed. Ensure you have proper permissions.`)
  }
}

const _writeConfigJson = (targetPath, config) => {
  try {
    fs.writeFileSync(targetPath, JSON.stringify(config, null, 2) + os.EOL)
  } catch (err) {
    handleError(err, `Writing ${targetPath} failed. Ensure you have proper permissions.`)
  }
}

/**
 * Writes the various moov_config-*.json files using user configuration.
 *
 * @param {string} targetPath The path to the moov_config-*.json files.
 * @param {Object} config The user's selected configuration options.
 */
const processReactStorefrontConfigJsons = (targetPath, config) => {
  console.log('Writing production React Storefront configuration...')
  _processReactStorefrontConfigJson(targetPath, 'prod', config.prodHostname, config.prodUpstream)
  ;['dev', 'local'].forEach(environment => {
    console.log(`Writing ${environment} React Storefront configuration...`)
    _processReactStorefrontConfigJson(
      targetPath,
      environment,
      config.devHostname,
      config.devUpstream
    )
  })

  console.log('React Storefront configuration files written.')
}

/**
 * Writes the package.json files using user configuration.
 *
 * @param {string} name Package name.
 * @param {string} targetPath The path to the package.json files.
 * @param {Object} config The user's selected configuration options.
 */
const processPackageJson = (name, targetPath, { layer0, ...config } = {}) => {
  const packageJsonPath = path.resolve(targetPath, 'package.json')
  const packageJson = _readConfigJson(packageJsonPath)

  packageJson.name = name
  packageJson.version = '0.0.0'
  packageJson.license = 'UNLICENSED'
  packageJson.private = true

  if (!layer0) {
    // remove yalc commands from free apps
    packageJson['lint-staged']['*.js'] = packageJson['lint-staged']['*.js'].filter(
      step => !step.match(/yalc/)
    )
    delete packageJson.scripts['rsf:link']
  }
  // remove react-storefront team from the deploy script, so it defaults to the user's own team:
  packageJson.scripts.deploy = packageJson.scripts.deploy.replace(
    'layer0 deploy react-storefront --environment=production',
    'layer0 deploy'
  )

  _writeConfigJson(packageJsonPath, packageJson)
}

const copyResources = (targetPath, { layer0 }) => {
  if (layer0) {
    fs.copySync(path.join(targetPath, 'crs-resources'), targetPath)
    fs.removeSync(path.join(targetPath, '.github', 'workflows', 'layer0.yml'))
    fs.removeSync(path.join(targetPath, 'crs-resources'))
  }
}

module.exports = {
  _processReactStorefrontConfigJson,
  _readConfigJson,
  _writeConfigJson,
  processReactStorefrontConfigJsons,
  processPackageJson,
  copyResources,
}
