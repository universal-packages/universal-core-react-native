import { CoreApp } from '@universal-packages/core'
import { EmittedEvent } from '@universal-packages/event-emitter'
import { SubProcess } from '@universal-packages/sub-process'
import { constantCase } from 'change-case'
import { pascalCase, snakeCase } from 'change-case'
import fs from 'fs'

import { DEFAULT_NAME } from './DEFAULT_NAME'

export default class ReactNativeApp extends CoreApp {
  public static readonly appName = 'react-native'
  public static readonly description = 'React Native core app wrapper for development'
  public static readonly allowAppWatch = false
  public static readonly allowLoadModules = false
  public static readonly allowLoadEnvironments = false

  private reactScriptsSubProcess: SubProcess
  private existentReactApps: string[]
  private reactNativeAppName: string
  private reactNativeAppDirectoryName: string

  async prepare() {
    this.existentReactApps = this.getDirectoryNamesFromPath(this.config.appsLocation)
    this.reactNativeAppName = pascalCase(this.args.name || DEFAULT_NAME)
    this.reactNativeAppDirectoryName = snakeCase(this.reactNativeAppName).replace(/_/g, '-')
  }

  public async run(): Promise<void> {
    if (!this.existentReactApps.includes(this.reactNativeAppDirectoryName)) {
      if (this.existentReactApps.length === 0) {
        throw new Error(`No apps found in ${this.config.appsLocation}`)
      } else {
        throw new Error(`The react native app ${this.reactNativeAppName} does not exist\n Available apps: ${this.existentReactApps.join(', ')}`)
      }
    }

    const reactAppEnvironmentVariables = Object.entries(this.config).reduce((acc, [key, value]) => {
      const variableName = constantCase(key)
      acc[variableName] = value

      return acc
    }, {})

    await core.developer.terminalPresenter.runSubProcess({
      command: 'npm',
      args: ['install'],
      workingDirectory: `${this.config.appsLocation}/${this.reactNativeAppDirectoryName}`
    })

    this.reactScriptsSubProcess = core.developer.terminalPresenter.setSubProcess({
      command: 'npm',
      args: [...(this.args.command ? ['run', this.args.command] : ['start'])],
      env: reactAppEnvironmentVariables,
      workingDirectory: `${this.config.appsLocation}/${this.reactNativeAppDirectoryName}`
    })

    this.reactScriptsSubProcess.on('error', (event: EmittedEvent) => {
      if (this.reactScriptsSubProcess.status !== 'stopped') {
        this.logger.log({ level: 'ERROR', error: event.error })
      }
    })

    this.reactScriptsSubProcess.on('stdout', (event: EmittedEvent) => {
      const message = event.payload.data || ''

      if (message) {
        if (message.includes('▒▒▓▓▓▓▒▒')) {
          this.logger.log({ level: 'INFO', message })
        } else {
          const queryLines = ['(NOBRIDGE) LOG', 'Welcome to', 'Starting dev server']

          if (queryLines.some((queryLine) => message.includes(queryLine))) {
            this.logger.log({ level: 'INFO', message: message.replace('(NOBRIDGE) LOG', '').trim() })
          } else {
            core.developer.terminalPresenter.setScriptOutput(message.trim())
          }
        }
      }
    })

    await this.reactScriptsSubProcess.run()
  }

  public async stop(): Promise<void> {
    await this.reactScriptsSubProcess.kill()
  }

  private getDirectoryNamesFromPath(path): string[] {
    return fs
      .readdirSync(path, {
        withFileTypes: true
      })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name)
  }
}
