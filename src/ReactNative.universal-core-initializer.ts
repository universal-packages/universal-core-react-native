import { CoreInitializer } from '@universal-packages/core'
import { Logger } from '@universal-packages/logger'
import { SubProcess } from '@universal-packages/sub-process'
import { pascalCase, snakeCase } from 'change-case'

import { DEFAULT_NAME } from './DEFAULT_NAME'
import { LOG_CONFIGURATION } from './LOG_CONFIGURATION'

export default class ReactNativeInitializer extends CoreInitializer {
  public static readonly initializerName = 'react-native'
  public static readonly description: string = 'React Native core initializer'

  public readonly templatesLocation: string = `${__dirname}/templates`

  private readonly reactNativeAppName: string
  private readonly reactNativeAppDirectoryName: string
  private currentSubProcess: SubProcess
  private stopping = false

  constructor(args: any, logger: Logger) {
    super(args, logger)

    this.reactNativeAppName = pascalCase(args.name || DEFAULT_NAME)
    this.reactNativeAppDirectoryName = snakeCase(this.reactNativeAppName).replace(/_/g, '-')
    this.templateVariables.appsLocation = `${this.sourceLocation}/react-apps`
  }

  public async afterTemplatePopulate(): Promise<void> {
    core.developer.terminalPresenter.setProgressPercentage(10)

    this.currentSubProcess = core.developer.terminalPresenter.setSubProcess({ command: 'mkdir', args: ['-p', 'tmp'] })
    await this.currentSubProcess.run()

    if (this.stopping) return

    core.developer.terminalPresenter.increaseProgressPercentageBy(2)

    this.logger.log(
      { level: 'INFO', title: 'Requesting react-native-community initialization', message: 'Executing npx @react-native-community/cli under the hood', category: 'RN' },
      LOG_CONFIGURATION
    )

    core.developer.terminalPresenter.startProgressIncreaseSimulation(68, 60000)

    this.currentSubProcess = core.developer.terminalPresenter.setSubProcess({
      command: 'npx',
      args: ['@react-native-community/cli@latest', 'init', this.reactNativeAppName],
      workingDirectory: './tmp'
    })
    await this.currentSubProcess.run()

    core.developer.terminalPresenter.finishProgressIncreaseSimulation()

    if (this.stopping) return

    this.logger.log({ level: 'INFO', title: 'Reconfiguring...', message: 'Reconfiguring to work as a universal packages module', category: 'RN' }, LOG_CONFIGURATION)

    this.currentSubProcess = core.developer.terminalPresenter.setSubProcess({
      command: 'mkdir',
      args: ['-p', `${this.sourceLocation}/react-apps/${this.reactNativeAppDirectoryName}`]
    })
    await this.currentSubProcess.run()

    if (this.stopping) return

    this.currentSubProcess = core.developer.terminalPresenter.setSubProcess({
      command: 'rm',
      args: ['-rf', `./tmp/${this.reactNativeAppName}/.git`]
    })
    await this.currentSubProcess.run()
    this.currentSubProcess = core.developer.terminalPresenter.setSubProcess({
      command: 'rsync',
      args: ['-av', `./tmp/${this.reactNativeAppName}/`, `${this.sourceLocation}/react-apps/${snakeCase(this.reactNativeAppName).replace(/_/g, '-')}`]
    })
    await this.currentSubProcess.run()

    if (this.stopping) return

    this.logger.log({ level: 'INFO', title: 'Finishing up...', message: 'Finishing up the react native reconfiguration', category: 'RN' }, LOG_CONFIGURATION)

    core.developer.terminalPresenter.increaseProgressPercentageBy(5)

    this.currentSubProcess = core.developer.terminalPresenter.setSubProcess({ command: 'rm', args: ['-rf', `./tmp/${this.reactNativeAppName}`] })
    await this.currentSubProcess.run()

    core.developer.terminalPresenter.increaseProgressPercentageBy(5)

    this.logger.log({ level: 'INFO', title: 'Attempting iOS gem preparations', message: 'Running bundle install and pod install', category: 'RN' }, LOG_CONFIGURATION)

    this.currentSubProcess = core.developer.terminalPresenter.setSubProcess({
      command: 'bundle',
      args: ['install'],
      workingDirectory: `${this.sourceLocation}/react-apps/${this.reactNativeAppDirectoryName}/ios`
    })

    try {
      await this.currentSubProcess.run()

      this.currentSubProcess = core.developer.terminalPresenter.setSubProcess({
        command: 'pod',
        args: ['install'],
        workingDirectory: `${this.sourceLocation}/react-apps/${this.reactNativeAppDirectoryName}/ios`
      })

      await this.currentSubProcess.run()
    } catch (error) {
      this.logger.log({ level: 'WARNING', title: 'iOS gem preparations failed', message: 'Failed to run bundle install', category: 'RN' }, LOG_CONFIGURATION)
    }
  }

  public async abort(): Promise<void> {
    this.stopping = true

    if (this.currentSubProcess) await this.currentSubProcess.kill()
    core.developer.terminalPresenter.finishProgressIncreaseSimulation()

    this.currentSubProcess = core.developer.terminalPresenter.setSubProcess({ command: 'rm', args: ['-rf', `./tmp/${this.reactNativeAppName}`] })
    await this.currentSubProcess.run()
  }
}
